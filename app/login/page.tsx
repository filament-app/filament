'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="block font-[family-name:var(--font-barlow)] font-bold text-[22px] tracking-wide uppercase text-[#0D0D0D] mb-12">
          FILAMENT
        </Link>

        {sent ? (
          <div>
            <h1 className="font-[family-name:var(--font-barlow)] font-bold text-[28px] uppercase tracking-wide text-[#0D0D0D] mb-4">
              Check your email.
            </h1>
            <p className="font-mono text-[13px] text-[#8A8A8A] leading-relaxed">
              A login link was sent to {email}.<br />
              Click it to continue.
            </p>
          </div>
        ) : (
          <>
            <h1 className="font-[family-name:var(--font-barlow)] font-bold text-[28px] uppercase tracking-wide text-[#0D0D0D] mb-2">
              Sign in.
            </h1>
            <p className="font-mono text-[13px] text-[#8A8A8A] mb-8">
              No password. We send a magic link.
            </p>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="font-mono text-[13px] px-4 py-3 border border-[#E5E2DA] text-[#0D0D0D] focus:outline-none focus:border-[#0D0D0D] placeholder-[#8A8A8A]"
              />
              {error && (
                <p className="font-mono text-[12px] text-[#6a2a2a]">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || !email}
                className="font-mono text-[13px] py-3 border border-[#0D0D0D] text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-white transition-colors disabled:opacity-40"
              >
                {loading ? 'Sending...' : 'Send magic link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
