import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encryptString } from '@/lib/crypto'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, endpoint, schema, auth_header } = body

  if (!name || !endpoint) {
    return NextResponse.json({ error: 'name and endpoint are required' }, { status: 400 })
  }

  const { data: tool, error } = await supabase
    .from('wired_tools')
    .insert({
      user_id: user.id,
      name,
      endpoint,
      schema: schema || null,
      auth_header: auth_header ? encryptString(auth_header) : null,
      active: true,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ tool_id: tool.id, status: 'wired' })
}

export async function GET(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: tools, error } = await supabase
    .from('wired_tools')
    .select('id, name, endpoint, schema, active, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ tools: tools || [] })
}
