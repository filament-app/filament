import Link from 'next/link'

export default function HowItWorksPage() {
  const steps = [
    {
      n: '01',
      title: 'Get your key',
      body: 'Free. No credit card. Click "Get API Key", enter your email, and your key is generated instantly in the browser. Store it as an environment variable.',
      code: `export FILAMENT_KEY="fl-a3f9c2d8e1b5f7a4..."`,
      note: 'Key format: fl- + 32 hex chars. Generated client-side.'
    },
    {
      n: '02',
      title: 'Route any model',
      body: 'Send one request to POST /api/route. Filament picks the model automatically or you pin one. If the primary provider fails, it falls back to the next one silently.',
      code: `curl -X POST https://filament.works/api/route \\
  -H "Authorization: Bearer $FILAMENT_KEY" \\
  -d '{"model":"auto","prompt":"What is RAG?"}'`,
      note: 'Auto-routing: code → GPT-4o, long reasoning → Claude, factual → Gemini.'
    },
    {
      n: '03',
      title: 'Observe everything',
      body: 'Every call is traced automatically. Pull logs via GET /api/observe or view them in the dashboard. Filter by session ID to trace a full conversation.',
      code: `curl "https://filament.works/api/observe?limit=50" \\
  -H "Authorization: Bearer $FILAMENT_KEY"`,
      note: 'Logs include: model used, tokens, latency, status, error (if any).'
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-[#E5E2DA] h-14 flex items-center px-5 sticky top-0 bg-white/95 backdrop-blur z-50">
        <Link href="/" className="font-[family-name:var(--font-barlow)] font-bold text-[20px] tracking-wide uppercase text-[#0D0D0D]">
          FILAMENT
        </Link>
        <span className="font-mono text-[12px] text-[#8A8A8A] ml-4">/ How it works</span>
        <div className="ml-auto hidden md:flex items-center gap-6">
          <Link href="/capabilities" className="font-mono text-[12px] text-[#8A8A8A] hover:text-[#0D0D0D] transition-colors">Capabilities</Link>
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
          <span>How it works</span>
        </div>
        <h1 className="font-[family-name:var(--font-barlow)] font-extrabold text-[48px] md:text-[64px] leading-[0.92] tracking-tight text-[#0D0D0D] mb-4">
          How it works.
        </h1>
        <p className="font-mono text-[13px] text-[#8A8A8A] max-w-md leading-relaxed">
          Three steps from zero to a fully routed, observable AI stack.
        </p>
      </div>

      {/* Steps */}
      <div className="max-w-5xl mx-auto px-5 py-16">
        {steps.map((step, i) => (
          <div key={step.n} className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 pb-16 mb-16 ${i < steps.length - 1 ? 'border-b border-[#E5E2DA]' : ''}`}>
            <div>
              <div className="font-[family-name:var(--font-barlow)] font-bold text-[72px] text-[#E5E2DA] leading-none mb-4">{step.n}</div>
              <h2 className="font-[family-name:var(--font-barlow)] font-bold text-[28px] uppercase tracking-wide text-[#0D0D0D] mb-4">{step.title}</h2>
              <p className="font-mono text-[13px] text-[#8A8A8A] leading-relaxed mb-4">{step.body}</p>
              <div className="border border-[#E5E2DA] px-4 py-3 bg-[#F7F4EE]">
                <p className="font-mono text-[11px] text-[#8A8A8A]">{step.note}</p>
              </div>
            </div>
            <div>
              <div className="bg-[#0D0D0D] border border-[#2a2a2a]">
                <div className="border-b border-[#2a2a2a] px-4 py-2.5 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#3a3a3a]" />
                  <div className="w-2 h-2 rounded-full bg-[#3a3a3a]" />
                  <div className="w-2 h-2 rounded-full bg-[#3a3a3a]" />
                  <span className="font-mono text-[10px] text-[#8A8A8A] ml-2">bash</span>
                </div>
                <pre className="p-5 font-mono text-[12px] text-[#F7F4EE] leading-relaxed overflow-x-auto whitespace-pre">{step.code}</pre>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-[#0D0D0D] py-16 px-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <h2 className="font-[family-name:var(--font-barlow)] font-bold text-[32px] uppercase text-[#F7F4EE]">Ready to route your first prompt?</h2>
          <Link href="/app" className="font-mono text-[13px] px-6 py-3 border border-white text-white hover:bg-white hover:text-[#0D0D0D] transition-colors whitespace-nowrap">
            Get API Key →
          </Link>
        </div>
      </div>

      <footer className="py-8 px-5 border-t border-[#E5E2DA]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <span className="font-mono text-[11px] text-[#8A8A8A]">© 2026 Filament — Free forever</span>
          <div className="flex gap-6">
            {[['Home','/'],['Capabilities','/capabilities'],['Docs','/docs'],['GitHub','https://github.com/filament-app/filament']].map(([label,href])=>(
              <Link key={href} href={href} className="font-mono text-[11px] text-[#8A8A8A] hover:text-[#0D0D0D] transition-colors">{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
