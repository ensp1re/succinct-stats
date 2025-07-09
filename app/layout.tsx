import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/ThemeProvider"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Succinct Stats - Testnet Leaderboard & Analytics",
  description: "Track your Succinct testnet stats and view the global leaderboard",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html suppressContentEditableWarning suppressHydrationWarning lang="en">
      <body className={inter.className}>
        <div className="digital-noise"></div>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Navbar />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}




