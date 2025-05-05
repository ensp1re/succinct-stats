"use client"

import { useState, useRef, useEffect, ReactElement } from "react"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Share2, Twitter, Copy, Check, Download, Info, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Star } from "lucide-react"
import type { LeaderboardEntry } from "@/lib/types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import * as htmlToImage from 'html-to-image';

interface ShareStatsProps {
    user: LeaderboardEntry
    progress: {
        proofs: number
        cycles: number
        stars: number
    }
}


const ShareStats = ({ user, progress }: ShareStatsProps): ReactElement => {
    const [isCopied, setIsCopied] = useState(false)
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [isGeneratingImage, setIsGeneratingImage] = useState(false)
    const shareCardRef = useRef<HTMLDivElement>(null)
    const [userStats, setUserStats] = useState<LeaderboardEntry | null>(null)
    const [isShowTwitterButton, setIsShowTwitterButton] = useState<boolean>(false)
    const [userProgress, setUserProgress] = useState(progress)

    useEffect(() => {
        if (user) {
            setUserStats(user)
            setUserProgress(progress)
        }
    }, [user])

    const generateImage = async () => {
        if (!shareCardRef.current || isGeneratingImage) return

        try {
            setIsShowTwitterButton(true)
            setIsGeneratingImage(true)

            await new Promise((resolve) => setTimeout(resolve, 100))
            if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
                await document.fonts.ready;
            } else {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }

            // Check if the browser is Firefox
            const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('firefox');
            if (isFirefox) {
                setImageUrl(null);
                setIsGeneratingImage(false);
                return;
            }

            const dataUrl = await htmlToImage.toPng(shareCardRef.current);
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
            : ''
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

    useEffect(() => {
        document.body.style.overflowY = 'auto !important'
    }, [])

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
            <DialogContent className="[&>button]:hidden sm:max-w-sm bg-white dark:bg-black border my-4 border-gray-300 dark:border-pink-900/50 overflow-y-auto max-h-[90vh] p-4 rounded-lg">
                <DialogHeader>
                    <DialogTitle className="text-lg font-mono text-gray-900 dark:text-pink-500">Share Your Stats</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center space-y-4">
                    {/* Preview Card */}
                    <div
                        ref={shareCardRef}
                        style={{
                            fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif'
                        }} className="w-full max-w-xs p-4 rounded-md bg-gray-100 dark:bg-[#050505] border border-gray-300 dark:border-pink-900/50 shadow-lg dark:shadow-pink-500/10 relative overflow-hidden "
                    >
                        {/* Cyberpunk grid background */}
                        <div
                            className="absolute inset-0 opacity-30"
                            style={{
                                background: `linear-gradient(to right, rgba(236, 72, 153, 0.1) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(236, 72, 153, 0.1) 1px, transparent 1px)`,
                                backgroundSize: "15px 15px",
                            }}
                        ></div>

                        {/* Glowing circuit lines */}
                        <div
                            className="absolute inset-0 opacity-40"
                            style={{
                                backgroundImage: `radial-gradient(circle at 20% 30%, rgba(236, 72, 153, 0.3) 0%, transparent 20%),
                  radial-gradient(circle at 80% 70%, rgba(34, 211, 238, 0.3) 0%, transparent 20%),
                  linear-gradient(90deg, transparent 0%, rgba(236, 72, 153, 0.1) 30%, rgba(34, 211, 238, 0.1) 70%, transparent 100%)`,
                            }}
                        ></div>

                        <div className="relative z-10">
                            {/* Logo and title centered */}
                            <div className="flex justify-center items-center mb-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded flex items-center justify-center">
                                        <span className="text-black font-bold text-lg">S</span>
                                    </div>
                                    <span className="text-gray-900 dark:text-pink-500 text-lg font-bold font-mono ml-2">Succinct Stats</span>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-pink-600/30 to-pink-500/30 p-2 rounded-md border border-gray-300 dark:border-pink-500/50 mb-4 text-center">
                                <div className="text-gray-900 dark:text-white text-xs font-mono mb-1">NETWORK RANKING</div>
                                <div className="text-xl font-bold text-pink-500 font-mono">TOP {userStats?.topPercent}%</div>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-lg font-mono text-gray-900 dark:text-white mb-2 text-center">{userStats?.name}</h3>
                                <div className="flex justify-between items-center">
                                    <div className="text-sm font-mono text-cyan-600 dark:text-cyan-400">RANK</div>
                                    <div className="bg-gradient-to-r from-pink-600 to-pink-500 px-3 py-1 rounded-md text-white font-bold font-mono text-lg">
                                        {userStats?.rank}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 mb-4">
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <h3 className="text-cyan-600 dark:text-cyan-400 font-mono text-sm">STARS</h3>
                                        <div className="flex items-center">
                                            <Star className="text-pink-500 w-4 h-4 mr-1" />
                                            <span className="text-gray-900 dark:text-white font-mono text-sm">{
                                                Number(userStats?.stars).toLocaleString()
                                            }</span>
                                        </div>
                                    </div>
                                    <Progress value={userProgress?.stars ? Number(userProgress.stars) : undefined} className="h-3 bg-gray-300 dark:bg-pink-900/30">
                                        <div className="h-full bg-gradient-to-r from-pink-600 to-pink-400 rounded-full" />
                                    </Progress>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-1">
                                        <h3 className="text-cyan-600 dark:text-cyan-400 font-mono text-sm">PROOFS</h3>
                                        <span className="text-gray-900 dark:text-white font-mono text-sm"> {
                                            Number(userStats?.proofs).toLocaleString()
                                        }</span>
                                    </div>
                                    <Progress value={userProgress?.proofs ? Number(userProgress.proofs) : undefined} className="h-3 bg-gray-300 dark:bg-pink-900/30">
                                        <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full" />
                                    </Progress>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-1">
                                        <h3 className="text-cyan-600 dark:text-cyan-400 font-mono text-sm">CYCLES</h3>
                                        <span className="text-gray-900 dark:text-white font-mono text-sm">{
                                            Number(userStats?.cycles).toLocaleString()
                                        }</span>
                                    </div>
                                    <Progress value={userProgress?.cycles ? Number(userProgress.proofs) : undefined} className="h-3 bg-gray-300 dark:bg-pink-900/30">
                                        <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full" />
                                    </Progress>
                                </div>
                            </div>

                            <div className="text-center">
                                <div className="text-xs text-gray-500 dark:text-pink-400 font-mono border-t border-gray-300 dark:border-pink-900/30 pt-2">
                                    testnet.succinct.xyz
                                </div>
                            </div>
                        </div>
                    </div>

                    {
                        isShowTwitterButton && (
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
                        )
                    }


                    {isGeneratingImage ? (
                        <div className="flex items-center justify-center py-2">
                            <div className="w-4 h-4 border-t-2 border-pink-500 border-r-2 border-pink-500/50 rounded-full animate-spin mr-2"></div>
                            <span className="text-pink-500 font-mono text-xs">GENERATING IMAGE...</span>
                        </div>
                    ) : imageUrl && (
                        <div className="flex flex-col gap-2 w-full">
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
                        </div>
                    )}

                    <DialogClose asChild>
                        <button
                            className="absolute right-3 top-0 rounded-full bg-transparent hover:bg-pink-900/30 p-1 transition-colors duration-200"
                        >
                            <X className="h-5 w-5 text-pink-500" />
                            <span className="sr-only">Close</span>
                        </button>
                    </DialogClose>

                </div>
            </DialogContent>
        </Dialog>
    )
}


export default ShareStats;