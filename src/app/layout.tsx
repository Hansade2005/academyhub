import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import Chatbot from '@/components/Chatbot'
import { AuthProvider } from '@/lib/auth-context'

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: '3 a Skill Passport Generator',
  description: 'Create professional skill passports from your CV using AI-powered analysis. Generate stunning, downloadable documents in seconds.',
  keywords: ['skill passport', 'CV generator', 'AI resume', 'professional documents', 'career tools'],
  authors: [{ name: 'PiPilot AI' }],
  openGraph: {
    title: '3 a Skill Passport Generator',
    description: 'Transform your CV into a professional skill passport with AI.',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <AuthProvider>
          {children}
          <Chatbot />
        </AuthProvider>
      </body>
    </html>
  )
}