import { ViewingConditions } from "@monet-color/tools/cam/Zcam"
import { CieLab } from "@monet-color/tools/lab/CieLab"
import { Color } from "@monet-color/tools/rgb/Srgb"
import { Illuminants } from "@monet-color/tools/data/Illuminants"
import { MaterialYouTargets } from "./MaterialYouTargets"
import { parseUserWhiteLuminance } from "./WhiteLuminance"
import { DynamicColorScheme } from "./DynamicColorScheme"

export * from "./ColorScheme"
export * from "./DynamicColorScheme"
export * from "./MaterialYouTargets"

export function createZcamViewingConditions(whiteLuminance: number) {
  return new ViewingConditions(
    ViewingConditions.SURROUND_AVERAGE,
    // sRGB
    0.4 * whiteLuminance,
    // Gray world
    new CieLab(50.0, 0.0, 0.0).toXyz().y * whiteLuminance,
    Illuminants.D65.toAbs(whiteLuminance),
  )
}

const SRGB_WHITE_LUMINANCE = 200.0 // cd/m^2
export const DEFAULT_VIEWING_CONDITIONS =
  createZcamViewingConditions(SRGB_WHITE_LUMINANCE)
// console.log(DEFAULT_VIEWING_CONDITIONS)

export function createColorScheme(
  color: Color,
  chromaFactor = 1,
  whiteLuminance?: number,
  complementColor?: Color,
) {
  const cond = createZcamViewingConditions(
    parseUserWhiteLuminance(whiteLuminance),
  )
  // console.log(cond);
  const targets = new MaterialYouTargets(chromaFactor, cond, false)
  // console.log(targets);

  return new DynamicColorScheme(
    targets,
    color,
    chromaFactor,
    cond,
    true,
    complementColor,
  )
}
