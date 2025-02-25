import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "../globals.css"
import { Sidebar } from "@/components/sidebar"
import { Navbar } from "@/components/navbar"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Peponi Admin",
  description: "Peponi Superadmin Dashboard",
  icons: "/apple-touch-icon.png",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-[#1e1f24]">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-white">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}

