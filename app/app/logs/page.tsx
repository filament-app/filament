'use client'

import { useState, useEffect, useCallback } from 'react'
import { TraceLog } from '@/types'

export default function LogsPage() {
  const [logs, setLogs] = useState<TraceLog[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/observe?limit=50')
      if (res.status === 401) {
        setError('Sign in to view logs.')
        return
      }
      const data = await res.json()
      setLogs(data.traces || [])
      setTotal(data.total || 0)
    } catch {
      setError('Failed to load logs.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const DEMO_LOGS: TraceLog[] = [
    { id: '1', user_id: 'u1', api_key_prefix: 'fl-a3f9c2', session_id: 'sess_k9x2', model_requested: 'auto', model_used: 'gemini-1.5-pro', tokens_in: 18, tokens_out: 94, latency_ms: 287, status: 'ok', error: null, created_at: '2026-01-08T14:32:01Z' },
    { id: '2', user_id: 'u1', api_key_prefix: 'fl-a3f9c2', session_id: 'sess_k9x2', model_requested: 'claude', model_used: 'claude-sonnet', tokens_in: 412, tokens_out: 638, latency_ms: 891, status: 'ok', error: null, created_at: '2026-01-08T14:31:58Z' },
    { id: '3', user_id: 'u1', api_key_prefix: 'fl-a3f9c2', session_id: 'sess_m4r1', model_requested: 'gpt', model_used: 'gpt-4o', tokens_in: 67, tokens_out: 201, latency_ms: 423, status: 'ok', error: null, created_at: '2026-01-08T14:31:45Z' },
    { id: '4', user_id: 'u1', api_key_prefix: 'fl-a3f9c2', session_id: 'sess_m4r1', model_requested: 'auto', model_used: 'claude-sonnet', tokens_in: 89, tokens_out: 145, latency_ms: 1102, status: 'fallback', error: 'Primary provider timeout', created_at: '2026-01-08T14:31:22Z' },
    { id: '5', user_id: 'u1', api_key_prefix: 'fl-a3f9c2', session_id: 'sess_z8c3', model_requested: 'gpt', model_used: 'gpt-4o', tokens_in: 230, tokens_out: 418, latency_ms: 389, status: 'ok', error: null, created_at: '2026-01-08T14:30:59Z' },
  ]

  const displayLogs = error ? DEMO_LOGS : logs.length > 0 ? logs : DEMO_LOGS

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="font-[family-name:var(--font-barlow)] font-bold text-[32px] uppercase tracking-wide text-[#0D0D0D]">
            Trace Logs
          </h1>
          <p className="font-mono text-[12px] text-[#8A8A8A] mt-1">
            {error ? 'Demo data — sign in to see real logs.' : `${total} total requests`}
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="font-mono text-[12px] px-4 py-2 border border-[#E5E2DA] text-[#8A8A8A] hover:border-[#0D0D0D] hover:text-[#0D0D0D] transition-colors"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="font-mono text-[13px] text-[#8A8A8A]">Loading...</div>
      ) : (
        <div className="border border-[#E5E2DA] overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E2DA] bg-[#F7F4EE]">
                {['timestamp', 'session', 'requested', 'model_used', 'tokens_in', 'tokens_out', 'latency', 'status'].map((col) => (
                  <th key={col} className="font-mono text-[10px] text-[#8A8A8A] text-left px-4 py-3 uppercase tracking-widest whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayLogs.map((log) => (
                <tr key={log.id} className="border-b border-[#E5E2DA] last:border-0 hover:bg-[#F7F4EE] transition-colors">
                  <td className="font-mono text-[11px] text-[#8A8A8A] px-4 py-3 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </td>
                  <td className="font-mono text-[11px] text-[#0D0D0D] px-4 py-3 whitespace-nowrap">
                    {log.session_id?.substring(0, 12) || '—'}
                  </td>
                  <td className="font-mono text-[11px] text-[#8A8A8A] px-4 py-3">{log.model_requested}</td>
                  <td className="font-mono text-[11px] text-[#0D0D0D] px-4 py-3 whitespace-nowrap">{log.model_used}</td>
                  <td className="font-mono text-[11px] text-[#0D0D0D] px-4 py-3 text-right">{log.tokens_in}</td>
                  <td className="font-mono text-[11px] text-[#0D0D0D] px-4 py-3 text-right">{log.tokens_out}</td>
                  <td className="font-mono text-[11px] text-[#0D0D0D] px-4 py-3 text-right">{log.latency_ms}ms</td>
                  <td className="px-4 py-3">
                    <span className={`font-mono text-[10px] px-2 py-0.5 border ${
                      log.status === 'ok' ? 'border-[#2a6a3a] text-[#2a6a3a]' :
                      log.status === 'fallback' ? 'border-[#6a5a2a] text-[#6a5a2a]' :
                      'border-[#6a2a2a] text-[#6a2a2a]'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
