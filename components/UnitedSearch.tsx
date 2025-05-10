"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Search, Star, AlertCircle, User, ArrowRight, Sparkles, ChevronDown, Shield, Info } from "lucide-react"
import { getEntryByUsername } from "@/lib/csv-service"
import { cn } from "@/lib/utils"
import ShareStats from "./ShareStats"
import type { LeaderboardEntry } from "@/lib/types"
import { ROLE_CATEGORIES, categorizeRole, getRoleIndex, sortRolesByImportance } from "@/lib/roles"
import { dsService } from "@/lib/ds.service"

// Sample user data with roles
const sampleRoles = [
    "Staff Prover",
    "Regional Lead",
    "X Prover",
    "PROOF OF DEV",
    "🇺🇸・english",
    "🇯🇵・日本語",
    "Proof Verified",
    "Truth Prover",
]

export function UnifiedUserSearch() {
    const [username, setUsername] = useState("")
    const [roleSearch, setRoleSearch] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isSearching, setIsSearching] = useState(false)
    const [hasInteracted, setHasInteracted] = useState(false)
    const [activeTab, setActiveTab] = useState("search")
    const [isFocused, setIsFocused] = useState<"twitter" | "discord" | null>(null)
    const [searchType, setSearchType] = useState<"twitter" | "discord" | "both" | null>(null)

    // Role filtering states
    const [roles, setRoles] = useState<string[]>([])
    const [selectedCategories, setSelectedCategories] = useState<string[]>(Object.values(ROLE_CATEGORIES))
    const [userStats, setUserStats] = useState<LeaderboardEntry | null>(null)
    const [progress, setProgress] = useState<{
        proofs: number
        cycles: number
        stars: number
    }>({
        proofs: 0,
        cycles: 0,
        stars: 0,
    })

    // Add Discord user state
    const [discordUser, setDiscordUser] = useState<{
        discordid?: string
        username?: string
    } | null>(null)

    const handleSearch = () => {
        const hasTwitter = username.trim().length > 0
        const hasDiscord = roleSearch.trim().length > 0

        if (!hasTwitter && !hasDiscord) {
            setError("Please enter a Twitter username or Discord role")
            return
        }

        setIsSearching(true)
        setError(null)
        setHasInteracted(true)

        // Determine search type
        if (hasTwitter && hasDiscord) {
            setSearchType("both")
        } else if (hasTwitter) {
            setSearchType("twitter")
        } else {
            setSearchType("discord")
        }

        setTimeout(async () => {
            // Twitter search - would use Twitter API in production
            if (hasTwitter) {
                try {
                    const result = await getEntryByUsername(username.trim())

                    if (result) {
                        console.log(result)
                        setUserStats({ ...result.data, topPercent: result.topPercentage })
                        setProgress(result.progress)

                        // If Discord search is also requested, fetch Discord roles
                        if (hasDiscord) {
                            try {
                                const rolesResult = await dsService.checkStatsImport(roleSearch.trim())
                                if (rolesResult && rolesResult.roles && rolesResult.roles.length > 0) {
                                    setRoles(sortRolesByImportance(rolesResult.roles))
                                    setDiscordUser({
                                        discordid: rolesResult.discordid,
                                        username: rolesResult.username,
                                    })
                                } else {
                                    setRoles([])
                                    setDiscordUser(null)
                                }
                            } catch (discordError) {
                                console.error("Discord search error:", discordError)
                                // Fallback to sample roles for demo purposes
                                const filteredSampleRoles = sampleRoles.filter((role) =>
                                    role.toLowerCase().includes(roleSearch.toLowerCase()),
                                )
                                setRoles(filteredSampleRoles.length > 0 ? sortRolesByImportance(filteredSampleRoles) : [])
                                setDiscordUser(
                                    filteredSampleRoles.length > 0
                                        ? {
                                            discordid: "123456789012345678",
                                            username: "sample_user",
                                        }
                                        : null,
                                )
                            }
                        } else {
                            setRoles([])
                            setDiscordUser(null)
                        }

                        setError(null)
                        setActiveTab("profile")
                    } else {
                        setUserStats(null)
                        setRoles([])
                        setError("Twitter user not found. Please check the username and try again.")
                    }
                } catch (error) {
                    setUserStats(null)
                    setRoles([])
                    setError("Twitter user not found. Please check the username and try again.")
                }
            }
            // Discord-only search
            else if (hasDiscord) {
                try {
                    const rolesResult = await dsService.checkStatsImport(roleSearch.trim())
                    if (rolesResult && rolesResult.roles && rolesResult.roles.length > 0) {
                        setRoles(sortRolesByImportance(rolesResult.roles))
                        setDiscordUser({
                            discordid: rolesResult.discordid,
                            username: rolesResult.username,
                        })
                        setUserStats(null)
                        setActiveTab("profile")
                        setError(null)
                    } else {
                        setRoles([])
                        setDiscordUser(null)
                        setError("No Discord roles found matching your search criteria.")
                    }
                } catch (error) {
                    console.error("Discord search error:", error)
                    // Fallback to sample roles for demo purposes
                    const filteredSampleRoles = sampleRoles.filter((role) =>
                        role.toLowerCase().includes(roleSearch.toLowerCase()),
                    )
                    if (filteredSampleRoles.length > 0) {
                        setRoles(sortRolesByImportance(filteredSampleRoles))
                        setDiscordUser({
                            discordid: "123456789012345678",
                            username: "sample_user",
                        })
                        setUserStats(null)
                        setActiveTab("profile")
                        setError(null)
                    } else {
                        setRoles([])
                        setDiscordUser(null)
                        setError("No Discord roles found matching your search criteria.")
                    }
                }
            }

            setIsSearching(false)
        }, 800)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch()
        }
    }

    // Filter roles based on settings and search
    const getFilteredRoles = () => {
        return roles
    }

    const filteredRoles = getFilteredRoles()

    useEffect(() => {
        const timer = setTimeout(() => {
            if (username.trim().length > 0 && !hasInteracted) {
                const button = document.getElementById("search-button")
                if (button) {
                    button.classList.add("animate-pulse")
                    setTimeout(() => {
                        button.classList.remove("animate-pulse")
                    }, 1500)
                }
            }
        }, 2000)

        return () => clearTimeout(timer)
    }, [username, hasInteracted])

    // Helper function to get badge color based on role category and importance
    function getRoleBadgeStyle(role: string) {
        const category = categorizeRole(role)
        const index = getRoleIndex(role)

        // Base styles
        const baseStyle = "transition-all duration-300"

        // Special case for Truth Prover - make it green
        if (role === "Truth Prover") {
            return cn(
                baseStyle,
                "bg-gradient-to-r from-green-600 to-green-400 text-white border-green-300 shadow-md shadow-green-500/20",
            )
        }

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

        // Category-based styling
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

    return (
        <Card className="bg-white dark:bg-black border border-pink-300/50 dark:border-pink-900/50 shadow-lg shadow-pink-300/10 dark:shadow-pink-500/10 overflow-hidden">
            <CardHeader className="border-b border-pink-300/30 dark:border-pink-900/30 bg-gradient-to-r from-white to-pink-50/50 dark:from-black dark:to-pink-950/20">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl font-mono text-pink-500 flex items-center">
                            <Sparkles className="mr-2 h-5 w-5" />
                            SUCCINCT EXPLORER
                        </CardTitle>
                        <div className="w-auto">
                            <TabsList className="bg-white/20 dark:bg-black/20 border border-pink-300/30 dark:border-pink-900/30">
                                <TabsTrigger value="search" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
                                    <Search className="h-4 w-4 mr-2" />
                                    Search
                                </TabsTrigger>
                                <TabsTrigger
                                    value="profile"
                                    className="data-[state=active]:bg-pink-500 data-[state=active]:text-white"
                                    disabled={!userStats && roles.length === 0}
                                >
                                    <User className="h-4 w-4 mr-2" />
                                    Profile
                                </TabsTrigger>
                            </TabsList>
                        </div>
                    </div>
                </Tabs>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="relative">
                    {/* Decorative elements */}
                    <div className="absolute -top-4 -left-4 w-16 h-16 bg-pink-500/5 rounded-full blur-xl" />
                    <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl" />

                    <div className="relative z-10" />
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsContent value="search" className="mt-0 space-y-6">
                            <div className="space-y-4">
                                <div className="bg-gradient-to-r from-pink-50/50 to-transparent dark:from-pink-950/20 dark:to-transparent p-4 rounded-lg border border-pink-300/30 dark:border-pink-900/30">
                                    <h3 className="text-pink-500 font-mono text-sm mb-3 flex items-center">
                                        <Search className="h-4 w-4 mr-2" />
                                        SEARCH USERS
                                        {searchType && (
                                            <span className="ml-2 text-xs bg-pink-100 dark:bg-pink-900/40 text-pink-800 dark:text-pink-300 px-2 py-0.5 rounded-full">
                                                {searchType === "twitter"
                                                    ? "Twitter Only"
                                                    : searchType === "discord"
                                                        ? "Discord Only"
                                                        : "Combined Search"}
                                            </span>
                                        )}
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div
                                                className={`relative group ${isFocused === "twitter" ? "ring-2 ring-pink-500 rounded-md" : ""}`}
                                            >
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <svg
                                                        className={`h-5 w-5 ${isFocused === "twitter" ? "text-pink-500" : "text-gray-400 dark:text-gray-600"}`}
                                                        viewBox="0 0 24 24"
                                                        fill="currentColor"
                                                    >
                                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                                    </svg>
                                                </div>
                                                <div className="absolute inset-y-0 left-10 flex items-center pointer-events-none">
                                                    <div className="h-5 w-0.5 bg-gray-300 dark:bg-gray-700"></div>
                                                </div>
                                                <Input
                                                    type="text"
                                                    placeholder="Twitter username for testnet stats..."
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    onKeyDown={handleKeyDown}
                                                    onFocus={() => setIsFocused("twitter")}
                                                    onBlur={() => setIsFocused(null)}
                                                    className="bg-white dark:bg-black border border-pink-300/50 dark:border-pink-900/50 rounded-md pl-14 pr-4 py-2 text-gray-800 dark:text-white w-full focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200"
                                                />
                                                {username && (
                                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                        <button
                                                            onClick={() => setUsername("")}
                                                            className="text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400"
                                                        >
                                                            <span className="sr-only">Clear input</span>
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-4 w-4"
                                                                viewBox="0 0 20 20"
                                                                fill="currentColor"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start pl-1">
                                                <Info className="h-3 w-3 mr-1 mt-0.5 text-pink-400" />
                                                Enter a Twitter username to find testnet stats, ranking, and achievements
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <div
                                                className={`relative group ${isFocused === "discord" ? "ring-2 ring-pink-500 rounded-md" : ""}`}
                                            >
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <svg
                                                        className={`h-5 w-5 ${isFocused === "discord" ? "text-pink-500" : "text-gray-400 dark:text-gray-600"}`}
                                                        viewBox="0 0 24 24"
                                                        fill="currentColor"
                                                    >
                                                        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3847-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                                                    </svg>
                                                </div>
                                                <div className="absolute inset-y-0 left-10 flex items-center pointer-events-none">
                                                    <div className="h-5 w-0.5 bg-gray-300 dark:bg-gray-700"></div>
                                                </div>
                                                <Input
                                                    type="text"
                                                    placeholder="Discord username or role to search..."
                                                    value={roleSearch}
                                                    onChange={(e) => setRoleSearch(e.target.value)}
                                                    onKeyDown={handleKeyDown}
                                                    onFocus={() => setIsFocused("discord")}
                                                    onBlur={() => setIsFocused(null)}
                                                    className="bg-white dark:bg-black border border-pink-300/50 dark:border-pink-900/50 rounded-md pl-14 pr-4 py-2 text-gray-800 dark:text-white w-full focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200"
                                                />
                                                {roleSearch && (
                                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                        <button
                                                            onClick={() => setRoleSearch("")}
                                                            className="text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400"
                                                        >
                                                            <span className="sr-only">Clear input</span>
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-4 w-4"
                                                                viewBox="0 0 20 20"
                                                                fill="currentColor"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start pl-1">
                                                <Info className="h-3 w-3 mr-1 mt-0.5 text-purple-400" />
                                                Search for Discord roles or usernames to discover community achievements
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-center">
                                        <Button
                                            id="search-button"
                                            onClick={handleSearch}
                                            disabled={isSearching}
                                            className="w-full md:w-auto bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 text-white font-mono shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                                        >
                                            {isSearching ? (
                                                <div className="flex items-center justify-center">
                                                    <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                                                    SEARCHING...
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center">
                                                    <Search className="mr-2 h-4 w-4" />
                                                    SEARCH NETWORK
                                                </div>
                                            )}
                                        </Button>
                                    </div>

                                    <div className="mt-4 text-center">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Combine both searches to get a complete profile with testnet stats and Discord roles
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-pink-50 dark:bg-pink-950/20 border border-pink-300/50 dark:border-pink-900/50 rounded-md p-4 flex items-start animate-fadeIn">
                                    <AlertCircle className="text-pink-500 mr-2 h-5 w-5 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-pink-700 dark:text-pink-200">{error}</p>
                                        <p className="text-pink-600/70 dark:text-pink-300/70 text-sm mt-1">
                                            Try searching for another username or check if you've typed it correctly.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {!userStats && !error && (
                                <div className="text-center py-10 text-gray-600 dark:text-gray-400 bg-gradient-to-br from-white to-pink-50/30 dark:from-black dark:to-pink-950/10 rounded-lg border border-pink-300/30 dark:border-pink-900/30">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-pink-500/10 rounded-full flex items-center justify-center">
                                        <Search className="h-8 w-8 text-pink-400 dark:text-pink-500/50" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Find Succinct Users</h3>
                                    <p>Search by username to find stats and roles on the Succinct network.</p>
                                    <div className="mt-4 max-w-md mx-auto grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="bg-white/50 dark:bg-black/50 p-3 rounded-md border border-pink-300/30 dark:border-pink-900/30">
                                            <h4 className="text-sm font-medium text-pink-500 mb-1">Twitter Search</h4>
                                            <p className="text-xs text-gray-500">Find testnet stats, rankings, and achievements</p>
                                        </div>
                                        <div className="bg-white/50 dark:bg-black/50 p-3 rounded-md border border-pink-300/30 dark:border-pink-900/30">
                                            <h4 className="text-sm font-medium text-purple-500 mb-1">Discord Search</h4>
                                            <p className="text-xs text-gray-500">Discover community roles and contributions</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="profile" className="mt-0 space-y-6">
                            {/* Twitter Stats Section - Only show for Twitter or Both search types */}
                            {(searchType === "twitter" || searchType === "both") && userStats && (
                                <div className="bg-gradient-to-br from-white to-pink-50/50 dark:from-black dark:to-pink-950/20 border border-pink-300/50 dark:border-pink-900/50 rounded-md p-6 animate-fadeIn shadow-md">
                                    <div className="flex flex-col md:flex-row justify-between mb-6">
                                        <div className="flex items-start">
                                            <div>
                                                <a
                                                    href={`https://twitter.com/${userStats.name}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-2xl text-pink-500 hover:text-pink-600 dark:hover:text-pink-600 font-mono inline-flex items-center group transition-colors duration-500"
                                                >
                                                    {userStats.name}
                                                    <svg className="w-5 h-5 ml-1" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                                    </svg>
                                                </a>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                    Invited by: {userStats.invitedBy !== "-" ? userStats.invitedBy : "None"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex-1 bg-pink-50 dark:bg-pink-950/30 px-4 py-2 rounded-md border border-pink-300/50 dark:border-pink-900/50 shadow-sm text-center flex flex-col items-center">
                                                    <span className="text-gray-600 dark:text-gray-400 text-sm font-mono">RANK</span>
                                                    <div className="text-2xl font-bold text-pink-500 font-mono break-words text-center">
                                                        {userStats.rank}
                                                    </div>
                                                </div>
                                                <div className="flex-1 bg-pink-50 dark:bg-pink-950/30 px-4 py-2 rounded-md border border-pink-300/50 dark:border-pink-900/50 shadow-sm text-center flex flex-col items-center">
                                                    <span className="text-gray-600 dark:text-gray-400 text-sm font-mono">TOP</span>
                                                    <div className="text-2xl font-bold text-pink-500 font-mono break-words">
                                                        {userStats.topPercent}%
                                                    </div>
                                                </div>
                                            </div>
                                            <ShareStats
                                                user={userStats}
                                                progress={{
                                                    proofs: Number(progress.proofs) || 0,
                                                    cycles: Number(progress.cycles) || 0,
                                                    stars: Number(progress.stars) || 0,
                                                }}
                                                roles={roles}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                        <div className="bg-white/50 dark:bg-black/50 p-4 rounded-lg border border-pink-300/30 dark:border-pink-900/30 shadow-sm">
                                            <div className="flex justify-between mb-2">
                                                <h3 className="text-cyan-600 dark:text-cyan-400 font-mono">STARS</h3>
                                                <div className="flex items-center">
                                                    <svg className="text-pink-500 w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                                    </svg>
                                                    <span className="text-gray-800 dark:text-white font-mono">
                                                        {Number(userStats.stars).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <Progress value={progress.stars} className="h-3 bg-pink-100 dark:bg-pink-900/30">
                                                <div className="h-full bg-gradient-to-r from-pink-600 to-pink-400 rounded-full" />
                                            </Progress>
                                        </div>

                                        <div className="bg-white/50 dark:bg-black/50 p-4 rounded-lg border border-pink-300/30 dark:border-pink-900/30 shadow-sm">
                                            <div className="flex justify-between mb-2">
                                                <h3 className="text-cyan-600 dark:text-cyan-400 font-mono">PROOFS</h3>
                                                <span className="text-gray-800 dark:text-white font-mono">
                                                    {Number(userStats.proofs).toLocaleString()}
                                                </span>
                                            </div>
                                            <Progress value={progress.proofs} className="h-3 bg-pink-100 dark:bg-pink-900/30">
                                                <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full" />
                                            </Progress>
                                        </div>

                                        <div className="bg-white/50 dark:bg-black/50 p-4 rounded-lg border border-pink-300/30 dark:border-pink-900/30 shadow-sm">
                                            <div className="flex justify-between mb-2">
                                                <h3 className="text-cyan-600 dark:text-cyan-400 font-mono">CYCLES</h3>
                                                <span className="text-gray-800 dark:text-white font-mono">
                                                    {Number(userStats.cycles).toLocaleString()}
                                                </span>
                                            </div>
                                            <Progress value={progress.cycles} className="h-3 bg-pink-100 dark:bg-pink-900/30">
                                                <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full" />
                                            </Progress>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Discord Roles Section - Only show for Discord or Both search types */}
                            {((searchType === "discord" && roles.length > 0) || (searchType === "both" && roles.length > 0)) && (
                                <div className="bg-white/50 dark:bg-black/50 p-4 rounded-lg border border-pink-300/30 dark:border-pink-900/30 shadow-sm">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h3 className="text-lg font-mono text-pink-500 flex items-center">
                                                <Shield className="h-5 w-5 mr-2" />
                                                DISCORD ROLES
                                                <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full">
                                                    Discord
                                                </span>
                                            </h3>
                                            {discordUser && discordUser.username && (
                                                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                                    User: <span className="font-medium">{discordUser.username}</span>
                                                    {discordUser.discordid && (
                                                        <span className="text-xs ml-2 text-gray-500 dark:text-gray-500">
                                                            ID: {discordUser.discordid}
                                                        </span>
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">{filteredRoles.length} roles found</div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {filteredRoles.length > 0 ? (
                                            filteredRoles.map((role) => (
                                                <Badge key={role} className={getRoleBadgeStyle(role)}>
                                                    {role}
                                                </Badge>
                                            ))
                                        ) : (
                                            <div className="w-full text-center py-4 text-gray-500 dark:text-gray-400">
                                                <AlertCircle className="h-5 w-5 mx-auto mb-2 opacity-50" />
                                                <p>No roles found matching your search criteria</p>
                                            </div>
                                        )}
                                    </div>

                                    <Collapsible>
                                        <CollapsibleTrigger className="flex items-center justify-center w-full p-2 bg-gradient-to-r from-pink-600/20 to-pink-500/20 hover:from-pink-600/30 hover:to-pink-500/30 text-pink-500 font-mono rounded-md transition-all">
                                            <ChevronDown className="h-4 w-4 mr-2" />
                                            ROLE CATEGORIES
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="mt-4 space-y-4">
                                            {Object.entries(ROLE_CATEGORIES).map(([categoryKey, categoryName]) => {
                                                const categoryRoles = roles.filter((role) => categorizeRole(role) === categoryName)

                                                if (categoryRoles.length === 0) return null

                                                return (
                                                    <div
                                                        key={categoryKey}
                                                        className="border border-pink-300/30 dark:border-pink-900/30 rounded-lg overflow-hidden"
                                                    >
                                                        <div className="p-3 bg-gradient-to-r from-white to-pink-50/50 dark:from-black dark:to-pink-950/20">
                                                            <span className="font-mono text-pink-500">
                                                                {categoryName.toUpperCase()} ({categoryRoles.length})
                                                            </span>
                                                        </div>
                                                        <div className="p-3 bg-white/50 dark:bg-black/50">
                                                            <div className="flex flex-wrap gap-2">
                                                                {categoryRoles.map((role) => (
                                                                    <Badge key={role} className={getRoleBadgeStyle(role)}>
                                                                        {role}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </CollapsibleContent>
                                    </Collapsible>
                                </div>
                            )}

                            {((searchType === "twitter" && !userStats) ||
                                (searchType === "discord" && roles.length === 0) ||
                                (searchType === "both" && !userStats && roles.length === 0)) && (
                                    <div className="text-center py-10 text-gray-600 dark:text-gray-400 bg-gradient-to-br from-white to-pink-50/30 dark:from-black dark:to-pink-950/10 rounded-lg border border-pink-300/30 dark:border-pink-900/30">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-pink-500/10 rounded-full flex items-center justify-center">
                                            {searchType === "twitter" ? (
                                                <svg
                                                    className="h-8 w-8 text-pink-400 dark:text-pink-500/50"
                                                    viewBox="0 0 24 24"
                                                    fill="currentColor"
                                                >
                                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                                </svg>
                                            ) : searchType === "discord" ? (
                                                <svg
                                                    className="h-8 w-8 text-pink-400 dark:text-pink-500/50"
                                                    viewBox="0 0 24 24"
                                                    fill="currentColor"
                                                >
                                                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3847-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                                                </svg>
                                            ) : (
                                                <Search className="h-8 w-8 text-pink-400 dark:text-pink-500/50" />
                                            )}
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {searchType === "twitter"
                                                ? "No Twitter User Found"
                                                : searchType === "discord"
                                                    ? "No Discord Roles Found"
                                                    : "No Results Found"}
                                        </h3>
                                        <p>
                                            {searchType === "twitter"
                                                ? "No user with this Twitter username was found."
                                                : searchType === "discord"
                                                    ? "No Discord roles match your search criteria."
                                                    : "No results found for your search criteria."}
                                        </p>
                                        <Button
                                            onClick={() => setActiveTab("search")}
                                            className="mt-4 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 text-white"
                                        >
                                            <Search className="mr-2 h-4 w-4" />
                                            Try Another Search
                                        </Button>
                                    </div>
                                )}

                            {/* Learn More Link - Show for any successful search */}
                            {((searchType === "twitter" && userStats) ||
                                (searchType === "discord" && roles.length > 0) ||
                                (searchType === "both" && (userStats || roles.length > 0))) && (
                                    <div className="text-center mt-6 bg-gradient-to-r from-pink-500/10 to-cyan-500/10 p-4 rounded-lg border border-pink-300/30 dark:border-pink-900/30">
                                        <a
                                            href="/earn"
                                            className="text-pink-500 hover:text-pink-600 dark:hover:text-pink-300 text-sm font-mono inline-flex items-center group"
                                        >
                                            <Star className="w-3 h-3 mr-1" />
                                            Learn how to earn more stars
                                            <ArrowRight className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" />
                                        </a>
                                    </div>
                                )}
                        </TabsContent>
                    </Tabs>
                </div>
            </CardContent>
        </Card>
    )
}