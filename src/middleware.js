import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) { return request.cookies.get(name)?.value },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Rotte protette
  if (pathname.startsWith('/admin') || pathname.startsWith('/magazzino')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const ruolo = user.user_metadata?.ruolo

    // Ruolo non definito → torna al login
    if (!ruolo) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Admin prova ad accedere a magazzino o viceversa
    if (pathname.startsWith('/admin') && ruolo !== 'admin') {
      return NextResponse.redirect(new URL('/magazzino', request.url))
    }
    if (pathname.startsWith('/magazzino') && ruolo !== 'magazzino') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  // Già loggato → redirect alla propria area
  if (pathname === '/login' && user) {
    const ruolo = user.user_metadata?.ruolo
    if (ruolo === 'admin') return NextResponse.redirect(new URL('/admin', request.url))
    if (ruolo === 'magazzino') return NextResponse.redirect(new URL('/magazzino', request.url))
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/magazzino/:path*', '/login'],
}
