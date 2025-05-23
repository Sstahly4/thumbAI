import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css' // Assuming you want to keep your global styles
import AuthProvider from "@/components/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import SessionUpdater from "@/components/SessionUpdater"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ThumbAI', // You can adjust this
  description: 'Your ThumbAI Application', // You can adjust this
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider>
            <SessionUpdater />
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
