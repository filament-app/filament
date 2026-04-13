import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-[#E5E2DA] h-14 flex items-center px-5 sticky top-0 bg-white/95 backdrop-blur z-50">
        <Link href="/" className="font-[family-name:var(--font-barlow)] font-bold text-[20px] tracking-wide uppercase text-[#0D0D0D]">FILAMENT</Link>
        <span className="font-mono text-[12px] text-[#8A8A8A] ml-4">/ Terms</span>
      </nav>
      <div className="max-w-3xl mx-auto px-5 py-16">
        <h1 className="font-[family-name:var(--font-barlow)] font-bold text-[48px] uppercase tracking-wide text-[#0D0D0D] mb-4">Terms of Service</h1>
        <p className="font-mono text-[12px] text-[#8A8A8A] mb-12">Last updated: April 2026</p>
        {[
          { title: 'Acceptance', body: 'By using Filament, you agree to these terms. If you do not agree, do not use the service.' },
          { title: 'Use of the service', body: 'Filament is provided free of charge. You may use it for personal and commercial projects. You may not use it to generate illegal content, spam, or to violate the terms of the underlying AI providers (Anthropic, OpenAI, Google).' },
          { title: 'API keys', body: 'You are responsible for keeping your API keys secure. Do not share keys publicly. If a key is compromised, revoke it immediately from your dashboard.' },
          { title: 'No warranties', body: 'Filament is provided "as is" without warranties of any kind. We do not guarantee uptime, accuracy of AI responses, or fitness for any particular purpose.' },
          { title: 'Limitation of liability', body: 'Filament is not liable for any damages arising from your use of the service, including but not limited to lost profits, data loss, or service interruptions.' },
          { title: 'Changes', body: 'We may update these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.' },
          { title: 'Contact', body: 'Questions about these terms: legal@filament.works' },
        ].map((s) => (
          <div key={s.title} className="mb-10 pb-10 border-b border-[#E5E2DA] last:border-0">
            <h2 className="font-[family-name:var(--font-barlow)] font-bold text-[22px] uppercase tracking-wide text-[#0D0D0D] mb-3">{s.title}</h2>
            <p className="font-mono text-[13px] text-[#8A8A8A] leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
