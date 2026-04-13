import { NextResponse } from 'next/server'

// Tool wiring — coming soon
export async function GET() {
  return NextResponse.json({ tools: [], message: 'Tool wiring coming soon.' })
}

export async function POST() {
  return NextResponse.json({ message: 'Tool wiring coming soon.' }, { status: 501 })
}
