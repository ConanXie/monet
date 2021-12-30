import { ViewingConditions, Zcam } from "@monet-color/tools/cam/Zcam"
import { Srgb, Color } from "@monet-color/tools/rgb/Srgb"
import { LinearSrgb } from "@monet-color/tools/rgb/LinearRgb"
import { ClipMethod } from "@monet-color/tools/gamut/LchGamut"
import { ColorScheme, ColorSwatch } from "./ColorScheme"
import { Shade } from "./MaterialYouTargets"

/**
 * Hue shift for the tertiary accent color (accent3), in degrees.
 *
 * 60 degrees = shifting by a secondary color
 */
const ACCENT3_HUE_SHIFT_DEGREES = 60.0

export class DynamicColorScheme extends ColorScheme<string> {
  public neutral1
  public neutral2

  public accent1
  public accent2
  public accent3

  constructor(
    public targets: ColorScheme,
    public seedColor: Color,
    public chromaFactor = 1.0,
    private cond: ViewingConditions,
    private accurateShades = true,
    public complementColor: Color | null = null,
  ) {
    super()

    const seedNeutral = new Srgb(seedColor)
      .toLinear()
      .toXyz()
      .toAbs(cond.referenceWhite.y)
      .toZcam(cond, false)
    seedNeutral.chroma = seedNeutral.chroma * chromaFactor

    const seedAccent = seedNeutral
    const seedAccent3: Zcam = new Zcam({
      ...seedAccent,
      chroma: seedAccent.chroma * 0.8,
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

  private transformSwatch(
    swatch: ColorSwatch,
    seed: Zcam,
    referenceSwatch: ColorSwatch,
  ): Map<Shade, string> {
    const arr: [Shade, string][] = []

    swatch.forEach((color, shade) => {
      const target = color
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
