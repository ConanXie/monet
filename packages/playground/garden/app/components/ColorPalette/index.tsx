import { FC, useEffect, useMemo, useState } from "react"
import {
  createColorScheme,
  DynamicColorScheme,
  Shade,
} from "@monet-color/theme"
import { Color, Srgb } from "@monet-color/tools/rgb/Srgb"

const shades: Shade[] = [
  0, 10, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000,
]

type Props = {
  color: Color
  chroma?: number
  whiteLuminance?: number
}

export const ColorPalette: FC<Props> = ({ color, chroma, whiteLuminance }) => {
  const [colorScheme, setColorScheme] = useState<DynamicColorScheme>()

  useEffect(() => {
    const scheme = createColorScheme(color, chroma, whiteLuminance)
    setColorScheme(scheme)
  }, [color, chroma, whiteLuminance])

  const colorHex = useMemo(() => new Srgb(color).toHex(), [color])

  return (
    <div className="color-palette-container">
      {colorScheme && (
        <>
          <table className="color-palette">
            <thead>
              <tr>
                <th>
                  <div
                    className="color-ball"
                    style={{ background: colorHex }}
                  ></div>
                </th>
                {shades.map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>A-1</td>
                {shades.map((key) => {
                  const color = colorScheme.accent1.get(key)
                  return (
                    <td key={`a-1-${key}`}>
                      <div
                        className="color-ball"
                        style={{ background: color }}
                      ></div>
                    </td>
                  )
                })}
              </tr>
              <tr>
                <td>A-2</td>
                {shades.map((key) => {
                  const color = colorScheme.accent2.get(key)
                  return (
                    <td key={`a-2-${key}`}>
                      <div
                        className="color-ball"
                        style={{ background: color }}
                      ></div>
                    </td>
                  )
                })}
              </tr>
              <tr>
                <td>A-3</td>
                {shades.map((key) => {
                  const color = colorScheme.accent3.get(key)
                  return (
                    <td key={`a-3-${key}`}>
                      <div
                        className="color-ball"
                        style={{ background: color }}
                      ></div>
                    </td>
                  )
                })}
              </tr>
              <tr>
                <td>N-1</td>
                {shades.map((key) => {
                  const color = colorScheme.neutral1.get(key)
                  return (
                    <td key={`n-1-${key}`}>
                      <div
                        className="color-ball"
                        style={{ background: color }}
                      ></div>
                    </td>
                  )
                })}
              </tr>
              <tr>
                <td>N-2</td>
                {shades.map((key) => {
                  const color = colorScheme.neutral2.get(key)
                  return (
                    <td key={`n-2-${key}`}>
                      <div
                        className="color-ball"
                        style={{ background: color }}
                      ></div>
                    </td>
                  )
                })}
              </tr>
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
