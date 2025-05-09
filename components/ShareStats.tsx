"use client"

import type React from "react"

import { useState, useRef, useEffect, type ReactElement } from "react"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Share2,
  Twitter,
  Copy,
  Check,
  Download,
  X,
  ImageIcon,
  Palette,
  Eye,
  EyeOff,
  RefreshCw,
  Upload,
  Search,
  SlidersHorizontal,
  Layers,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Star, Shield } from "lucide-react"
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

const COLOR_THEMES = [
  {
    name: "Default",
    bgGradient: "from-pink-600/30 to-pink-500/30",
    textPrimary: "text-gray-900 dark:text-white",
    textSecondary: "text-cyan-600 dark:text-cyan-400",
    textAccent: "text-pink-500",
    progressBg: "bg-gray-300 dark:bg-pink-900/30",
    progressFill: "from-pink-600 to-pink-400",
    cardBg: "bg-gray-100 dark:bg-[#050505]",
    cardBorder: "border-gray-300 dark:border-pink-900/50",
  },
  {
    name: "Cyberpunk",
    bgGradient: "from-yellow-500/30 to-purple-500/30",
    textPrimary: "text-gray-900 dark:text-yellow-300",
    textSecondary: "text-purple-600 dark:text-purple-400",
    textAccent: "text-yellow-500",
    progressBg: "bg-gray-300 dark:bg-purple-900/30",
    progressFill: "from-yellow-500 to-purple-500",
    cardBg: "bg-gray-100 dark:bg-[#0a0a16]",
    cardBorder: "border-gray-300 dark:border-purple-900/50",
  },
  {
    name: "Ocean",
    bgGradient: "from-blue-600/30 to-cyan-500/30",
    textPrimary: "text-gray-900 dark:text-white",
    textSecondary: "text-blue-600 dark:text-blue-400",
    textAccent: "text-cyan-500",
    progressBg: "bg-gray-300 dark:bg-blue-900/30",
    progressFill: "from-blue-600 to-cyan-400",
    cardBg: "bg-gray-100 dark:bg-[#051520]",
    cardBorder: "border-gray-300 dark:border-blue-900/50",
  },
  {
    name: "Forest",
    bgGradient: "from-green-600/30 to-emerald-500/30",
    textPrimary: "text-gray-900 dark:text-white",
    textSecondary: "text-emerald-600 dark:text-emerald-400",
    textAccent: "text-green-500",
    progressBg: "bg-gray-300 dark:bg-green-900/30",
    progressFill: "from-green-600 to-emerald-400",
    cardBg: "bg-gray-100 dark:bg-[#051505]",
    cardBorder: "border-gray-300 dark:border-green-900/50",
  },
  {
    name: "Sunset",
    bgGradient: "from-orange-600/30 to-red-500/30",
    textPrimary: "text-gray-900 dark:text-white",
    textSecondary: "text-red-600 dark:text-red-400",
    textAccent: "text-orange-500",
    progressBg: "bg-gray-300 dark:bg-red-900/30",
    progressFill: "from-orange-500 to-red-400",
    cardBg: "bg-gray-100 dark:bg-[#150505]",
    cardBorder: "border-gray-300 dark:border-red-900/50",
  },
]

