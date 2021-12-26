import { LinearSrgb } from "../rgb/LinearRgb"
import { CieXyzAbs } from "./CieXyzAbs"

/**
 * Default absolute luminance used to convert SDR colors to absolute XYZ.
 * This effectively models the color being displayed on a display with a brightness of 200 nits (cd/m^2).
 */
export const DEFAULT_SDR_WHITE_LUMINANCE = 200.0 // cd/m^2

/**
 * A color in the CIE XYZ tristimulus color space.
 * This is often used as an intermediate color space for uniform color spaces and color appearance models.
 *
 * Note that this is *not* a uniform color space; see [Lab] for that.
 *
 * @see <a href="https://en.wikipedia.org/wiki/CIE_1931_color_space">Wikipedia</a>
 */
export class CieXyz {
  constructor(
    /**
     * X component: mix of the non-negative CIE RGB curves.
     */
    public readonly x: number,
    /**
     * Y component: relative luminance.
     */
    public readonly y: number,
    /**
     * Z component: approximately equal to blue from CIE RGB.
     */
    public readonly z: number,
  ) {}

  /**
   * Convert a relative XYZ color to absolute XYZ, using the specified reference white luminance.
   *
   * @return Color in absolute XYZ
   */
  toAbs(luminance: number = DEFAULT_SDR_WHITE_LUMINANCE): CieXyzAbs {
    return new CieXyzAbs(
      this.x * luminance,
      this.y * luminance,
      this.z * luminance,
    )
  }

  /**
   * Convert this color to the linear sRGB color space.
   *
   * @see LinearSrgb
   * @return Color in linear sRGB
   */
  toLinearSrgb(): LinearSrgb {
    const { x, y, z } = this
    // See LinearSrgb.toXyz for info about the source of this matrix.
    return new LinearSrgb(
      3.2404541621141045 * x +
        -1.5371385127977162 * y +
        -0.4985314095560159 * z,
      -0.969266030505187 * x + 1.8760108454466944 * y + 0.04155601753034983 * z,
      0.05564343095911474 * x +
        -0.2040259135167538 * y +
        1.0572251882231787 * z,
    )
  }
}
