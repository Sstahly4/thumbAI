import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ThumbAI - Create High-CTR YouTube Thumbnails with AI',
  description: 'Generate engaging, click-worthy YouTube thumbnails using AI. Upload sketches, reference images, and get professional results in seconds.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
