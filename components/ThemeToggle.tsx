"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (mounted) {
            if (theme === "dark") {
                document.body.classList.add("dark")
                document.body.classList.remove("light")
            } else {
                document.body.classList.remove("dark")
                document.body.classList.add("light")
            }
        }
    }, [theme, mounted])

    if (!mounted) {
        return null
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="bg-transparent border-gray-300 hover:bg-gray-100 text-gray-800 dark:bg-black/50 dark:border-pink-900/50 dark:hover:bg-pink-950/30 dark:text-pink-500"
                    >
                        {theme === "dark" ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Toggle {theme === "dark" ? "light" : "dark"} mode</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

