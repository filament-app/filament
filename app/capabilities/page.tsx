import Link from 'next/link'

const CAPABILITIES = [
  {
    n: '01',
    title: 'Unified Router',
    endpoint: 'POST /api/route',
    body: 'One endpoint routes to Claude, GPT-4o, or Gemini. Set model: "auto" and Filament picks based on prompt type. Pin a model explicitly when needed.',
    details: ['Auto-routing by prompt analysis', 'Auto fallback on provider failure', 'OpenAI-compatible response format', 'Returns filament.model_used, latency_ms, status'],
    code: `{
  "prompt": "Explain RAG",
  "model": "auto",
  "system": "Be concise.",
  "session_id": "sess_abc"
}`,
  },
  {
    n: '02',
    title: 'Tool Wiring',
    endpoint: 'POST /api/wire',
    body: 'Register any HTTP endpoint as a tool the model can call. Schema-validated. Auth headers encrypted at rest.',
    details: ['JSON Schema input validation', 'Auth header stored encrypted', 'Hot-reloadable — no redeploy needed', 'List tools via GET /api/wire'],
    code: `{
  "name": "get_weather",
  "endpoint": "https://api.weather.com/v1",
  "schema": {
    "type": "object",
    "properties": {
      "location": { "type": "string" }
    }
  }
}`,
  },
  {
    n: '03',
    title: 'Observability',
    endpoint: 'GET /api/observe',
    body: 'Every request is traced. Tokens, latency, model used, status. Filter by session. Pull via API or view in dashboard.',
    details: ['9 fields logged per trace', 'Filter by session_id', 'Paginated with limit + offset', 'Status: ok / fallback / error'],
    code: `GET /api/observe
  ?session_id=sess_abc
  &limit=50
  &offset=0`,
  },
  {
    n: '04',
    title: 'Hot-swap',
    endpoint: 'PATCH /api/session/:id',
    body: 'Swap the active model for a running session without losing context or tool bindings.',
    details: ['Context preserved on swap', 'Tool bindings preserved', 'Takes effect on next request', 'Accepts: claude, gpt, gemini, auto'],
    code: `PATCH /api/session/sess_abc

{
  "model": "claude"
}`,
  },
  {
    n: '05',
    title: 'skill.md',
    endpoint: 'GET /skill.md',
    body: 'Machine-readable capability spec served as plain text. Drop the URL into any agent for automatic skill discovery.',
    details: ['Content-Type: text/plain', 'YAML frontmatter + Markdown body', 'No auth required', 'Describes all endpoints + schemas'],
    code: `curl https://filament.works/skill.md

# Returns:
---
name: filament
version: 1.0.0
endpoint: https://filament.works/api
---
## capabilities
...`,
  },
  {
    n: '06',
    title: 'OpenAI Compatible',
    endpoint: 'POST /api/route',
    body: 'Drop-in replacement. Change one URL in your existing OpenAI SDK code. Same response schema, same interface.',
    details: ['Works with openai Python + JS SDKs', 'Same choices[].message.content format', 'Extra metadata in filament.* field', 'Change base_url, keep everything else'],
    code: `from openai import OpenAI

client = OpenAI(
  base_url="https://filament.works/api",
  api_key="fl-..."
)`,
  },
]

export default function CapabilitiesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-[#E5E2DA] h-14 flex items-center px-5 sticky top-0 bg-white/95 backdrop-blur z-50">
        <Link href="/" className="font-[family-name:var(--font-barlow)] font-bold text-[20px] tracking-wide uppercase text-[#0D0D0D]">
          FILAMENT
        </Link>
        <span className="font-mono text-[12px] text-[#8A8A8A] ml-4">/ Capabilities</span>
        <div className="ml-auto hidden md:flex items-center gap-6">
          <Link href="/how-it-works" className="font-mono text-[12px] text-[#8A8A8A] hover:text-[#0D0D0D] transition-colors">How it works</Link>
          <Link href="/docs" className="font-mono text-[12px] text-[#8A8A8A] hover:text-[#0D0D0D] transition-colors">Docs</Link>
          <Link href="/app" className="font-mono text-[12px] px-4 py-2 border border-[#0D0D0D] text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-white transition-colors">
            Get API Key
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="px-5 pt-14 pb-10 border-b border-[#E5E2DA] max-w-5xl mx-auto">
        <div className="font-mono text-[11px] text-[#8A8A8A] mb-4">
          <Link href="/" className="hover:text-[#0D0D0D] transition-colors">Filament</Link>
          <span className="mx-2">/</span>
          <span>Capabilities</span>
        </div>
        <h1 className="font-[family-name:var(--font-barlow)] font-extrabold text-[48px] md:text-[64px] leading-[0.92] tracking-tight text-[#0D0D0D] mb-4">
          Capabilities.
        </h1>
        <p className="font-mono text-[13px] text-[#8A8A8A] max-w-md leading-relaxed">
          Six things Filament does. Each one documented and code-ready.
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto px-5 py-16">
        {CAPABILITIES.map((cap, i) => (
          <div key={cap.n} className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 pb-16 mb-16 ${i < CAPABILITIES.length - 1 ? 'border-b border-[#E5E2DA]' : ''}`}>
            <div>
              <div className="flex items-baseline gap-4 mb-4">
                <span className="font-mono text-[11px] text-[#8A8A8A]">{cap.n}</span>
                <h2 className="font-[family-name:var(--font-barlow)] font-bold text-[28px] uppercase tracking-wide text-[#0D0D0D]">{cap.title}</h2>
              </div>
              <div className="font-mono text-[11px] text-[#8A8A8A] border border-[#E5E2DA] px-3 py-1 inline-block mb-4">{cap.endpoint}</div>
              <p className="font-mono text-[13px] text-[#8A8A8A] leading-relaxed mb-5">{cap.body}</p>
              <ul className="flex flex-col gap-2">
                {cap.details.map((d, j) => (
                  <li key={j} className="font-mono text-[12px] text-[#8A8A8A] flex items-start gap-2">
                    <span className="w-1 h-1 bg-[#8A8A8A] rounded-full mt-2 shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="bg-[#0D0D0D] border border-[#2a2a2a]">
                <div className="border-b border-[#2a2a2a] px-4 py-2.5">
                  <span className="font-mono text-[10px] text-[#8A8A8A]">{cap.endpoint}</span>
                </div>
                <pre className="p-5 font-mono text-[12px] text-[#F7F4EE] leading-relaxed overflow-x-auto whitespace-pre">{cap.code}</pre>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-[#0D0D0D] py-16 px-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <h2 className="font-[family-name:var(--font-barlow)] font-bold text-[32px] uppercase text-[#F7F4EE]">Six capabilities. One API key.</h2>
          <Link href="/app" className="font-mono text-[13px] px-6 py-3 border border-white text-white hover:bg-white hover:text-[#0D0D0D] transition-colors whitespace-nowrap">
            Get API Key →
          </Link>
        </div>
      </div>

      <footer className="py-8 px-5 border-t border-[#E5E2DA]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <span className="font-mono text-[11px] text-[#8A8A8A]">© 2026 Filament — Free forever</span>
          <div className="flex gap-6">
            {[['Home','/'],['How it works','/how-it-works'],['Docs','/docs'],['GitHub','https://github.com/filament-app/filament']].map(([label,href])=>(
              <Link key={href} href={href} className="font-mono text-[11px] text-[#8A8A8A] hover:text-[#0D0D0D] transition-colors">{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
