import { useEffect, useState } from "react"

export function useMediaQuery(query: string): boolean {
  const [value, setValue] = useState(false)

  useEffect(() => {
    function onChange(event: MediaQueryListEvent | MediaQueryList) {
      setValue(event.matches)
    }

    const result = window.matchMedia(query)
    setValue(result.matches)

    // Older browsers support `addListener/removeListener`
    if (typeof result.addListener === "function") {
      result.addListener(onChange)
    } else {
      result.addEventListener("change", onChange)
    }

    return () => {
      // Older browsers support `removeListener/removeListener`
      if (typeof result.removeListener === "function") {
        result.removeListener(onChange)
      } else {
        result.removeEventListener("change", onChange)
      }
    }
  }, [query])

  return value
} 