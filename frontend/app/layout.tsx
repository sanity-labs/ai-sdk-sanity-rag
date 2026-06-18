import type {Metadata} from 'next'
import {Geist, Geist_Mono} from 'next/font/google'
import {Toaster} from 'sonner'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Sanity RAG Chatbot',
  description:
    'A retrieval-augmented generation chatbot powered by the Vercel AI SDK and Sanity Content Lake embeddings.',
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
