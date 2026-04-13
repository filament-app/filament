'use client'

import { useEffect, useState } from 'react'

interface ApiKey {
  id: string
  name: string
  key: string
  key_prefix: string
  created_at: string
  revoked: boolean
}

const STORAGE_KEY = 'filament_api_keys'

function loadKeys(): ApiKey[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveKeys(keys: ApiKey[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
}

export default function KeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [newKeyName, setNewKeyName] = useState('')
  const [creating, setCreating] = useState(false)
  const [newKeyRaw, setNewKeyRaw] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setKeys(loadKeys())
  }, [])

  async function createKey() {
    if (!newKeyName.trim()) return
    setCreating(true)

    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const updated = [data, ...loadKeys()]
      saveKeys(updated)
      setKeys(updated)
      setNewKeyRaw(data.key)
      setNewKeyName('')
    } catch (err) {
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  function revokeKey(id: string) {
    const updated = loadKeys().map(k => k.id === id ? { ...k, revoked: true } : k)
    saveKeys(updated)
    setKeys(updated)
  }

  function deleteKey(id: string) {
    const updated = loadKeys().filter(k => k.id !== id)
    saveKeys(updated)
    setKeys(updated)
  }

  function copyKey(key: string, id: string) {
    navigator.clipboard.writeText(key)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (!mounted) return null

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-[#E5E2DA]">
        <h1 className="font-[family-name:var(--font-barlow)] font-bold text-[28px] uppercase tracking-wide text-[#0D0D0D]">
          API Keys
        </h1>
        <p className="font-mono text-[12px] text-[#8A8A8A] mt-1">
          Keys are generated locally and stored in your browser.
        </p>
      </div>

      {/* New key revealed */}
      {newKeyRaw && (
        <div className="border border-[#2a6a3a] bg-[#F7F4EE] p-5 mb-6">
          <p className="font-mono text-[11px] text-[#2a6a3a] mb-3 uppercase tracking-widest">
            ✓ Key created — copy it now. Shown once only.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <code className="font-mono text-[12px] text-[#0D0D0D] break-all flex-1 bg-white border border-[#E5E2DA] px-3 py-2 w-full">
              {newKeyRaw}
            </code>
            <button
              onClick={() => { copyKey(newKeyRaw, 'new'); setNewKeyRaw(null) }}
              className="font-mono text-[12px] px-4 py-2 border border-[#0D0D0D] text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Copy + dismiss
            </button>
          </div>
        </div>
      )}

      {/* Create form */}
      <div className="border border-[#E5E2DA] p-5 mb-8">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key name (e.g. Production)"
            className="font-mono text-[13px] px-3 py-2.5 border border-[#E5E2DA] text-[#0D0D0D] focus:outline-none focus:border-[#0D0D0D] flex-1 placeholder-[#8A8A8A] bg-white"
            onKeyDown={(e) => e.key === 'Enter' && createKey()}
          />
          <button
            onClick={createKey}
            disabled={creating || !newKeyName.trim()}
            className="font-mono text-[13px] px-5 py-2.5 border border-[#0D0D0D] text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-white transition-colors disabled:opacity-40 whitespace-nowrap"
          >
            {creating ? 'Creating...' : 'Create key'}
          </button>
        </div>
      </div>

      {/* Keys list */}
      <div className="border border-[#E5E2DA]">
        {keys.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-mono text-[13px] text-[#8A8A8A]">No keys yet. Create your first key above.</p>
          </div>
        ) : (
          keys.map((key, i) => (
            <div
              key={key.id}
              className={`p-4 md:p-5 ${i < keys.length - 1 ? 'border-b border-[#E5E2DA]' : ''} ${key.revoked ? 'opacity-50' : ''}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                {/* Key info */}
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-[13px] text-[#0D0D0D] font-medium">{key.name}</div>
                  <div className="font-mono text-[11px] text-[#8A8A8A] mt-0.5">
                    {key.key_prefix}••••••••••••••••
                    <span className="ml-3">{new Date(key.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 flex-wrap">
                  {key.revoked ? (
                    <>
                      <span className="font-mono text-[11px] px-2 py-0.5 border border-[#6a2a2a] text-[#6a2a2a]">revoked</span>
                      <button
                        onClick={() => deleteKey(key.id)}
                        className="font-mono text-[11px] text-[#8A8A8A] hover:text-[#6a2a2a] transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="font-mono text-[11px] px-2 py-0.5 border border-[#2a6a3a] text-[#2a6a3a]">active</span>
                      <button
                        onClick={() => copyKey(key.key, key.id)}
                        className="font-mono text-[11px] text-[#8A8A8A] hover:text-[#0D0D0D] transition-colors"
                      >
                        {copiedId === key.id ? '✓ Copied' : 'Copy key'}
                      </button>
                      <button
                        onClick={() => revokeKey(key.id)}
                        className="font-mono text-[11px] text-[#8A8A8A] hover:text-[#6a2a2a] transition-colors"
                      >
                        Revoke
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Note */}
      <div className="mt-6 border border-[#E5E2DA] bg-[#F7F4EE] p-4">
        <p className="font-mono text-[11px] text-[#8A8A8A] leading-relaxed">
          Keys are stored in your browser&apos;s localStorage. To use a key: add{' '}
          <code className="text-[#0D0D0D]">Authorization: Bearer fl-...</code>{' '}
          to your API requests.
        </p>
      </div>
    </div>
  )
}
