import { CieXyz } from "../tristimulus/CieXyz"

const xyToX = (x: number, y: number) => x / y
const xyToZ = (x: number, y: number) => (1.0 - x - y) / y

/**
 * Standard reference illuminants, typically used as reference white points.
 */
export const Illuminants = {
  /**
   * ASTM variant of CIE Standard Illuminant D65. ~6500K color temperature; approximates average daylight in Europe.
   * This uses the XYZ values defined in the ASTM E‑308 document.
   *
   * @see <a href="https://en.wikipedia.org/wiki/Illuminant_D65">Wikipedia: Illuminant D65</a>
   */
  get D65() {
    return new CieXyz(0.95047, 1.0, 1.08883)
  },

  /**
   * sRGB variant of CIE Standard Illuminant D65. ~6500K color temperature; approximates average daylight in Europe.
   * This uses the white point chromaticities defined in the sRGB specification.
   *
   * @see <a href="https://en.wikipedia.org/wiki/SRGB">Wikipedia: sRGB</a>
   */
  get D65_SRGB() {
    return new CieXyz(xyToX(0.3127, 0.329), 1.0, xyToZ(0.3127, 0.329))
  },

  /**
   * Raw precise variant of CIE Standard Illuminant D65. ~6500K color temperature; approximates average daylight in Europe.
   * This uses XYZ values calculated from raw 1nm SPD data, combined with the CIE 1931 2-degree
   * standard observer.
   *
   * @see <a href="https://www.rit.edu/cos/colorscience/rc_useful_data.php">RIT - Useful Color Data</a>
   */
  get D65_CIE() {
    return new CieXyz(0.9504705586542832, 1.0, 1.088828736395884)
  },

  /**
   * CIE Standard Illuminant D50. ~5000K color temperature.
   */
  get D50() {
    return new CieXyz(xyToX(0.3457, 0.3585), 1.0, xyToZ(0.3457, 0.3585))
  },
}
