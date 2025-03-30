"use client"

import { useState, useEffect, ReactElement } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, Users, ActivityIcon, Calendar, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format, addDays, subDays, startOfWeek, parseISO, isValid } from "date-fns"
import { fetchActivityData } from "@/lib/csv-service"

interface DailyActivity {
    day: string
    date: string
    newUsers: number
    starsEarned: number
    proofsGenerated: number
    activeUsers: number
    topEarner: string
    topEarnerStars: number
}

export function ActivityChart(): ReactElement {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [selectedMetric, setSelectedMetric] = useState<"starsEarned" | "proofsGenerated" | "activeUsers" | "newUsers">("starsEarned")
    const [dateRange, setDateRange] = useState<{
        start: string
        end: string
    }>(() => {
        const currentDate = new Date()
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
        return {
            start: format(weekStart, "yyyy-MM-dd"),
            end: format(addDays(weekStart, 6), "yyyy-MM-dd"),
        }
    })
    const [showCalendar, setShowCalendar] = useState<boolean>(false)
    const [calendarError, setCalendarError] = useState<string>("")
    const [activityData, setActivityData] = useState<DailyActivity[]>([])
    const [isLoadingActivity, setIsLoadingActivity] = useState<boolean>(false)
    const [activityError, setActivityError] = useState<string>("")
    const [weeklyStats, setWeeklyStats] = useState<{
        totalUsers: number
        totalProofs: number
        totalStars: number
    }>({
        totalUsers: 0,
        totalProofs: 0,
        totalStars: 0,
    })

    useEffect(() => {
        async function loadActivityData() {
            setIsLoadingActivity(true)
            setActivityError("")

            try {
                const res = await fetchActivityData(dateRange.start, dateRange.end)
                const data = res.data as DailyActivity[]
                setActivityData(data)

                const totalStars = Array.isArray(data) ? data.reduce((sum: number, day: DailyActivity) => sum + day.starsEarned, 0) : 0
                const totalProofs = Array.isArray(data) ? data.reduce((sum: number, day: DailyActivity) => sum + day.proofsGenerated, 0) : 0
                const totalUsers = Array.isArray(data) ? data.reduce((sum: number, day: DailyActivity) => sum + day.activeUsers, 0) / 7 : 0

                setWeeklyStats({
                    totalUsers: Math.round(totalUsers),
                    totalProofs,
                    totalStars,
                })
            } catch (error) {
                console.error("Failed to load activity data:", error)
                setActivityError(error instanceof Error ? error.message : "Failed to load activity data")
                setActivityData([])
            } finally {
                setIsLoadingActivity(false)
                setIsLoading(false)
            }
        }

        loadActivityData()
    }, [dateRange])

    const maxStarsEarned = Math.max(...(Array.isArray(activityData) ? activityData.map((day) => day.starsEarned) : []), 1)
    const maxProofsGenerated = Math.max(...(Array.isArray(activityData) ? activityData.map((day) => day.proofsGenerated) : []), 1)
    const maxActiveUsers = Math.max(...(Array.isArray(activityData) ? activityData.map((day) => day.activeUsers) : []), 1)
    const maxNewUsers = Math.max(...(Array.isArray(activityData) ? activityData.map((day) => day.newUsers) : []), 1)

    const getMaxValue = (metric: "starsEarned" | "proofsGenerated" | "activeUsers" | "newUsers"): number => {
        switch (metric) {
            case "starsEarned":
                return maxStarsEarned
            case "proofsGenerated":
                return maxProofsGenerated
            case "activeUsers":
                return maxActiveUsers
            case "newUsers":
                return maxNewUsers
            default:
                return maxStarsEarned
        }
    }

    const formatNumber = (num: number) => {
        return num.toLocaleString()
    }

    const getMetricColor = (metric: "starsEarned" | "proofsGenerated" | "activeUsers" | "newUsers"): string => {
        switch (metric) {
            case "starsEarned":
                return "bg-pink-500"
            case "proofsGenerated":
                return "bg-cyan-500"
            case "activeUsers":
                return "bg-purple-500"
            case "newUsers":
                return "bg-green-500"
            default:
                return "bg-pink-500"
        }
    }

    const goToPreviousWeek = () => {
        const startDate = parseISO(dateRange.start)
        const newStartDate = subDays(startDate, 7)
        const newEndDate = addDays(newStartDate, 6)

        setDateRange({
            start: format(newStartDate, "yyyy-MM-dd"),
            end: format(newEndDate, "yyyy-MM-dd"),
        })
    }

    const goToNextWeek = () => {
        const startDate = parseISO(dateRange.start)
        const newStartDate = addDays(startDate, 7)
        const newEndDate = addDays(newStartDate, 6)

        if (newStartDate > new Date()) {
            return
        }

        setDateRange({
            start: format(newStartDate, "yyyy-MM-dd"),
            end: format(newEndDate, "yyyy-MM-dd"),
        })
    }

    const updateDateRange = (start: string, end: string): boolean => {
        const startDate = parseISO(start)
        const endDate = parseISO(end)

        if (!isValid(startDate) || !isValid(endDate)) {
            setCalendarError("Invalid date format")
            return false
        }

        const diffInDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

        if (diffInDays !== 6) {
            setCalendarError("Date range must be exactly 7 days")
            return false
        }

        if (endDate > new Date()) {
            setCalendarError("Cannot select future dates")
            return false
        }

        setCalendarError("")
        setDateRange({ start, end })
        setShowCalendar(false)
        return true
    }

    const formatDateForDisplay = (dateString: string): string => {
        const date: Date = parseISO(dateString)
        return format(date, "MMM d, yyyy")
    }

    return (
        <Card className="bg-white dark:bg-black border border-pink-300/50 dark:border-pink-900/50 shadow-lg shadow-pink-300/10 dark:shadow-pink-500/10">
            <CardHeader className="border-b border-pink-300/30 dark:border-pink-900/30">
                <CardTitle className="text-xl font-mono text-pink-500">ACTIVITY CHART</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                {/* Date Range Selector */}
                <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <div className="text-gray-800 dark:text-white font-medium">Select Metric:</div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedMetric("starsEarned")}
                                className={`px-3 py-1 rounded-md text-sm ${selectedMetric === "starsEarned"
                                    ? "bg-pink-500 text-white"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                    }`}
                            >
                                Stars Earned
                            </button>
                            <button
                                onClick={() => setSelectedMetric("proofsGenerated")}
                                className={`px-3 py-1 rounded-md text-sm ${selectedMetric === "proofsGenerated"
                                    ? "bg-cyan-500 text-white"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                    }`}
                            >
                                Proofs Generated
                            </button>
                            <button
                                onClick={() => setSelectedMetric("activeUsers")}
                                className={`px-3 py-1 rounded-md text-sm ${selectedMetric === "activeUsers"
                                    ? "bg-purple-500 text-white"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                    }`}
                            >
                                Active Users
                            </button>
                            <button
                                onClick={() => setSelectedMetric("newUsers")}
                                className={`px-3 py-1 rounded-md text-sm ${selectedMetric === "newUsers"
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                    }`}
                            >
                                New Users
                            </button>
                        </div>
                    </div>

                    <div className="relative">
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 border-pink-300/50 dark:border-pink-900/50 hover:bg-pink-50 dark:hover:bg-pink-950/30"
                            onClick={() => setShowCalendar(!showCalendar)}
                        >
                            <Calendar className="h-4 w-4" />
                            <span>
                                {formatDateForDisplay(dateRange.start)} - {formatDateForDisplay(dateRange.end)}
                            </span>
                        </Button>

                        {showCalendar && (
                            <div className="absolute right-0 mt-2 p-4 bg-white dark:bg-gray-900 border border-pink-300/50 dark:border-pink-900/50 rounded-md shadow-lg z-10 w-80">
                                <div className="mb-4">
                                    <h3 className="text-gray-800 dark:text-white font-medium mb-2">Select Week</h3>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                                        Select a 7-day period to view activity data
                                    </p>

                                    <div className="flex justify-between items-center mb-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-pink-300/50 dark:border-pink-900/50 hover:bg-pink-50 dark:hover:bg-pink-950/30"
                                            onClick={goToPreviousWeek}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Previous Week
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-pink-300/50 dark:border-pink-900/50 hover:bg-pink-50 dark:hover:bg-pink-950/30"
                                            onClick={goToNextWeek}
                                        >
                                            Next Week
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Predefined Week Options */}
                                    <div className="space-y-2 mt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full border-pink-300/50 dark:border-pink-900/50 hover:bg-pink-50 dark:hover:bg-pink-950/30 justify-start"
                                            onClick={() => {
                                                const currentDate = new Date()
                                                const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
                                                updateDateRange(format(weekStart, "yyyy-MM-dd"), format(addDays(weekStart, 6), "yyyy-MM-dd"))
                                            }}
                                        >
                                            Current Week
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full border-pink-300/50 dark:border-pink-900/50 hover:bg-pink-50 dark:hover:bg-pink-950/30 justify-start"
                                            onClick={() => {
                                                const currentDate = new Date()
                                                const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
                                                const prevWeekStart = subDays(weekStart, 7)
                                                updateDateRange(
                                                    format(prevWeekStart, "yyyy-MM-dd"),
                                                    format(addDays(prevWeekStart, 6), "yyyy-MM-dd"),
                                                )
                                            }}
                                        >
                                            Previous Week
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full border-pink-300/50 dark:border-pink-900/50 hover:bg-pink-50 dark:hover:bg-pink-950/30 justify-start"
                                            onClick={() => {
                                                const currentDate = new Date()
                                                const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
                                                const twoWeeksAgoStart = subDays(weekStart, 14)
                                                updateDateRange(
                                                    format(twoWeeksAgoStart, "yyyy-MM-dd"),
                                                    format(addDays(twoWeeksAgoStart, 6), "yyyy-MM-dd"),
                                                )
                                            }}
                                        >
                                            Two Weeks Ago
                                        </Button>
                                    </div>
                                </div>

                                {calendarError && (
                                    <div className="mb-4 p-2 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-md text-red-600 dark:text-red-300 text-xs flex items-start">
                                        <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
                                        <span>{calendarError}</span>
                                    </div>
                                )}

                                <div className="flex justify-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-pink-300/50 dark:border-pink-900/50 hover:bg-pink-50 dark:hover:bg-pink-950/30 mr-2"
                                        onClick={() => setShowCalendar(false)}
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        size="sm"
                                        className="bg-pink-500 hover:bg-pink-600 text-white"
                                        onClick={() => setShowCalendar(false)}
                                    >
                                        Apply
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {isLoading || isLoadingActivity ? (
                    <div className="h-[300px] flex items-center justify-center">
                        <div className="w-8 h-8 border-t-2 border-pink-500 border-r-2 border-pink-500/50 rounded-full animate-spin"></div>
                    </div>
                ) : activityError ? (
                    <div className="h-[300px] flex items-center justify-center">
                        <div className="text-center p-6 bg-pink-50 dark:bg-pink-950/20 border border-pink-300/50 dark:border-pink-900/50 rounded-lg max-w-md">
                            <AlertCircle className="h-8 w-8 text-pink-500 mx-auto mb-2" />
                            <h3 className="text-pink-600 dark:text-pink-400 font-medium mb-2">Data Unavailable</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{activityError}</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-4 border-pink-300/50 dark:border-pink-900/50 hover:bg-pink-50 dark:hover:bg-pink-950/30"
                                onClick={() => {
                                    const currentDate = new Date()
                                    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
                                    updateDateRange(format(weekStart, "yyyy-MM-dd"), format(addDays(weekStart, 6), "yyyy-MM-dd"))
                                }}
                            >
                                Try Current Week
                            </Button>
                        </div>
                    </div>
                ) : activityData.length === 0 ? (
                    <div className="h-[300px] flex items-center justify-center">
                        <div className="text-center p-6 bg-pink-50 dark:bg-pink-950/20 border border-pink-300/50 dark:border-pink-900/50 rounded-lg max-w-md">
                            <Calendar className="h-8 w-8 text-pink-500 mx-auto mb-2" />
                            <h3 className="text-pink-600 dark:text-pink-400 font-medium mb-2">No Data Available</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                There is no activity data available for the selected date range.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-4 border-pink-300/50 dark:border-pink-900/50 hover:bg-pink-50 dark:hover:bg-pink-950/30"
                                onClick={() => {
                                    const currentDate = new Date()
                                    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
                                    updateDateRange(format(weekStart, "yyyy-MM-dd"), format(addDays(weekStart, 6), "yyyy-MM-dd"))
                                }}
                            >
                                Try Current Week
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="h-[300px] overflow-y-auto">
                            <div className="flex h-[250px] items-end space-x-2 px-4">
                                {Array.isArray(activityData) && activityData.map((day, index) => (
                                    <div key={index} className="flex-1 flex flex-col items-center">
                                        <div className="w-full flex flex-col items-center space-y-1">
                                            <div
                                                className={`w-full ${getMetricColor(selectedMetric)} rounded-t-sm transition-all duration-500 ease-in-out`}
                                                style={{
                                                    height: `${(day[selectedMetric] / getMaxValue(selectedMetric)) * 200}px`,
                                                    minHeight: "10px",
                                                }}
                                            >
                                                <div className="h-full w-full flex items-start justify-center">
                                                    <span className="text-white text-xs font-bold px-1 py-0.5 bg-black/30 rounded mt-1 truncate max-w-full">
                                                        {selectedMetric === "starsEarned" || selectedMetric === "proofsGenerated"
                                                            ? formatNumber(day[selectedMetric])
                                                            : day[selectedMetric]}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 flex flex-col items-center">
                                            <span>{day.day}</span>
                                            <span className="text-[10px] text-gray-500 dark:text-gray-500">
                                                {formatDateForDisplay(day.date).split(",")[0]}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-white dark:bg-black border border-pink-300/30 dark:border-pink-900/30 rounded-lg">
                            <h3 className="text-gray-800 dark:text-white font-medium mb-2">Daily Top Earners</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-xs">
                                {Array.isArray(activityData) && activityData.map((day, index) => (
                                    <div key={index} className="text-center">
                                        <div className="font-medium text-gray-700 dark:text-gray-300">{day.day}</div>
                                        <div className="text-pink-500 font-bold">{day.topEarner}</div>
                                        <div className="text-gray-600 dark:text-gray-400">
                                            <Star className="inline h-3 w-3 mr-0.5" />
                                            {formatNumber(day.topEarnerStars)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                            <div className="bg-gradient-to-br from-white to-pink-50 dark:from-black dark:to-pink-950/30 p-4 rounded-lg border border-pink-300/30 dark:border-pink-900/30">
                                <h3 className="text-cyan-600 dark:text-cyan-400 font-mono mb-2 flex items-center">
                                    <Users className="mr-2 h-4 w-4" /> WEEKLY USERS
                                </h3>
                                <p className="text-xl font-bold text-gray-800 dark:text-white">
                                    {formatNumber(weeklyStats.totalUsers)}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Avg. daily active users</p>
                            </div>
                            <div className="bg-gradient-to-br from-white to-pink-50 dark:from-black dark:to-pink-950/30 p-4 rounded-lg border border-pink-300/30 dark:border-pink-900/30">
                                <h3 className="text-cyan-600 dark:text-cyan-400 font-mono mb-2 flex items-center">
                                    <ActivityIcon className="mr-2 h-4 w-4" /> WEEKLY PROOFS
                                </h3>
                                <p className="text-xl font-bold text-gray-800 dark:text-white">
                                    {formatNumber(weeklyStats.totalProofs)}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total for the week</p>
                            </div>
                            <div className="bg-gradient-to-br from-white to-pink-50 dark:from-black dark:to-pink-950/30 p-4 rounded-lg border border-pink-300/30 dark:border-pink-900/30">
                                <h3 className="text-cyan-600 dark:text-cyan-400 font-mono mb-2 flex items-center">
                                    <Star className="mr-2 h-4 w-4" /> WEEKLY STARS
                                </h3>
                                <p className="text-xl font-bold text-gray-800 dark:text-white">
                                    {formatNumber(weeklyStats.totalStars)}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total for the week</p>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}

