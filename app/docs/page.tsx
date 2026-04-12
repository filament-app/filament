import Link from 'next/link'

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-[#E5E2DA] h-14 flex items-center px-6">
        <Link href="/" className="font-[family-name:var(--font-barlow)] font-bold text-[20px] tracking-wide uppercase text-[#0D0D0D]">
          FILAMENT
        </Link>
        <span className="font-mono text-[12px] text-[#8A8A8A] ml-4">/ docs</span>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-[family-name:var(--font-barlow)] font-bold text-[48px] uppercase tracking-wide text-[#0D0D0D] mb-4">
          Documentation
        </h1>
        <p className="font-mono text-[14px] text-[#8A8A8A] mb-16 leading-relaxed">
          Filament routes prompts to any supported model via a single endpoint.<br />
          OpenAI-compatible. No SDK required.
        </p>

        {[
          {
            id: 'quickstart',
            title: 'Quickstart',
            content: `Get an API key from /app/keys. All requests require:

Authorization: Bearer fl-...
Content-Type: application/json`,
          },
          {
            id: 'route',
            title: 'POST /api/route',
            content: `Route a prompt to any model.

Request body:
{
  "prompt": "string",         // required
  "model": "auto|claude|gpt|gemini",  // default: auto
  "system": "string",         // optional system prompt
  "tools": [],                // wired tools to expose
  "session_id": "string"      // optional session context
}

Response: OpenAI-compatible chat completion object
+ filament.model_used, filament.latency_ms, filament.status`,
          },
          {
            id: 'observe',
            title: 'GET /api/observe',
            content: `Retrieve trace logs.

Query params:
  session_id  — filter by session
  limit       — records per page (default: 50)
  offset      — pagination offset

Response: { traces: TraceLog[], total: number }`,
          },
          {
            id: 'wire',
            title: 'POST /api/wire',
            content: `Register an HTTP endpoint as a tool.

{
  "name": "string",
  "endpoint": "https://...",
  "schema": {},
  "auth_header": "Bearer ..."  // optional, encrypted at rest
}

Response: { tool_id, status: "wired" }`,
          },
          {
            id: 'swap',
            title: 'PATCH /api/session/:id',
            content: `Hot-swap the active model for a session.

{ "model": "claude|gpt|gemini" }

Swaps without breaking session context or tool bindings.`,
          },
          {
            id: 'skill',
            title: 'skill.md',
            content: `Machine-readable capability spec available at:
GET /skill.md

Returns plain text. Paste into any agent that supports skill discovery.`,
          },
        ].map((section) => (
          <section key={section.id} id={section.id} className="mb-16">
            <h2 className="font-[family-name:var(--font-barlow)] font-bold text-[24px] uppercase tracking-wide text-[#0D0D0D] mb-4 pb-4 border-b border-[#E5E2DA]">
              {section.title}
            </h2>
            <pre className="font-mono text-[13px] text-[#0D0D0D] leading-relaxed whitespace-pre-wrap">
              {section.content}
            </pre>
          </section>
        ))}
      </div>
    </div>
  )
}
