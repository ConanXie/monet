import { ViewingConditions, Zcam } from "@monet-color/tools/cam/Zcam"
import { Srgb } from "@monet-color/tools/rgb/Srgb"
import { CieLab } from "@monet-color/tools/lab/CieLab"
import { ColorScheme, ColorSwatch } from "./ColorScheme"

/**
 * from lightest to darkest
 */
export type Shade =
  | 0
  | 10
  | 20
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 650
  | 700
  | 800
  | 900
  | 950
  | 1000

const SHADE_TO_LIGHTNESS: readonly [Shade, number][] = [
  [0, 100.0],
  [10, 99.0],
  [20, 98.0],
  [50, 95.0],
  [100, 90.0],
  [200, 80.0],
  [300, 70.0],
  [400, 60.0],
  [500, 50.0],
  [600, 40.0],
  [650, 35.0],
  [700, 30.0],
  [800, 20.0],
  [900, 10.0],
  [950, 5.0],
  [1000, 0.0],
]

/** Linear ZCAM lightness */
const LINEAR_LIGHTNESS_MAP = new Map<Shade, number>(SHADE_TO_LIGHTNESS)

/** CIELAB lightness from AOSP defaults */
const CIELAB_LIGHTNESS_MAP = new Map<Shade, number>(
  SHADE_TO_LIGHTNESS.map(([key, value]) => [key, value == 50.0 ? 49.6 : value]),
)

/** Accent colors from Pixel defaults */
const REF_ACCENT1_COLORS = [
  0xd3e3fd, 0xa8c7fa, 0x7cacf8, 0x4c8df6, 0x1b6ef3, 0x0b57d0, 0x0842a0,
  0x062e6f, 0x041e49,
]

const ACCENT1_REF_CHROMA_FACTOR = 1.2

/**
 * Default target colors, conforming to Material You standards.
 *
 * Derived from AOSP and Pixel defaults.
 */
export class MaterialYouTargets extends ColorScheme {
  public neutral1
  public neutral2

  public accent1
  public accent2
  public accent3

  constructor(
    public chromaFactor = 1,
    public cond: ViewingConditions,
    useLinearLightness = false,
  ) {
    super()

    const lightnessMap: Map<Shade, number> = useLinearLightness
      ? LINEAR_LIGHTNESS_MAP
      : this.calcCieLabLightnessMap()

    // Accent chroma from Pixel defaults
    // We use the most chromatic color as the reference
    // A-1 chroma = avg(default Pixel Blue shades 100-900)
    // Excluding very bright variants (10, 50) to avoid light bias
    // A-1 > A-3 > A-2
    const accent1Chroma =
      this.calcAccent1Chroma(cond) * ACCENT1_REF_CHROMA_FACTOR
    const accent2Chroma = accent1Chroma / 3
    const accent3Chroma = accent2Chroma * 2

    // Custom neutral chroma
    const neutral1Chroma = accent1Chroma / 8
    const neutral2Chroma = accent1Chroma / 5

    this.neutral1 = this.shadesWithChroma(neutral1Chroma, lightnessMap)
    this.neutral2 = this.shadesWithChroma(neutral2Chroma, lightnessMap)

    this.accent1 = this.shadesWithChroma(accent1Chroma, lightnessMap)
    this.accent2 = this.shadesWithChroma(accent2Chroma, lightnessMap)
    this.accent3 = this.shadesWithChroma(accent3Chroma, lightnessMap)
  }

  private calcCieLabLightnessMap(): Map<Shade, number> {
    const arr: [Shade, number][] = []

    CIELAB_LIGHTNESS_MAP.forEach((value, key) =>
      arr.push([key, this.cielabL(value)]),
    )

    return new Map(arr)
  }

  private cielabL(l: number) {
    return new CieLab(l, 0, 0)
      .toXyz()
      .toAbs(this.cond.referenceWhite.y)
      .toZcam(this.cond, false).lightness
  }

  private calcAccent1Chroma(cond: ViewingConditions) {
    const chromaSum = REF_ACCENT1_COLORS.reduce((prev, curr) => {
      return (
        prev +
        new Srgb(curr)
          .toLinear()
          .toXyz()
          .toAbs(cond.referenceWhite.y)
          .toZcam(cond, false).chroma
      )
    }, 0)

    return chromaSum / REF_ACCENT1_COLORS.length
  }

  private shadesWithChroma(
    chroma: number,
    lightnessMap: Map<Shade, number>,
  ): ColorSwatch {
    // Adjusted chroma
    const chromaAdj = chroma * this.chromaFactor

    const arr: [Shade, Zcam][] = []

    lightnessMap.forEach((value, key) =>
      arr.push([
        key,
        new Zcam({
          lightness: value,
          chroma: chromaAdj,
          hue: 0.0,
          viewingConditions: this.cond,
        }),
      ]),
    )

    return new Map(arr)
  }
}
