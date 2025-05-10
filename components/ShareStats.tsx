"use client"

import type React from "react"

import { useState, useRef, useEffect, type ReactElement } from "react"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Share2, Twitter, Copy, Check, Download, X, ImageIcon, Palette, Eye, EyeOff, RefreshCw, Upload, Search, SlidersHorizontal, Layers, Sparkles, Zap, Hexagon, Award, Crown, Gem, Droplets, Flower, Snowflake, Flame, Leaf, Shapes, Sticker, Lightbulb, Wand2, Dices, Shrink, Expand } from 'lucide-react'
import { Progress } from "@/components/ui/progress"
import { Star, Shield } from 'lucide-react'
import type { LeaderboardEntry } from "@/lib/types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import * as htmlToImage from "html-to-image"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ROLE_CATEGORIES, categorizeRole, getRoleIndex, sortRolesByImportance, groupRolesByCategory } from "@/lib/roles"

interface ShareStatsProps {
  user: LeaderboardEntry
  progress: {
    proofs: number
    cycles: number
    stars: number
  }
  roles?: string[]
}

// Predefined color themes
const COLOR_THEMES = [
  {
    name: "Default",
    bgGradient: "from-pink-600/30 to-pink-500/30",
    textPrimary: "text-gray-900 dark:text-white",
    textSecondary: "text-cyan-600 dark:text-cyan-400",
    textAccent: "text-pink-500",
    textLogo: "text-white",
    progressBg: "bg-gray-300 dark:bg-pink-900/30",
    progressFill: "from-pink-600 to-pink-400",
    cardBg: "bg-gray-100 dark:bg-[#050505]",
    cardBorder: "border-gray-300 dark:border-pink-900/50",
    glowColor: "rgba(236, 72, 153, 0.3)",
    accentGlowColor: "rgba(34, 211, 238, 0.3)",
  },
  {
    name: "Cyberpunk",
    bgGradient: "from-yellow-500/30 to-purple-500/30",
    textPrimary: "text-gray-900 dark:text-yellow-300",
    textSecondary: "text-purple-600 dark:text-purple-400",
    textAccent: "text-yellow-500",
    textLogo: "text-white",
    progressBg: "bg-gray-300 dark:bg-purple-900/30",
    progressFill: "from-yellow-500 to-purple-500",
    cardBg: "bg-gray-100 dark:bg-[#0a0a16]",
    cardBorder: "border-gray-300 dark:border-purple-900/50",
    glowColor: "rgba(234, 179, 8, 0.3)",
    accentGlowColor: "rgba(168, 85, 247, 0.3)",
  },
  {
    name: "Ocean",
    bgGradient: "from-blue-600/30 to-cyan-500/30",
    textPrimary: "text-gray-900 dark:text-white",
    textSecondary: "text-blue-600 dark:text-blue-400",
    textAccent: "text-cyan-500",
    textLogo: "text-white",
    progressBg: "bg-gray-300 dark:bg-blue-900/30",
    progressFill: "from-blue-600 to-cyan-400",
    cardBg: "bg-gray-100 dark:bg-[#051520]",
    cardBorder: "border-gray-300 dark:border-blue-900/50",
    glowColor: "rgba(37, 99, 235, 0.3)",
    accentGlowColor: "rgba(6, 182, 212, 0.3)",
  },
  {
    name: "Forest",
    bgGradient: "from-green-600/30 to-emerald-500/30",
    textPrimary: "text-gray-900 dark:text-white",
    textSecondary: "text-emerald-600 dark:text-emerald-400",
    textAccent: "text-green-500",
    textLogo: "text-white",
    progressBg: "bg-gray-300 dark:bg-green-900/30",
    progressFill: "from-green-600 to-emerald-400",
    cardBg: "bg-gray-100 dark:bg-[#051505]",
    cardBorder: "border-gray-300 dark:border-green-900/50",
    glowColor: "rgba(22, 163, 74, 0.3)",
    accentGlowColor: "rgba(5, 150, 105, 0.3)",
  },
  {
    name: "Sunset",
    bgGradient: "from-orange-600/30 to-red-500/30",
    textPrimary: "text-gray-900 dark:text-white",
    textSecondary: "text-red-600 dark:text-red-400",
    textAccent: "text-orange-500",
    textLogo: "text-white",
    progressBg: "bg-gray-300 dark:bg-red-900/30",
    progressFill: "from-orange-500 to-red-400",
    cardBg: "bg-gray-100 dark:bg-[#150505]",
    cardBorder: "border-gray-300 dark:border-red-900/50",
    glowColor: "rgba(234, 88, 12, 0.3)",
    accentGlowColor: "rgba(220, 38, 38, 0.3)",
  },
  {
    name: "Neon",
    bgGradient: "from-fuchsia-600/30 to-blue-500/30",
    textPrimary: "text-gray-900 dark:text-white",
    textSecondary: "text-fuchsia-600 dark:text-fuchsia-400",
    textAccent: "text-blue-500",
    textLogo: "text-white",
    progressBg: "bg-gray-300 dark:bg-fuchsia-900/30",
    progressFill: "from-fuchsia-600 to-blue-400",
    cardBg: "bg-gray-100 dark:bg-[#0c0521]",
    cardBorder: "border-gray-300 dark:border-fuchsia-900/50",
    glowColor: "rgba(192, 38, 211, 0.3)",
    accentGlowColor: "rgba(59, 130, 246, 0.3)",
  },
  {
    name: "Synthwave",
    bgGradient: "from-purple-600/30 to-pink-500/30",
    textPrimary: "text-gray-900 dark:text-pink-100",
    textSecondary: "text-purple-600 dark:text-purple-300",
    textAccent: "text-pink-500",
    textLogo: "text-white",
    progressBg: "bg-gray-300 dark:bg-purple-900/30",
    progressFill: "from-purple-600 to-pink-400",
    cardBg: "bg-gray-100 dark:bg-[#120024]",
    cardBorder: "border-gray-300 dark:border-purple-900/50",
    glowColor: "rgba(168, 85, 247, 0.4)",
    accentGlowColor: "rgba(236, 72, 153, 0.4)",
  },
  {
    name: "Aurora",
    bgGradient: "from-teal-600/30 to-purple-500/30",
    textPrimary: "text-gray-900 dark:text-teal-100",
    textSecondary: "text-purple-600 dark:text-purple-300",
    textAccent: "text-teal-500",
    textLogo: "text-white",
    progressBg: "bg-gray-300 dark:bg-teal-900/30",
    progressFill: "from-teal-500 to-purple-400",
    cardBg: "bg-gray-100 dark:bg-[#051a1a]",
    cardBorder: "border-gray-300 dark:border-teal-900/50",
    glowColor: "rgba(20, 184, 166, 0.3)",
    accentGlowColor: "rgba(168, 85, 247, 0.3)",
  },
]

// Decorative patterns
const DECORATIVE_PATTERNS = [
  {
    name: "None",
    pattern: "",
  },
  {
    name: "Dots",
    pattern: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
    size: "20px 20px",
  },
  {
    name: "Grid",
    pattern: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
    size: "20px 20px",
  },
  {
    name: "Diagonal",
    pattern: `repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 1px, transparent 0, transparent 50%)`,
    size: "20px 20px",
  },
  {
    name: "Hexagons",
    pattern: `radial-gradient(circle, rgba(255,255,255,0.1) 2px, transparent 2px)`,
    size: "25px 25px",
    position: "0 0, 12.5px 12.5px",
  },
  {
    name: "Waves",
    pattern: `repeating-radial-gradient(rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 1px, transparent 1px, transparent 100%)`,
    size: "40px 40px",
  },
]

// Badge styles
const BADGE_STYLES = [
  {
    name: "Default",
    style: "default",
  },
  {
    name: "Gradient",
    style: "gradient",
  },
  {
    name: "Outline",
    style: "outline",
  },
  {
    name: "Solid",
    style: "solid",
  },
  {
    name: "Neon",
    style: "neon",
  },
  {
    name: "Glass",
    style: "glass",
  },
]

// Animated backgrounds
const ANIMATED_BACKGROUNDS = [
  {
    name: "None",
    style: "",
  },
  {
    name: "Gradient Flow",
    style: "animate-gradient-flow",
  },
  {
    name: "Pulse",
    style: "animate-pulse-bg",
  },
  {
    name: "Shimmer",
    style: "animate-shimmer",
  },
  {
    name: "Wave",
    style: "animate-wave-bg",
  },
]

