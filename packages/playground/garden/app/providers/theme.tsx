import { createColorScheme, DynamicColorScheme } from "@monet/theme"
import { Color } from "@monet/tools/rgb/Srgb"
import { useContext, createContext, FC, useState, useEffect } from "react"

export interface Theme {
  scheme?: DynamicColorScheme
}

interface ThemeContextType {
  changeTheme(color: Color): void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function useTheme() {
  const theme = useContext(ThemeContext)
  return theme
}

export const ThemeProvider: FC = (props) => {
  const [theme, setTheme] = useState<Theme>({})

  useEffect(() => {
    // console.log(theme)
    const { scheme } = theme
    if (scheme) {
      scheme.accent1.forEach((color, weight) => {
        document.documentElement.style.setProperty(
          `--accent1-${weight}`,
          color ?? "",
        )
      })
      scheme.accent2.forEach((color, weight) => {
        document.documentElement.style.setProperty(
          `--accent2-${weight}`,
          color ?? "",
        )
      })
      scheme.accent3.forEach((color, weight) => {
        document.documentElement.style.setProperty(
          `--accent3-${weight}`,
          color ?? "",
        )
      })
      scheme.neutral1.forEach((color, weight) => {
        document.documentElement.style.setProperty(
          `--neutral1-${weight}`,
          color ?? "",
        )
      })
      scheme.neutral2.forEach((color, weight) => {
        document.documentElement.style.setProperty(
          `--neutral2-${weight}`,
          color ?? "",
        )
      })
    }
  }, [theme])

  const value: ThemeContextType = {
    changeTheme(color: Color) {
      console.log(`%ctheme color: ${color}`, `color:${color}`)

      console.time("create color scheme")
      const scheme = createColorScheme(color)
      console.timeEnd("create color scheme")

      setTheme({ scheme })
    },
  }

  return (
    <ThemeContext.Provider value={value}>
      {props.children}
    </ThemeContext.Provider>
  )
}