// Helper function to get badge color based on role category and importance
function getRoleBadgeStyle(role: string, theme: (typeof COLOR_THEMES)[0]) {
  const category = categorizeRole(role)
  const index = getRoleIndex(role)

  // Base styles
  const baseStyle = "transition-all duration-300 text-xs"

  // Special styling for top roles (first 5)
  if (index < 5) {
    return cn(
      baseStyle,
      "bg-gradient-to-r from-pink-600 to-pink-400 text-white border-pink-300 shadow-md shadow-pink-500/20",
    )
  }

  // Special styling for important roles (next 10)
  if (index < 15) {
    if (category === ROLE_CATEGORIES.ACHIEVEMENT) {
      return cn(
        baseStyle,
        "bg-gradient-to-r from-purple-600 to-purple-400 text-white border-purple-300 shadow-md shadow-purple-500/20",
      )
    }
    if (category === ROLE_CATEGORIES.DEVELOPER) {
      return cn(
        baseStyle,
        "bg-gradient-to-r from-cyan-600 to-cyan-400 text-white border-cyan-300 shadow-md shadow-cyan-500/20",
      )
    }
    if (category === ROLE_CATEGORIES.STAFF) {
      return cn(
        baseStyle,
        "bg-gradient-to-r from-amber-500 to-yellow-400 text-white border-yellow-300 shadow-md shadow-yellow-500/20",
      )
    }
  }

  // Category-based styling with theme colors
  switch (category) {
    case ROLE_CATEGORIES.ACHIEVEMENT:
      return cn(
        baseStyle,
        "bg-pink-100 dark:bg-pink-900/40 text-pink-800 dark:text-pink-300 border-pink-200 dark:border-pink-800/50",
      )
    case ROLE_CATEGORIES.DEVELOPER:
      return cn(
        baseStyle,
        "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/50",
      )
    case ROLE_CATEGORIES.LANGUAGE:
      return cn(
        baseStyle,
        "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/50",
      )
    case ROLE_CATEGORIES.COMMUNITY:
      return cn(
        baseStyle,
        "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/50",
      )
    case ROLE_CATEGORIES.STAFF:
      return cn(
        baseStyle,
        "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/50",
      )
    default:
      return cn(
        baseStyle,
        "bg-gray-100 dark:bg-gray-800/60 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700/50",
      )
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
  const [maxRolesToShow, setMaxRolesToShow] = useState(10)
  const [textBackdrop, setTextBackdrop] = useState(false)
  const [textBackdropOpacity, setTextBackdropOpacity] = useState(50)
  const [backgroundBlur, setBackgroundBlur] = useState(0)
  const [roleSearchQuery, setRoleSearchQuery] = useState("")
  const [groupRolesByCategories, setGroupRolesByCategories] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

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

  // Render roles based on grouping preference
  const renderRoles = () => {
    if (groupRolesByCategories) {
      return Object.entries(groupedRoles).map(([category, categoryRoles]) => {
        if (categoryRoles.length === 0) return null

        return (
          <div key={category} className="mb-2">
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{category}</div>
            <div className="flex flex-wrap gap-1">
              {categoryRoles.map((role) => (
                <Badge key={role} className={getRoleBadgeStyle(role, selectedTheme)}>
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        )
      })
    } else {
      return (
        <div className="flex flex-wrap gap-1">
          {filteredRoles.map((role) => (
            <Badge key={role} className={getRoleBadgeStyle(role, selectedTheme)}>
              {role}
            </Badge>
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
      <DialogContent className="[&>button]:hidden sm:max-w-4xl bg-white dark:bg-black border my-4 border-gray-300 dark:border-pink-900/50 overflow-y-auto max-h-[90vh] p-4 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-mono text-gray-900 dark:text-pink-500">
            Customize & Share Your Stats
          </DialogTitle>
          <DialogClose asChild>
            <button className="absolute right-2 top-2 rounded-full bg-transparent hover:bg-pink-900/20 p-1 transition-colors duration-200">
              <X className="h-5 w-5 text-pink-500" />
              <span className="sr-only">Close</span>
            </button>
          </DialogClose>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preview Panel - Left side */}
          <div className="flex flex-col items-center space-y-4">
            <div
              ref={shareCardRef}
              style={{
                fontFamily:
                  'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
              }}
              className={cn(
                "w-full max-w-xs p-4 rounded-md border shadow-lg dark:shadow-pink-500/10 relative overflow-hidden",
                selectedTheme.cardBg,
                selectedTheme.cardBorder,
              )}
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
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 20% 30%, rgba(236, 72, 153, 0.3) 0%, transparent 20%),
                    radial-gradient(circle at 80% 70%, rgba(34, 211, 238, 0.3) 0%, transparent 20%),
                    linear-gradient(90deg, transparent 0%, rgba(236, 72, 153, 0.1) 30%, rgba(34, 211, 238, 0.1) 70%, transparent 100%)`,
                  opacity: backgroundOpacity / 100,
                }}
              ></div>

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
                <div className="flex justify-center items-center mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded flex items-center justify-center">
                      <span className={cn("font-bold text-lg", "text-white")}>S</span>
                    </div>
                    <span className={cn("text-lg font-bold font-mono ml-2", selectedTheme.textAccent)}>
                      Succinct Stats
                    </span>
                  </div>
                </div>

                <div
                  className={cn(
                    "p-2 rounded-md border mb-4 text-center",
                    selectedTheme.bgGradient,
                    selectedTheme.cardBorder,
                  )}
                >
                  <div className={cn("text-xs font-mono mb-1", selectedTheme.textPrimary)}>NETWORK RANKING</div>
                  <div className={cn("text-xl font-bold font-mono", selectedTheme.textAccent)}>
                    TOP {userStats?.topPercent}%
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className={cn("text-lg font-mono mb-2 text-center", selectedTheme.textPrimary)}>
                    {userStats?.name}
                  </h3>
                  <div className="flex justify-between items-center">
                    <div className={cn("text-sm font-mono", selectedTheme.textSecondary)}>RANK</div>
                    <div
                      className={cn(
                        "bg-gradient-to-r px-3 py-1 rounded-md text-white font-bold font-mono text-lg",
                        `from-${selectedTheme.progressFill.split(" ")[0]} to-${selectedTheme.progressFill.split(" ")[1]}`,
                      )}
                    >
                      {userStats?.rank}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <h3 className={cn("font-mono text-sm", selectedTheme.textSecondary)}>STARS</h3>
                      <div className="flex items-center">
                        <Star className={cn("w-4 h-4 mr-1", selectedTheme.textAccent)} />
                        <span className={cn("font-mono text-sm", selectedTheme.textPrimary)}>
                          {Number(userStats?.stars).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={userProgress?.stars ? Number(userProgress.stars) : undefined}
                      className={cn("h-2", selectedTheme.progressBg)}
                    >
                      <div className={cn("h-full bg-gradient-to-r rounded-full", selectedTheme.progressFill)} />
                    </Progress>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <h3 className={cn("font-mono text-sm", selectedTheme.textSecondary)}>PROOFS</h3>
                      <span className={cn("font-mono text-sm", selectedTheme.textPrimary)}>
                        {Number(userStats?.proofs).toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={userProgress?.proofs ? Number(userProgress.proofs) : undefined}
                      className={cn("h-2", selectedTheme.progressBg)}
                    >
                      <div className={cn("h-full bg-gradient-to-r rounded-full", selectedTheme.progressFill)} />
                    </Progress>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <h3 className={cn("font-mono text-sm", selectedTheme.textSecondary)}>CYCLES</h3>
                      <span className={cn("font-mono text-sm", selectedTheme.textPrimary)}>
                        {Number(userStats?.cycles).toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={userProgress?.cycles ? Number(userProgress.cycles) : undefined}
                      className={cn("h-2", selectedTheme.progressBg)}
                    >
                      <div className={cn("h-full bg-gradient-to-r rounded-full", selectedTheme.progressFill)} />
                    </Progress>
                  </div>
                </div>

                {/* Discord Roles Section */}
                {showRoles && filteredRoles.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center mb-2">
                      <Shield className={cn("h-4 w-4 mr-1", selectedTheme.textSecondary)} />
                      <h3 className={cn("font-mono text-sm", selectedTheme.textSecondary)}>DISCORD ROLES</h3>
                    </div>
                    {renderRoles()}
                  </div>
                )}

                <div className="text-center">
                  <div
                    className={cn(
                      "text-xs border-t pt-2 font-mono",
                      selectedTheme.textAccent,
                      selectedTheme.cardBorder,
                    )}
                  >
                    testnet.succinct.xyz
                  </div>
                </div>
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
              </TabsList>

              <TabsContent value="general" className="space-y-6 mt-4">
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

                {/* Text Backdrop */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
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
                            <div className="flex flex-wrap gap-1">
                              {filteredRoles.length > 0 ? (
                                filteredRoles.map((role) => (
                                  <Badge key={role} className={getRoleBadgeStyle(role, selectedTheme)}>
                                    {role}
                                  </Badge>
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