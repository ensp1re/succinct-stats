"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"

export interface RunningCrabProps {
    speed?: number
    escapeDistance?: number
    updateInterval?: number
    size?: number
    zIndex?: number
    initialPosition?: { x: number; y: number }
    enableSound?: boolean
}

export function RunningCrab({
    speed = 5,
    escapeDistance = 150,
    updateInterval = 2000,
    size = 80,
    zIndex = 100,
    initialPosition,
    enableSound = true,
}: RunningCrabProps) {
    const [position, setPosition] = useState(
        () =>
            initialPosition || {
                x: Math.random() * (typeof window !== "undefined" ? window.innerWidth - size : 300),
                y: Math.random() * (typeof window !== "undefined" ? window.innerHeight - size : 300),
            },
    )
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [direction, setDirection] = useState({ x: Math.random() > 0.5 ? 1 : -1, y: Math.random() > 0.5 ? 1 : -1 })
    const [isMoving, setIsMoving] = useState(false)
    const [soundAvailable, setSoundAvailable] = useState(false)
    const crabRef = useRef<HTMLDivElement>(null)
    const animationRef = useRef<number | null>(null)
    const lastUpdateRef = useRef<number>(Date.now())
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const lastSoundTimeRef = useRef<number>(0)

    // Track mouse position
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY })
        }

        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [])

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setPosition((prev) => ({
                x: Math.min(prev.x, window.innerWidth - size),
                y: Math.min(prev.y, window.innerHeight - size),
            }))
        }

        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [size])

    // Initialize audio
    useEffect(() => {
        // Only initialize audio if sound is enabled
        if (typeof window !== "undefined" && enableSound) {
            try {
                // Check if Audio is supported in this browser/environment
                if (typeof Audio !== "undefined") {
                    audioRef.current = new Audio("/no-sound.mp3")

                    // Test if audio can be played
                    const testPlayPromise = audioRef.current.play()

                    if (testPlayPromise !== undefined) {
                        testPlayPromise
                            .then(() => {
                                // Audio playback started successfully
                                setSoundAvailable(true)
                                // Immediately pause it since this was just a test
                                if (audioRef.current) audioRef.current.pause()
                                if (audioRef.current) audioRef.current.currentTime = 0
                            })
                            .catch((err) => {
                                // Auto-play was prevented or there was another issue
                                console.log("Audio not immediately available:", err.message)
                                // We'll still set sound as available since it might work on user interaction
                                setSoundAvailable(true)
                            })
                    } else {
                        // Older browsers might not return a promise
                        setSoundAvailable(true)
                    }
                }
            } catch (err) {
                console.error("Error initializing audio:", err)
                setSoundAvailable(false)
            }
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current = null
            }
        }
    }, [enableSound])

    // Function to play sound with cooldown
    const playNoSound = () => {
        const now = Date.now()
        // Only play sound if it's available, enabled, and it's been at least 1 second since the last play
        if (soundAvailable && enableSound && now - lastSoundTimeRef.current > 1000 && audioRef.current) {
            lastSoundTimeRef.current = now
            // Reset the audio to the beginning if it's already playing
            audioRef.current.currentTime = 0
            audioRef.current.play().catch((err) => {
                console.error("Error playing sound:", err)
                // If we get an error here, sound might not be available after all
                if (err.name === "NotAllowedError") {
                    console.log("Sound blocked by browser. Requires user interaction first.")
                }
            })
        }
    }

    // Animation loop
    useEffect(() => {
        const animate = () => {
            const now = Date.now()
            const deltaTime = (now - lastUpdateRef.current) / 1000
            lastUpdateRef.current = now

            // Check if mouse is close to crab
            if (crabRef.current) {
                const crabRect = crabRef.current.getBoundingClientRect()
                const crabCenter = {
                    x: crabRect.left + crabRect.width / 2,
                    y: crabRect.top + crabRect.height / 2,
                }

                const distanceToMouse = Math.sqrt(
                    Math.pow(mousePosition.x - crabCenter.x, 2) + Math.pow(mousePosition.y - crabCenter.y, 2),
                )

                if (distanceToMouse < escapeDistance) {
                    // Escape from mouse
                    setIsMoving(true)

                    // Play "no" sound when user tries to catch the crab
                    playNoSound()

                    // Calculate escape direction (away from mouse)
                    const escapeDirection = {
                        x: crabCenter.x - mousePosition.x,
                        y: crabCenter.y - mousePosition.y,
                    }

                    // Normalize the direction vector
                    const magnitude = Math.sqrt(escapeDirection.x * escapeDirection.x + escapeDirection.y * escapeDirection.y)
                    if (magnitude > 0) {
                        escapeDirection.x /= magnitude
                        escapeDirection.y /= magnitude
                    }

                    setDirection(escapeDirection)
                } else if (now - lastUpdateRef.current > updateInterval && !isMoving) {
                    // Change direction randomly if not escaping
                    if (Math.random() < 0.3) {
                        setIsMoving(true)
                        setDirection({
                            x: Math.random() * 2 - 1,
                            y: Math.random() * 2 - 1,
                        })
                    }
                }
            }

            // Update position
            if (isMoving) {
                setPosition((prev) => {
                    const newX = prev.x + direction.x * speed * deltaTime * 60
                    const newY = prev.y + direction.y * speed * deltaTime * 60

                    // Check boundaries
                    const maxX = window.innerWidth - size
                    const maxY = window.innerHeight - size

                    const boundedX = Math.max(0, Math.min(newX, maxX))
                    const boundedY = Math.max(0, Math.min(newY, maxY))

                    // Stop moving if hit boundary
                    if (boundedX <= 0 || boundedX >= maxX || boundedY <= 0 || boundedY >= maxY) {
                        setIsMoving(false)

                        // Bounce off walls by reversing direction
                        const newDirection = { ...direction }
                        if (boundedX <= 0 || boundedX >= maxX) newDirection.x *= -1
                        if (boundedY <= 0 || boundedY >= maxY) newDirection.y *= -1
                        setDirection(newDirection)
                    }

                    return { x: boundedX, y: boundedY }
                })
            }

            // Occasionally stop moving
            if (isMoving && Math.random() < 0.01) {
                setIsMoving(false)
            }

            animationRef.current = requestAnimationFrame(animate)
        }

        animationRef.current = requestAnimationFrame(animate)

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [direction, escapeDistance, isMoving, mousePosition, position, size, speed, updateInterval])

    return (
        <div
            ref={crabRef}
            style={{
                position: "absolute",
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: `${size}px`,
                height: `${size}px`,
                zIndex,
                transform: `scaleX(${direction.x < 0 ? -1 : 1})`,
                transition: "transform 0.2s ease",
                cursor: "pointer",
                userSelect: "none",
            }}
        >
            <Image src="/images/crab.png" alt="Running Crab" width={size} height={size} priority />
        </div>
    )
}

