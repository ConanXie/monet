import { ClipMethod, LchGamut } from "../gamut/LchGamut"
import { square, toRadians } from "../math"
import { LinearSrgb } from "../rgb/LinearRgb"
import { CieXyzAbs } from "../tristimulus/CieXyzAbs"

/**
 * Surround factor for dark viewing conditions.
 */
export const SURROUND_DARK = 0.525
/**
 * Surround factor for dim viewing conditions.
 */
export const SURROUND_DIM = 0.59
/**
 * Surround factor for average viewing conditions.
 */
export const SURROUND_AVERAGE = 0.69

// Constants
const B = 1.15
const G = 0.66
const C1 = 3424.0 / 4096
const C2 = 2413.0 / 128
const C3 = 2392.0 / 128
const ETA = 2610.0 / 16384
const RHO = (1.7 * 2523.0) / 32
const EPSILON = 3.7035226210190005e-11

// Transfer function and inverse
function pq(x: number): number {
  const num = C1 - Math.pow(x, 1.0 / RHO)
  const denom = C3 * Math.pow(x, 1.0 / RHO) - C2

  return 10000.0 * Math.pow(num / denom, 1.0 / ETA)
}
function pqInv(x: number): number {
  const num = C1 + C2 * Math.pow(x / 10000, ETA)
  const denom = 1.0 + C3 * Math.pow(x / 10000, ETA)

  return Math.pow(num / denom, RHO)
}

/** Intermediate conversion, also used in ViewingConditions */
export function xyzToIzazbz(xyz: CieXyzAbs): number[] {
  // This equation (#4) is wrong in the paper; below is the correct version.
  // It can be derived from the inverse model (supplementary paper) or the original Jzazbz paper.
  const xp = B * xyz.x - (B - 1) * xyz.z
  const yp = G * xyz.y - (G - 1) * xyz.x

  const rp = pqInv(0.41478972 * xp + 0.579999 * yp + 0.014648 * xyz.z)
  const gp = pqInv(-0.20151 * xp + 1.120649 * yp + 0.0531008 * xyz.z)
  const bp = pqInv(-0.0166008 * xp + 0.2648 * yp + 0.6684799 * xyz.z)

  const az = 3.524 * rp + -4.066708 * gp + 0.542708 * bp
  const bz = 0.199076 * rp + 1.096799 * gp + -1.295875 * bp
  const Iz = gp - EPSILON

  return [Iz, az, bz]
}

// Shared between forward and inverse models
export const hpToEz = (hp: number) => 1.015 + Math.cos(toRadians(89.038 + hp))
export const izToQz = (Iz: number, cond: ViewingConditions) =>
  cond.Iz_coeff * Math.pow(Iz, (1.6 * cond.surroundFactor) / cond.Qz_denom)

/**
 * The conditions under which a color modeled by ZCAM will be viewed. This is defined by the luminance of the
 * adapting field, luminance of the background, and surround factor.
 *
 * For performance, viewing conditions should be created once and reused for all ZCAM conversions unless they have
 * changed. Creating an instance of ViewingConditions performs calculations that are reused throughout the ZCAM
 * model.
 */
export class ViewingConditions {
  Iz_coeff: number
  ez_coeff: number
  Qz_denom: number
  Sz_coeff: number
  Sz_denom: number
  Mz_denom: number
  Qz_w: number

  constructor(
    /**
     * Surround factor, which models the surround field (distant background).
     */
    public readonly surroundFactor: number,
    /**
     * Absolute luminance of the adapting field. This can be calculated as L_w * [backgroundLuminance] / 100 where
     * L_w is the luminance of [referenceWhite], but it is a user-controlled parameter for flexibility.
     */
    public readonly adaptingLuminance: number,
    /**
     * Absolute luminance of the background.
     */
    public readonly backgroundLuminance: number,

    /**
     * Reference white point in absolute XYZ.
     */
    public readonly referenceWhite: CieXyzAbs,
  ) {
    const F_b = Math.sqrt(backgroundLuminance / referenceWhite.y)
    const F_l =
      0.171 *
      Math.cbrt(adaptingLuminance) *
      (1.0 - Math.exp((-48.0 / 9.0) * adaptingLuminance))

    this.Iz_coeff =
      2700.0 *
      Math.pow(surroundFactor, 2.2) *
      Math.sqrt(F_b) *
      Math.pow(F_l, 0.2)
    this.ez_coeff = Math.pow(F_l, 0.2)
    this.Qz_denom = Math.pow(F_b, 0.12)
    this.Sz_coeff = Math.pow(F_l, 0.6)
    this.Sz_denom = Math.pow(F_l, 1.2)

    const Iz_w = xyzToIzazbz(referenceWhite)[0]
    this.Mz_denom = Math.pow(Iz_w, 0.78) * Math.pow(F_b, 0.1)

    // Depends on coefficients computed above
    this.Qz_w = izToQz(Iz_w, this)
  }
}

/**
 * ZCAM attributes that can be used to calculate luminance in the inverse model.
 */
