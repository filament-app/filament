'use client'

import { useState, useRef, useCallback } from 'react'

type ModelId = 'auto' | 'claude' | 'gpt' | 'gemini'

interface TraceInfo {
  model_used: string
  tokens_in: number
  tokens_out: number
  latency_ms: number
  status: string
}

function saveTraceLog(data: {
  model_requested: string; model_used: string; tokens_in: number
  tokens_out: number; latency_ms: number; status: string
  trace_id: string; prompt: string
}) {
  if (typeof window === 'undefined') return
  const existing = JSON.parse(localStorage.getItem('filament_trace_logs') || '[]')
  localStorage.setItem('filament_trace_logs', JSON.stringify([{
    id: data.trace_id,
    timestamp: new Date().toISOString(),
    model_requested: data.model_requested,
    model_used: data.model_used,
    tokens_in: data.tokens_in,
    tokens_out: data.tokens_out,
    latency_ms: data.latency_ms,
    status: data.status,
    prompt_preview: data.prompt.substring(0, 80),
  }, ...existing].slice(0, 200)))
}

const MODELS: { id: ModelId; label: string; desc: string }[] = [
  { id: 'auto',   label: 'AUTO',   desc: 'Auto-select' },
  { id: 'claude', label: 'CLAUDE', desc: 'claude-sonnet-4' },
  { id: 'gpt',    label: 'GPT',    desc: 'gpt-4o' },
  { id: 'gemini', label: 'GEMINI', desc: 'gemini-1.5-pro' },
]

