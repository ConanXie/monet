import { Zcam } from "@monet-color/tools/cam/Zcam"
import { Shade } from "./MaterialYouTargets"

export type ColorSwatch<K = Shade, V = Zcam> = Map<K, V>

export abstract class ColorScheme<V = Zcam, K = Shade> {
  abstract neutral1: ColorSwatch<K, V>
  abstract neutral2: ColorSwatch<K, V>

  abstract accent1: ColorSwatch<K, V>
  abstract accent2: ColorSwatch<K, V>
  abstract accent3: ColorSwatch<K, V>

  // Helpers
  get accentColors(): ColorSwatch<K, V>[] {
    return [this.accent1, this.accent2, this.accent3]
  }

  get neutralColors(): ColorSwatch<K, V>[] {
    return [this.neutral1, this.neutral2]
  }
}
