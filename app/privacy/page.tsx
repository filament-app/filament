import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-[#E5E2DA] h-14 flex items-center px-5 sticky top-0 bg-white/95 backdrop-blur z-50">
        <Link href="/" className="font-[family-name:var(--font-barlow)] font-bold text-[20px] tracking-wide uppercase text-[#0D0D0D]">FILAMENT</Link>
        <span className="font-mono text-[12px] text-[#8A8A8A] ml-4">/ Privacy</span>
      </nav>
      <div className="max-w-3xl mx-auto px-5 py-16">
        <h1 className="font-[family-name:var(--font-barlow)] font-bold text-[48px] uppercase tracking-wide text-[#0D0D0D] mb-4">Privacy Policy</h1>
        <p className="font-mono text-[12px] text-[#8A8A8A] mb-12">Last updated: April 2026</p>
        {[
          { title: 'What we collect', body: 'We collect your email address when you create an API key. We log API request metadata: timestamp, model used, token counts, latency, and status. We do not log prompt content or response content.' },
          { title: 'How we use it', body: 'Your email is used only to associate API keys with your account. Request metadata is used to generate trace logs accessible only to you via your API key. We do not sell or share your data with third parties.' },
          { title: 'Data storage', body: 'Data is stored in Supabase (PostgreSQL) with Row Level Security enforced. API keys are stored as bcrypt hashes — the raw key is never stored. Tool auth headers are stored encrypted using AES-256.' },
          { title: 'Data retention', body: 'Trace logs are retained indefinitely on the free plan. You can delete your account and all associated data at any time by contacting us.' },
          { title: 'Third-party providers', body: 'Your prompts are forwarded to AI providers (Anthropic, OpenAI, Google) based on your routing selection. Each provider has their own privacy policy governing how they handle API requests.' },
          { title: 'Contact', body: 'Questions about this policy: privacy@filament.works' },
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
