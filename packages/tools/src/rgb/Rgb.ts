/**
 * Common interface for color spaces that express color with the following 3 components:
 *   - R: amount of red color
 *   - G: amount of green color
 *   - B: amount of blue color
 *
 * Implementations of this are usually device color spaces, used for final output colors.
 */
export interface Rgb {
  /**
   * Red color component.
   */
  r: number

  /**
   * Green color component.
   */
  g: number

  /**
   * Blue color component.
   */
  b: number
}
