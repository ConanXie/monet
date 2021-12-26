export const cube = (x: number) => x * x * x

export const square = (x: number) => x * x

/**
 * ensure input in [min, max]
 */
export function clamp(min: number, input: number, max: number) {
  return Math.min(Math.max(min, input), max)
}

/**
 * convert degrees to radians
 */
export const toRadians = (degrees: number) => (degrees * Math.PI) / 180.0

/**
 * convert radians to degrees
 */
export const toDegrees = (radians: number) => (radians * 180.0) / Math.PI

/**
 * ensure degrees in [0, 360)
 */
export function sanitizeDegrees(degrees: number) {
  if (degrees < 0) {
    return (degrees % 360) + 360
  } else if (degrees >= 360.0) {
    return degrees % 360
  } else {
    return degrees
  }
}

/**
 * determine the shortest angle between two angles, measured in degrees.
 */
export function differenceDegrees(a: number, b: number): number {
  return 180.0 - Math.abs(Math.abs(a - b) - 180.0)
}
