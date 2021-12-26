import { LinearSrgb } from "../rgb/LinearRgb"

export enum ClipMethod {
  /**
   * Preserve the target lightness (e.g. for contrast) by reducing chroma.
   */
  PRESERVE_LIGHTNESS,

  /**
   * Project towards neutral 50% gray.
   */
  PROJECT_TO_MID,

  /**
   * A mix of lightness-preserving chroma reduction and projecting towards neutral 50% gray.
   */
  ADAPTIVE_TOWARDS_MID,
}

export interface LchFactory {
  getColor(lightness: number, chroma: number, hue: number): LinearSrgb
}

/**
 * sRGB gamut clipping using binary search to find the edge of the gamut for a specific color.
 *
 * Out-of-gamut colors are mapped using gamut intersection in a 2D plane, and hue is always preserved. Lightness and
 * chroma are changed depending on the clip method; see [ClipMethod] for details.
 *
 * [OklabGamut] has the same goal, but this is a generalized solution that works with any color space or color
 * appearance model with brightness/lightness, chroma/colorfulness, and hue attributes. It's not as fast as
 * [OklabGamut] and lacks methods that use the lightness of the maximum chroma in the hue plane, but is much more
 * flexible.
 *
 * Currently, only ZCAM is supported, but the underlying algorithm implementation may be exposed in the future as it is
 * portable to other color spaces and appearance models.
 */
export const LchGamut = {
  /** Epsilon for color spaces where lightness ranges from 0 to 100 */
  EPSILON_100: 0.001,

  evalLine(slope: number, intercept: number, x: number) {
    return slope * x + intercept
  },

  clip(
    // Target point
    l1: number,
    c1: number,
    hue: number,
    // Projection point within gamut
    l0: number,
    // Color space parameters
    epsilon: number,
    maxLightness: number,
    factory: LchFactory,
  ): LinearSrgb {
    let result = factory.getColor(l1, c1, hue)

    if (result.isInGamut()) {
      return result
      // Avoid searching black and white for performance
    } else if (l1 <= epsilon) {
      return new LinearSrgb(0.0, 0.0, 0.0)
    } else if (l1 >= maxLightness - epsilon) {
      return new LinearSrgb(1.0, 1.0, 1.0)
      // Clip with gamut intersection
    } else {
      // Chroma is always 0 so the reference point is guaranteed to be within gamut
      const c0 = 0.0

      // Create a line - x=C, y=L - intersecting a hue plane
      // In theory, we could have a divide-by-zero error here if c1=0. However, that's not a problem because
      // all colors with chroma = 0 should be in gamut, so this loop never runs. Even if this loop somehow
      // ends up running for such a color, it would just result in a slow search that doesn't converge because
      // the NaN causes isInGamut() to return false.
      const slope = (l1 - l0) / (c1 - c0)
      const intercept = l0 - slope * c0

      let lo = 0.0
      let hi = c1

      while (Math.abs(hi - lo) > epsilon) {
        const midC = (lo + hi) / 2
        const midL = LchGamut.evalLine(slope, intercept, midC)

        result = factory.getColor(midL, midC, hue)

        if (!result.isInGamut()) {
          // If this color isn't in gamut, pivot left to get an in-gamut color.
          hi = midC
        } else {
          // If this color is in gamut, test a point to the right that should be just outside the gamut.
          // If the test point is *not* in gamut, we know that this color is right at the edge of the
          // gamut.
          const midC2 = midC + epsilon
          const midL2 = LchGamut.evalLine(slope, intercept, midC2)

          const ptOutside = factory.getColor(midL2, midC2, hue)
          if (ptOutside.isInGamut()) {
            lo = midC
          } else {
            break
          }
        }
      }

      return result
    }
  },
}
