"use client"

import { useState, useEffect } from "react"

declare module "react" {
    interface CSSProperties {
        "--block-color"?: string;
        "--block-shadow"?: string;
    }
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Info, X, Twitter, Users, Code, ArrowRight, Copy, Check } from "lucide-react"

interface EarlyAccessProps {
    totalSpots: number
    remainingSpots: number
}

export function EarlyAccess({ totalSpots = 25000, remainingSpots = 1340 }: EarlyAccessProps) {
    const [visibleBlocks, setVisibleBlocks] = useState(0)

    const totalBlocks = 20
    const claimedSpots = totalSpots - remainingSpots
    const claimedPercentage = (claimedSpots / totalSpots) * 100
    const filledBlocks = Math.round((claimedPercentage / 100) * totalBlocks)

    useEffect(() => {
        setVisibleBlocks(0)

        let currentBlock = 0
        const blockInterval = setInterval(() => {
            if (currentBlock < filledBlocks) {
                currentBlock += 1
                setVisibleBlocks(currentBlock)
            } else {
                clearInterval(blockInterval)
            }
        }, 120)

        return () => {
            clearInterval(blockInterval)
        }
    }, [filledBlocks])

    return (
        <Card className="bg-white dark:bg-black border border-pink-300/50 dark:border-pink-900/50 shadow-lg shadow-pink-300/10 dark:shadow-pink-500/10 mb-8">
            <CardHeader className="border-b border-pink-300/30 dark:border-pink-900/30">
                <CardTitle className="text-xl font-mono text-pink-500">EARLY ACCESS</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                    <div className="w-full max-w-md">
                        <div className="text-center mb-4">
                            <span className="text-cyan-600 dark:text-cyan-400 font-mono text-2xl">
                                {remainingSpots.toLocaleString()}
                            </span>
                            <span className="text-cyan-600 dark:text-cyan-400 font-mono"> SPOTS REMAINING</span>
                        </div>

                        {/* Progress bar container */}
                        <div className="border-2 border-pink-400 dark:border-pink-500 p-1 rounded-sm relative overflow-hidden">
                            {/* Progress blocks */}
                            <div className="relative flex">
                                {Array.from({ length: totalBlocks }).map((_, index) => (
                                    <div
                                        key={index}
                                        className={`h-8 flex-1 mx-0.5 transition-all duration-300 relative overflow-hidden`}
                                        style={{
                                            transform: index < visibleBlocks ? "scale(1)" : "scale(0.8)",
                                            opacity: index < visibleBlocks ? 1 : 0.3,
                                            backgroundColor: index < visibleBlocks ? "var(--block-color, #ec4899)" : "transparent",
                                            boxShadow:
                                                index < visibleBlocks ? "var(--block-shadow, 0 0 8px rgba(236, 72, 153, 0.7))" : "none",
                                            transition: `all 0.3s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)`,
                                            "--block-color": "var(--tw-theme-pink, #ec4899)" as React.CSSProperties["--block-color"],
                                            "--block-shadow": "var(--tw-theme-pink-shadow, 0 0 8px rgba(236, 72, 153, 0.7))",
                                        }}
                                    >
                                        {index < visibleBlocks && (
                                            <div className="absolute inset-0 bg-gradient-to-t from-pink-500 to-pink-400 dark:from-pink-600 dark:to-pink-400"></div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Digital noise overlay */}
                            <div
                                className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`,
                                }}
                            ></div>
                        </div>

                        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400 font-mono">
                            <span>0</span>
                            <span>{totalSpots.toLocaleString()} TOTAL SPOTS</span>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-pink-500 font-mono text-sm">{Math.round(claimedPercentage)}% OF SPOTS CLAIMED</p>
                            <p className="text-gray-500 dark:text-gray-400 text-xs mt-2 flex items-center justify-center flex-wrap">
                                Join now to secure your place in the Succinct Network.
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <button className="ml-1 text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center">
                                            How to get a code <Info className="h-3 w-3 ml-1" />
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="[&>button]:hidden p-0 sm:max-w-md bg-black/95 border border-pink-500/50 rounded-lg overflow-hidden">
                                        <div className="relative p-6">
                                            <div className="flex items-center mb-6">
                                                <Code className="h-5 w-5 text-pink-500 mr-2" />
                                                <h2 className="text-xl font-mono text-pink-500">HOW TO GET A CODE</h2>
                                            </div>

                                            <div className="bg-gradient-to-r from-cyan-900/30 to-pink-900/30 rounded-lg p-4 mb-6 border border-cyan-500/20">
                                                <p className="text-gray-300 text-sm">
                                                    The only way to get a code is to contribute to Succinct and prove your commitment.
                                                </p>
                                            </div>

                                            <h3 className="text-cyan-400 font-mono text-sm mb-4">WAYS TO GET A CODE:</h3>

                                            <ul className="space-y-4 mb-6">
                                                <li className="flex items-start">
                                                    <Twitter className="h-4 w-4 text-pink-500 mr-3 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-300 text-sm">
                                                        Post about Succinct on X (Twitter) -{" "}
                                                        <a
                                                            href="https://twitter.com/succinctlabs"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-pink-400 hover:text-pink-300"
                                                        >
                                                            @SuccinctLabs
                                                        </a>{" "}
                                                        - <span className="text-pink-400">most effective way</span>
                                                    </span>
                                                </li>
                                                <li className="flex items-start">
                                                    <Users className="h-4 w-4 text-pink-500 mr-3 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-300 text-sm">
                                                        Join the{" "}
                                                        <a
                                                            href="https://discord.gg/succinctlabs"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-pink-400 hover:text-pink-300"
                                                        >
                                                            Succinct Discord
                                                        </a>{" "}
                                                        and engage with the community
                                                    </span>
                                                </li>
                                                <li className="flex items-start">
                                                    <Users className="h-4 w-4 text-pink-500 mr-3 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-300 text-sm">
                                                        Participate in weekly Succinct Rockstars contests{" "}
                                                        <span className="text-cyan-400">(Discord channel: ⁠⭐・contest-details)</span>
                                                    </span>
                                                </li>
                                                <li className="flex items-start">
                                                    <Code className="h-4 w-4 text-pink-500 mr-3 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-300 text-sm">
                                                        Complete tasks on <span className="text-cyan-400">Discord channel: ⁠🎸・rockstar-tasks</span>
                                                    </span>
                                                </li>
                                                <li className="flex items-start">
                                                    <Info className="h-4 w-4 text-pink-500 mr-3 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-300 text-sm">Be active and supportive in the community</span>
                                                </li>
                                            </ul>

                                            <div className="bg-gradient-to-r from-cyan-900/30 to-pink-900/30 rounded-lg p-4 mb-6 border border-cyan-500/20">
                                                <p className="text-gray-300 text-sm">
                                                    The team tracks all contributions and will provide you with a personal invite code once they
                                                    feel you've proven your commitment.
                                                </p>
                                            </div>

                                            <div className="flex justify-center">
                                                <a
                                                    href="https://testnet.succinct.xyz"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-md font-mono text-sm transition-colors duration-200 w-full sm:w-auto"
                                                >
                                                    GO TO TESTNET <ArrowRight className="ml-2 h-4 w-4" />
                                                </a>
                                            </div>

                                            <DialogClose asChild>
                                                <button
                                                    className="absolute right-4 top-4 rounded-full bg-transparent hover:bg-pink-900/30 p-1 transition-colors duration-200"
                                                >
                                                    <X className="h-5 w-5 text-pink-500" />
                                                    <span className="sr-only">Close</span>
                                                </button>
                                            </DialogClose>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card >
    )
}

