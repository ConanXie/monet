import { FC, useEffect, useState } from "react"
import { ColorController } from "~/routes/samples"

import { InputRange } from "./Range"

type Props = {
  onChange(value: ColorController): void
}

export const ControllerPanel: FC<Props> = ({ onChange }) => {
  const [chroma, setChroma] = useState(1)
  const [whiteLuminance, setWhiteLuminance] = useState(425)

  function handleChromaChange(chroma: number) {
    setChroma(chroma)
  }

  function handleWhiteLuminance(whiteLuminance: number) {
    setWhiteLuminance(whiteLuminance)
  }

  useEffect(() => {
    onChange({ chroma, whiteLuminance })
  }, [chroma, whiteLuminance])

  return (
    <div className="panel">
      <h3>Panel</h3>
      <InputRange
        label="Chroma"
        value={chroma}
        min={0}
        max={6}
        step={0.1}
        onChange={handleChromaChange}
      />
      <InputRange
        label="White Luminance"
        value={whiteLuminance}
        min={0}
        max={1000}
        step={25}
        onChange={handleWhiteLuminance}
      />
    </div>
  )
}
