import { CieXyz } from "../tristimulus/CieXyz"
import { Rgb } from "./Rgb"
import { Srgb } from "./Srgb"

/**
 * Linear representation of [Srgb].
 * This is useful as an intermediate color space for conversions.
 *
 * The sRGB non-linearity and its inverse are applied accurately, including the linear part of the piecewise function.
 *
 * @see <a href="https://en.wikipedia.org/wiki/SRGB">Wikipedia</a>
 */
export class LinearSrgb implements Rgb {
  constructor(public r: number, public g: number, public b: number) {}

  /**
   * Check whether this color is within the sRGB gamut.
   * This will return false if any component is either NaN or is not within the 0-1 range.
   *
   * @return true if color is in gamut, false otherwise
   */
  isInGamut(): boolean {
    const { r, g, b } = this
    return r >= 0.0 && r <= 1.0 && g >= 0.0 && g <= 1.0 && b >= 0.0 && b <= 1.0
  }

  // Linear -> sRGB
  private f(x: number) {
    if (x >= 0.0031308) {
      return 1.055 * Math.pow(x, 1.0 / 2.4) - 0.055
    } else {
      return 12.92 * x
    }
  }

  /**
   * Convert this color to standard sRGB.
   * This delinearizes the sRGB components.
   *
   * @see Srgb
   * @return Color in standard sRGB
   */
  toSrgb(this: LinearSrgb): Srgb {
    const { r, g, b, f } = this
    return new Srgb([f(r), f(g), f(b)])
  }

  /**
   * Convert a linear sRGB color (D65 white point) to the CIE XYZ color space.
   *
   * @return Color in XYZ
   */
  toXyz(this: LinearSrgb): CieXyz {
    // This matrix (along with the inverse above) has been optimized to minimize chroma in CIELCh
    // when converting neutral sRGB colors to CIELAB. The maximum chroma for sRGB neutral colors 0-255 is
    // 5.978733960281817e-14.
    //
    // Calculated with https://github.com/facelessuser/coloraide/blob/master/tools/calc_xyz_transform.py
    // Using D65 xy chromaticities from the sRGB spec: x = 0.3127, y = 0.3290
    // Always keep in sync with Illuminants.D65.

    const { r, g, b } = this

    return new CieXyz(
      0.41245643908969226 * r + 0.357576077643909 * g + 0.18043748326639897 * b,
      0.21267285140562256 * r + 0.715152155287818 * g + 0.07217499330655959 * b,
      0.019333895582329303 * r +
        0.11919202588130297 * g +
        0.950304078536368 * b,
    )
  }
}