export default function RouterPage() {
  // ── refs: read on submit only, never on keystroke ──
  const promptRef = useRef<HTMLTextAreaElement>(null)
  const systemRef = useRef<HTMLTextAreaElement>(null)

  // ── state that does NOT affect textarea DOM ──
  const [model, setModel]     = useState<ModelId>('auto')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState('')
  const [trace, setTrace]     = useState<TraceInfo | null>(null)
  const [rawJson, setRawJson] = useState<string | null>(null)
  const [showRaw, setShowRaw] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const handleRun = useCallback(async () => {
    const prompt = promptRef.current?.value?.trim() ?? ''
    const system = systemRef.current?.value?.trim() ?? ''
    if (!prompt) return

    setLoading(true)
    setResponse('')
    setTrace(null)
    setRawJson(null)
    setError(null)

    const start = Date.now()
    try {
      const res  = await fetch('/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model, system: system || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Request failed'); return }

      const t: TraceInfo = {
        model_used: data.filament?.model_used || data.model || 'unknown',
        tokens_in:  data.usage?.prompt_tokens     || 0,
        tokens_out: data.usage?.completion_tokens || 0,
        latency_ms: data.filament?.latency_ms     || (Date.now() - start),
        status:     data.filament?.status         || 'ok',
      }
      setRawJson(JSON.stringify(data, null, 2))
      setResponse(data.choices?.[0]?.message?.content || '')
      setTrace(t)
      saveTraceLog({ model_requested: model, ...t, trace_id: data.id || crypto.randomUUID(), prompt })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }, [model])

  return (
    <div style={{ padding: '16px', fontFamily: 'monospace' }}>

      {/* ── Page title ── */}
      <div style={{ borderBottom: '1px solid #E5E2DA', paddingBottom: '12px', marginBottom: '20px' }}>
        <div style={{ fontSize: '18px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-barlow)' }}>
          Unified Router
        </div>
        <div style={{ fontSize: '12px', color: '#8A8A8A', marginTop: '2px' }}>
          Route any prompt to any model.
        </div>
      </div>

      {/* ── Model selector ── */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: '#8A8A8A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
          Model
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setModel(m.id)}
              style={{
                fontFamily: 'monospace',
                fontSize: '12px',
                padding: '10px 12px',
                border: `1px solid ${model === m.id ? '#0D0D0D' : '#E5E2DA'}`,
                background: model === m.id ? '#0D0D0D' : '#fff',
                color: model === m.id ? '#fff' : '#8A8A8A',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontWeight: 700 }}>{m.label}</div>
              <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '2px' }}>{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── System prompt — always in DOM, just hidden. No conditional mount. ── */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: '#8A8A8A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
          System prompt (optional)
        </div>
        <textarea
          ref={systemRef}
          rows={2}
          placeholder="You are a helpful assistant."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          data-gramm="false"
          data-gramm_editor="false"
          data-enable-grammarly="false"
          style={{
            width: '100%',
            fontFamily: 'monospace',
            fontSize: '16px',
            padding: '10px',
            border: '1px solid #E5E2DA',
            background: '#F7F4EE',
            color: '#0D0D0D',
            resize: 'none',
            outline: 'none',
            boxSizing: 'border-box',
            display: 'block',
            WebkitUserSelect: 'text',
            touchAction: 'manipulation',
          }}
        />
      </div>

      {/* ── Prompt ── */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: '#8A8A8A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
          Prompt
        </div>
        <textarea
          ref={promptRef}
          rows={7}
          placeholder="What is an embedding?"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          data-gramm="false"
          data-gramm_editor="false"
          data-enable-grammarly="false"
          style={{
            width: '100%',
            fontFamily: 'monospace',
            fontSize: '16px',
            padding: '10px',
            border: '1px solid #E5E2DA',
            background: '#fff',
            color: '#0D0D0D',
            resize: 'none',
            outline: 'none',
            boxSizing: 'border-box',
            display: 'block',
            WebkitUserSelect: 'text',
            touchAction: 'manipulation',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleRun()
          }}
        />
        <div style={{ fontSize: '10px', color: '#8A8A8A', marginTop: '4px' }}>Cmd+Enter to run</div>
      </div>

      {/* ── Run button ── */}
      <button
        type="button"
        onClick={handleRun}
        disabled={loading}
        style={{
          width: '100%',
          fontFamily: 'monospace',
          fontSize: '13px',
          padding: '12px',
          border: '1px solid #0D0D0D',
          background: loading ? '#0D0D0D' : '#fff',
          color: loading ? '#fff' : '#0D0D0D',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
          marginBottom: '24px',
        }}
      >
        {loading ? 'Running...' : 'Run →'}
      </button>

      {/* ── Output ── */}
      {(loading || error || response) && (
        <div style={{ borderTop: '1px solid #E5E2DA', paddingTop: '16px' }}>

          {/* Trace bar */}
          {trace && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '12px', padding: '10px', background: '#F7F4EE' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>{trace.model_used}</span>
              <span style={{ fontSize: '11px', color: '#8A8A8A' }}>{trace.tokens_in}→{trace.tokens_out} tok</span>
              <span style={{ fontSize: '11px', color: '#8A8A8A' }}>{trace.latency_ms}ms</span>
              <span style={{ fontSize: '10px', padding: '2px 6px', border: `1px solid ${trace.status === 'ok' ? '#2a6a3a' : '#6a2a2a'}`, color: trace.status === 'ok' ? '#2a6a3a' : '#6a2a2a' }}>
                {trace.status}
              </span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowRaw(!showRaw)}
                  style={{ fontFamily: 'monospace', fontSize: '11px', color: '#8A8A8A', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showRaw ? 'Response' : 'Raw JSON'}
                </button>
                {response && (
                  <button type="button" onClick={() => navigator.clipboard.writeText(showRaw ? rawJson || '' : response)}
                    style={{ fontFamily: 'monospace', fontSize: '11px', color: '#8A8A8A', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Copy
                  </button>
                )}
              </div>
            </div>
          )}

          {loading && (
            <div style={{ fontSize: '13px', color: '#8A8A8A' }}>Routing request...</div>
          )}
          {error && (
            <div style={{ border: '1px solid #6a2a2a', padding: '12px', fontSize: '13px', color: '#6a2a2a' }}>{error}</div>
          )}
          {!loading && response && !showRaw && (
            <div style={{ fontSize: '14px', lineHeight: 1.7, whiteSpace: 'pre-wrap', color: '#0D0D0D' }}>{response}</div>
          )}
          {!loading && rawJson && showRaw && (
            <pre style={{ fontSize: '12px', lineHeight: 1.6, whiteSpace: 'pre-wrap', background: '#F7F4EE', padding: '16px', overflowX: 'auto', color: '#0D0D0D' }}>{rawJson}</pre>
          )}
        </div>
      )}

      {!loading && !error && !response && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#8A8A8A', fontSize: '13px' }}>
          Response appears here after you run a prompt.
        </div>
      )}
    </div>
  )
}
