import type { Metadata } from 'next'
import { Hanken_Grotesk } from 'next/font/google'
import './globals.css'

const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-hanken',
})

export const metadata: Metadata = {
  title: 'Finanças Familiar',
  description: 'Controle financeiro para toda a família',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${hanken.variable} font-sans`}>{children}</body>
    </html>
  )
}
