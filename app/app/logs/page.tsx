'use client'

import { useEffect, useState } from 'react'

interface TraceLog {
  id: string
  timestamp: string
  model_requested: string
  model_used: string
  tokens_in: number
  tokens_out: number
  latency_ms: number
  status: string
  prompt_preview?: string
}

const LOGS_KEY = 'filament_trace_logs'

export default function LogsPage() {
  const [logs, setLogs] = useState<TraceLog[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const raw = localStorage.getItem(LOGS_KEY)
    if (raw) setLogs(JSON.parse(raw))
  }, [])

  function clearLogs() {
    localStorage.removeItem(LOGS_KEY)
    setLogs([])
  }

  if (!mounted) return null

  return (
    <div className="px-4 md:px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8 pb-6 border-b border-[#E5E2DA]">
        <div>
          <h1 className="font-[family-name:var(--font-barlow)] font-bold text-[28px] uppercase tracking-wide text-[#0D0D0D]">
            Trace Logs
          </h1>
          <p className="font-mono text-[12px] text-[#8A8A8A] mt-1">
            Every request through the router. Stored locally.
          </p>
        </div>
        {logs.length > 0 && (
          <button
            onClick={clearLogs}
            className="font-mono text-[12px] text-[#8A8A8A] hover:text-[#6a2a2a] transition-colors whitespace-nowrap mt-1"
          >
            Clear all
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="border border-[#E5E2DA] p-16 text-center">
          <p className="font-mono text-[13px] text-[#8A8A8A]">No logs yet.</p>
          <p className="font-mono text-[11px] text-[#E5E2DA] mt-2">Run a prompt in the Router tab to see traces here.</p>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="md:hidden flex flex-col gap-3">
            {logs.map((log) => (
              <div key={log.id} className="border border-[#E5E2DA] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[12px] text-[#0D0D0D] font-medium">{log.model_used}</span>
                  <span className={`font-mono text-[10px] px-2 py-0.5 border ${
                    log.status === 'ok' ? 'border-[#2a6a3a] text-[#2a6a3a]' :
                    log.status === 'fallback' ? 'border-[#6a5a2a] text-[#6a5a2a]' :
                    'border-[#6a2a2a] text-[#6a2a2a]'
                  }`}>{log.status}</span>
                </div>
                {log.prompt_preview && (
                  <p className="font-mono text-[11px] text-[#8A8A8A] mb-2 truncate">{log.prompt_preview}</p>
                )}
                <div className="flex gap-4 font-mono text-[11px] text-[#8A8A8A]">
                  <span>{log.tokens_in}→{log.tokens_out} tok</span>
                  <span>{log.latency_ms}ms</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block border border-[#E5E2DA] overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E2DA] bg-[#F7F4EE]">
                  {['Time', 'Model', 'Requested', 'Tokens in', 'Tokens out', 'Latency', 'Status'].map(col => (
                    <th key={col} className="font-mono text-[10px] text-[#8A8A8A] text-left px-4 py-3 uppercase tracking-widest whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={log.id} className={`border-b border-[#E5E2DA] last:border-0 hover:bg-[#F7F4EE] transition-colors`}>
                    <td className="font-mono text-[11px] text-[#8A8A8A] px-4 py-3 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="font-mono text-[12px] text-[#0D0D0D] px-4 py-3 whitespace-nowrap">{log.model_used}</td>
                    <td className="font-mono text-[11px] text-[#8A8A8A] px-4 py-3 whitespace-nowrap">{log.model_requested}</td>
                    <td className="font-mono text-[12px] text-[#0D0D0D] px-4 py-3 text-right">{log.tokens_in}</td>
                    <td className="font-mono text-[12px] text-[#0D0D0D] px-4 py-3 text-right">{log.tokens_out}</td>
                    <td className="font-mono text-[12px] text-[#0D0D0D] px-4 py-3 text-right">{log.latency_ms}ms</td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-[10px] px-2 py-0.5 border ${
                        log.status === 'ok' ? 'border-[#2a6a3a] text-[#2a6a3a]' :
                        log.status === 'fallback' ? 'border-[#6a5a2a] text-[#6a5a2a]' :
                        'border-[#6a2a2a] text-[#6a2a2a]'
                      }`}>{log.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="font-mono text-[11px] text-[#8A8A8A] mt-4">
            {logs.length} trace{logs.length !== 1 ? 's' : ''} — last 200 kept
          </p>
        </>
      )}
    </div>
  )
}
