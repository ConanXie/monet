import type { LinksFunction } from "remix"
import { ColorPalette } from "~/components/ColorPalette"

import stylesUrl from "~/styles/samples/index.css"

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }]
}

export default function Samples() {
  return (
    <div>
      <h1>Monet Engine Samples</h1>
      <ColorPalette color="#607d8b" />
      <ColorPalette color="#3f51b5" />
      <ColorPalette color="#795548" />
      <ColorPalette color="#4caf50" />
      <ColorPalette color="#9c27b0" />
      <ColorPalette color="#ff9801" />
      <ColorPalette color="#ff2c93" />
      <ColorPalette color="#2a00ff" />
      <ColorPalette color="#f44336" />
      <ColorPalette color="#019688" />
      <ColorPalette color="#019688" />
      <ColorPalette color="#673ab7" />
      <ColorPalette color="#fdeb3b" />
      {/* <ColorPalette color={["42", "0", "255"]} />
      <ColorPalette color={["76", "175", "80"]} />
      <ColorPalette color={["255", "47", "147"]} />
      <ColorPalette color={["255", "152", "0"]} />
      <ColorPalette color={["156", "39", "176"]} />
      <ColorPalette color={["244", "67", "54"]} /> */}
    </div>
  )
}
