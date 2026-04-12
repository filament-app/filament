# Filament

AI infrastructure layer. One endpoint to route, wire, and observe your AI stack.

## What it does

- **Unified routing** — one API endpoint, any model (Claude, GPT-4o, Gemini)
- **Tool wiring** — register any HTTP endpoint as an AI tool
- **Observability** — full trace logs per request: tokens, latency, model, status
- **Hot-swap** — change the active model mid-session without breaking context
- **skill.md** — machine-readable spec at `/skill.md` for agent discovery

## Quick start

```bash
npm install
cp .env.local.example .env.local
# fill in keys
npm run dev
```

## API

### Route a prompt
```bash
curl -X POST https://filament.works/api/route \
  -H "Authorization: Bearer fl-..." \
  -H "Content-Type: application/json" \
  -d '{"model": "auto", "prompt": "Explain what an embedding is."}'
```

### OpenAI drop-in
```python
from openai import OpenAI
client = OpenAI(base_url="https://filament.works/api", api_key="fl-...")
```

```javascript
import OpenAI from 'openai'
const client = new OpenAI({
  baseURL: 'https://filament.works/api',
  apiKey: 'fl-...',
})
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/route | Route prompt to model |
| GET | /api/observe | Pull trace logs |
| POST | /api/wire | Register tool endpoint |
| PATCH | /api/session/:id | Hot-swap active model |
| GET | /api/keys | List API keys |
| POST | /api/keys | Create API key |
| DELETE | /api/keys | Revoke API key |
| GET | /skill.md | Machine-readable capability spec |

## Auto-routing logic

The `auto` model uses prompt heuristics:
- Code signals (functions, syntax) → GPT-4o
- Long-form / reasoning (>500 chars) → Claude
- Factual / short queries → Gemini

## skill.md

Available at [filament.works/skill.md](https://filament.works/skill.md)

Returns `Content-Type: text/plain`. Paste into any agent that supports skill discovery.

## Database

Supabase PostgreSQL with Row Level Security on all tables:
- `api_keys` — hashed keys, prefix for lookup
- `trace_logs` — full request traces
- `wired_tools` — registered tool endpoints
- `sessions` — session context for hot-swap

Schema: `supabase/schema.sql`

## Stack

Next.js 14 · TypeScript · Supabase · Tailwind CSS · Anthropic · OpenAI · Gemini
