const WHITE_LUMINANCE_MIN = 1.0
const WHITE_LUMINANCE_MAX = 10000.0
export const WHITE_LUMINANCE_USER_MAX = 1000
export const WHITE_LUMINANCE_USER_STEP = 25 // both max and default must be divisible by this
export const WHITE_LUMINANCE_USER_DEFAULT = 425 // ~200.0 divisible by step (decoded = 199.526)

export function parseUserWhiteLuminance(
  userValue = WHITE_LUMINANCE_USER_DEFAULT,
): number {
  const userSrc = userValue / WHITE_LUMINANCE_USER_MAX
  const userInv = 1.0 - userSrc
  return Math.max(
    Math.pow(10.0, userInv * Math.log10(WHITE_LUMINANCE_MAX)),
    WHITE_LUMINANCE_MIN,
  )
}
