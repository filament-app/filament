'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { label: 'Router', href: '/app/router' },
  { label: 'Logs', href: '/app/logs' },
  { label: 'API Keys', href: '/app/keys' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* App nav */}
      <nav className="border-b border-[#E5E2DA] bg-white sticky top-0 z-40">
        <div className="flex items-center justify-between h-14 px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-[family-name:var(--font-barlow)] font-bold text-[18px] tracking-wide uppercase text-[#0D0D0D]">
              FILAMENT
            </Link>
            <div className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-mono text-[12px] px-4 py-2 transition-colors ${
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
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] text-[#8A8A8A] border border-[#E5E2DA] px-3 py-1">
              Free plan
            </span>
            <Link href="/app/keys" className="font-mono text-[12px] px-4 py-2 border border-[#0D0D0D] text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-white transition-colors">
              Get key
            </Link>
          </div>
        </div>
      </nav>
      {/* Content */}
      <main className="flex-1">{children}</main>
    </div>
  )
}