// Helper function to get badge color based on role category and importance
function getRoleBadgeStyle(role: string, theme: (typeof COLOR_THEMES)[0], badgeStyle = "default") {
  const category = categorizeRole(role)
  const index = getRoleIndex(role)

  // Base styles
  const baseStyle =
    "transition-all duration-300 text-xs px-2 py-1.5 rounded-md whitespace-nowrap overflow-hidden text-ellipsis max-w-full border shadow-sm hover:shadow-md hover:-translate-y-px flex items-center justify-center h-full"

  // Special case for Truth Prover - make it green
  if (role === "Truth Prover") {
    if (badgeStyle === "neon") {
      return cn(
        baseStyle,
        "bg-green-950 text-green-300 border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]",
      )
    } else if (badgeStyle === "outline") {
      return cn(
        baseStyle,
        "bg-transparent text-green-600 dark:text-green-400 border-green-500",
      )
    } else if (badgeStyle === "solid") {
      return cn(
        baseStyle,
        "bg-green-600 text-white border-green-700",
      )
    } else if (badgeStyle === "glass") {
      return cn(
        baseStyle,
        "bg-green-500/20 backdrop-blur-sm text-green-700 dark:text-green-300 border-green-500/30",
      )
    } else if (badgeStyle === "gradient" || badgeStyle === "default") {
      return cn(
        baseStyle,
        "bg-gradient-to-r from-green-600 to-green-400 text-white border-green-300 shadow-md shadow-green-500/20",
      )
    }
  }

  // Special styling for top roles (first 5)
  if (index < 5) {
    if (badgeStyle === "neon") {
      return cn(
        baseStyle,
        "bg-pink-950 text-pink-300 border-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.6)]",
      )
    } else if (badgeStyle === "outline") {
      return cn(
        baseStyle,
        "bg-transparent text-pink-600 dark:text-pink-400 border-pink-500",
      )
    } else if (badgeStyle === "solid") {
      return cn(
        baseStyle,
        "bg-pink-600 text-white border-pink-700",
      )
    } else if (badgeStyle === "glass") {
      return cn(
        baseStyle,
        "bg-pink-500/20 backdrop-blur-sm text-pink-700 dark:text-pink-300 border-pink-500/30",
      )
    } else if (badgeStyle === "gradient" || badgeStyle === "default") {
      return cn(
        baseStyle,
        "bg-gradient-to-r from-pink-600 to-pink-400 text-white border-pink-300 shadow-md shadow-pink-500/20",
      )
    }
  }

  // Special styling for important roles (next 10)
  if (index < 15) {
    if (category === ROLE_CATEGORIES.ACHIEVEMENT) {
      if (badgeStyle === "neon") {
        return cn(
          baseStyle,
          "bg-purple-950 text-purple-300 border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]",
        )
      } else if (badgeStyle === "outline") {
        return cn(
          baseStyle,
          "bg-transparent text-purple-600 dark:text-purple-400 border-purple-500",
        )
      } else if (badgeStyle === "solid") {
        return cn(
          baseStyle,
          "bg-purple-600 text-white border-purple-700",
        )
      } else if (badgeStyle === "glass") {
        return cn(
          baseStyle,
          "bg-purple-500/20 backdrop-blur-sm text-purple-700 dark:text-purple-300 border-purple-500/30",
        )
      } else if (badgeStyle === "gradient" || badgeStyle === "default") {
        return cn(
          baseStyle,
          "bg-gradient-to-r from-purple-600 to-purple-400 text-white border-purple-300 shadow-md shadow-purple-500/20",
        )
      }
    }
    if (category === ROLE_CATEGORIES.DEVELOPER) {
      if (badgeStyle === "neon") {
        return cn(
          baseStyle,
          "bg-cyan-950 text-cyan-300 border-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]",
        )
      } else if (badgeStyle === "outline") {
        return cn(
          baseStyle,
          "bg-transparent text-cyan-600 dark:text-cyan-400 border-cyan-500",
        )
      } else if (badgeStyle === "solid") {
        return cn(
          baseStyle,
          "bg-cyan-600 text-white border-cyan-700",
        )
      } else if (badgeStyle === "glass") {
        return cn(
          baseStyle,
          "bg-cyan-500/20 backdrop-blur-sm text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
        )
      } else if (badgeStyle === "gradient" || badgeStyle === "default") {
        return cn(
          baseStyle,
          "bg-gradient-to-r from-cyan-600 to-cyan-400 text-white border-cyan-300 shadow-md shadow-cyan-500/20",
        )
      }
    }
    if (category === ROLE_CATEGORIES.STAFF) {
      if (badgeStyle === "neon") {
        return cn(
          baseStyle,
          "bg-amber-950 text-amber-300 border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]",
        )
      } else if (badgeStyle === "outline") {
        return cn(
          baseStyle,
          "bg-transparent text-amber-600 dark:text-amber-400 border-amber-500",
        )
      } else if (badgeStyle === "solid") {
        return cn(
          baseStyle,
          "bg-amber-600 text-white border-amber-700",
        )
      } else if (badgeStyle === "glass") {
        return cn(
          baseStyle,
          "bg-amber-500/20 backdrop-blur-sm text-amber-700 dark:text-amber-300 border-amber-500/30",
        )
      } else if (badgeStyle === "gradient" || badgeStyle === "default") {
        return cn(
          baseStyle,
          "bg-gradient-to-r from-amber-500 to-yellow-400 text-white border-yellow-300 shadow-md shadow-yellow-500/20",
        )
      }
    }
  }

  // Category-based styling with theme colors
  switch (category) {
    case ROLE_CATEGORIES.ACHIEVEMENT:
      if (badgeStyle === "neon") {
        return cn(
          baseStyle,
          "bg-pink-950/70 text-pink-300 border-pink-800 shadow-[0_0_5px_rgba(236,72,153,0.4)]",
        )
      } else if (badgeStyle === "outline") {
        return cn(
          baseStyle,
          "bg-transparent text-pink-600 dark:text-pink-400 border-pink-500/50",
        )
      } else if (badgeStyle === "solid") {
        return cn(
          baseStyle,
          "bg-pink-600/80 text-white border-pink-700/50",
        )
      } else if (badgeStyle === "glass") {
        return cn(
          baseStyle,
          "bg-pink-500/10 backdrop-blur-sm text-pink-700 dark:text-pink-300 border-pink-500/20",
        )
      } else if (badgeStyle === "gradient") {
        return cn(
          baseStyle,
          "bg-gradient-to-r from-pink-500/40 to-pink-400/40 text-pink-800 dark:text-pink-200 border-pink-300/30",
        )
      } else {
        return cn(
          baseStyle,
          "bg-pink-100 dark:bg-pink-900/40 text-pink-800 dark:text-pink-300 border-pink-200 dark:border-pink-800/50",
        )
      }
    case ROLE_CATEGORIES.DEVELOPER:
      if (badgeStyle === "neon") {
        return cn(
          baseStyle,
          "bg-cyan-950/70 text-cyan-300 border-cyan-800 shadow-[0_0_5px_rgba(6,182,212,0.4)]",
        )
      } else if (badgeStyle === "outline") {
        return cn(
          baseStyle,
          "bg-transparent text-cyan-600 dark:text-cyan-400 border-cyan-500/50",
        )
      } else if (badgeStyle === "solid") {
        return cn(
          baseStyle,
          "bg-cyan-600/80 text-white border-cyan-700/50",
        )
      } else if (badgeStyle === "glass") {
        return cn(
          baseStyle,
          "bg-cyan-500/10 backdrop-blur-sm text-cyan-700 dark:text-cyan-300 border-cyan-500/20",
        )
      } else if (badgeStyle === "gradient") {
        return cn(
          baseStyle,
          "bg-gradient-to-r from-cyan-500/40 to-cyan-400/40 text-cyan-800 dark:text-cyan-200 border-cyan-300/30",
        )
      } else {
        return cn(
          baseStyle,
          "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/50",
        )
      }
    case ROLE_CATEGORIES.LANGUAGE:
      if (badgeStyle === "neon") {
        return cn(
          baseStyle,
          "bg-purple-950/70 text-purple-300 border-purple-800 shadow-[0_0_5px_rgba(168,85,247,0.4)]",
        )
      } else if (badgeStyle === "outline") {
        return cn(
          baseStyle,
          "bg-transparent text-purple-600 dark:text-purple-400 border-purple-500/50",
        )
      } else if (badgeStyle === "solid") {
        return cn(
          baseStyle,
          "bg-purple-600/80 text-white border-purple-700/50",
        )
      } else if (badgeStyle === "glass") {
        return cn(
          baseStyle,
          "bg-purple-500/10 backdrop-blur-sm text-purple-700 dark:text-purple-300 border-purple-500/20",
        )
      } else if (badgeStyle === "gradient") {
        return cn(
          baseStyle,
          "bg-gradient-to-r from-purple-500/40 to-purple-400/40 text-purple-800 dark:text-purple-200 border-purple-300/30",
        )
      } else {
        return cn(
          baseStyle,
          "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/50",
        )
      }
    case ROLE_CATEGORIES.COMMUNITY:
      if (badgeStyle === "neon") {
        return cn(
          baseStyle,
          "bg-yellow-950/70 text-yellow-300 border-yellow-800 shadow-[0_0_5px_rgba(234,179,8,0.4)]",
        )
      } else if (badgeStyle === "outline") {
        return cn(
          baseStyle,
          "bg-transparent text-yellow-600 dark:text-yellow-400 border-yellow-500/50",
        )
      } else if (badgeStyle === "solid") {
        return cn(
          baseStyle,
          "bg-yellow-600/80 text-white border-yellow-700/50",
        )
      } else if (badgeStyle === "glass") {
        return cn(
          baseStyle,
          "bg-yellow-500/10 backdrop-blur-sm text-yellow-700 dark:text-yellow-300 border-yellow-500/20",
        )
      } else if (badgeStyle === "gradient") {
        return cn(
          baseStyle,
          "bg-gradient-to-r from-yellow-500/40 to-yellow-400/40 text-yellow-800 dark:text-yellow-200 border-yellow-300/30",
        )
      } else {
        return cn(
          baseStyle,
          "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/50",
        )
      }
    case ROLE_CATEGORIES.STAFF:
      if (badgeStyle === "neon") {
        return cn(
          baseStyle,
          "bg-amber-950/70 text-amber-300 border-amber-800 shadow-[0_0_5px_rgba(245,158,11,0.4)]",
        )
      } else if (badgeStyle === "outline") {
        return cn(
          baseStyle,
          "bg-transparent text-amber-600 dark:text-amber-400 border-amber-500/50",
        )
      } else if (badgeStyle === "solid") {
        return cn(
          baseStyle,
          "bg-amber-600/80 text-white border-amber-700/50",
        )
      } else if (badgeStyle === "glass") {
        return cn(
          baseStyle,
          "bg-amber-500/10 backdrop-blur-sm text-amber-700 dark:text-amber-300 border-amber-500/20",
        )
      } else if (badgeStyle === "gradient") {
        return cn(
          baseStyle,
          "bg-gradient-to-r from-amber-500/40 to-amber-400/40 text-amber-800 dark:text-amber-200 border-amber-300/30",
        )
      } else {
        return cn(
          baseStyle,
          "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/50",
        )
      }
    default:
      if (badgeStyle === "neon") {
        return cn(
          baseStyle,
          "bg-gray-950/70 text-gray-300 border-gray-800 shadow-[0_0_5px_rgba(156,163,175,0.4)]",
        )
      } else if (badgeStyle === "outline") {
        return cn(
          baseStyle,
          "bg-transparent text-gray-600 dark:text-gray-400 border-gray-500/50",
        )
      } else if (badgeStyle === "solid") {
        return cn(
          baseStyle,
          "bg-gray-600/80 text-white border-gray-700/50",
        )
      } else if (badgeStyle === "glass") {
        return cn(
          baseStyle,
          "bg-gray-500/10 backdrop-blur-sm text-gray-700 dark:text-gray-300 border-gray-500/20",
        )
      } else if (badgeStyle === "gradient") {
        return cn(
          baseStyle,
          "bg-gradient-to-r from-gray-500/40 to-gray-400/40 text-gray-800 dark:text-gray-200 border-gray-300/30",
        )
      } else {
        return cn(
          baseStyle,
          "bg-gray-100 dark:bg-gray-800/60 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700/50",
        )
      }
  }
}