export enum LuminanceSource {
  /**
   * Use the brightness attribute to calculate luminance in the inverse model.
   * Lightness will be ignored.
   */
  BRIGHTNESS,
  /**
   * Use the lightness attribute to calculate luminance in the inverse model.
   * Brightness will be ignored.
   */
  LIGHTNESS,
}

/**
 * ZCAM attributes that can be used to calculate chroma (colorfulness) in the inverse model.
 */
export enum ChromaSource {
  /**
   * Use the chroma attribute to calculate luminance in the inverse model.
   * Colorfulness, saturation, vividness, blackness, and whiteness will be ignored.
   */
  CHROMA,
  /**
   * Use the colorfulness attribute to calculate luminance in the inverse model.
   * Chroma, saturation, vividness, blackness, and whiteness will be ignored.
   */
  COLORFULNESS,
  /**
   * Use the saturation attribute to calculate luminance in the inverse model.
   * Chroma, colorfulness, vividness, blackness, and whiteness will be ignored.
   */
  SATURATION,
  /**
   * Use the vividness attribute to calculate luminance in the inverse model.
   * Chroma, colorfulness, saturation, blackness, and whiteness will be ignored.
   */
  VIVIDNESS,
  /**
   * Use the blackness attribute to calculate luminance in the inverse model.
   * Chroma, colorfulness, saturation, vividness, and whiteness will be ignored.
   */
  BLACKNESS,
  /**
   * Use the whiteness attribute to calculate luminance in the inverse model.
   * Chroma, colorfulness, saturation, vividness, and blackness will be ignored.
   */
  WHITENESS,
}

export interface ZcamAttributes {
  brightness?: number
  lightness?: number
  colorfulness?: number
  chroma?: number
  hue: number
  saturation?: number
  vividness?: number
  blackness?: number
  whiteness?: number
  viewingConditions: ViewingConditions
}

/**
 * A color modeled by the ZCAM color appearance model, which provides a variety of perceptual color attributes.
 * This color appearance model is designed with HDR in mind so it only accepts *absolute* CIE XYZ values scaled by the
 * absolute luminance of the modeled display, unlike SDR color spaces that accept relative luminance.
 *
 * Most attributes are optional in the constructor because don't need to be present together. All ZCAM colors must have:
 *     - brightness OR lightness
 *     - colorfulness OR chroma OR saturation OR vividness OR blackness OR whiteness
 *     - hue
 *     - viewing conditions
 *
 * @see <a href="https://www.osapublishing.org/oe/viewmedia.cfm?uri=oe-29-4-6036&html=true">ZCAM, a colour appearance model based on a high dynamic range uniform colour space</a>
 */
// Math code looks better with underscores, and we want to match the paper
export class Zcam {
  // 1D
  /** Absolute brightness. **/
  brightness: number
  /** Brightness relative to the reference white, from 0 to 100. **/
  lightness: number
  /** Absolute colorfulness. **/
  colorfulness: number
  /** Colorfulness relative to the reference white. **/
  chroma: number
  /** Hue from 0 to 360 degrees. **/
  hue: number
  /* hue composition is not supported */

  // 2D
  /** Chroma relative to lightness. 2D attribute. **/
  saturation: number
  /** Distance from neutral black. 2D attribute. **/
  vividness: number
  /** Amount of black. 2D attribute. **/
  blackness: number
  /** Amount of white. 2D attribute. **/
  whiteness: number

  /** Viewing conditions used to model this color. **/
  viewingConditions: ViewingConditions

  // Aliases to match the paper
  /** Alias for [brightness]. **/
  get Qz() {
    return this.brightness
  }
  /** Alias for [lightness]. **/
  get Jz() {
    return this.lightness
  }
  /** Alias for [colorfulness]. **/
  get Mz() {
    return this.colorfulness
  }
  /** Alias for [chroma]. **/
  get Cz() {
    return this.chroma
  }
  /** Alias for [hue]. **/
  get hz() {
    return this.hue
  }
  /** Alias for [saturation]. **/
  get Sz() {
    return this.saturation
  }
  /** Alias for [vividness]. **/
  get Vz() {
    return this.vividness
  }
  /** Alias for [blackness]. **/
  get Kz() {
    return this.blackness
  }
  /** Alias for [whiteness]. **/
  get Wz() {
    return this.whiteness
  }

  constructor({
    brightness = NaN,
    lightness = NaN,
    colorfulness = NaN,
    chroma = NaN,
    hue,
    saturation = NaN,
    vividness = NaN,
    blackness = NaN,
    whiteness = NaN,
    viewingConditions,
  }: ZcamAttributes) {
    this.brightness = brightness
    this.lightness = lightness
    this.colorfulness = colorfulness
    this.chroma = chroma
    this.hue = hue
    this.saturation = saturation
    this.vividness = vividness
    this.blackness = blackness
    this.whiteness = whiteness
    this.viewingConditions = viewingConditions
  }

