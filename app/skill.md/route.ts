import { NextResponse } from 'next/server'

export async function GET() {
  const md = `---
name: filament
version: 1.0.0
description: >
  Filament is a lightweight AI infrastructure layer. It provides unified
  model routing, tool wiring, observability, and hot-swappable components
  for AI developers building on Base chain and beyond.
endpoint: https://filament.works/api
auth: Bearer <FILAMENT_API_KEY>
---

## capabilities

### route
Route a prompt to any supported model with automatic fallback.
POST /api/route
{ "prompt": "string", "model": "auto|claude|gpt|gemini", "tools": [] }

### wire
Register a tool endpoint and bind it to the routing layer.
POST /api/wire
{ "name": "string", "endpoint": "string", "schema": {} }

### observe
Pull trace logs for a given session or API key.
GET /api/observe?session_id=<id>

### swap
Hot-swap the underlying model for an active session.
PATCH /api/session/:id
{ "model": "claude|gpt|gemini" }

## models

- claude-sonnet-4-20250514
- gpt-4o
- gemini-1.5-pro

## notes

- All responses conform to OpenAI message format for compatibility
- Max tokens per request: 4096
- Rate limit: 100 req/min per API key
- Latency: p50 < 400ms, p99 < 1200ms
`

  return new NextResponse(md, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
