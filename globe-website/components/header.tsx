"use client"

import { useState, useEffect } from "react"
import { Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"

export default function Header() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // After mounting, we can access the theme
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="absolute top-0 w-full z-10 flex justify-center p-6">
      <nav className="flex items-center gap-8">
        <a href="#about" className="text-white hover:text-gray-300 transition-colors">
          ABOUT
        </a>
        <a href="#work" className="text-white hover:text-gray-300 transition-colors">
          WORK
        </a>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-white hover:text-gray-300 transition-colors"
          aria-label="Toggle theme"
        >
          {mounted && theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </nav>
    </header>
  )
}
