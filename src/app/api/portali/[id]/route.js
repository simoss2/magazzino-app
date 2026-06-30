import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

// DELETE /api/portali/[id] — elimina portale
export async function DELETE(request, { params }) {
  try {
    const supabase = createSupabaseAdminClient()
    const { error } = await supabase.from('portali').delete().eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
