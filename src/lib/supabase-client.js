'use client'

import { createBrowserClient } from '@supabase/ssr'

// Client per i componenti React lato browser
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
