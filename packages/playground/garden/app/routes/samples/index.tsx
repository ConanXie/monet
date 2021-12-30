import { useState } from "react"
import type { LinksFunction } from "remix"
import { ColorPalette } from "~/components/ColorPalette"
import { ControllerPanel } from "~/components/ControllerPanel"

import stylesUrl from "~/styles/samples/index.css"

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }]
}

export type ColorController = {
  chroma: number
  whiteLuminance: number
}

export default function Samples() {
  const [controller, setController] = useState<ColorController>({
    chroma: 1,
    whiteLuminance: 425,
  })

  return (
    <div className="samples">
      <ControllerPanel onChange={(value) => setController(value)} />
      <h1>Monet Engine Samples</h1>
      <ColorPalette color="#607d8b" {...controller} />
      <ColorPalette color="#3f51b5" {...controller} />
      <ColorPalette color="#795548" {...controller} />
      <ColorPalette color="#4caf50" {...controller} />
      <ColorPalette color="#9c27b0" {...controller} />
      <ColorPalette color="#ff9801" {...controller} />
      <ColorPalette color="#ff2c93" {...controller} />
      <ColorPalette color="#2a00ff" {...controller} />
      <ColorPalette color="#f44336" {...controller} />
      <ColorPalette color="#019688" {...controller} />
      <ColorPalette color="#673ab7" {...controller} />
      <ColorPalette color="#fdeb3b" {...controller} />
      {/* <ColorPalette color={["42", "0", "255"]} />
      <ColorPalette color={["76", "175", "80"]} />
      <ColorPalette color={["255", "47", "147"]} />
      <ColorPalette color={["255", "152", "0"]} />
      <ColorPalette color={["156", "39", "176"]} />
      <ColorPalette color={["244", "67", "54"]} /> */}
    </div>
  )
}
