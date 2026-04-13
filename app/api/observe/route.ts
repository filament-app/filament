import { NextResponse } from 'next/server'

// Observability: logs are stored client-side (localStorage).
// This endpoint exists for API compatibility — returns empty for now.

export async function GET() {
  return NextResponse.json({
    traces: [],
    note: 'Logs are stored locally in your browser. View them in the Logs tab.',
  })
}
