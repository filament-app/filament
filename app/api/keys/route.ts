import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

// Keys are stateless — generated server-side with crypto.
// The client stores them in localStorage. No DB needed.

export async function POST(req: Request) {
  try {
    const { name } = await req.json()

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const raw = 'fl-' + randomBytes(24).toString('hex')
    const prefix = raw.substring(0, 10)
    const id = crypto.randomUUID()

    return NextResponse.json({
      id,
      name: name.trim(),
      key: raw,
      key_prefix: prefix,
      created_at: new Date().toISOString(),
      revoked: false,
    })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
