"use client"

import { ReactElement, useState } from "react"
import Link from "next/link"
import { Menu, X, Award, BookOpen } from "lucide-react"
import { ThemeToggle } from "./ThemeToggle"

export function Navbar(): ReactElement {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)

  return (
    <nav className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-pink-300/30 dark:border-pink-900/30 py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="text-pink-500 text-2xl font-bold font-mono">Succinct Stats</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            href="/earn"
            className="text-gray-800 dark:text-white hover:text-pink-400 dark:hover:text-pink-400 font-mono group relative"
          >
            [EARN]
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pink-500 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link
            href="/docs"
            className="text-gray-800 dark:text-white hover:text-pink-400 dark:hover:text-pink-400 font-mono group relative"
          >
            [DOCS]
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pink-500 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />
          <button className="text-gray-800 dark:text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/90 dark:bg-black/90 backdrop-blur-md border-t border-pink-300/30 dark:border-pink-900/30 py-4">
          <div className="container mx-auto px-4 flex flex-col space-y-4">
            <Link
              href="/earn"
              className="flex items-center space-x-2 text-gray-800 dark:text-white hover:text-pink-400 dark:hover:text-pink-400 font-mono"
              onClick={() => setIsMenuOpen(false)}
            >
              <Award size={18} />
              <span>[EARN]</span>
            </Link>
            <Link
              href="/docs"
              className="flex items-center space-x-2 text-gray-800 dark:text-white hover:text-pink-400 dark:hover:text-pink-400 font-mono"
              onClick={() => setIsMenuOpen(false)}
            >
              <BookOpen size={18} />
              <span>[DOCS]</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