// Function to truncate role name if too long
function truncateRoleName(role: string, maxLength = 18): string {
  if (role.length <= maxLength) return role
  return role.substring(0, maxLength - 3) + "..."
}

// Function to get category icon
function getCategoryIcon(category: string): ReactElement {
  switch (category) {
    case ROLE_CATEGORIES.ACHIEVEMENT:
      return <Award className="h-3 w-3 mr-1" />
    case ROLE_CATEGORIES.DEVELOPER:
      return <Zap className="h-3 w-3 mr-1" />
    case ROLE_CATEGORIES.LANGUAGE:
      return <Hexagon className="h-3 w-3 mr-1" />
    case ROLE_CATEGORIES.COMMUNITY:
      return <Sparkles className="h-3 w-3 mr-1" />
    case ROLE_CATEGORIES.STAFF:
      return <Crown className="h-3 w-3 mr-1" />
    default:
      return <Gem className="h-3 w-3 mr-1" />
  }
}

// Function to get decorative icon
function getDecorativeIcon(name: string): ReactElement {
  switch (name) {
    case "sparkles":
      return <Sparkles className="h-4 w-4" />
    case "zap":
      return <Zap className="h-4 w-4" />
    case "droplets":
      return <Droplets className="h-4 w-4" />
    case "flower":
      return <Flower className="h-4 w-4" />
    case "snowflake":
      return <Snowflake className="h-4 w-4" />
    case "flame":
      return <Flame className="h-4 w-4" />
    case "leaf":
      return <Leaf className="h-4 w-4" />
    case "shapes":
      return <Shapes className="h-4 w-4" />
    case "sticker":
      return <Sticker className="h-4 w-4" />
    case "lightbulb":
      return <Lightbulb className="h-4 w-4" />
    case "wand":
      return <Wand2 className="h-4 w-4" />
    case "dices":
      return <Dices className="h-4 w-4" />
    default:
      return <Sparkles className="h-4 w-4" />
  }
}

