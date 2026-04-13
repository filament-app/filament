'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

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

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANT HTML string defined at MODULE LEVEL.
// React compares __html by value on every reconcile.
// Because this string NEVER changes, React will call innerHTML exactly ONCE
// (on first render) and then SKIP every subsequent reconcile.
// The textarea DOM nodes are therefore completely outside React's control.
// ─────────────────────────────────────────────────────────────────────────────
const TA_STYLE = [
  'width:100%',
  'font-family:monospace',
  'font-size:16px',
  'line-height:1.6',
  'padding:10px 12px',
  'border:1px solid #E5E2DA',
  'color:#0D0D0D',
  'resize:none',
  'outline:none',
  'box-sizing:border-box',
  'display:block',
  '-webkit-appearance:none',
  'appearance:none',
  'border-radius:0',
].join(';')

const SHARED_ATTRS = [
  'autocomplete="off"',
  'autocorrect="off"',
  'autocapitalize="off"',
  'spellcheck="false"',
  'data-gramm="false"',
  'data-gramm_editor="false"',
  'data-enable-grammarly="false"',
].join(' ')

const PROMPTS_HTML = `
<div style="margin-bottom:20px">
  <div style="font-size:11px;font-family:monospace;color:#8A8A8A;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px">
    System prompt (optional)
  </div>
  <textarea
    id="fil-system"
    rows="2"
    placeholder="You are a helpful assistant."
    ${SHARED_ATTRS}
    style="${TA_STYLE};background:#F7F4EE"
  ></textarea>
</div>
<div style="margin-bottom:20px">
  <div style="font-size:11px;font-family:monospace;color:#8A8A8A;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px">
    Prompt
  </div>
  <textarea
    id="fil-prompt"
    rows="7"
    placeholder="What is an embedding?"
    ${SHARED_ATTRS}
    style="${TA_STYLE};background:#fff"
  ></textarea>
  <div style="font-size:10px;font-family:monospace;color:#8A8A8A;margin-top:4px">
    Cmd+Enter to run
  </div>
</div>
`

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function RouterPage() {
  const [model,    setModel]    = useState<ModelId>('auto')
  const [loading,  setLoading]  = useState(false)
  const [response, setResponse] = useState('')
  const [trace,    setTrace]    = useState<TraceInfo | null>(null)
  const [rawJson,  setRawJson]  = useState<string | null>(null)
  const [showRaw,  setShowRaw]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  // Stable ref so the keydown listener never needs to be re-added
  const runRef = useRef<() => Promise<void>>(async () => {})

  const handleRun = useCallback(async () => {
    const prompt = (document.getElementById('fil-prompt') as HTMLTextAreaElement | null)?.value?.trim() ?? ''
    const system = (document.getElementById('fil-system') as HTMLTextAreaElement | null)?.value?.trim() ?? ''
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

  // Keep ref in sync — the keydown listener calls runRef.current() so it
  // always calls the latest handleRun without needing to re-register the listener
  runRef.current = handleRun

  // Register Cmd+Enter on textarea — runs ONCE, never re-runs
  useEffect(() => {
    const ta = document.getElementById('fil-prompt') as HTMLTextAreaElement | null
    if (!ta) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        runRef.current()
      }
    }
    ta.addEventListener('keydown', onKeyDown)
    return () => ta.removeEventListener('keydown', onKeyDown)
  }, []) // ← empty: registered once, never touched again

  return (
    <div style={{ padding: '16px 20px 80px', fontFamily: 'monospace', maxWidth: '720px' }}>

      {/* Title */}
      <div style={{ borderBottom: '1px solid #E5E2DA', paddingBottom: '12px', marginBottom: '24px' }}>
        <div style={{ fontSize: '18px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-barlow)' }}>
          Unified Router
        </div>
        <div style={{ fontSize: '12px', color: '#8A8A8A', marginTop: '2px' }}>
          Route any prompt to any model.
        </div>
      </div>

      {/* Model pills — React-managed, re-renders only affect this section */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', color: '#8A8A8A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
          Model
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {MODELS.map((m) => (
            <button key={m.id} type="button" onClick={() => setModel(m.id)} style={{
              fontFamily: 'monospace', fontSize: '12px', padding: '10px 12px',
              border: `1px solid ${model === m.id ? '#0D0D0D' : '#E5E2DA'}`,
              background: model === m.id ? '#0D0D0D' : '#fff',
              color: model === m.id ? '#fff' : '#8A8A8A',
              textAlign: 'left', cursor: 'pointer',
            }}>
              <div style={{ fontWeight: 700 }}>{m.label}</div>
              <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '2px' }}>{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/*
        ── TEXTAREAS ──────────────────────────────────────────────────────────
        dangerouslySetInnerHTML with a MODULE-LEVEL CONSTANT.
        React diffs __html by value. Since PROMPTS_HTML never changes,
        React will NEVER call innerHTML again after the first render.
        These textarea nodes are 100% outside React's reconciliation.
      */}
      <div dangerouslySetInnerHTML={{ __html: PROMPTS_HTML }} />

      {/* Run button */}
      <button
        type="button"
        onClick={handleRun}
        disabled={loading}
        style={{
          width: '100%', fontFamily: 'monospace', fontSize: '13px', padding: '12px',
          border: '1px solid #0D0D0D',
          background: loading ? '#0D0D0D' : '#fff',
          color: loading ? '#fff' : '#0D0D0D',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1, marginBottom: '28px',
        }}
      >
        {loading ? 'Running...' : 'Run →'}
      </button>

      {/* Empty state */}
      {!loading && !error && !response && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#8A8A8A', fontSize: '13px' }}>
          Response appears here after you run a prompt.
        </div>
      )}

      {/* Output — React-managed, re-renders here never affect the textareas above */}
      {(loading || error || response) && (
        <div style={{ borderTop: '1px solid #E5E2DA', paddingTop: '16px' }}>
          {trace && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '16px', padding: '10px 12px', background: '#F7F4EE' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>{trace.model_used}</span>
              <span style={{ fontSize: '11px', color: '#8A8A8A' }}>{trace.tokens_in}→{trace.tokens_out} tok</span>
              <span style={{ fontSize: '11px', color: '#8A8A8A' }}>{trace.latency_ms}ms</span>
              <span style={{ fontSize: '10px', padding: '2px 6px', border: `1px solid ${trace.status === 'ok' ? '#2a6a3a' : '#6a2a2a'}`, color: trace.status === 'ok' ? '#2a6a3a' : '#6a2a2a' }}>
                {trace.status}
              </span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowRaw(!showRaw)} style={{ fontFamily: 'monospace', fontSize: '11px', color: '#8A8A8A', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  {showRaw ? 'Response' : 'Raw JSON'}
                </button>
                {response && (
                  <button type="button" onClick={() => navigator.clipboard.writeText(showRaw ? rawJson || '' : response)} style={{ fontFamily: 'monospace', fontSize: '11px', color: '#8A8A8A', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    Copy
                  </button>
                )}
              </div>
            </div>
          )}
          {loading && <div style={{ fontSize: '13px', color: '#8A8A8A', padding: '8px 0' }}>Routing request...</div>}
          {error    && <div style={{ border: '1px solid #6a2a2a', padding: '12px', fontSize: '13px', color: '#6a2a2a' }}>{error}</div>}
          {!loading && response && !showRaw && (
            <div style={{ fontSize: '14px', lineHeight: 1.7, whiteSpace: 'pre-wrap', color: '#0D0D0D' }}>{response}</div>
          )}
          {!loading && rawJson && showRaw && (
            <pre style={{ fontSize: '12px', lineHeight: 1.6, whiteSpace: 'pre-wrap', background: '#F7F4EE', padding: '16px', overflowX: 'auto', color: '#0D0D0D', margin: 0 }}>{rawJson}</pre>
          )}
        </div>
      )}
    </div>
  )
}
