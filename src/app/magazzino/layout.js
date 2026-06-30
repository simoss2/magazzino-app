'use client'

import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-client'

export default function MagazzinoLayout({ children }) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-emerald-700 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏭</span>
            <div>
              <p className="font-bold text-lg leading-tight">Magazzino</p>
              <p className="text-emerald-200 text-xs">Ordini da preparare</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-emerald-200 hover:text-white text-sm transition-colors"
          >
            Esci →
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
