'use client';

import { ReactElement } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, ExternalLink, DollarSign, GamepadIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function EarnPage(): ReactElement {

  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#050505] text-white bg-grid-pattern">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 bg-gradient-to-r from-pink-600 to-pink-500 p-6 rounded-lg shadow-lg shadow-pink-500/20">
          <h1 className="text-3xl font-bold mb-4 text-white font-mono">LEVEL 1: CRISIS OF TRUST</h1>
          <p className="text-white mb-4">
            We're excited to announce Level 1: Crisis of Trust, Succinct's first testnet. Play games to earn stars here.
          </p>
          <p className="text-white mb-4">
            This testnet allows users to deposit USDC, generate proofs, and earn stars. By participating, you'll gain
            early access to the network and contribute to our mission of proving the world's software.
          </p>
          <Button className="bg-black hover:bg-gray-900 text-pink-500 font-mono">
            <Link
              href="https://testnet.succinct.xyz"
              className="flex items-center"
              target="_blank"
              rel="noopener noreferrer"
            >
              GO TO TESTNET.SUCCINCT.XYZ
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <Card className="bg-black border border-pink-900/50 shadow-lg shadow-pink-500/10 mb-8">
          <CardHeader className="border-b border-pink-900/30">
            <CardTitle className="text-xl font-mono text-pink-500">ELIGIBILITY REQUIREMENTS</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-300 mb-4">
              Users will only be eligible to earn stars if they meet to the following criteria:
            </p>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <div className="bg-pink-500 rounded-full h-5 w-5 flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                  <span className="text-black text-xs font-bold">1</span>
                </div>
                <span>
                  Use the frontend interface to the "Level 1: Crisis of Trust" application to generate proofs.
                </span>
              </li>
              <li className="flex items-start">
                <div className="bg-pink-500 rounded-full h-5 w-5 flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                  <span className="text-black text-xs font-bold">2</span>
                </div>
                <span>
                  Deposit $10 USDC, connect their wallet, use a valid invite code, and complete the rest of the
                  onboarding process.
                </span>
              </li>
              <li className="flex items-start">
                <div className="bg-pink-500 rounded-full h-5 w-5 flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                  <span className="text-black text-xs font-bold">3</span>
                </div>
                <span>Interact with games to generate proofs.</span>
              </li>
            </ul>
            <div className="mt-6 p-4 bg-pink-950/20 rounded-md border border-pink-900/30">
              <p className="text-pink-200 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-pink-500" />
                It is important to note that depositing more than $10 USDC will not earn you more stars. For additional
                information, please refer to the FAQ section of the network.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border border-pink-900/50 shadow-lg shadow-pink-500/10 mb-8">
          <CardHeader className="border-b border-pink-900/30">
            <CardTitle className="text-xl font-mono text-pink-500 flex items-center">
              <GamepadIcon className="mr-2 h-5 w-5" /> AVAILABLE GAMES
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                onClick={() => router.push("https://testnet.succinct.xyz/veristar")}
                className={`bg-gradient-to-br from-black to-pink-950/30 rounded-lg border border-pink-900/30 overflow-hidden group cursor-pointer`}>
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src="images/veristar.png"
                    alt="VeriStar Game"
                    width={400}
                    height={240}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
                  <div className="absolute bottom-0 left-0 p-3">
                    <h3 className="text-white font-mono font-bold">VeriStar</h3>
                    <p className="text-pink-300 text-sm">Test your ZK knowledge</p>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-pink-500 mr-1" />
                      <span className="text-white text-sm">50-100 stars</span>
                    </div>
                    <span className="text-xs text-cyan-400 font-mono">QUIZ</span>
                  </div>
                </div>
              </div>

              <div
                onClick={() => router.push("https://testnet.succinct.xyz/coin")}
                className={`bg-gradient-to-br from-black to-pink-950/30 rounded-lg border border-pink-900/30 overflow-hidden group cursor-pointer`}>
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src="images/coin-craze.png"
                    alt="Coin Craze Game"
                    width={400}
                    height={240}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
                  <div className="absolute bottom-0 left-0 p-3">
                    <h3 className="text-white font-mono font-bold">Coin Craze</h3>
                    <p className="text-pink-300 text-sm">Select coins that add up to 10</p>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-pink-500 mr-1" />
                      <span className="text-white text-sm">1-20 stars</span>
                    </div>
                    <span className="text-xs text-cyan-400 font-mono">PUZZLE</span>
                  </div>
                </div>
              </div>

              <div

                onClick={() => router.push("https://testnet.succinct.xyz/bird")}
                className={`bg-gradient-to-br from-black to-pink-950/30 rounded-lg border border-pink-900/30 overflow-hidden group cursor-pointer`}>
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src="images/floppygpu.png"
                    alt="Coin Craze Game"
                    width={400}
                    height={240}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
                  <div className="absolute bottom-0 left-0 p-3">
                    <h3 className="text-white font-mono font-bold">Floppy Gpu</h3>
                    <p className="text-pink-300 text-sm">Play and prove your score to get on the leaderboard.</p>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-pink-500 mr-1" />
                      <span className="text-white text-sm">1-20 stars</span>
                    </div>
                    <span className="text-xs text-cyan-400 font-mono">FLOPPY</span>
                  </div>
                </div>
              </div>
              <div
                onClick={() => router.push("https://testnet.succinct.xyz/2048")}
                className={`bg-gradient-to-br from-black to-pink-950/30 rounded-lg border border-pink-900/30 overflow-hidden group cursor-pointer`}>
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src="images/2048.png"
                    alt="2048 Game"
                    width={400}
                    height={240}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
                  <div className="absolute bottom-0 left-0 p-3">
                    <h3 className="text-white font-mono font-bold">2048</h3>
                    <p className="text-pink-300 text-sm">Join tiles to reach 2048</p>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-pink-500 mr-1" />
                      <span className="text-white text-sm">1-20 stars</span>
                    </div>
                    <span className="text-xs text-cyan-400 font-mono">PUZZLE</span>
                  </div>
                </div>
              </div>

              <div
                onClick={() => router.push("https://testnet.succinct.xyz/turbo")}
                className={`bg-gradient-to-br from-black to-pink-950/30 rounded-lg border border-pink-900/30 overflow-hidden group cursor-pointer`}>
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src="images/turbo-racing.png"
                    alt="Turbo Racing Game"
                    width={400}
                    height={240}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
                  <div className="absolute bottom-0 left-0 p-3">
                    <h3 className="text-white font-mono font-bold">Turbo Racing</h3>
                    <p className="text-pink-300 text-sm">Race against time</p>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-pink-500 mr-1" />
                      <span className="text-white text-sm">5-40 stars</span>
                    </div>
                    <span className="text-xs text-cyan-400 font-mono">RACING</span>
                  </div>
                </div>
              </div>

              <div
                onClick={() => router.push("https://testnet.succinct.xyz/superprover")}
                className={`bg-gradient-to-br from-black to-pink-950/30 rounded-lg border border-pink-900/30 overflow-hidden group cursor-pointer`}>
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src="images/super-prover.png"
                    alt="Super Prover Game"
                    width={400}
                    height={240}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
                  <div className="absolute bottom-0 left-0 p-3">
                    <h3 className="text-white font-mono font-bold">Super Prover</h3>
                    <p className="text-pink-300 text-sm">Prove programs in the Digital Kingdom</p>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-pink-500 mr-1" />
                      <span className="text-white text-sm">1 star</span>
                    </div>
                    <span className="text-xs text-cyan-400 font-mono">ADVENTURE</span>
                  </div>
                </div>
              </div>

              <div
                onClick={() => router.push("https://testnet.succinct.xyz/eth")}
                className={`bg-gradient-to-br from-black to-pink-950/30 rounded-lg border border-pink-900/30 overflow-hidden group cursor-pointer`}>
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src="images/ethereum-last-block.png"
                    alt="Ethereum: The Last Block Game"
                    width={400}
                    height={240}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
                  <div className="absolute bottom-0 left-0 p-3">
                    <h3 className="text-white font-mono font-bold">Ethereum: The Last Block</h3>
                    <p className="text-pink-300 text-sm">Help prevent Ethereum's last block</p>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-pink-500 mr-1" />
                      <span className="text-white text-sm">10-40 stars</span>
                    </div>
                    <span className="text-xs text-cyan-400 font-mono">STRATEGY</span>
                  </div>
                </div>
              </div>

              <div
                onClick={() => router.push("https://testnet.succinct.xyz/volleyball")}
                className={`bg-gradient-to-br from-black to-pink-950/30 rounded-lg border border-pink-900/30 overflow-hidden group cursor-pointer`}>
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src="images/ferris-volleyball.png"
                    alt="Ferris Volleyball Game"
                    width={400}
                    height={240}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
                  <div className="absolute bottom-0 left-0 p-3">
                    <h3 className="text-white font-mono font-bold">Ferris Volleyball</h3>
                    <p className="text-pink-300 text-sm">Beach volleyball with Blue Ferris</p>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-pink-500 mr-1" />
                      <span className="text-white text-sm">5-20 stars</span>
                    </div>
                    <span className="text-xs text-cyan-400 font-mono">SPORTS</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


        <div
          className="bg-gradient-to-r from-pink-600 to-pink-500 p-6 rounded-lg shadow-lg shadow-pink-500/20 text-center">
          <h2 className="text-xl font-mono font-bold mb-2">Ready to start earning?</h2>
          <p className="mb-4">Visit testnet.succinct.xyz to start playing games and earning stars!</p>
          <a
            href="https://testnet.succinct.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-black text-pink-500 hover:text-pink-400 px-4 py-2 rounded-md font-mono"
          >
            GO TO TESTNET
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </div>
      </main>
    </div>
  )
}

