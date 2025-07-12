import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Assessement',
  description: 'Woocommerce Assessment',
  generator: 'Lekhnath Oli',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
