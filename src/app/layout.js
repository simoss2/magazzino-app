import './globals.css'

export const metadata = {
  title: 'Gestione Magazzino',
  description: 'Sistema di gestione ordini magazzino',
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
