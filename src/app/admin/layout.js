'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-client'

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItems = [
    { href: '/admin', label: 'Ordini', icon: '📋' },
    { href: '/admin/nuovo-ordine', label: 'Nuovo Ordine', icon: '➕' },
    { href: '/admin/impostazioni', label: 'Impostazioni', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📦</span>
            <span className="font-bold text-lg">Gestione Magazzino</span>
            <span className="bg-blue-500 text-xs px-2 py-0.5 rounded-full">Admin</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-blue-200 hover:text-white text-sm transition-colors"
          >
            Esci →
          </button>
        </div>
        {/* Nav */}
        <nav className="max-w-5xl mx-auto px-4 flex gap-1 pb-0">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                pathname === item.href
                  ? 'bg-white text-blue-700'
                  : 'text-blue-100 hover:bg-blue-600'
              }`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Contenuto */}
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
