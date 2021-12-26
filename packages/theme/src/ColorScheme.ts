export type ColorSwatch<T> = Map<number, T>

export abstract class ColorScheme<T> {
  abstract neutral1: ColorSwatch<T>
  abstract neutral2: ColorSwatch<T>

  abstract accent1: ColorSwatch<T>
  abstract accent2: ColorSwatch<T>
  abstract accent3: ColorSwatch<T>

  // Helpers
  get accentColors(): ColorSwatch<T>[] {
    return [this.accent1, this.accent2, this.accent3]
  }

  get neutralColors(): ColorSwatch<T>[] {
    return [this.neutral1, this.neutral2]
  }
}
