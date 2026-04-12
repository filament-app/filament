'use client'

import { useState, useEffect, useCallback } from 'react'

interface ApiKey {
  id: string
  key_prefix: string
  name: string | null
  created_at: string
  last_used: string | null
  revoked: boolean
  key?: string
}

export default function KeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyRaw, setNewKeyRaw] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch('/api/keys')
      if (res.status === 401) {
        setError('Sign in to manage API keys.')
        setLoading(false)
        return
      }
      const data = await res.json()
      setKeys(data.keys || [])
    } catch {
      setError('Failed to load keys.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchKeys()
  }, [fetchKeys])

  async function createKey() {
    setCreating(true)
    setNewKeyRaw(null)
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName || 'Default' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
        return
      }
      setNewKeyRaw(data.key)
      setNewKeyName('')
      await fetchKeys()
    } catch {
      setError('Failed to create key.')
    } finally {
      setCreating(false)
    }
  }

  async function revokeKey(id: string) {
    try {
      await fetch('/api/keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      await fetchKeys()
    } catch {
      setError('Failed to revoke key.')
    }
  }

  const DEMO_KEYS: ApiKey[] = [
    { id: '1', key_prefix: 'fl-a3f9c2', name: 'Production', created_at: '2026-01-01T00:00:00Z', last_used: '2026-01-08T14:32:01Z', revoked: false },
    { id: '2', key_prefix: 'fl-b8d4e1', name: 'Development', created_at: '2026-01-05T00:00:00Z', last_used: null, revoked: false },
  ]

  const displayKeys = error?.includes('Sign in') ? DEMO_KEYS : keys

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-10">
        <h1 className="font-[family-name:var(--font-barlow)] font-bold text-[32px] uppercase tracking-wide text-[#0D0D0D]">
          API Keys
        </h1>
        <p className="font-mono text-[12px] text-[#8A8A8A] mt-1">
          Keys authenticate requests to /api/route and other endpoints.
        </p>
      </div>

      {/* New key revealed */}
      {newKeyRaw && (
        <div className="border border-[#2a6a3a] bg-[#F7F4EE] p-6 mb-8">
          <p className="font-mono text-[11px] text-[#2a6a3a] mb-3 uppercase tracking-widest">
            Key created — copy it now. It will not be shown again.
          </p>
          <div className="flex items-center gap-4">
            <code className="font-mono text-[13px] text-[#0D0D0D] flex-1 overflow-x-auto">{newKeyRaw}</code>
            <button
              onClick={() => { navigator.clipboard.writeText(newKeyRaw); setNewKeyRaw(null) }}
              className="font-mono text-[12px] px-4 py-2 border border-[#0D0D0D] text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-white transition-colors shrink-0"
            >
              Copy + dismiss
            </button>
          </div>
        </div>
      )}

      {/* Create form */}
      {!error?.includes('Sign in') && (
        <div className="border border-[#E5E2DA] p-6 mb-8 flex items-center gap-4 flex-wrap">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key name (e.g. Production)"
            className="font-mono text-[12px] px-3 py-2 border border-[#E5E2DA] text-[#0D0D0D] focus:outline-none focus:border-[#0D0D0D] flex-1 min-w-0 placeholder-[#8A8A8A]"
            onKeyDown={(e) => e.key === 'Enter' && createKey()}
          />
          <button
            onClick={createKey}
            disabled={creating}
            className="font-mono text-[12px] px-5 py-2 border border-[#0D0D0D] text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-white transition-colors disabled:opacity-40"
          >
            {creating ? 'Creating...' : 'Create key'}
          </button>
        </div>
      )}

      {error && (
        <div className="font-mono text-[12px] text-[#6a2a2a] border border-[#6a2a2a] p-4 mb-6">
          {error} — showing demo data.
        </div>
      )}

      {loading ? (
        <div className="font-mono text-[13px] text-[#8A8A8A]">Loading...</div>
      ) : (
        <div className="border border-[#E5E2DA]">
          {displayKeys.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-mono text-[13px] text-[#8A8A8A]">No keys yet. Create your first key above.</p>
            </div>
          ) : (
            displayKeys.map((key, i) => (
              <div key={key.id} className={`flex items-center justify-between p-5 ${i < displayKeys.length - 1 ? 'border-b border-[#E5E2DA]' : ''}`}>
                <div className="flex items-center gap-6 flex-wrap">
                  <div>
                    <div className="font-mono text-[13px] text-[#0D0D0D] font-medium">{key.name || 'Unnamed'}</div>
                    <div className="font-mono text-[11px] text-[#8A8A8A] mt-0.5">{key.key_prefix}••••••••••••••••••••</div>
                  </div>
                  <div className="font-mono text-[11px] text-[#8A8A8A]">
                    Created {new Date(key.created_at).toLocaleDateString()}
                  </div>
                  {key.last_used && (
                    <div className="font-mono text-[11px] text-[#8A8A8A]">
                      Last used {new Date(key.last_used).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {key.revoked ? (
                    <span className="font-mono text-[11px] px-2 py-0.5 border border-[#6a2a2a] text-[#6a2a2a]">revoked</span>
                  ) : (
                    <>
                      <span className="font-mono text-[11px] px-2 py-0.5 border border-[#2a6a3a] text-[#2a6a3a]">active</span>
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
            ))
          )}
        </div>
      )}
    </div>
  )
}
