import {
  hpToEz,
  izToQz,
  ViewingConditions,
  xyzToIzazbz,
  Zcam,
} from "../cam/Zcam"
import { square, toDegrees } from "../math"
import { CieXyz, DEFAULT_SDR_WHITE_LUMINANCE } from "./CieXyz"

/**
 * A color in the CIE XYZ tristimulus color space, with absolute luminance.
 * This is often used as an intermediate color space for uniform color spaces and color appearance models.
 *
 * @see CieXyz
 */
export class CieXyzAbs {
  constructor(
    /**
     * X component: mix of the non-negative CIE RGB curves.
     */
    public readonly x: number,

    /**
     * Y component: absolute luminance.
     */
    public readonly y: number,

    /**
     * Z component: approximately equal to blue from CIE RGB.
     */
    public readonly z: number,
  ) {}

  /**
   * Convert an absolute XYZ color to relative XYZ, using the specified reference white luminance.
   *
   * @return Color in relative XYZ
   */
  toRel(luminance: number = DEFAULT_SDR_WHITE_LUMINANCE): CieXyz {
    return new CieXyz(
      this.x / luminance,
      this.y / luminance,
      this.z / luminance,
    )
  }

  /**
   * Get the perceptual appearance attributes of this color using the [Zcam] color appearance model.
   * Input colors must be relative to a reference white of D65, absolute luminance notwithstanding.
   *
   * @return [Zcam] attributes
   */
  toZcam(
    /**
     * Conditions under which the color will be viewed.
     */
    cond: ViewingConditions,
    /**
     * Whether to calculate 2D color attributes (attributes that depend on the result of multiple 1D
     * attributes). This includes saturation (Sz), vividness (Vz), blackness (Kz), and whiteness (Wz).
     *
     * These attributes are unnecessary in most cases, so you can set this to false and speed up the
     * calculations.
     */
    include2D = true,
  ): Zcam {
    /* Step 2 */
    // Raw responses (similar to Jzazbz)
    const [Iz, az, bz] = xyzToIzazbz(this)

    /* Step 3 */
    // Hue angle
    const hzRaw = toDegrees(Math.atan2(bz, az))
    const hz = hzRaw < 0 ? hzRaw + 360 : hzRaw

    /* Step 4 */
    // Eccentricity factor
    const ez = hpToEz(hz)

    /* Step 5 */
    // Brightness
    const Qz = izToQz(Iz, cond)
    const Qz_w = cond.Qz_w

    // Lightness
    const Jz = 100.0 * (Qz / Qz_w)

    // Colorfulness
    const Mz =
      100.0 *
      Math.pow(square(az) + square(bz), 0.37) *
      ((Math.pow(ez, 0.068) * cond.ez_coeff) / cond.Mz_denom)

    // Chroma
    const Cz = 100.0 * (Mz / Qz_w)

    /* Step 6 */
    // Saturation
    const Sz = include2D ? 100.0 * cond.Sz_coeff * Math.sqrt(Mz / Qz) : NaN

    // Vividness, blackness, whiteness
    const Vz = include2D ? Math.sqrt(square(Jz - 58) + 3.4 * square(Cz)) : NaN
    const Kz = include2D
      ? 100.0 - 0.8 * Math.sqrt(square(Jz) + 8.0 * square(Cz))
      : NaN
    const Wz = include2D
      ? 100.0 - Math.sqrt(square(100.0 - Jz) + square(Cz))
      : NaN

    return new Zcam({
      brightness: Qz,
      lightness: Jz,
      colorfulness: Mz,
      chroma: Cz,
      hue: hz,

      saturation: Sz,
      vividness: Vz,
      blackness: Kz,
      whiteness: Wz,

      viewingConditions: cond,
    })
  }
}