  /**
   * Convert this color to the CIE XYZ color space, with absolute luminance.
   *
   * @see CieXyzAbs
   * @return Color in absolute XYZ
   */
  toXyzAbs(
    luminanceSource: LuminanceSource,
    chromaSource: ChromaSource,
  ): CieXyzAbs {
    const cond = this.viewingConditions
    const Qz_w = cond.Qz_w

    /* Step 1 */
    // Achromatic response
    const Iz = Math.pow(
      luminanceSource == LuminanceSource.BRIGHTNESS
        ? this.Qz / cond.Iz_coeff
        : (this.Jz * Qz_w) / (cond.Iz_coeff * 100.0),
      cond.Qz_denom / (1.6 * cond.surroundFactor),
    )

    /* Step 2 */
    // Chroma
    let Cz: number
    switch (chromaSource) {
      case ChromaSource.CHROMA:
        Cz = this.Cz
        break
      case ChromaSource.COLORFULNESS:
        Cz = NaN
        break
      case ChromaSource.SATURATION:
        Cz = (this.Qz * square(this.Sz)) / (100.0 * Qz_w * cond.Sz_denom)
        break
      case ChromaSource.VIVIDNESS:
        Cz = Math.sqrt((square(this.Vz) - square(this.Jz - 58)) / 3.4)
        break
      case ChromaSource.BLACKNESS:
        Cz = Math.sqrt((square((100 - this.Kz) / 0.8) - square(this.Jz)) / 8)
        break
      case ChromaSource.WHITENESS:
        Cz = Math.sqrt(square(100.0 - this.Wz) - square(100.0 - this.Jz))
        break
    }

    /* Step 3 is missing because hue composition is not supported */

    /* Step 4 */
    // ... and back to colorfulness
    const Mz =
      chromaSource == ChromaSource.COLORFULNESS ? this.Mz : (Cz * Qz_w) / 100
    const ez = hpToEz(this.hz)
    const Cz_p = Math.pow(
      (Mz * cond.Mz_denom) /
        // Paper specifies pow(1.3514) but this extra precision is necessary for accurate inversion
        (100.0 * Math.pow(ez, 0.068) * cond.ez_coeff),
      1.0 / 0.37 / 2,
    )
    const hzRad = toRadians(this.hz)
    const az = Cz_p * Math.cos(hzRad)
    const bz = Cz_p * Math.sin(hzRad)

    /* Step 5 */
    const I = Iz + EPSILON

    const r = pq(I + 0.2772100865 * az + 0.1160946323 * bz)
    const g = pq(I)
    const b = pq(I + 0.0425858012 * az + -0.7538445799 * bz)

    const xp = 1.9242264358 * r + -1.0047923126 * g + 0.037651404 * b
    const yp = 0.3503167621 * r + 0.7264811939 * g + -0.0653844229 * b
    const z = -0.090982811 * r + -0.3127282905 * g + 1.5227665613 * b

    const x = (xp + (B - 1) * z) / B
    const y = (yp + (G - 1) * x) / G

    return new CieXyzAbs(x, y, z)
  }

  /**
   * Convert this ZCAM color to linear sRGB, and clip it to sRGB gamut boundaries if it's not already within gamut.
   *
   * Out-of-gamut colors are mapped using gamut intersection in a 2D plane, and hue is always preserved. Lightness and
   * chroma are changed depending on the clip method; see [ClipMethod] for details.
   *
   * @return clipped color in linear sRGB
   */
  clipToLinearSrgb(
    /**
     * Gamut clipping method to use. Different methods preserve different attributes and make different trade-offs.
     * @see [ClipMethod]
     */
    method: ClipMethod = ClipMethod.PRESERVE_LIGHTNESS,
    /**
     * For adaptive clipping methods only: the extent to which lightness should be preserved rather than chroma.
     * Larger numbers will preserve chroma more than lightness, and vice versa.
     *
     * This value is ignored when using other (non-adaptive) clipping methods.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    alpha = 0.05,
  ): LinearSrgb {
    let l0: number
    switch (method) {
      case ClipMethod.PRESERVE_LIGHTNESS:
        l0 = this.lightness
        break
      case ClipMethod.PROJECT_TO_MID:
        l0 = 50.0
        break
      case ClipMethod.ADAPTIVE_TOWARDS_MID:
        // TODO
        //     ClipMethod.ADAPTIVE_TOWARDS_MID -> OklabGamut.calcAdaptiveMidL(
        //         L = lightness / 100.0,
        //         C = chroma / 100.0,
        //         alpha = alpha,
        //     ) * 100.0
        l0 = NaN
        break
    }

    return LchGamut.clip(
      this.lightness,
      this.chroma,
      this.hue,
      l0,
      LchGamut.EPSILON_100,
      100.0,
      {
        getColor: (l, c, h) => {
          const { viewingConditions } = this
          return new Zcam({
            lightness: l,
            chroma: c,
            hue: h,
            viewingConditions: viewingConditions,
          })
            .toXyzAbs(LuminanceSource.LIGHTNESS, ChromaSource.CHROMA)
            .toRel(viewingConditions.referenceWhite.y)
            .toLinearSrgb()
        },
      },
    )
  }
}
