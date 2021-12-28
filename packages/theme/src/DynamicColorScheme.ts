import {
  ViewingConditions,
  Zcam,
  SURROUND_AVERAGE,
} from "@monet-color/tools/cam/Zcam"
import { Srgb, Color } from "@monet-color/tools/rgb/Srgb"
import { LinearSrgb } from "@monet-color/tools/rgb/LinearRgb"
import { CieLab } from "@monet-color/tools/lab/CieLab"
import { ClipMethod } from "@monet-color/tools/gamut/LchGamut"
import { Illuminants } from "@monet-color/tools/data/Illuminants"
import { ColorScheme, ColorSwatch } from "./ColorScheme"
import { MaterialYouTargets } from "./MaterialYouTargets"

/**
 * Hue shift for the tertiary accent color (accent3), in degrees.
 *
 * 60 degrees = shifting by a secondary color
 */
const ACCENT3_HUE_SHIFT_DEGREES = 60.0

export interface DynamicColorSchemeParameters {
  targets: ColorScheme<Zcam>
  seedColor: Color
  chromaFactor?: number
  cond: ViewingConditions
  accurateShades?: boolean
  complementColor?: Color | null
}

export class DynamicColorScheme extends ColorScheme<string> {
  neutral1: ColorSwatch<string>
  neutral2: ColorSwatch<string>
  accent1: ColorSwatch<string>
  accent2: ColorSwatch<string>
  accent3: ColorSwatch<string>

  targets: ColorScheme<Zcam>
  seedColor: Color
  chromaFactor: number
  cond: ViewingConditions
  accurateShades: boolean
  complementColor: Color | null

  constructor({
    targets,
    seedColor,
    chromaFactor = 1.0,
    cond,
    accurateShades = true,
    complementColor = null,
  }: DynamicColorSchemeParameters) {
    super()

    this.targets = targets
    this.seedColor = seedColor
    this.chromaFactor = chromaFactor
    this.cond = cond
    this.accurateShades = accurateShades
    this.complementColor = complementColor

    const seedNeutral = new Srgb(seedColor)
      .toLinear()
      .toXyz()
      .toAbs(cond.referenceWhite.y)
      .toZcam(cond, false)
    seedNeutral.chroma = seedNeutral.chroma * chromaFactor

    const seedAccent = seedNeutral
    const seedAccent3: Zcam = new Zcam({
      ...seedAccent,
      chroma: seedAccent.chroma * 0.7,
      hue: complementColor
        ? new Srgb(complementColor)
            .toLinear()
            .toXyz()
            .toAbs(cond.referenceWhite.y)
            .toZcam(cond, false).hue
        : seedAccent.hue + ACCENT3_HUE_SHIFT_DEGREES,
    })

    // Main accent color. Generally, this is close to the seed color.
    this.accent1 = this.transformSwatch(
      targets.accent1,
      seedAccent,
      targets.accent1,
    )
    // Secondary accent color. Darker shades of accent1.
    this.accent2 = this.transformSwatch(
      targets.accent2,
      seedAccent,
      targets.accent1,
    )
    // Tertiary accent color. Seed color shifted to the next secondary color via hue offset.
    this.accent3 = this.transformSwatch(
      targets.accent3,
      seedAccent3,
      targets.accent1,
    )

    // Main background color. Tinted with the seed color.
    this.neutral1 = this.transformSwatch(
      targets.neutral1,
      seedNeutral,
      targets.neutral1,
    )
    // Secondary background color. Slightly tinted with the seed color.
    this.neutral2 = this.transformSwatch(
      targets.neutral2,
      seedNeutral,
      targets.neutral1,
    )
  }

  transformSwatch(
    swatch: ColorSwatch<Zcam>,
    seed: Zcam,
    referenceSwatch: ColorSwatch<Zcam>,
  ): Map<number, string> {
    const arr: [number, string][] = []

    swatch.forEach((color, shade) => {
      const target = color
      const reference = referenceSwatch.get(shade)!
      const newLch = this.transformColor(target, seed, reference)
      const newSrgb = newLch.toSrgb()

      arr.push([shade, newSrgb.toHex()])
    })

    return new Map(arr)
  }

  private transformColor(
    target: Zcam,
    seed: Zcam,
    reference: Zcam,
  ): LinearSrgb {
    // Keep target lightness.
    const lightness = target.lightness
    // Allow colorless gray and low-chroma colors by clamping.
    // To preserve chroma ratios, scale chroma by the reference (A-1 / N-1).
    const scaleC =
      reference.chroma == 0.0
        ? // Zero reference chroma won't have chroma anyway, so use 0 to avoid a divide-by-zero
          0.0
        : // Non-zero reference chroma = possible chroma scale
          Math.max(0, Math.min(seed.chroma, reference.chroma)) /
          reference.chroma

    const chroma = target.chroma * scaleC
    // Use the seed color's hue, since it's the most prominent feature of the theme.
    const hue = seed.hue

    const newColor = new Zcam({
      lightness: lightness,
      chroma: chroma,
      hue: hue,
      viewingConditions: this.cond,
    })

    return this.accurateShades
      ? newColor.clipToLinearSrgb(ClipMethod.PRESERVE_LIGHTNESS)
      : newColor.clipToLinearSrgb(ClipMethod.ADAPTIVE_TOWARDS_MID, 5.0)
  }
}

const WHITE_LUMINANCE_MIN = 1.0
const WHITE_LUMINANCE_MAX = 10000.0
const WHITE_LUMINANCE_USER_MAX = 1000
const WHITE_LUMINANCE_USER_STEP = 25 // both max and default must be divisible by this
const WHITE_LUMINANCE_USER_DEFAULT = 425 + WHITE_LUMINANCE_USER_STEP * -9 // ~200.0 divisible by step (decoded = 199.526)

function createZcamViewingConditions(whiteLuminance: number) {
  return new ViewingConditions(
    SURROUND_AVERAGE,
    // sRGB
    0.4 * whiteLuminance,
    // Gray world
    new CieLab(50.0, 0.0, 0.0).toXyz().y * whiteLuminance,
    Illuminants.D65.toAbs(whiteLuminance),
  )
}

function getWhiteLuminance(): number {
  const userValue = WHITE_LUMINANCE_USER_DEFAULT
  return parseWhiteLuminanceUser(userValue)
}

function parseWhiteLuminanceUser(userValue: number): number {
  const userSrc = userValue / WHITE_LUMINANCE_USER_MAX
  const userInv = 1.0 - userSrc
  return Math.max(
    Math.pow(10.0, userInv * Math.log10(WHITE_LUMINANCE_MAX)),
    WHITE_LUMINANCE_MIN,
  )
}

export const cond = createZcamViewingConditions(getWhiteLuminance())
// console.log(cond);

const targets = new MaterialYouTargets(1, false, cond)

// console.log(targets);

// export const scheme = new DynamicColorScheme({
//   targets,
//   seedColor: "#ff0000",
//   cond,
//   chromaFactor: 1,
//   accurateShades: true,
//   complementColor: null,
// });

export function createColorScheme(color: Color) {
  return new DynamicColorScheme({
    targets,
    seedColor: color,
    cond,
    chromaFactor: 1,
    accurateShades: true,
  })
}
