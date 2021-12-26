import { Illuminants } from "../data/Illuminants"
import { cube } from "../math"
import { CieXyz } from "../tristimulus/CieXyz"
import { Lab } from "./Lab"

/**
 * A color in the CIE L*a*b* uniform color space, which represents colors in [Lab] form.
 * This is the most well-known uniform color space, but more modern alternatives such as
 * [Oklab] tend to be more perceptually uniform.
 *
 * Note that this implementation uses a white point of D65, like sRGB.
 * It does not implement CIELAB D50.
 *
 * @see <a href="https://en.wikipedia.org/wiki/CIELAB_color_space">Wikipedia</a>
 */
export class CieLab implements Lab {
  constructor(
    public readonly L: number,
    public readonly a: number,
    public readonly b: number,
    /**
     * Reference white for CIELAB calculations. This affects the converted color.
     */
    public readonly referenceWhite: CieXyz = Illuminants.D65,
  ) {}

  toXyz(): CieXyz {
    const lp = (this.L + 16.0) / 116.0

    return new CieXyz(
      this.referenceWhite.x * this.fInv(lp + this.a / 500.0),
      this.referenceWhite.y * this.fInv(lp),
      this.referenceWhite.z * this.fInv(lp - this.b / 200.0),
    )
  }

  // private f(x: number) {
  //   if (x > 216.0 / 24389.0) {
  //     return Math.cbrt(x);
  //   } else {
  //     return x / (108.0 / 841.0) + 4.0 / 29.0;
  //   }
  // }

  private fInv(x: number) {
    if (x > 6.0 / 29.0) {
      return cube(x)
    } else {
      return (108.0 / 841.0) * (x - 4.0 / 29.0)
    }
  }
}
