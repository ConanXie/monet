/**
 * Common interface for color spaces that express color with the following 3 components:
 *   - L: perceived lightness
 *   - a: amount of green/red color
 *   - b: amount of blue/yellow color
 *
 * Implementations of this are usually uniform color spaces.
 *
 * It may be helpful to convert these colors to polar [Lch] representations
 * for easier manipulation.
 */
export interface Lab {
  /**
   * Perceived lightness component.
   */
  readonly L: number

  /**
   * Green/red color component.
   */
  readonly a: number

  /**
   * Blue/yellow color component.
   */
  readonly b: number
}
