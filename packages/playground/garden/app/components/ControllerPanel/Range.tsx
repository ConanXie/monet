import { FC, useState } from "react"

type Props = {
  label: string
  id?: string
  min: number
  max: number
  value?: number
  step?: number
  onChange?(value: number): void
}

export const InputRange: FC<Props> = ({
  label,
  id,
  min,
  max,
  value: pValue = min,
  step = 1,
  onChange,
}) => {
  const [value, setValue] = useState(pValue)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(e.target.value)
    setValue(value)
    onChange?.(value)
  }

  return (
    <div>
      <label htmlFor={id || label}>{label}</label>
      <input
        id={id || label}
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
      ></input>
      <span>{value}</span>
    </div>
  )
}
