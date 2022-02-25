import { ViewingConditions, Zcam } from "../cam/Zcam"
import { LinearSrgb } from "./LinearRgb"
import { Rgb } from "./Rgb"

export type Color =
  | [number, number, number]
  | [string, string, string]
  | number
  | string

/**
 * A color in the standard sRGB color space.
 * This is the most common device color space, usually used for final output colors.
 *
 * @see <a href="https://en.wikipedia.org/wiki/SRGB">Wikipedia</a>
 */
export class Srgb implements Rgb {
  r: number
  g: number
  b: number

  // Convenient constructors for quantized values

  /**
   * **[string, string, string]** Create a color from 8-bit integer sRGB components.
   *
   * **number** Create a color from a packed (A)RGB8 integer.
   *
   * **string** Create a color from a hex color code (e.g. #FA00FA).
   *            Hex codes with and without leading hash (#) symbols are supported.
   */
  constructor(color: Color) {
    let r: number
    let g: number
    let b: number

    if (typeof color == "number") {
      color = (color & 0x00ffffff).toString(16).padStart(6, "0")
    }
    if (typeof color == "string") {
      color = color
        .replace("#", "")
        .replace(
          /^([a-f\d])([a-f\d])([a-f\d])$/i,
          (_, r, g, b) => r + r + g + g + b + b,
        )

      const match = color.match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/)

      if (!match) {
        throw new Error("Invalid color")
      }

      color = [
        parseInt(match[1], 16).toString(),
        parseInt(match[2], 16).toString(),
        parseInt(match[3], 16).toString(),
      ]
    }
    if (Array.isArray(color) && typeof color[0] === "string") {
      color = [
        Number(color[0]) / 255,
        Number(color[1]) / 255,
        Number(color[2]) / 255,
      ]
    }

    // eslint-disable-next-line prefer-const, @typescript-eslint/no-extra-semi
    ;[r, g, b] = color as number[]

    this.r = r
    this.g = g
    this.b = b
  }

  /** Clamp out-of-bounds values */
  quantize8(n: number): number {
    return Math.max(0, Math.min(Math.round(n * 255), 255))
  }

  /**
   * Convert this color to an 8-bit packed RGB integer (32 bits total)
   *
   * This is equivalent to the integer value of hex color codes (e.g. #FA00FA).
   *
   * @return color as 32-bit integer in RGB8 format
   */
  toRgb8(): number {
    const { r, g, b, quantize8 } = this
    return parseInt(
      quantize8(r).toString(16).padStart(2, "0") +
        quantize8(g).toString(16).padStart(2, "0") +
        quantize8(b).toString(16).padStart(2, "0"),
      16,
    )
  }

  /**
   * Convert this color to an 8-bit hex color code (e.g. #FA00FA).
   *
   * @return color as RGB8 hex code
   */
  toHex(): string {
    return "#" + this.toRgb8().toString(16).padStart(6, "0")
  }

  /** sRGB to linear */
  private fInv(x: number) {
    if (x >= 0.04045) {
      return Math.pow((x + 0.055) / 1.055, 2.4)
    } else {
      return x / 12.92
    }
  }

  /**
   * Convert this color to linear sRGB.
   * This linearizes the sRGB components.
   *
   * @see LinearSrgb
   * @return Color in linear sRGB
   */
  toLinear(): LinearSrgb {
    const { r, g, b, fInv } = this
    return new LinearSrgb(fInv(r), fInv(g), fInv(b))
  }

  /**
   * Convert this color to Zcam
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
    include2D = false,
  ): Zcam {
    return this.toLinear()
      .toXyz()
      .toAbs(cond.referenceWhite.y)
      .toZcam(cond, include2D)
  }
}
