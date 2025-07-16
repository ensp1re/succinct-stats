"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
import { dsService } from "@/lib/ds.service"

// Cache configuration
const CACHE_KEY = 'discord_roles_cache'
const CACHE_DURATION = 12 * 60 * 60 * 1000 // 12 hours in milliseconds

interface CacheData {
    data: DiscordUser[]
    timestamp: number
}

interface RoleStats {
    name: string
    count: number
    percentage: number
    color: string
    isOther?: boolean
}

interface DiscordUser {
    discordid: string
    username: string
    roles: string[]
    pfp: string
}

export function RoleStats() {
    const [roleStats, setRoleStats] = useState<RoleStats[]>([])
    const [totalUsers, setTotalUsers] = useState<number>(0)
    const [totalRoles, setTotalRoles] = useState<number>(0)
    const [isLoading, setIsLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState<string>("")
    const [isUsingCache, setIsUsingCache] = useState(false)
    const [showOtherRoles, setShowOtherRoles] = useState(false)
    const [otherRolesList, setOtherRolesList] = useState<RoleStats[]>([])
    const [levelCounts, setLevelCounts] = useState<{ L1: number, L2: number, L3: number }>({ L1: 0, L2: 0, L3: 0 })

    // Priority roles to show first (lowercase for better matching)
    const priorityRoles = [
        "programmable truth", // l3
        "cargo prover", // l3
        "super prover", // l3
        "pwoofer", // l3
        "all in succinct", // l3
        "truth prover", // l2
        "sp1up prover", // l2
        "proofer", // l2
        "prover", // l2
        "proved ur luv" // l1
    ]

    // Role levels mapping
    const roleLevels: Record<string, string> = {
        "programmable truth": "L3",
        "cargo prover": "L3",
        "super prover": "L3",
        "pwoofer": "L3",
        "all in succinct": "L3",
        "truth prover": "L2",
        "sp1up prover": "L2",
        "proofer": "L2",
        "prover": "L2",
        "proved ur luv": "L1"
    }

    // Function to get role level
    const getRoleLevel = (roleName: string): string => {
        return roleLevels[roleName.toLowerCase()] || ""
    }

    // Color palette for the pie chart
    const colors = [
        "#ec4899", // pink-500
        "#06b6d4", // cyan-500
        "#8b5cf6", // violet-500
        "#f59e0b", // amber-500
        "#10b981", // emerald-500
        "#f97316", // orange-500
        "#3b82f6", // blue-500
        "#ef4444", // red-500
        "#84cc16", // lime-500
        "#6366f1", // indigo-500
        "#14b8a6", // teal-500
        "#f43f5e", // rose-500
    ]

    // Cache utility functions
    const getCachedData = (): DiscordUser[] | null => {
        try {
            const cached = localStorage.getItem(CACHE_KEY)
            if (!cached) return null

            const cacheData: CacheData = JSON.parse(cached)
            const now = Date.now()

            // Check if cache is still valid (within 12 hours)
            if (now - cacheData.timestamp < CACHE_DURATION) {
                console.log('Using cached Discord roles data')
                return cacheData.data
            } else {
                console.log('Cache expired, will fetch fresh data')
                localStorage.removeItem(CACHE_KEY)
                return null
            }
        } catch (error) {
            console.error('Error reading cache:', error)
            localStorage.removeItem(CACHE_KEY)
            return null
        }
    }

    const setCachedData = (data: DiscordUser[]) => {
        try {
            const cacheData: CacheData = {
                data,
                timestamp: Date.now()
            }
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
            console.log('Discord roles data cached for 12 hours')
        } catch (error) {
            console.error('Error setting cache:', error)
        }
    }

    useEffect(() => {
        const fetchRoleStats = async () => {
            try {
                setIsLoading(true)

                // Try to get cached data first
                const cachedData = getCachedData()
                let response: DiscordUser[]

                if (cachedData) {
                    response = cachedData
                    setIsUsingCache(true)

                    // Get cache timestamp for display
                    const cached = localStorage.getItem(CACHE_KEY)
                    if (cached) {
                        const cacheData: CacheData = JSON.parse(cached)
                        setLastUpdated(new Date(cacheData.timestamp).toLocaleString())
                    }
                } else {
                    console.log('Fetching fresh Discord roles data...')
                    response = await dsService.getRolesInfo()
                    setIsUsingCache(false)
                    setLastUpdated(new Date().toLocaleString())

                    // Cache the fresh data
                    if (Array.isArray(response)) {
                        setCachedData(response)
                    }
                }

                if (Array.isArray(response)) {
                    // Count occurrences of each role
                    const roleCount: Record<string, number> = {}

                    response.forEach((user: DiscordUser) => {
                        if (user.roles && Array.isArray(user.roles)) {
                            user.roles.forEach((role: string) => {
                                roleCount[role] = (roleCount[role] || 0) + 1
                            })
                        }
                    })

                    // Convert to array and sort by count
                    const allRoles = Object.entries(roleCount)
                        .map(([name, count]) => ({
                            name,
                            count,
                            percentage: (count / response.length) * 100 // Use total users, not role assignments
                        }))
                        .sort((a, b) => b.count - a.count)

                    // Separate priority roles from others using lowercase comparison
                    const priorityRoleData: Array<{ name: string, count: number, percentage: number }> = []
                    const otherRoleData: Array<{ name: string, count: number, percentage: number }> = []

                    allRoles.forEach(role => {
                        if (priorityRoles.includes(role.name.toLowerCase())) {
                            priorityRoleData.push(role)
                        } else {
                            otherRoleData.push(role)
                        }
                    })

                    // Sort priority roles by their priority order (if they exist)
                    priorityRoleData.sort((a, b) => {
                        const aIndex = priorityRoles.indexOf(a.name)
                        const bIndex = priorityRoles.indexOf(b.name)
                        return aIndex - bIndex
                    })

                    // Assign colors to priority roles
                    let finalRoles: RoleStats[] = priorityRoleData.map((role, index) => ({
                        ...role,
                        color: colors[index % colors.length]
                    }))

                    // Store other roles for the expandable section
                    const otherRolesWithColors = otherRoleData.map((role, index) => ({
                        ...role,
                        color: colors[(priorityRoleData.length + index) % colors.length]
                    }))
                    setOtherRolesList(otherRolesWithColors)

                    // Add "Show other roles" entry if there are other roles
                    if (otherRoleData.length > 0) {
                        const otherCount = otherRoleData.reduce((sum, role) => sum + role.count, 0)
                        const otherPercentage = (otherCount / response.length) * 100
                        finalRoles.push({
                            name: "Other roles",
                            count: otherCount,
                            percentage: otherPercentage,
                            color: "#6b7280", // gray-500
                            isOther: true
                        })
                    }

                    setRoleStats(finalRoles)
                    setTotalUsers(response.length)
                    setTotalRoles(Object.keys(roleCount).length)

                    // Count users by level
                    const levelCount = { L1: 0, L2: 0, L3: 0 }
                    priorityRoleData.forEach(role => {
                        const level = getRoleLevel(role.name)
                        if (level === "L1") levelCount.L1 += role.count
                        else if (level === "L2") levelCount.L2 += role.count
                        else if (level === "L3") levelCount.L3 += role.count
                    })
                    setLevelCounts(levelCount)
                }
            } catch (error) {
                console.error("Error fetching role stats:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchRoleStats()
    }, [])





    return (
        <Card className="bg-white dark:bg-black border border-pink-300/50 dark:border-pink-900/50 shadow-lg shadow-pink-300/10 dark:shadow-pink-500/10">
            <CardHeader className="border-b border-pink-300/30 dark:border-pink-900/30">
                <CardTitle className="text-xl font-mono text-pink-500 flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    DISCORD ROLE DISTRIBUTION
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-8 h-8 border-t-2 border-pink-500 border-r-2 border-pink-500/50 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Stats Summary */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-white to-pink-50 dark:from-black dark:to-pink-950/30 p-4 rounded-lg border border-pink-300/30 dark:border-pink-900/30">
                                <h3 className="text-cyan-600 dark:text-cyan-400 font-mono mb-2 flex items-center">
                                    <Users className="mr-2 h-4 w-4" /> TOTAL USERS
                                </h3>
                                <p className="text-xl font-bold text-gray-800 dark:text-white">
                                    {totalUsers.toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-white to-pink-50 dark:from-black dark:to-pink-950/30 p-4 rounded-lg border border-pink-300/30 dark:border-pink-900/30">
                                <h3 className="text-cyan-600 dark:text-cyan-400 font-mono mb-2 flex items-center">
                                    <Shield className="mr-2 h-4 w-4" /> UNIQUE ROLES
                                </h3>
                                <p className="text-xl font-bold text-gray-800 dark:text-white">
                                    {totalRoles.toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-white to-pink-50 dark:from-black dark:to-pink-950/30 p-4 rounded-lg border border-pink-300/30 dark:border-pink-900/30">
                                <h3 className="text-cyan-600 dark:text-cyan-400 font-mono mb-2 flex items-center">
                                    <TrendingUp className="mr-2 h-4 w-4" /> MOST POPULAR ROLE
                                </h3>
                                <p className="text-xl font-bold text-gray-800 dark:text-white">
                                    {roleStats[0]?.name || "N/A"}
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-white to-pink-50 dark:from-black dark:to-pink-950/30 p-4 rounded-lg border border-pink-300/30 dark:border-pink-900/30">
                                <h3 className="text-cyan-600 dark:text-cyan-400 font-mono mb-2 flex items-center">
                                    <Shield className="mr-2 h-4 w-4" /> ROLE LEVELS
                                </h3>
                                <div className="text-sm text-gray-800 dark:text-white">
                                    <div className="flex justify-between">
                                        <span>L3:</span>
                                        <span className="font-bold">{levelCounts.L3}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>L2:</span>
                                        <span className="font-bold">{levelCounts.L2}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>L1:</span>
                                        <span className="font-bold">{levelCounts.L1}</span>
                                    </div>
                                </div>
                            </div>
                        </div>



                        {/* Roles List */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-mono text-pink-500 mb-4">PRIORITY ROLES</h3>
                            {roleStats.filter(role => !role.isOther).map((role, index) => (
                                <div key={role.name} className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-cyan-50 dark:from-pink-950/20 dark:to-cyan-950/20 rounded-lg border border-pink-300/30 dark:border-pink-900/30">
                                    <div className="flex items-center">
                                        <div
                                            className="w-4 h-4 rounded-full mr-3"
                                            style={{ backgroundColor: role.color }}
                                        />
                                        <span className="font-mono text-gray-800 dark:text-white">
                                            {role.name}
                                            {getRoleLevel(role.name) && (
                                                <span className="ml-2 px-2 py-1 text-xs bg-pink-500 text-white rounded-full font-bold">
                                                    {getRoleLevel(role.name)}
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-cyan-600 dark:text-cyan-400 font-mono font-bold">
                                            {role.count.toLocaleString()}
                                        </span>
                                        <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                                            ({role.percentage.toFixed(1)}%)
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {/* Show other roles section */}
                            {roleStats.find(role => role.isOther) && (
                                <div className="mt-4">
                                    <button
                                        onClick={() => setShowOtherRoles(!showOtherRoles)}
                                        className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-lg border border-gray-300/30 dark:border-gray-700/30 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-800/70 dark:hover:to-gray-700/70 transition-colors duration-200"
                                    >
                                        <div className="flex items-center">
                                            <div className="w-4 h-4 rounded-full mr-3 bg-gray-500" />
                                            <span className="font-mono text-gray-800 dark:text-white">
                                                {showOtherRoles ? 'Hide' : 'Show'} other roles ({otherRolesList.length})
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-cyan-600 dark:text-cyan-400 font-mono font-bold mr-2">
                                                {roleStats.find(role => role.isOther)?.count.toLocaleString()}
                                            </span>
                                            <span className="text-gray-500 dark:text-gray-400 text-sm mr-2">
                                                ({roleStats.find(role => role.isOther)?.percentage.toFixed(1)}%)
                                            </span>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {showOtherRoles ? '▼' : '▶'}
                                            </span>
                                        </div>
                                    </button>

                                    {showOtherRoles && (
                                        <div className="mt-3 space-y-2 pl-4 border-l-2 border-gray-300 dark:border-gray-700">
                                            {otherRolesList.map((role, index) => (
                                                <div key={role.name} className="flex items-center justify-between p-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30 rounded-lg">
                                                    <div className="flex items-center">
                                                        <div
                                                            className="w-3 h-3 rounded-full mr-2"
                                                            style={{ backgroundColor: role.color }}
                                                        />
                                                        <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
                                                            {role.name}
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-cyan-600 dark:text-cyan-400 font-mono font-bold text-sm">
                                                            {role.count.toLocaleString()}
                                                        </span>
                                                        <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">
                                                            ({role.percentage.toFixed(1)}%)
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>


                    </div>
                )}
            </CardContent>
        </Card>
    )
} 