/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { differenceDegrees, sanitizeDegrees } from "@monet-color/tools/math"
import { Srgb } from "@monet-color/tools/rgb/Srgb"
import { ViewingConditions, Zcam } from "@monet-color/tools/cam/Zcam"

export class Score {
  // private static readonly TARGET_CHROMA = 48.0;
  private static readonly TARGET_CHROMA = 25.0
  // private static readonly WEIGHT_PROPORTION = 0.7;
  private static readonly WEIGHT_PROPORTION = 0.4
  private static readonly WEIGHT_CHROMA_ABOVE = 0.5
  private static readonly WEIGHT_CHROMA_BELOW = 0.1
  private static readonly CUTOFF_CHROMA = 15.0
  private static readonly CUTOFF_TONE = 10.0
  private static readonly CUTOFF_EXCITED_PROPORTION = 0.01

  /**
   * Given a map with keys of colors and values of how often the color appears,
   * rank the colors based on suitability for being used for a UI theme.
   *
   * @param colorsToPopulation map with keys of colors and values of how often
   *     the color appears, usually from a source image.
   * @return Colors sorted by suitability for a UI theme. The most suitable
   *     color is the first item, the least suitable is the last. There will
   *     always be at least one color returned. If all the input colors
   *     were not suitable for a theme, a default fallback color will be
   *     provided, Google Blue.
   */
  static score(
    colorsToPopulation: Map<number, number>,
    cond: ViewingConditions,
  ): number[] {
    // Determine the total count of all colors.
    let populationSum = 0
    for (const population of colorsToPopulation.values()) {
      populationSum += population
    }

    // Turn the count of each color into a proportion by dividing by the total
    // count. Also, fill a cache of Zcam colors representing each color, and
    // record the proportion of colors for each Zcam hue.
    const colorsToProportion = new Map<number, number>()
    const colorsToCam = new Map<number, Zcam>()
    const hueProportions = new Array<number>(360).fill(0)
    for (const [color, population] of colorsToPopulation.entries()) {
      const proportion = population / populationSum
      colorsToProportion.set(color, proportion)

      const cam = new Srgb(color & 0x00ffffff)
        .toLinear()
        .toXyz()
        .toAbs(cond.referenceWhite.y)
        .toZcam(cond, false)

      colorsToCam.set(color, cam)

      const hue = Math.round(cam.hue)
      hueProportions[hue] += proportion
    }

    // Determine the proportion of the colors around each color, by summing the
    // proportions around each color's hue.
    const colorsToExcitedProportion = new Map<number, number>()
    for (const [color, cam] of colorsToCam.entries()) {
      const hue = Math.round(cam.hue)

      let excitedProportion = 0
      for (let i = hue - 10; i < hue + 10; i++) {
        const neighborHue = sanitizeDegrees(i)
        excitedProportion += hueProportions[neighborHue]
      }
      colorsToExcitedProportion.set(color, excitedProportion)
    }
    // console.log("colorsToExcitedProportion", colorsToExcitedProportion);

    // Score the colors by their proportion, as well as how chromatic they are.
    const colorsToScore = new Map<number, number>()
    for (const [color, cam] of colorsToCam.entries()) {
      const proportion = colorsToExcitedProportion.get(color)!
      const proportionScore = proportion * 100.0 * Score.WEIGHT_PROPORTION

      const chromaWeight =
        cam.colorfulness < Score.TARGET_CHROMA
          ? Score.WEIGHT_CHROMA_BELOW
          : Score.WEIGHT_CHROMA_ABOVE
      const chromaScore =
        (cam.colorfulness - Score.TARGET_CHROMA) * chromaWeight
      // console.log(
      //   `proportionScore: ${proportionScore}, chromaScore: ${chromaScore}`
      // );

      const score = proportionScore + chromaScore
      colorsToScore.set(color, score)
    }
    // console.log("colorsToScore", colorsToScore);

    // Remove colors that are unsuitable, ex. very dark or unchromatic colors.
    // And sorted by colorfulness, lightness and score
    // Also, remove colors that are very similar in hue.
    const filteredColors = Score.filter(
      colorsToExcitedProportion,
      colorsToCam,
    ).sort((c1, c2) => {
      const { colorfulness: c1Colorfulness, lightness: c1Lightness } =
        colorsToCam.get(c1)!
      const { colorfulness: c2Colorfulness, lightness: c2Lightness } =
        colorsToCam.get(c2)!
      // return (
      //   c2Colorfulness * colorsToProportion.get(c2)! -
      //   c1Colorfulness * colorsToProportion.get(c1)!
      // );
      return (
        (c2Colorfulness * 0.4 + c2Lightness * 0.7) * colorsToScore.get(c2)! -
        (c1Colorfulness * 0.4 + c1Lightness * 0.7) * colorsToScore.get(c1)!
      )
    })
    // return filteredColors;
    // console.log("filteredColors", filteredColors);
    const dedupedColorsToScore = new Map<number, number>()
    for (const color of filteredColors) {
      let duplicateHue = false
      const hue = colorsToCam.get(color)!.hue
      for (const [alreadyChosenColor] of dedupedColorsToScore) {
        const alreadyChosenHue = colorsToCam.get(alreadyChosenColor)!.hue
        if (differenceDegrees(hue, alreadyChosenHue) < 15) {
          duplicateHue = true
          break
        }
      }
      if (duplicateHue) {
        continue
      }
      // console.log(colorsToCam.get(color));
      dedupedColorsToScore.set(color, colorsToScore.get(color)!)
    }
    // console.log('dedupedColorsToScore', dedupedColorsToScore);

    // Ensure the list of colors returned is sorted such that the first in the
    // list is the most suitable, and the last is the least suitable.
    const colorsByScoreDescending = Array.from(dedupedColorsToScore.entries())
    colorsByScoreDescending.sort((first: number[], second: number[]) => {
      return second[1] - first[1]
    })

    const answer = colorsByScoreDescending.map((entry: number[]) => {
      return entry[0]
    })
    // Ensure that at least one color is returned.
    if (answer.length === 0) {
      // Dominant Color
      if (filteredColors.length) {
        answer.push(filteredColors[0])
      } else {
        let maxScore = 0
        let dominantColor: number | undefined
        colorsToScore.forEach((score, color) => {
          if (score > maxScore) {
            maxScore = score
            dominantColor = color
          }
        })

        answer.push(dominantColor || 0xffffff)
      }
    }
    // answer.forEach((color: number) => {
    //   console.log(colorsToCam.get(color))
    //   console.log(colorsToScore.get(color))
    // })
    return answer
  }

  private static filter(
    colorsToExcitedProportion: Map<number, number>,
    colorsToCam: Map<number, Zcam>,
  ): number[] {
    const filtered: number[] = []
    // debugger
    for (const [color, cam] of colorsToCam.entries()) {
      const proportion = colorsToExcitedProportion.get(color)!
      // console.log(cam.chroma, utils.lstarFromInt(color), proportion);
      if (
        cam.colorfulness >= Score.CUTOFF_CHROMA &&
        cam.lightness >= Score.CUTOFF_TONE &&
        proportion >= Score.CUTOFF_EXCITED_PROPORTION
      ) {
        filtered.push(color)
      }
    }
    return filtered
  }
}
