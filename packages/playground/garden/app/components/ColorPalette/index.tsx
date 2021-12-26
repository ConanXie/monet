import { FC, useEffect, useMemo, useState } from "react"
import { createColorScheme, DynamicColorScheme } from "@monet/theme"
import { Color, Srgb } from "@monet/tools/rgb/Srgb"

const tones = [0, 10, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]

type Props = {
  color: Color
}

export const ColorPalette: FC<Props> = (props) => {
  const [colorScheme, setColorScheme] = useState<DynamicColorScheme>()

  useEffect(() => {
    console.time("color scheme")
    const scheme = createColorScheme(props.color)
    console.timeEnd("color scheme")
    setColorScheme(scheme)
  }, [])

  const colorHex = useMemo(function () {
    const color = new Srgb(props.color).toHex()

    return color
  }, [])

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
                {tones.map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>A-1</td>
                {tones.map((key) => {
                  const color = colorScheme.accent1.get(key)
                  return (
                    <td key={color}>
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
                {tones.map((key) => {
                  const color = colorScheme.accent2.get(key)
                  return (
                    <td key={color}>
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
                {tones.map((key) => {
                  const color = colorScheme.accent3.get(key)
                  return (
                    <td key={color}>
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
                {tones.map((key) => {
                  const color = colorScheme.neutral1.get(key)
                  return (
                    <td key={color}>
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
                {tones.map((key) => {
                  const color = colorScheme.neutral2.get(key)
                  return (
                    <td key={color}>
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
