import { FC, useEffect, useRef, useState } from "react"
import { ColorPalette } from "../ColorPalette"
import { DEFAULT_VIEWING_CONDITIONS } from "@monet-color/theme"
import { getPalette } from "@monet-color/palette"
import { useTheme } from "~/providers/theme"
import clsx from "clsx"

type Props = {
  src: string
}

export const ImageDominant: FC<Props> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [activeColor, setActiveColor] = useState<string>("")

  const [quantizationColors, setQuantizationColors] = useState<string[]>([])

  const theme = useTheme()

  function quantizeImage(img: HTMLImageElement) {
    console.time("quantize image")
    const colors = getPalette(img, DEFAULT_VIEWING_CONDITIONS)
    console.timeEnd("quantize image")
    setQuantizationColors(colors)
    setActiveColor(colors[0])
  }

  useEffect(() => {
    const img = imageRef.current

    if (img) {
      quantizeImage(img)
    }
  }, [])

  useEffect(() => {
    if (activeColor) {
      setTheme(activeColor)
    }
  }, [activeColor])

  function setTheme(color: string) {
    theme?.changeTheme(color)
    containerRef.current!.dataset.color = color
  }

  return (
    <div className="dominant-container" ref={containerRef}>
      <img ref={imageRef} src={props.src} />
      {quantizationColors.length && (
        <>
          <div className="dominant-color">
            <div>
              <h2>Palette</h2>
              <div>
                {quantizationColors.map((color) => (
                  <div
                    className={clsx([
                      "color-item",
                      { active: activeColor == color },
                    ])}
                    role="button"
                    onClick={() => setActiveColor(color)}
                    key={color}
                  >
                    <span
                      style={{
                        backgroundColor: color,
                      }}
                    ></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {activeColor && (
            <>
              <h3>Color Sheme</h3>
              <ColorPalette color={activeColor} />
            </>
          )}
        </>
      )}
    </div>
  )
}
