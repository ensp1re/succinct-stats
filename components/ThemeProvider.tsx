"use client"

import { ThemeProvider as NextThemesProvider, ThemeProviderProps } from "next-themes"
import { useEffect } from "react"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  useEffect(() => {
    document.body.classList.remove("light")
    const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
    if (isDarkMode && props.defaultTheme === "dark") {
      document.body.classList.add("dark")
    }
  }, [props.defaultTheme])

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

