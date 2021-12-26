import { FC, useEffect, useRef, useState } from "react"
import { ColorPalette } from "../ColorPalette"
import { cond } from "@monet/theme"
import { getPalette } from "@monet/palette"
import { useTheme } from "~/providers/theme"

type Props = {
  src: string
}

export const ImageDominant: FC<Props> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const [quantizationColors, setQuantizationColors] = useState<string[]>([])

  const theme = useTheme()

  function quantizeImage(img: HTMLImageElement) {
    console.time("quantizeImage")
    const colors = getPalette(img, cond)
    console.timeEnd("quantizeImage")
    setQuantizationColors(colors)
    setTheme(colors)
  }

  useEffect(() => {
    const img = imageRef.current

    if (img) {
      quantizeImage(img)
    }
  }, [])

  function setTheme(colors: string[]) {
    const mainColor = colors[0]
    theme?.changeTheme(mainColor)
    containerRef.current!.dataset.color = mainColor
  }

  return (
    <div className="dominant-container" ref={containerRef}>
      <img ref={imageRef} src={props.src} />
      {quantizationColors.length && (
        <>
          <div className="dominant-color">
            <div>
              <h2>Dominant Color</h2>
              <div
                style={{
                  backgroundColor: quantizationColors[0],
                }}
              ></div>
            </div>
            <div>
              <h2>Palette</h2>
              {quantizationColors.map((color, index) => (
                <div
                  style={{ display: "inline-flex", flexDirection: "column" }}
                  key={color}
                >
                  <span style={{ textAlign: "center", paddingRight: 4 }}>
                    {index}
                  </span>
                  <div className="color-item">
                    <span
                      style={{
                        backgroundColor: color,
                      }}
                    ></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <ColorPalette color={quantizationColors[0]} />
        </>
      )}
    </div>
  )
}
