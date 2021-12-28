import { QuantizerCelebi } from "@monet-color/quantize"
import { ViewingConditions } from "@monet-color/tools/cam/Zcam"
import { Srgb } from "@monet-color/tools/rgb/Srgb"
import { Score } from "./score"

/** limit max size of canvas */
const MAX_CANVAS_SIZE = 100

/**
 * Get a palette from the image by clustering similar colors.
 * @param image - ImageHTML image element
 */
export function getPalette(
  image: HTMLImageElement,
  cond: ViewingConditions,
): string[] {
  const { width, height } = image

  // calculate canvas size
  const ratio = width / height
  const isPortrait = width < height
  const w = isPortrait ? MAX_CANVAS_SIZE * ratio : MAX_CANVAS_SIZE
  const h = isPortrait ? MAX_CANVAS_SIZE : MAX_CANVAS_SIZE / ratio

  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")!
  ctx.drawImage(image, 0, 0, w, h)

  const pixelData = ctx.getImageData(0, 0, w, h).data
  // Colors in ARGB format.
  const pixels: number[] = []
  for (let i = 0; i < pixelData.length; i += 4) {
    const color =
      // alpha
      pixelData[i + 3].toString(16).padStart(2, "0") +
      // red
      pixelData[i].toString(16).padStart(2, "0") +
      // green
      pixelData[i + 1].toString(16).padStart(2, "0") +
      // blue
      pixelData[i + 2].toString(16).padStart(2, "0")
    pixels.push(parseInt(color, 16))
  }

  const populations = QuantizerCelebi.quantize(pixels, 128)

  const colors = Score.score(populations, cond)

  return colors.map((color) => new Srgb(color).toHex())
}
