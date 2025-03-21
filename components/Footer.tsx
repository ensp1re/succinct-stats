import Link from "next/link"
import { Twitter, Github, ExternalLink, MessageCircle, Rss } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-black/80 backdrop-blur-md border-t border-pink-900/30 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-pink-500 font-mono text-lg mb-4">SUCCINCT STATS</h3>
            <p className="text-gray-400 text-sm">
              Track your Succinct testnet stats and view the global leaderboard. Earn stars by playing games and
              generating proofs.
            </p>
          </div>

          <div>
            <h3 className="text-pink-500 font-mono text-lg mb-4">QUICK LINKS</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-pink-400 text-sm flex items-center">
                  <span className="mr-2">→</span> Home
                </Link>
              </li>
              <li>
                <Link href="/earn" className="text-gray-400 hover:text-pink-400 text-sm flex items-center">
                  <span className="mr-2">→</span> Earn Stars
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-gray-400 hover:text-pink-400 text-sm flex items-center">
                  <span className="mr-2">→</span> Documentation
                </Link>
              </li>
              <li>
                <a
                  href="https://testnet.succinct.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-pink-400 text-sm flex items-center"
                >
                  <span className="mr-2">→</span> Testnet <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-pink-500 font-mono text-lg mb-4">CONNECT</h3>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://twitter.com/succinctlabs"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black hover:bg-pink-900/30 border border-pink-900/50 p-2 rounded-md transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5 text-pink-500" />
              </a>
              <a
                href="https://github.com/succinctlabs"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black hover:bg-pink-900/30 border border-pink-900/50 p-2 rounded-md transition-colors duration-200"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5 text-pink-500" />
              </a>
              <a
                href="https://discord.gg/succinctlabs"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black hover:bg-pink-900/30 border border-pink-900/50 p-2 rounded-md transition-colors duration-200"
                aria-label="Discord"
              >
                <MessageCircle className="h-5 w-5 text-pink-500" />
              </a>
              <a
                href="https://blog.succinct.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black hover:bg-pink-900/30 border border-pink-900/50 p-2 rounded-md transition-colors duration-200"
                aria-label="Blog"
              >
                <Rss className="h-5 w-5 text-pink-500" />
              </a>
            </div>

            <div className="mt-6">
              <a
                href="https://docs.succinct.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-gradient-to-r from-pink-600 to-pink-500 text-white px-4 py-2 rounded-md font-mono text-sm hover:from-pink-700 hover:to-pink-600 transition-colors duration-200"
              >
                OFFICIAL DOCUMENTATION
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-pink-900/30 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm font-mono mb-4 md:mb-0">
            © {new Date().getFullYear()} Succinct Stats. All rights reserved.
          </p>
          <div className="flex items-center space-x-2">
            <p className="text-gray-400 text-sm font-mono">Made by</p>
            <Link
              href="https://twitter.com/0xEnsp1re"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-500 hover:text-pink-400 font-mono text-sm flex items-center"
            >
              @0xEnsp1re
              <Twitter className="ml-1 w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