const ShareStats = ({ user, progress, roles = [] }: ShareStatsProps): ReactElement => {
  const [isCopied, setIsCopied] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const shareCardRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [userStats, setUserStats] = useState<LeaderboardEntry | null>(null)
  const [isShowTwitterButton, setIsShowTwitterButton] = useState<boolean>(false)
  const [userProgress, setUserProgress] = useState(progress)

  // Customization states
  const [showRoles, setShowRoles] = useState(roles.length > 0)
  const [selectedRoles, setSelectedRoles] = useState<string[]>(roles)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(Object.values(ROLE_CATEGORIES))
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState<string>("")
  const [selectedTheme, setSelectedTheme] = useState(COLOR_THEMES[0])
  const [backgroundOpacity, setBackgroundOpacity] = useState(30)
  const [maxRolesToShow, setMaxRolesToShow] = useState(4)
  const [textBackdrop, setTextBackdrop] = useState(false)
  const [textBackdropOpacity, setTextBackdropOpacity] = useState(50)
  const [backgroundBlur, setBackgroundBlur] = useState(0)
  const [roleSearchQuery, setRoleSearchQuery] = useState("")
  const [groupRolesByCategories, setGroupRolesByCategories] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [roleDisplayStyle, setRoleDisplayStyle] = useState<"compact" | "comfortable" | "grid">("comfortable")
  const [showGlowEffects, setShowGlowEffects] = useState(true)
  const [showGradientBorders, setShowGradientBorders] = useState(true)
  const [cardStyle, setCardStyle] = useState<"modern" | "glass" | "minimal" | "neon" | "retro" | "frosted">("modern")
  const [showRankBadge, setShowRankBadge] = useState(true)
  const [showCategoryIcons, setShowCategoryIcons] = useState(true)
  const [animateProgress, setAnimateProgress] = useState(true)
  const [badgeStyle, setBadgeStyle] = useState<"default" | "gradient" | "outline" | "solid" | "neon" | "glass">("default")
  const [gridColumns, setGridColumns] = useState(2)
  const [showCornerDecoration, setShowCornerDecoration] = useState(false)
  const [cornerDecoration, setCornerDecoration] = useState<string>("None")
  const [showPatternBackground, setShowPatternBackground] = useState(false)
  const [patternBackground, setPatternBackground] = useState<string>("None")
  const [showFloatingElements, setShowFloatingElements] = useState(false)
  const [glowIntensity, setGlowIntensity] = useState(50)
  const [showRoleCount, setShowRoleCount] = useState(true)
  const [showCardHeader, setShowCardHeader] = useState(true)
  const [showCardFooter, setShowCardFooter] = useState(true)
  const [showProgressLabels, setShowProgressLabels] = useState(false)
  const [progressBarHeight, setProgressBarHeight] = useState(6)
  const [progressBarStyle, setProgressBarStyle] = useState<"default" | "rounded" | "segmented" | "glow">("default")
  const [showRoleBorders, setShowRoleBorders] = useState(true)
  const [roleBorderRadius, setRoleBorderRadius] = useState(6)
  const [roleSpacing, setRoleSpacing] = useState(2)
  const [animatedBackground, setAnimatedBackground] = useState<string>("None")
  const [rankingBgStyle, setRankingBgStyle] = useState<"solid" | "gradient" | "glass" | "outline">("solid")

  useEffect(() => {
    if (user) {
      setUserStats(user)
      setUserProgress(progress)
    }

    if (roles) {
      setSelectedRoles(sortRolesByImportance(roles))
    }
  }, [user, progress, roles])

  const generateImage = async () => {
    if (!shareCardRef.current || isGeneratingImage) return

    try {
      setIsShowTwitterButton(true)
      setIsGeneratingImage(true)

      await new Promise((resolve) => setTimeout(resolve, 100))
      if (typeof document !== "undefined" && document.fonts && document.fonts.ready) {
        await document.fonts.ready
      } else {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      // Check if the browser is Firefox
      const isFirefox = typeof navigator !== "undefined" && navigator.userAgent.toLowerCase().includes("firefox")
      if (isFirefox) {
        setImageUrl(null)
        setIsGeneratingImage(false)
        return
      }

      const dataUrl = await htmlToImage.toPng(shareCardRef.current)
      setImageUrl(dataUrl)
      setIsGeneratingImage(false)
    } catch (error) {
      console.error("Error generating image:", error)
      setIsGeneratingImage(false)
    }
  }

  const handleDialogOpen = () => {
    setImageUrl(null)
    setTimeout(generateImage, 100)
  }

  const getShareText = () => {
    return userStats
      ? `I'm in the TOP ${userStats.topPercent}% (ranked ${userStats.rank}) on the Succinct Network with ${userStats.stars} stars!\n\nJoin me in proving the world's software.\n\n#SuccinctNetwork #ZKProofs`
      : ""
  }

  const getTwitterShareUrl = () => {
    const text = encodeURIComponent(getShareText())
    return `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent("https://testnet.succinct.xyz")}`
  }

  const copyShareLink = () => {
    navigator.clipboard.writeText(getShareText())
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const downloadImage = () => {
    if (!imageUrl) return

    const link = document.createElement("a")
    link.href = imageUrl
    link.download = `succinct-stats-${userStats?.name.replace("@", "")}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const toggleRoleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
    } else {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  const getFilteredRoles = () => {
    return selectedRoles
      .filter((role) => {
        // Filter by search query
        if (roleSearchQuery && !role.toLowerCase().includes(roleSearchQuery.toLowerCase())) {
          return false
        }

        // Filter by category
        const category = categorizeRole(role)
        if (!selectedCategories.includes(category)) {
          return false
        }

        return true
      })
      .slice(0, maxRolesToShow)
  }

  const filteredRoles = getFilteredRoles()
  const groupedRoles = groupRolesByCategory(filteredRoles)

  const handleThemeChange = (themeName: string) => {
    const theme = COLOR_THEMES.find((t) => t.name === themeName)
    if (theme) {
      setSelectedTheme(theme)
    }
  }

  const regenerateImage = () => {
    setImageUrl(null)
    setTimeout(generateImage, 100)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomBackgroundUrl(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  useEffect(() => {
    document.body.style.overflowY = "auto !important"
  }, [])

  // Get card style classes based on selected style
  const getCardStyleClasses = () => {
    const baseClasses = cn(
      "w-full max-w-xs p-4 rounded-md relative overflow-hidden",
      selectedTheme.cardBg,
      animatedBackground !== "None" && ANIMATED_BACKGROUNDS.find(bg => bg.name === animatedBackground)?.style
    )

    switch (cardStyle) {
      case "glass":
        return cn(
          baseClasses,
          "backdrop-blur-md bg-opacity-70 dark:bg-opacity-50",
          showGradientBorders
            ? "border-0 before:absolute before:inset-0 before:p-[1px] before:rounded-md before:bg-gradient-to-r before:from-white/50 before:via-pink-500/50 before:to-white/50 before:-z-10"
            : "border border-white/20 dark:border-white/10",
        )
      case "minimal":
        return cn(
          baseClasses,
          "border-0 shadow-sm",
          showGradientBorders
            ? "border-0 ring-1 ring-gray-200 dark:ring-gray-800"
            : "border border-gray-200 dark:border-gray-800",
        )
      case "neon":
        return cn(
          baseClasses,
          "border-0 dark:bg-black bg-gray-950",
          showGradientBorders
            ? `border-0 shadow-[0_0_${glowIntensity / 5}px_rgba(236,72,153,${glowIntensity / 100})] dark:shadow-[0_0_${glowIntensity / 4}px_rgba(236,72,153,${glowIntensity / 100})]`
            : "border border-pink-300 dark:border-pink-900/50",
        )
      case "retro":
        return cn(
          baseClasses,
          "border-4 border-double shadow-[5px_5px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[5px_5px_0px_0px_rgba(236,72,153,0.3)]",
          "bg-white dark:bg-gray-900",
        )
      case "frosted":
        return cn(
          baseClasses,
          "backdrop-blur-lg bg-white/70 dark:bg-black/70",
          "border border-white/40 dark:border-white/10",
          "shadow-lg shadow-black/5 dark:shadow-white/5",
        )
      default: // modern
        return cn(
          baseClasses,
          "shadow-lg dark:shadow-pink-500/10",
          showGradientBorders
            ? "border-0 before:absolute before:inset-0 before:p-[1px] before:rounded-md before:bg-gradient-to-r before:from-transparent before:via-pink-500/30 before:to-transparent before:-z-10"
            : selectedTheme.cardBorder,
        )
    }
  }

  // Get ranking background style
  const getRankingBgStyle = () => {
    const baseClasses = "p-2 rounded-md mb-4 text-center"

    switch (rankingBgStyle) {
      case "solid":
        return cn(
          baseClasses,
          "bg-pink-600/80 dark:bg-pink-800/80 text-white border border-pink-700/50"
        )
      case "glass":
        return cn(
          baseClasses,
          "bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-white/10"
        )
      case "outline":
        return cn(
          baseClasses,
          "bg-transparent border-2 border-pink-500/50 dark:border-pink-400/50"
        )
      default: // gradient
        return cn(
          baseClasses,
          selectedTheme.bgGradient,
          cardStyle === "neon"
            ? `border border-pink-500/50 shadow-[0_0_${glowIntensity / 10}px_rgba(236,72,153,${glowIntensity / 100})]`
            : selectedTheme.cardBorder,
        )
    }
  }

  // Get progress bar style
  const getProgressBarStyle = (value: number) => {
    const baseClasses = cn(
      "h-full rounded-full",
      selectedTheme.progressFill,
      animateProgress && "animate-pulse-subtle",
    )

    switch (progressBarStyle) {
      case "rounded":
        return cn(
          baseClasses,
          "rounded-full",
          cardStyle === "neon" && `shadow-[0_0_${glowIntensity / 10}px_rgba(236,72,153,${glowIntensity / 100})]`,
        )
      case "segmented":
        return cn(
          "h-full flex",
          cardStyle === "neon" && `shadow-[0_0_${glowIntensity / 10}px_rgba(236,72,153,${glowIntensity / 100})]`,
        )
      case "glow":
        return cn(
          baseClasses,
          `shadow-[0_0_${glowIntensity / 10}px_rgba(236,72,153,${glowIntensity / 100})]`,
        )
      default:
        return cn(
          baseClasses,
          cardStyle === "neon" && `shadow-[0_0_${glowIntensity / 10}px_rgba(236,72,153,${glowIntensity / 100})]`,
        )
    }
  }

  // Render segmented progress bar
  const renderSegmentedProgress = (value: number) => {
    const segments = 10
    const filledSegments = Math.round((value / 100) * segments)

    return (
      <div className="h-full flex gap-0.5 w-full">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-full flex-1 rounded-sm transition-all duration-300",
              i < filledSegments
                ? `bg-gradient-to-r ${selectedTheme.progressFill}`
                : "bg-gray-300 dark:bg-gray-700/30",
              animateProgress && i < filledSegments && "animate-pulse-subtle",
              cardStyle === "neon" && i < filledSegments && `shadow-[0_0_${glowIntensity / 10}px_rgba(236,72,153,${glowIntensity / 100})]`,
            )}
          />
        ))}
      </div>
    )
  }

  // Render roles based on grouping preference and display style
  const renderRoles = () => {
    if (groupRolesByCategories) {
      return Object.entries(groupedRoles).map(([category, categoryRoles]) => {
        if (categoryRoles.length === 0) return null

        return (
          <div key={category} className="mb-2">
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center justify-between">
              <div className="flex items-center">
                {showCategoryIcons && getCategoryIcon(category)}
                {category}
              </div>
              {showRoleCount && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {categoryRoles.length}
                </span>
              )}
            </div>
            <div
              className={cn(
                "flex flex-wrap",
                roleDisplayStyle === "grid" && `grid grid-cols-${gridColumns} auto-rows-min`,
                `gap-${roleSpacing}`,
              )}
              style={{
                gap: `${roleSpacing * 0.25}rem`,
              }}
            >
              {categoryRoles.map((role) => (
                <TooltipProvider key={role}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={getRoleBadgeStyle(role, selectedTheme, badgeStyle)}
                        style={{
                          borderRadius: `${roleBorderRadius}px`,
                          borderWidth: showRoleBorders ? '1px' : '0',
                        }}
                      >
                        {role.length > 18 ? truncateRoleName(role) : role}
                      </div>
                    </TooltipTrigger>
                    {role.length > 18 && (
                      <TooltipContent>
                        <p className="text-xs">{role}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        )
      })
    } else {
      return (
        <div
          className={cn(
            "flex flex-wrap",
            roleDisplayStyle === "grid" && `grid grid-cols-${gridColumns} auto-rows-min`,
            `gap-${roleSpacing}`,
          )}
          style={{
            gap: `${roleSpacing * 0.25}rem`,
          }}
        >
          {filteredRoles.map((role) => (
            <TooltipProvider key={role}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={getRoleBadgeStyle(role, selectedTheme, badgeStyle)}
                    style={{
                      borderRadius: `${roleBorderRadius}px`,
                      borderWidth: showRoleBorders ? '1px' : '0',
                    }}
                  >
                    {role.length > 18 ? truncateRoleName(role) : role}
                  </div>
                </TooltipTrigger>
                {role.length > 18 && (
                  <TooltipContent>
                    <p className="text-xs">{role}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          ))}
          {selectedRoles.length > maxRolesToShow && (
            <Badge variant="outline" className="text-xs">
              +{selectedRoles.length - maxRolesToShow} more
            </Badge>
          )}
        </div>
      )
    }
  }

  // Get pattern background style
  const getPatternBackgroundStyle = () => {
    const pattern = DECORATIVE_PATTERNS.find(p => p.name === patternBackground)
    if (!pattern || pattern.name === "None") return {}

    return {
      backgroundImage: pattern.pattern,
      backgroundSize: pattern.size,
      backgroundPosition: pattern.position || "0 0",
    }
  }

  return (
    <Dialog onOpenChange={(open) => open && handleDialogOpen()}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 md:mt-0 w-full md:w-auto px-4 border-gray-300 dark:border-pink-900/50 bg-gray-100 dark:bg-black/50 hover:bg-gray-200 dark:hover:bg-pink-950/30 text-gray-900 dark:text-pink-500 text-sm"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl bg-white dark:bg-black border my-4 border-gray-300 dark:border-pink-900/50 overflow-y-auto max-h-[90vh] p-4 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-mono text-gray-900 dark:text-pink-500">
            Customize & Share Your Stats
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preview Panel - Left side */}
          <div className="flex flex-col items-center space-y-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white self-start">Preview</h3>
            <div
              ref={shareCardRef}
              style={{
                fontFamily:
                  'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
                ...getPatternBackgroundStyle(),
              }}
              className={getCardStyleClasses()}
            >
              {/* Custom background image if provided */}
              {customBackgroundUrl && (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${customBackgroundUrl})`,
                    opacity: backgroundOpacity / 100,
                    filter: backgroundBlur > 0 ? `blur(${backgroundBlur}px)` : "none",
                  }}
                ></div>
              )}

              {/* Cyberpunk grid background */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to right, rgba(236, 72, 153, 0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(236, 72, 153, 0.1) 1px, transparent 1px)`,
                  backgroundSize: "15px 15px",
                  opacity: backgroundOpacity / 100,
                }}
              ></div>

              {/* Glowing circuit lines */}
              {showGlowEffects && (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `radial-gradient(circle at 20% 30%, ${selectedTheme.glowColor} 0%, transparent 20%),
                      radial-gradient(circle at 80% 70%, ${selectedTheme.accentGlowColor} 0%, transparent 20%),
                      linear-gradient(90deg, transparent 0%, ${selectedTheme.glowColor} 30%, ${selectedTheme.accentGlowColor} 70%, transparent 100%)`,
                    opacity: backgroundOpacity / 100,
                  }}
                ></div>
              )}

              {/* Floating elements */}
              {showFloatingElements && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-[10%] left-[10%] w-2 h-2 rounded-full bg-pink-500/50 animate-float-slow"></div>
                  <div className="absolute top-[30%] right-[20%] w-3 h-3 rounded-full bg-cyan-500/50 animate-float-medium"></div>
                  <div className="absolute bottom-[20%] left-[30%] w-2 h-2 rounded-full bg-purple-500/50 animate-float-fast"></div>
                  <div className="absolute bottom-[40%] right-[15%] w-1.5 h-1.5 rounded-full bg-yellow-500/50 animate-float-slow"></div>
                </div>
              )}

              {/* Corner decoration */}
              {showCornerDecoration && (
                <div className="absolute top-2 right-2 text-pink-500/70 dark:text-pink-400/70 animate-pulse-subtle">
                  {getDecorativeIcon(cornerDecoration)}
                </div>
              )}

              {textBackdrop && (
                <div
                  className="absolute inset-0 z-[5] pointer-events-none"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, " + textBackdropOpacity / 100 + ")",
                  }}
                ></div>
              )}

              <div className="relative z-10">
                {/* Logo and title centered */}
                {showCardHeader && (
                  <div className="flex justify-center items-center mb-4">
                    <div className="flex items-center">
                      <div
                        className={cn(
                          "w-10 h-10 rounded flex items-center justify-center",
                          cardStyle === "neon"
                            ? `bg-gradient-to-br from-pink-500 to-pink-600 shadow-[0_0_${glowIntensity / 5}px_rgba(236,72,153,${glowIntensity / 100})]`
                            : "bg-gradient-to-br from-pink-500 to-pink-600",
                        )}
                      >
                        <span className={cn("font-bold text-lg", selectedTheme.textLogo)}>S</span>
                      </div>
                      <span
                        className={cn(
                          "text-lg font-bold font-mono ml-2",
                          selectedTheme.textAccent,
                          cardStyle === "neon" && `drop-shadow-[0_0_${glowIntensity / 10}px_rgba(236,72,153,${glowIntensity / 100})]`,
                        )}
                      >
                        Succinct Stats
                      </span>
                    </div>
                  </div>
                )}

                <div className={getRankingBgStyle()}>
                  <div className={cn("text-xs font-mono mb-1", selectedTheme.textPrimary)}>NETWORK RANKING</div>
                  <div
                    className={cn(
                      "text-xl font-bold font-mono",
                      selectedTheme.textAccent,
                      cardStyle === "neon" && `drop-shadow-[0_0_${glowIntensity / 10}px_rgba(236,72,153,${glowIntensity / 100})]`
                    )}
                  >
                    TOP {userStats?.topPercent}%
                  </div>
                </div>

                <div className="mb-4">
                  <h3
                    className={cn(
                      "text-lg font-mono mb-2 text-center",
                      selectedTheme.textPrimary,
                      cardStyle === "neon" && `drop-shadow-[0_0_${glowIntensity / 20}px_rgba(255,255,255,${glowIntensity / 100})]`
                    )}
                  >
                    {userStats?.name}
                  </h3>
                  <div className="flex justify-between items-center">
                    <div
                      className={cn(
                        "text-sm font-mono",
                        selectedTheme.textSecondary,
                        cardStyle === "neon" && `drop-shadow-[0_0_${glowIntensity / 20}px_rgba(236,72,153,${glowIntensity / 100})]`
                      )}
                    >
                      RANK
                    </div>
                    {showRankBadge ? (
                      <div
                        className={cn(
                          "px-3 py-1 rounded-md text-white font-bold font-mono text-lg",
                          cardStyle === "neon"
                            ? `bg-pink-600 shadow-[0_0_${glowIntensity / 5}px_rgba(236,72,153,${glowIntensity / 100})]`
                            : "bg-gradient-to-r from-pink-600 to-pink-400",
                        )}
                      >
                        {userStats?.rank}
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "text-lg font-bold font-mono",
                          selectedTheme.textAccent,
                          cardStyle === "neon" && `drop-shadow-[0_0_${glowIntensity / 10}px_rgba(236,72,153,${glowIntensity / 100})]`
                        )}
                      >
                        {userStats?.rank}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <h3
                        className={cn(
                          "font-mono text-sm",
                          selectedTheme.textSecondary,
                          cardStyle === "neon" && `drop-shadow-[0_0_${glowIntensity / 20}px_rgba(236,72,153,${glowIntensity / 100})]`
                        )}
                      >
                        STARS
                      </h3>
                      <div className="flex items-center">
                        <Star
                          className={cn(
                            "w-4 h-4 mr-1",
                            selectedTheme.textAccent,
                            cardStyle === "neon" && `drop-shadow-[0_0_${glowIntensity / 10}px_rgba(236,72,153,${glowIntensity / 100})]`
                          )}
                        />
                        <span
                          className={cn(
                            "font-mono text-sm",
                            selectedTheme.textPrimary,
                            cardStyle === "neon" && `drop-shadow-[0_0_${glowIntensity / 20}px_rgba(255,255,255,${glowIntensity / 100})]`
                          )}
                        >
                          {Number(userStats?.stars).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={userProgress?.stars ? Number(userProgress.stars) : undefined}
                      className={cn(
                        selectedTheme.progressBg,
                        "overflow-hidden",
                        cardStyle === "neon" && "overflow-visible"
                      )}
                      style={{ height: `${progressBarHeight}px` }}
                    >
                      {progressBarStyle === "segmented" ? (
                        renderSegmentedProgress(userProgress?.stars || 0)
                      ) : (
                        <div className={getProgressBarStyle(userProgress?.stars || 0)} />
                      )}
                    </Progress>
                    {showProgressLabels && (
                      <div className="flex justify-between mt-0.5">
                        <span className="text-xs text-gray-500 dark:text-gray-400">0</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">100</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <h3
                        className={cn(
                          "font-mono text-sm",
                          selectedTheme.textSecondary,
                          cardStyle === "neon" && `drop-shadow-[0_0_${glowIntensity / 20}px_rgba(236,72,153,${glowIntensity / 100})]`
                        )}
                      >
                        PROOFS
                      </h3>
                      <span
                        className={cn(
                          "font-mono text-sm",
                          selectedTheme.textPrimary,
                          cardStyle === "neon" && `drop-shadow-[0_0_${glowIntensity / 20}px_rgba(255,255,255,${glowIntensity / 100})]`
                        )}
                      >
                        {Number(userStats?.proofs).toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={userProgress?.proofs ? Number(userProgress.proofs) : undefined}
                      className={cn(
                        selectedTheme.progressBg,
                        "overflow-hidden",
                        cardStyle === "neon" && "overflow-visible"
                      )}
                      style={{ height: `${progressBarHeight}px` }}
                    >
                      {progressBarStyle === "segmented" ? (
                        renderSegmentedProgress(userProgress?.proofs || 0)
                      ) : (
                        <div className={getProgressBarStyle(userProgress?.proofs || 0)} />
                      )}
                    </Progress>
                    {showProgressLabels && (
                      <div className="flex justify-between mt-0.5">
                        <span className="text-xs text-gray-500 dark:text-gray-400">0</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">100</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <h3
                        className={cn(
                          "font-mono text-sm",
                          selectedTheme.textSecondary,
                          cardStyle === "neon" && `drop-shadow-[0_0_${glowIntensity / 20}px_rgba(236,72,153,${glowIntensity / 100})]`
                        )}
                      >
                        CYCLES
                      </h3>
                      <span
                        className={cn(
                          "font-mono text-sm",
                          selectedTheme.textPrimary,
                          cardStyle === "neon" && `drop-shadow-[0_0_${glowIntensity / 20}px_rgba(255,255,255,${glowIntensity / 100})]`
                        )}
                      >
                        {Number(userStats?.cycles).toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={userProgress?.cycles ? Number(userProgress.cycles) : undefined}
                      className={cn(
                        selectedTheme.progressBg,
                        "overflow-hidden",
                        cardStyle === "neon" && "overflow-visible"
                      )}
                      style={{ height: `${progressBarHeight}px` }}
                    >
                      {progressBarStyle === "segmented" ? (
                        renderSegmentedProgress(userProgress?.cycles || 0)
                      ) : (
                        <div className={getProgressBarStyle(userProgress?.cycles || 0)} />
                      )}
                    </Progress>
                    {showProgressLabels && (
                      <div className="flex justify-between mt-0.5">
                        <span className="text-xs text-gray-500 dark:text-gray-400">0</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">100</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Discord Roles Section */}
                {showRoles && selectedRoles.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Shield
                          className={cn(
                            "h-4 w-4 mr-1",
                            selectedTheme.textSecondary,
                            cardStyle === "neon" && `drop-shadow-[0_0_${glowIntensity / 20}px_rgba(236,72,153,${glowIntensity / 100})]`
                          )}
                        />
                        <h3
                          className={cn(
                            "font-mono text-sm",
                            selectedTheme.textSecondary,
                            cardStyle === "neon" && `drop-shadow-[0_0_${glowIntensity / 20}px_rgba(236,72,153,${glowIntensity / 100})]`
                          )}
                        >
                          DISCORD ROLES
                        </h3>
                      </div>
                      {showRoleCount && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedRoles.length} roles
                        </span>
                      )}
                    </div>
                    {renderRoles()}
                  </div>
                )}

                {showCardFooter && (
                  <div className="text-center">
                    <div
                      className={cn(
                        "text-xs border-t pt-2 font-mono",
                        selectedTheme.textAccent,
                        cardStyle === "glass" ? "border-white/20 dark:border-white/10" : selectedTheme.cardBorder,
                        cardStyle === "neon" && `drop-shadow-[0_0_${glowIntensity / 20}px_rgba(236,72,153,${glowIntensity / 100})]`,
                      )}
                    >
                      testnet.succinct.xyz
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Share buttons */}
            {isGeneratingImage ? (
              <div className="flex items-center justify-center py-2">
                <div className="w-4 h-4 border-t-2 border-pink-500 border-r-2 border-pink-500/50 rounded-full animate-spin mr-2"></div>
                <span className="text-pink-500 font-mono text-xs">GENERATING IMAGE...</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2 w-full">
                <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white text-sm" onClick={regenerateImage}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Update Preview
                </Button>

                {imageUrl && (
                  <>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a href={getTwitterShareUrl()} target="_blank" rel="noopener noreferrer" className="w-full">
                            <Button className="w-full bg-[#1DA1F2] hover:bg-[#1a94e0] text-white text-sm">
                              <Twitter className="h-4 w-4 mr-2" />
                              Share on Twitter
                            </Button>
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs max-w-[200px]">
                            After clicking, download and attach the image to your tweet for the best impact!
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                      <Button
                        variant="outline"
                        className="flex-1 border-gray-300 dark:border-pink-900/50 bg-transparent hover:bg-gray-200 dark:hover:bg-pink-950/30 text-gray-900 dark:text-white text-sm"
                        onClick={downloadImage}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Image
                      </Button>

                      <Button
                        variant="outline"
                        className="flex-1 border-gray-300 dark:border-pink-900/50 bg-transparent hover:bg-gray-200 dark:hover:bg-pink-950/30 text-gray-900 dark:text-white text-sm"
                        onClick={copyShareLink}
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-4 w-4 mr-2 text-green-500" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Text
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Customization Panel - Right side */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="general" className="flex-1">
                  General
                </TabsTrigger>
                <TabsTrigger value="background" className="flex-1">
                  Background
                </TabsTrigger>
                <TabsTrigger value="roles" className="flex-1">
                  Roles
                </TabsTrigger>
                <TabsTrigger value="effects" className="flex-1">
                  Effects
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6 mt-4">
                {/* Card Style */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Card Style
                  </h4>
                  <Select value={cardStyle} onValueChange={(value) => setCardStyle(value as any)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a card style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="glass">Glass</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="neon">Neon</SelectItem>
                      <SelectItem value="retro">Retro</SelectItem>
                      <SelectItem value="frosted">Frosted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Theme Selection */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                    <Palette className="h-4 w-4 mr-2" />
                    Color Theme
                  </h4>
                  <Select value={selectedTheme.name} onValueChange={handleThemeChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a theme" />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_THEMES.map((theme) => (
                        <SelectItem key={theme.name} value={theme.name}>
                          {theme.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Ranking Style */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                    <Crown className="h-4 w-4 mr-2" />
                    Ranking Style
                  </h4>
                  <Select value={rankingBgStyle} onValueChange={(value) => setRankingBgStyle(value as any)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select ranking style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gradient">Gradient</SelectItem>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="glass">Glass</SelectItem>
                      <SelectItem value="outline">Outline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Card Layout */}
                <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center pt-2">
                    <Shapes className="h-4 w-4 mr-2" />
                    Card Layout
                  </h4>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-header" className="text-xs flex items-center">
                        Show Header
                      </Label>
                      <Switch id="show-header" checked={showCardHeader} onCheckedChange={setShowCardHeader} />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-footer" className="text-xs flex items-center">
                        Show Footer
                      </Label>
                      <Switch id="show-footer" checked={showCardFooter} onCheckedChange={setShowCardFooter} />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="rank-badge" className="text-xs flex items-center">
                        Rank Badge
                      </Label>
                      <Switch id="rank-badge" checked={showRankBadge} onCheckedChange={setShowRankBadge} />
                    </div>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center pt-2">
                    <Zap className="h-4 w-4 mr-2" />
                    Progress Bars
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="progress-bar-style" className="text-xs">
                        Progress Bar Style
                      </Label>
                      <Select
                        value={progressBarStyle}
                        onValueChange={(value) => setProgressBarStyle(value as any)}
                      >
                        <SelectTrigger id="progress-bar-style" className="w-full mt-1">
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="rounded">Rounded</SelectItem>
                          <SelectItem value="segmented">Segmented</SelectItem>
                          <SelectItem value="glow">Glow</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="progress-bar-height" className="text-xs">
                          Progress Bar Height
                        </Label>
                        <span className="text-xs">{progressBarHeight}px</span>
                      </div>
                      <Slider
                        id="progress-bar-height"
                        min={2}
                        max={8}
                        step={1}
                        value={[progressBarHeight]}
                        onValueChange={(value) => setProgressBarHeight(value[0])}
                        className="py-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Text Colors */}
                <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center pt-2">
                    <span className="mr-2">Aa</span>
                    Text Colors
                  </h4>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="text-primary" className="text-xs">
                        Primary Text
                      </Label>
                      <div className="flex mt-1">
                        <Select
                          value={selectedTheme.textPrimary}
                          onValueChange={(value) => {
                            setSelectedTheme({ ...selectedTheme, textPrimary: value })
                          }}
                        >
                          <SelectTrigger id="text-primary" className="w-full">
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text-gray-900 dark:text-white">Default</SelectItem>
                            <SelectItem value="text-pink-900 dark:text-pink-100">Pink</SelectItem>
                            <SelectItem value="text-blue-900 dark:text-blue-100">Blue</SelectItem>
                            <SelectItem value="text-green-900 dark:text-green-100">Green</SelectItem>
                            <SelectItem value="text-purple-900 dark:text-purple-100">Purple</SelectItem>
                            <SelectItem value="text-amber-900 dark:text-amber-100">Amber</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="text-secondary" className="text-xs">
                        Secondary Text
                      </Label>
                      <div className="flex mt-1">
                        <Select
                          value={selectedTheme.textSecondary}
                          onValueChange={(value) => {
                            setSelectedTheme({ ...selectedTheme, textSecondary: value })
                          }}
                        >
                          <SelectTrigger id="text-secondary" className="w-full">
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text-cyan-600 dark:text-cyan-400">Cyan</SelectItem>
                            <SelectItem value="text-pink-600 dark:text-pink-400">Pink</SelectItem>
                            <SelectItem value="text-blue-600 dark:text-blue-400">Blue</SelectItem>
                            <SelectItem value="text-green-600 dark:text-green-400">Green</SelectItem>
                            <SelectItem value="text-purple-600 dark:text-purple-400">Purple</SelectItem>
                            <SelectItem value="text-amber-600 dark:text-amber-400">Amber</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2">
                    <Label htmlFor="text-accent" className="text-xs">
                      Accent Text
                    </Label>
                    <div className="flex mt-1">
                      <Select
                        value={selectedTheme.textAccent}
                        onValueChange={(value) => {
                          setSelectedTheme({ ...selectedTheme, textAccent: value })
                        }}
                      >
                        <SelectTrigger id="text-accent" className="w-full">
                          <SelectValue placeholder="Select color" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text-pink-500">Pink</SelectItem>
                          <SelectItem value="text-cyan-500">Cyan</SelectItem>
                          <SelectItem value="text-blue-500">Blue</SelectItem>
                          <SelectItem value="text-green-500">Green</SelectItem>
                          <SelectItem value="text-purple-500">Purple</SelectItem>
                          <SelectItem value="text-amber-500">Amber</SelectItem>
                          <SelectItem value="text-red-500">Red</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="background" className="space-y-6 mt-4">
                {/* Background Image */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Background Image
                  </h4>

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={triggerFileInput}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />

                      {customBackgroundUrl && (
                        <Button variant="outline" size="icon" onClick={() => setCustomBackgroundUrl("")}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {customBackgroundUrl ? (
                        <span className="text-green-500">✓ Background image uploaded</span>
                      ) : (
                        "Upload an image to use as background"
                      )}
                    </div>
                  </div>

                  {/* Background Opacity */}
                  <div className="pt-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="opacity" className="text-xs">
                        Background Opacity
                      </Label>
                      <span className="text-xs">{backgroundOpacity}%</span>
                    </div>
                    <Slider
                      id="opacity"
                      min={0}
                      max={100}
                      step={5}
                      value={[backgroundOpacity]}
                      onValueChange={(value) => setBackgroundOpacity(value[0])}
                      className="py-2"
                    />
                  </div>
                </div>

                {/* Background Blur */}
                <div className="pt-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="blur" className="text-xs">
                      Background Blur
                    </Label>
                    <span className="text-xs">{backgroundBlur}px</span>
                  </div>
                  <Slider
                    id="blur"
                    min={0}
                    max={20}
                    step={1}
                    value={[backgroundBlur]}
                    onValueChange={(value) => setBackgroundBlur(value[0])}
                    className="py-2"
                  />
                </div>

                {/* Pattern Background */}
                <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between pt-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                      <Shapes className="h-4 w-4 mr-2" />
                      Pattern Background
                    </h4>
                    <Switch id="pattern-background" checked={showPatternBackground} onCheckedChange={setShowPatternBackground} />
                  </div>

                  {showPatternBackground && (
                    <div className="pt-2">
                      <Label htmlFor="pattern-type" className="text-xs">
                        Pattern Type
                      </Label>
                      <Select
                        value={patternBackground}
                        onValueChange={setPatternBackground}
                      >
                        <SelectTrigger id="pattern-type" className="w-full mt-1">
                          <SelectValue placeholder="Select pattern" />
                        </SelectTrigger>
                        <SelectContent>
                          {DECORATIVE_PATTERNS.map((pattern) => (
                            <SelectItem key={pattern.name} value={pattern.name}>
                              {pattern.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Text Backdrop */}
                <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between pt-2">
                    <Label htmlFor="text-backdrop" className="text-xs flex items-center">
                      <span className="mr-1">Text Backdrop</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-700 w-4 h-4 text-xs">
                              ?
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs max-w-[200px]">
                              Adds a dark backdrop behind text and components to improve readability on light
                              backgrounds
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Switch id="text-backdrop" checked={textBackdrop} onCheckedChange={setTextBackdrop} />
                  </div>

                  {textBackdrop && (
                    <div className="pt-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="backdrop-opacity" className="text-xs">
                          Backdrop Opacity
                        </Label>
                        <span className="text-xs">{textBackdropOpacity}%</span>
                      </div>
                      <Slider
                        id="backdrop-opacity"
                        min={10}
                        max={90}
                        step={5}
                        value={[textBackdropOpacity]}
                        onValueChange={(value) => setTextBackdropOpacity(value[0])}
                        className="py-2"
                      />
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="roles" className="space-y-6 mt-4">
                {/* Discord Roles Options */}
                {roles.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        Discord Roles
                      </h4>
                      <div className="flex items-center space-x-2">
                        <Switch id="show-roles" checked={showRoles} onCheckedChange={setShowRoles} />
                        <Label htmlFor="show-roles" className="text-xs">
                          Show Roles
                        </Label>
                      </div>
                    </div>

                    {showRoles && (
                      <>
                        {/* Role Badge Style */}
                        <div className="space-y-2">
                          <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center">
                            <Sticker className="h-3 w-3 mr-1" />
                            Badge Style
                          </h5>
                          <Select
                            value={badgeStyle}
                            onValueChange={(value) => setBadgeStyle(value as any)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select badge style" />
                            </SelectTrigger>
                            <SelectContent>
                              {BADGE_STYLES.map((style) => (
                                <SelectItem key={style.name} value={style.style}>
                                  {style.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Role Search */}
                        <div className="space-y-2">
                          <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-600" />
                            <Input
                              placeholder="Search roles..."
                              value={roleSearchQuery}
                              onChange={(e) => setRoleSearchQuery(e.target.value)}
                              className="pl-8"
                            />
                          </div>
                        </div>

                        {/* Role Display Options */}
                        <div className="space-y-2">
                          <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center">
                            <SlidersHorizontal className="h-3 w-3 mr-1" />
                            Display Options
                          </h5>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="group-roles" className="text-xs flex items-center">
                              Group by Category
                            </Label>
                            <Switch
                              id="group-roles"
                              checked={groupRolesByCategories}
                              onCheckedChange={setGroupRolesByCategories}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="category-icons" className="text-xs flex items-center">
                              Show Category Icons
                            </Label>
                            <Switch
                              id="category-icons"
                              checked={showCategoryIcons}
                              onCheckedChange={setShowCategoryIcons}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="role-count" className="text-xs flex items-center">
                              Show Role Count
                            </Label>
                            <Switch
                              id="role-count"
                              checked={showRoleCount}
                              onCheckedChange={setShowRoleCount}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="role-borders" className="text-xs flex items-center">
                              Show Role Borders
                            </Label>
                            <Switch
                              id="role-borders"
                              checked={showRoleBorders}
                              onCheckedChange={setShowRoleBorders}
                            />
                          </div>

                          {/* Role Display Style */}
                          <div className="pt-2">
                            <Label htmlFor="role-display-style" className="text-xs">
                              Role Display Style
                            </Label>
                            <Select
                              value={roleDisplayStyle}
                              onValueChange={(value) =>
                                setRoleDisplayStyle(value as "compact" | "comfortable" | "grid")
                              }
                            >
                              <SelectTrigger id="role-display-style" className="w-full mt-1">
                                <SelectValue placeholder="Select display style" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="compact">Compact</SelectItem>
                                <SelectItem value="comfortable">Comfortable</SelectItem>
                                <SelectItem value="grid">Grid</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {roleDisplayStyle === "grid" && (
                            <div className="pt-2">
                              <div className="flex justify-between items-center">
                                <Label htmlFor="grid-columns" className="text-xs flex items-center">
                                  Grid Columns
                                </Label>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => setGridColumns(Math.max(1, gridColumns - 1))}
                                    disabled={gridColumns <= 1}
                                  >
                                    <Shrink className="h-3 w-3" />
                                  </Button>
                                  <span className="text-xs w-4 text-center">{gridColumns}</span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => setGridColumns(Math.min(4, gridColumns + 1))}
                                    disabled={gridColumns >= 4}
                                  >
                                    <Expand className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="pt-2">
                            <div className="flex justify-between items-center">
                              <Label htmlFor="role-spacing" className="text-xs">
                                Role Spacing
                              </Label>
                              <span className="text-xs">{roleSpacing}</span>
                            </div>
                            <Slider
                              id="role-spacing"
                              min={1}
                              max={4}
                              step={1}
                              value={[roleSpacing]}
                              onValueChange={(value) => setRoleSpacing(value[0])}
                              className="py-2"
                            />
                          </div>

                          <div className="pt-2">
                            <div className="flex justify-between items-center">
                              <Label htmlFor="role-border-radius" className="text-xs">
                                Role Border Radius
                              </Label>
                              <span className="text-xs">{roleBorderRadius}px</span>
                            </div>
                            <Slider
                              id="role-border-radius"
                              min={0}
                              max={12}
                              step={1}
                              value={[roleBorderRadius]}
                              onValueChange={(value) => setRoleBorderRadius(value[0])}
                              className="py-2"
                            />
                          </div>

                          <div className="pt-2">
                            <div className="flex justify-between items-center">
                              <Label htmlFor="max-roles" className="text-xs flex items-center">
                                Number of Roles to Show
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="inline-flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-700 w-4 h-4 text-xs ml-1">
                                        ?
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs max-w-[200px]">
                                        Control how many roles are displayed. Roles are shown in order of importance.
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </Label>
                              <span className="text-xs">{maxRolesToShow}</span>
                            </div>
                            <Slider
                              id="max-roles"
                              min={1}
                              max={20}
                              step={1}
                              value={[maxRolesToShow]}
                              onValueChange={(value) => setMaxRolesToShow(value[0])}
                              className="py-2"
                            />
                          </div>
                        </div>

                        {/* Role Categories */}
                        <div className="space-y-2">
                          <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center">
                            <Layers className="h-3 w-3 mr-1" />
                            Role Categories
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {Object.values(ROLE_CATEGORIES).map((category) => (
                              <Badge
                                key={category}
                                variant="outline"
                                className={cn(
                                  "cursor-pointer transition-all",
                                  selectedCategories.includes(category)
                                    ? "bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300 border-pink-300"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-700 opacity-70",
                                )}
                                onClick={() => toggleRoleCategory(category)}
                              >
                                {selectedCategories.includes(category) ? (
                                  <Eye className="h-3 w-3 mr-1" />
                                ) : (
                                  <EyeOff className="h-3 w-3 mr-1" />
                                )}
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Role Preview */}
                        <div className="space-y-2">
                          <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            Roles Preview ({filteredRoles.length} of {selectedRoles.length} shown)
                          </h5>
                          <div className="max-h-32 overflow-y-auto p-2 border rounded-md border-gray-300 dark:border-gray-700">
                            <div
                              className={cn(
                                "flex flex-wrap",
                                roleDisplayStyle === "grid" && `grid grid-cols-${gridColumns} auto-rows-min`,
                                `gap-${roleSpacing}`,
                              )}
                              style={{
                                gap: `${roleSpacing * 0.25}rem`,
                              }}
                            >
                              {filteredRoles.length > 0 ? (
                                filteredRoles.map((role) => (
                                  <TooltipProvider key={role}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div
                                          className={getRoleBadgeStyle(role, selectedTheme, badgeStyle)}
                                          style={{
                                            borderRadius: `${roleBorderRadius}px`,
                                            borderWidth: showRoleBorders ? '1px' : '0',
                                          }}
                                        >
                                          {role.length > 18 ? truncateRoleName(role) : role}
                                        </div>
                                      </TooltipTrigger>
                                      {role.length > 18 && (
                                        <TooltipContent>
                                          <p className="text-xs">{role}</p>
                                        </TooltipContent>
                                      )}
                                    </Tooltip>
                                  </TooltipProvider>
                                ))
                              ) : (
                                <p className="text-xs text-gray-500 dark:text-gray-400 p-2">
                                  No roles match your current filter settings
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="effects" className="space-y-6 mt-4">
                {/* Visual Effects */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                    <Wand2 className="h-4 w-4 mr-2" />
                    Visual Effects
                  </h4>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="glow-effects" className="text-xs flex items-center">
                        Glow Effects
                      </Label>
                      <Switch id="glow-effects" checked={showGlowEffects} onCheckedChange={setShowGlowEffects} />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="gradient-borders" className="text-xs flex items-center">
                        Gradient Borders
                      </Label>
                      <Switch
                        id="gradient-borders"
                        checked={showGradientBorders}
                        onCheckedChange={setShowGradientBorders}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="floating-elements" className="text-xs flex items-center">
                        Floating Elements
                      </Label>
                      <Switch
                        id="floating-elements"
                        checked={showFloatingElements}
                        onCheckedChange={setShowFloatingElements}
                      />
                    </div>

                    {cardStyle === "neon" && (
                      <div className="pt-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="glow-intensity" className="text-xs">
                            Glow Intensity
                          </Label>
                          <span className="text-xs">{glowIntensity}%</span>
                        </div>
                        <Slider
                          id="glow-intensity"
                          min={10}
                          max={100}
                          step={5}
                          value={[glowIntensity]}
                          onValueChange={(value) => setGlowIntensity(value[0])}
                          className="py-2"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Corner Decoration */}
                <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between pt-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                      <Sticker className="h-4 w-4 mr-2" />
                      Corner Decoration
                    </h4>
                    <Switch
                      id="corner-decoration"
                      checked={showCornerDecoration}
                      onCheckedChange={setShowCornerDecoration}
                    />
                  </div>

                  {showCornerDecoration && (
                    <div className="pt-2">
                      <Label htmlFor="decoration-type" className="text-xs">
                        Decoration Type
                      </Label>
                      <Select
                        value={cornerDecoration}
                        onValueChange={setCornerDecoration}
                      >
                        <SelectTrigger id="decoration-type" className="w-full mt-1">
                          <SelectValue placeholder="Select decoration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sparkles">Sparkles</SelectItem>
                          <SelectItem value="zap">Zap</SelectItem>
                          <SelectItem value="droplets">Droplets</SelectItem>
                          <SelectItem value="flower">Flower</SelectItem>
                          <SelectItem value="snowflake">Snowflake</SelectItem>
                          <SelectItem value="flame">Flame</SelectItem>
                          <SelectItem value="leaf">Leaf</SelectItem>
                          <SelectItem value="shapes">Shapes</SelectItem>
                          <SelectItem value="sticker">Sticker</SelectItem>
                          <SelectItem value="lightbulb">Lightbulb</SelectItem>
                          <SelectItem value="wand">Wand</SelectItem>
                          <SelectItem value="dices">Dices</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <DialogClose asChild>
          <button className="absolute right-3 top-3 rounded-full bg-transparent hover:bg-pink-900/30 p-1 transition-colors duration-200">
            <X className="h-5 w-5 text-pink-500" />
            <span className="sr-only">Close</span>
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}

export default ShareStats;