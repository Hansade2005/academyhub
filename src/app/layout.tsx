import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import Chatbot from '@/components/Chatbot'
import { AuthProvider } from '@/lib/auth-context'

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: 'The 3rd Academy - AI-Powered Career Development Platform',
  description: 'Transform your career with AI-verified skill assessments, real project work, and proof-based credentials. Connect with employers, build your portfolio, and get hired with confidence through our comprehensive career development platform.',
  keywords: ['career development', 'skill assessment', 'AI verification', 'job marketplace', 'talent exchange', 'professional development', 'career advancement', 'skill validation', 'workforce readiness', 'career coaching', 'LiveWorks', 'TalentVisa', 'skill passport'],
  authors: [{ name: 'The 3rd Academy' }],
  creator: 'The 3rd Academy',
  publisher: 'The 3rd Academy',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://the3rdacademy.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'The 3rd Academy - AI-Powered Career Development Platform',
    description: 'Transform your career with AI-verified skill assessments, real project work, and proof-based credentials. Connect with employers and get hired with confidence.',
    url: 'https://the3rdacademy.com',
    siteName: 'The 3rd Academy',
    images: [
      {
        url: 'https://api.a0.dev/assets/image?text=Futuristic AI-powered academy logo with glowing blue circuit patterns and neural networks&aspect=1:1&seed=academy_logo',
        width: 1200,
        height: 630,
        alt: 'The 3rd Academy - AI-Powered Career Development Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The 3rd Academy - AI-Powered Career Development Platform',
    description: 'Transform your career with AI-verified skill assessments, real project work, and proof-based credentials.',
    images: ['https://api.a0.dev/assets/image?text=Futuristic AI-powered academy logo with glowing blue circuit patterns and neural networks&aspect=1:1&seed=academy_logo'],
    creator: '@the3rdacademy',
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: 'https://api.a0.dev/assets/image?text=Futuristic AI-powered academy logo with glowing blue circuit patterns and neural networks&aspect=1:1&seed=academy_logo',
    shortcut: 'https://api.a0.dev/assets/image?text=Futuristic AI-powered academy logo with glowing blue circuit patterns and neural networks&aspect=1:1&seed=academy_logo',
    apple: 'https://api.a0.dev/assets/image?text=Futuristic AI-powered academy logo with glowing blue circuit patterns and neural networks&aspect=1:1&seed=academy_logo',
  },
  manifest: '/manifest.json',
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