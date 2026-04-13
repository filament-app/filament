'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV_ITEMS = [
  { label: 'Router', href: '/app/router' },
  { label: 'Logs', href: '/app/logs' },
  { label: 'Keys', href: '/app/keys' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="border-b border-[#E5E2DA] bg-white sticky top-0 z-40">
        <div className="flex items-center justify-between h-14 px-4 md:px-6">
          {/* Left: logo + tabs */}
          <div className="flex items-center gap-4 md:gap-6 min-w-0">
            <Link href="/" className="font-[family-name:var(--font-barlow)] font-bold text-[18px] tracking-wide uppercase text-[#0D0D0D] shrink-0">
              FILAMENT
            </Link>
            {/* Desktop tabs */}
            <div className="hidden sm:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-mono text-[12px] px-3 py-2 transition-colors ${
                    pathname === item.href
                      ? 'bg-[#0D0D0D] text-white'
                      : 'text-[#8A8A8A] hover:text-[#0D0D0D]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <span className="hidden md:inline font-mono text-[11px] text-[#8A8A8A] border border-[#E5E2DA] px-2 py-1">
              Free
            </span>
            <Link href="/app/keys" className="hidden sm:inline font-mono text-[11px] px-3 py-2 border border-[#0D0D0D] text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-white transition-colors">
              Get key
            </Link>
            {/* Mobile hamburger */}
            <button
              className="sm:hidden flex flex-col gap-[5px] p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span className={`block w-5 h-[1.5px] bg-[#0D0D0D] transition-all origin-center ${menuOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
              <span className={`block w-5 h-[1.5px] bg-[#0D0D0D] transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-[1.5px] bg-[#0D0D0D] transition-all origin-center ${menuOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="sm:hidden border-t border-[#E5E2DA] bg-white">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`block font-mono text-[13px] px-4 py-3 border-b border-[#E5E2DA] last:border-0 ${
                  pathname === item.href ? 'bg-[#F7F4EE] text-[#0D0D0D] font-bold' : 'text-[#8A8A8A]'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/app/keys"
              onClick={() => setMenuOpen(false)}
              className="block font-mono text-[13px] px-4 py-3 text-[#0D0D0D] font-bold"
            >
              Get API Key →
            </Link>
          </div>
        )}
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  )
}
