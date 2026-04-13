'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

// ─── Nav ───────────────────────────────────────────────────────────────────
function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-[#E5E2DA]">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="font-[family-name:var(--font-barlow)] font-bold text-[22px] tracking-wide uppercase text-[#0D0D0D]">
            FILAMENT
          </Link>
          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/docs" className="font-mono text-[12px] text-[#8A8A8A] hover:text-[#0D0D0D] transition-colors">Docs</Link>
            <Link href="/how-it-works" className="font-mono text-[12px] text-[#8A8A8A] hover:text-[#0D0D0D] transition-colors">How it works</Link>
            <Link href="/capabilities" className="font-mono text-[12px] text-[#8A8A8A] hover:text-[#0D0D0D] transition-colors">Capabilities</Link>
            <Link href="/app" className="font-mono text-[12px] px-4 py-2 border border-[#0D0D0D] text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-white transition-colors">
              Launch App →
            </Link>
          </div>
          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-[5px] p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-[1.5px] bg-[#0D0D0D] transition-all origin-center ${menuOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
            <span className={`block w-5 h-[1.5px] bg-[#0D0D0D] transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-[1.5px] bg-[#0D0D0D] transition-all origin-center ${menuOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="fixed top-14 left-0 right-0 z-40 bg-white border-b border-[#E5E2DA] md:hidden">
          <div className="flex flex-col px-5 py-4 gap-0">
            {[
              { label: 'Docs', href: '/docs' },
              { label: 'How it works', href: '/how-it-works' },
              { label: 'Capabilities', href: '/capabilities' },
              { label: 'Launch App →', href: '/app' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="font-mono text-[13px] text-[#0D0D0D] py-3 border-b border-[#E5E2DA] last:border-0 hover:text-[#8A8A8A] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// ─── Terminal Typewriter ────────────────────────────────────────────────────
const TERMINAL_LINES = [
  { type: 'cmd', text: 'curl -X POST https://filament.works/api/route \\' },
  { type: 'cmd', text: '  -H "Authorization: Bearer fl-a3f9..." \\' },
  { type: 'cmd', text: '  -d \'{"model":"auto","prompt":"What is RAG?"}\'' },
  { type: 'gap', text: '' },
  { type: 'resp', text: '{' },
  { type: 'resp', text: '  "model": "gemini-1.5-pro",' },
  { type: 'resp', text: '  "choices": [{' },
  { type: 'resp', text: '    "message": {' },
  { type: 'resp', text: '      "content": "RAG is a technique..."' },
  { type: 'resp', text: '    }' },
  { type: 'resp', text: '  }],' },
  { type: 'resp', text: '  "filament": {' },
  { type: 'resp', text: '    "model_used": "gemini",' },
  { type: 'resp', text: '    "latency_ms": 312,' },
  { type: 'resp', text: '    "status": "ok"' },
  { type: 'resp', text: '  }' },
  { type: 'resp', text: '}' },
]

function TerminalBlock() {
  const [visibleLines, setVisibleLines] = useState(0)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i++
      setVisibleLines(i)
      if (i >= TERMINAL_LINES.length) clearInterval(interval)
    }, 120)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-[#0D0D0D] border border-[#2a2a2a] p-4 font-mono text-[12px] leading-relaxed overflow-hidden">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#2a2a2a]">
        <div className="w-2.5 h-2.5 rounded-full bg-[#3a3a3a]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#3a3a3a]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#3a3a3a]" />
        <span className="ml-2 text-[#8A8A8A] text-[10px] truncate">filament.works/api/route</span>
      </div>
      {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
        <div key={i} className={
          line.type === 'gap' ? 'h-3' :
          line.type === 'cmd' ? 'text-[#F7F4EE] break-all' :
          'text-[#8A8A8A]'
        }>
          {line.type === 'cmd' && <span className="text-[#4a4a4a] select-none">$ </span>}
          {line.text}
          {i === visibleLines - 1 && line.type !== 'gap' && (
            <span className="inline-block w-[7px] h-[13px] bg-[#F7F4EE] ml-0.5 animate-pulse" />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Hero ───────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="pt-28 pb-16 px-5 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Mobile: stacked, Desktop: two-col */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10 lg:gap-16 items-start">
          <div>
            <div className="mb-5">
              <span className="font-mono text-[11px] text-[#8A8A8A] border border-[#E5E2DA] px-3 py-1">
                v1.0.0 — free forever
              </span>
            </div>
            <h1 className="font-[family-name:var(--font-barlow)] font-extrabold text-[56px] sm:text-[72px] md:text-[88px] leading-[0.92] tracking-tight text-[#0D0D0D] mb-6">
              The wire your<br />AI stack<br />runs on.
            </h1>
            <p className="font-mono text-[13px] sm:text-[14px] text-[#8A8A8A] leading-relaxed mb-8 max-w-md">
              One endpoint. Any model. Full observability.<br className="hidden sm:block" />
              No configuration creep.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <Link
                href="/app"
                className="font-mono text-[13px] px-5 py-3 border border-[#0D0D0D] text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-white transition-colors"
              >
                Get API Key
              </Link>
              <Link
                href="/docs"
                className="font-mono text-[13px] py-3 text-[#8A8A8A] hover:text-[#0D0D0D] transition-colors"
              >
                Read the docs →
              </Link>
            </div>
          </div>
          {/* Terminal — visible on mobile too, just below headline */}
          <div className="mt-2 lg:mt-4">
            <TerminalBlock />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Ticker ─────────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  'Unified Routing', 'Tool Wiring', 'Observability', 'Hot-swap Models',
  'OpenAI Compatible', 'Free Forever', 'MCP Ready', 'skill.md Spec',
  'Claude + GPT + Gemini', 'Latency Tracing', 'Sub-400ms p50', 'Agent-Native',
]

function Ticker() {
  return (
    <div className="bg-[#0D0D0D] border-y border-[#2a2a2a] overflow-hidden py-3">
      <div
        className="flex gap-0 whitespace-nowrap"
        style={{ animation: 'marquee 40s linear infinite' }}
      >
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="font-mono text-[11px] text-[#F7F4EE] tracking-widest uppercase px-5">
              {item}
            </span>
            <span className="w-px h-3 bg-[#2a2a2a] shrink-0" />
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── How It Works ────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      n: '01',
      title: 'Get your key',
      body: 'Free. No credit card. Get an API key in seconds.',
      code: `export FILAMENT_KEY="fl-a3f9..."`,
    },
    {
      n: '02',
      title: 'Route any model',
      body: 'One endpoint routes your prompt to Claude, GPT-4o, or Gemini. Automatic fallback. No cold-starts.',
      code: `POST /api/route\n{"model":"auto","prompt":"..."}`,
    },
    {
      n: '03',
      title: 'Observe everything',
      body: 'Every call is traced. Tokens, latency, model used. Inspect in the dashboard or pull via API.',
      code: `GET /api/observe?session=xxx`,
    },
  ]

  return (
    <section id="how-it-works" className="py-16 md:py-24 px-5 bg-[#F7F4EE]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 md:mb-16">
          <span className="font-mono text-[11px] text-[#8A8A8A] uppercase tracking-widest">How it works</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0">
          {steps.map((step) => (
            <div key={step.n} className="border border-[#E5E2DA] bg-white p-6 md:p-8 md:border-r-0 last:border-r md:border-b last:md:border-r">
              <div className="font-[family-name:var(--font-barlow)] font-bold text-[40px] md:text-[48px] text-[#E5E2DA] mb-3 leading-none">
                {step.n}
              </div>
              <h3 className="font-[family-name:var(--font-barlow)] font-bold text-[20px] text-[#0D0D0D] mb-3 uppercase tracking-wide">
                {step.title}
              </h3>
              <p className="font-mono text-[12px] text-[#8A8A8A] leading-relaxed mb-5">
                {step.body}
              </p>
              <div className="bg-[#0D0D0D] p-3 font-mono text-[11px] text-[#F7F4EE] whitespace-pre leading-relaxed overflow-x-auto">
                {step.code}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Features Grid ───────────────────────────────────────────────────────────
const FEATURES = [
  { n: '01', title: 'Unified Router', body: 'One endpoint. Claude, GPT-4o, Gemini. Auto-routing by cost, latency, or capability.' },
  { n: '02', title: 'Tool Wiring', body: 'Register any HTTP endpoint as a tool. Schema-validated. Hot-reloadable.' },
  { n: '03', title: 'Observability', body: 'Every call traced end-to-end. Tokens, latency, model, tool calls, errors.' },
  { n: '04', title: 'Hot-swap', body: 'Swap models mid-session without breaking context or tool bindings.' },
  { n: '05', title: 'skill.md', body: 'Machine-readable skill spec at /skill.md. Drop it into any agent.' },
  { n: '06', title: 'OpenAI Compatible', body: 'Drop-in replacement for any OpenAI client. Change one URL.' },
]

function FeaturesGrid() {
  return (
    <section id="capabilities" className="py-16 md:py-24 px-5 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 md:mb-16">
          <span className="font-mono text-[11px] text-[#8A8A8A] uppercase tracking-widest">Capabilities</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-[#E5E2DA]">
          {FEATURES.map((f) => (
            <div key={f.n} className="border-r border-b border-[#E5E2DA] p-6 md:p-8">
              <div className="font-mono text-[11px] text-[#8A8A8A] mb-3">{f.n}</div>
              <h3 className="font-[family-name:var(--font-barlow)] font-bold text-[20px] uppercase tracking-wide text-[#0D0D0D] mb-2">
                {f.title}
              </h3>
              <p className="font-mono text-[12px] text-[#8A8A8A] leading-relaxed">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Code Demo ───────────────────────────────────────────────────────────────
const CODE_TABS = {
  cURL: `curl -X POST https://filament.works/api/route \\
  -H "Authorization: Bearer fl-a3f9..." \\
  -H "Content-Type: application/json" \\
  -d '{"model":"auto","prompt":"..."}'`,

  Python: `from openai import OpenAI

client = OpenAI(
    base_url="https://filament.works/api",
    api_key="fl-a3f9c2d8e1b5f7a4"
)

response = client.chat.completions.create(
    model="auto",
    messages=[{"role":"user","content":"..."}]
)
print(response.choices[0].message.content)`,

  Node: `import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: 'https://filament.works/api',
  apiKey: 'fl-a3f9c2d8e1b5f7a4',
})

const res = await client.chat.completions.create({
  model: 'auto',
  messages: [{ role:'user', content:'...' }],
})
console.log(res.choices[0].message.content)`,

  MCP: `{
  "mcpServers": {
    "filament": {
      "command": "npx",
      "args": ["filament-mcp"],
      "env": {
        "FILAMENT_API_KEY": "fl-a3f9...",
        "FILAMENT_BASE_URL":
          "https://filament.works/api"
      }
    }
  }
}`,
}

const RESPONSE_PREVIEW = `{
  "id": "tr_01j8xk4m...",
  "model": "gemini-1.5-pro",
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "An embedding is..."
    }
  }],
  "usage": {
    "prompt_tokens": 18,
    "completion_tokens": 94
  },
  "filament": {
    "model_used": "gemini",
    "latency_ms": 287,
    "status": "ok"
  }
}`

function CodeDemo() {
  const [activeTab, setActiveTab] = useState('cURL')
  const tabs = Object.keys(CODE_TABS)

  return (
    <section className="py-16 md:py-24 px-5 bg-[#0D0D0D]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 md:mb-12">
          <span className="font-mono text-[11px] text-[#8A8A8A] uppercase tracking-widest">Drop-in compatible</span>
          <h2 className="font-[family-name:var(--font-barlow)] font-bold text-[32px] md:text-[40px] text-[#F7F4EE] uppercase tracking-wide mt-2">
            One URL change.
          </h2>
        </div>
        <div className="border border-[#2a2a2a]">
          {/* Tabs — scrollable on mobile */}
          <div className="flex border-b border-[#2a2a2a] overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`font-mono text-[11px] px-4 py-3 border-r border-[#2a2a2a] whitespace-nowrap transition-colors flex-shrink-0 ${
                  activeTab === tab ? 'bg-[#1a1a1a] text-[#F7F4EE]' : 'text-[#8A8A8A] hover:text-[#F7F4EE]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* Content — stacked on mobile, side-by-side on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="border-b lg:border-b-0 lg:border-r border-[#2a2a2a]">
              <pre className="p-5 font-mono text-[12px] text-[#F7F4EE] leading-relaxed overflow-x-auto whitespace-pre min-h-[180px]">
                {CODE_TABS[activeTab as keyof typeof CODE_TABS]}
              </pre>
            </div>
            <div>
              <div className="border-b border-[#2a2a2a] px-5 py-3">
                <span className="font-mono text-[11px] text-[#8A8A8A]">Response</span>
                <span className="ml-3 font-mono text-[11px] text-[#4a9a6a]">200 OK</span>
              </div>
              <pre className="p-5 font-mono text-[12px] text-[#8A8A8A] leading-relaxed overflow-x-auto whitespace-pre">
                {RESPONSE_PREVIEW}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Observability Preview ───────────────────────────────────────────────────
const TRACE_ROWS = [
  { time: '14:32:01', session: 'sess_k9x2', model: 'gemini-1.5-pro', t_in: 18, t_out: 94, latency: 287, status: 'ok' },
  { time: '14:31:58', session: 'sess_k9x2', model: 'claude-sonnet', t_in: 412, t_out: 638, latency: 891, status: 'ok' },
  { time: '14:31:45', session: 'sess_m4r1', model: 'gpt-4o', t_in: 67, t_out: 201, latency: 423, status: 'ok' },
  { time: '14:31:22', session: 'sess_m4r1', model: 'claude-sonnet', t_in: 89, t_out: 145, latency: 1102, status: 'fallback' },
  { time: '14:30:59', session: 'sess_z8c3', model: 'gpt-4o', t_in: 230, t_out: 418, latency: 389, status: 'ok' },
]

function ObservabilityPreview() {
  return (
    <section className="py-16 md:py-24 px-5 bg-[#F7F4EE]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 md:mb-12">
          <span className="font-mono text-[11px] text-[#8A8A8A] uppercase tracking-widest">Observability</span>
          <h2 className="font-[family-name:var(--font-barlow)] font-bold text-[32px] md:text-[40px] text-[#0D0D0D] uppercase tracking-wide mt-2">
            Every call traced.
          </h2>
        </div>

        {/* Mobile: card list */}
        <div className="md:hidden flex flex-col gap-3">
          {TRACE_ROWS.map((row, i) => (
            <div key={i} className="border border-[#E5E2DA] bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[11px] text-[#8A8A8A]">{row.time}</span>
                <span className={`font-mono text-[10px] px-2 py-0.5 border ${
                  row.status === 'ok' ? 'border-[#2a6a3a] text-[#2a6a3a]' : 'border-[#6a5a2a] text-[#6a5a2a]'
                }`}>{row.status}</span>
              </div>
              <div className="font-mono text-[12px] text-[#0D0D0D] mb-2">{row.model}</div>
              <div className="flex items-center gap-4 font-mono text-[11px] text-[#8A8A8A]">
                <span>{row.t_in}→{row.t_out} tok</span>
                <span>{row.latency}ms</span>
                <span className="text-[10px]">{row.session}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: table */}
        <div className="hidden md:block border border-[#E5E2DA] bg-white overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E2DA]">
                {['timestamp', 'session', 'model', 'tokens_in', 'tokens_out', 'latency', 'status'].map((col) => (
                  <th key={col} className="font-mono text-[11px] text-[#8A8A8A] text-left px-4 py-3 uppercase tracking-widest whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TRACE_ROWS.map((row, i) => (
                <tr key={i} className="border-b border-[#E5E2DA] last:border-0 hover:bg-[#F7F4EE] transition-colors">
                  <td className="font-mono text-[12px] text-[#8A8A8A] px-4 py-3 whitespace-nowrap">{row.time}</td>
                  <td className="font-mono text-[12px] text-[#0D0D0D] px-4 py-3 whitespace-nowrap">{row.session}</td>
                  <td className="font-mono text-[12px] text-[#0D0D0D] px-4 py-3 whitespace-nowrap">{row.model}</td>
                  <td className="font-mono text-[12px] text-[#0D0D0D] px-4 py-3 text-right">{row.t_in}</td>
                  <td className="font-mono text-[12px] text-[#0D0D0D] px-4 py-3 text-right">{row.t_out}</td>
                  <td className="font-mono text-[12px] text-[#0D0D0D] px-4 py-3 text-right">{row.latency}ms</td>
                  <td className="px-4 py-3">
                    <span className={`font-mono text-[11px] px-2 py-0.5 border ${
                      row.status === 'ok' ? 'border-[#2a6a3a] text-[#2a6a3a]' : 'border-[#6a5a2a] text-[#6a5a2a]'
                    }`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="font-mono text-[12px] text-[#8A8A8A] mt-5">
          Full trace logs in your dashboard. Or pull via API.
        </p>
      </div>
    </section>
  )
}

// ─── CTA ─────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="py-20 md:py-32 px-5 bg-[#0D0D0D]">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="font-[family-name:var(--font-barlow)] font-extrabold text-[48px] sm:text-[64px] md:text-[80px] leading-[0.92] tracking-tight text-[#F7F4EE] mb-8 md:mb-10">
          Your stack is ready.<br />Filament is the wire.
        </h2>
        <Link
          href="/app"
          className="inline-block font-mono text-[13px] px-8 py-4 border border-white text-white hover:bg-white hover:text-[#0D0D0D] transition-colors"
        >
          Get API Key →
        </Link>
      </div>
    </section>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="py-10 px-5 bg-white border-t border-[#E5E2DA]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
          <div>
            <span className="font-[family-name:var(--font-barlow)] font-bold text-[20px] tracking-wide uppercase text-[#0D0D0D]">
              FILAMENT
            </span>
            <p className="font-mono text-[12px] text-[#8A8A8A] mt-1">
              The wire your AI stack runs on.
            </p>
          </div>
          <div className="flex items-center gap-6 flex-wrap">
            {[
              { label: 'Docs', href: '/docs' },
              { label: 'skill.md', href: '/skill.md' },
              { label: 'GitHub', href: 'https://github.com/filament-app/filament' },
              { label: 'X', href: 'https://x.com/filament_works' },
            ].map((link) => (
              <Link key={link.label} href={link.href} className="font-mono text-[12px] text-[#8A8A8A] hover:text-[#0D0D0D] transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="pt-6 border-t border-[#E5E2DA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="font-mono text-[11px] text-[#8A8A8A]">© 2026 Filament — Free forever</span>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="font-mono text-[11px] text-[#8A8A8A] hover:text-[#0D0D0D] transition-colors">Privacy</Link>
            <Link href="/terms" className="font-mono text-[11px] text-[#8A8A8A] hover:text-[#0D0D0D] transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Ticker />
        <HowItWorks />
        <FeaturesGrid />
        <CodeDemo />
        <ObservabilityPreview />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
