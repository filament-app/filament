'use client'

import { useState, useRef, useCallback, memo, useEffect } from 'react'

type ModelId = 'auto' | 'claude' | 'gpt' | 'gemini'

interface TraceInfo {
  model_used: string
  tokens_in: number
  tokens_out: number
  latency_ms: number
  status: string
}

function saveLog(data: {
  model_requested: string; model_used: string; tokens_in: number
  tokens_out: number; latency_ms: number; status: string
  trace_id: string; prompt: string
}) {
  if (typeof window === 'undefined') return
  const existing = JSON.parse(localStorage.getItem('filament_trace_logs') || '[]')
  localStorage.setItem('filament_trace_logs', JSON.stringify([{
    id: data.trace_id, timestamp: new Date().toISOString(),
    model_requested: data.model_requested, model_used: data.model_used,
    tokens_in: data.tokens_in, tokens_out: data.tokens_out,
    latency_ms: data.latency_ms, status: data.status,
    prompt_preview: data.prompt.substring(0, 80),
  }, ...existing].slice(0, 200)))
}

const MODELS: { id: ModelId; label: string; desc: string }[] = [
  { id: 'auto',   label: 'AUTO',   desc: 'Auto-select' },
  { id: 'claude', label: 'CLAUDE', desc: 'claude-sonnet-4' },
  { id: 'gpt',    label: 'GPT',    desc: 'gpt-4o' },
  { id: 'gemini', label: 'GEMINI', desc: 'gemini-1.5-pro' },
]



// ── InputPanel: memo with constant comparator → NEVER re-renders from props ──
// Model state lives here (isolated from RouterPage completely)
// No React event handlers on textarea (native addEventListener only)
const InputPanel = memo(function InputPanel({
  runRef,
  modelRef,
}: {
  runRef: RefObject<() => void>
  modelRef: RefObject<ModelId>
}) {
  const [model, setModel] = useState<ModelId>('auto')

  // Register keydown ONCE — no React events on textarea at all
  useEffect(() => {
    const ta = document.getElementById('fil-prompt') as HTMLTextAreaElement | null
    if (!ta) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        runRef.current?.()
      }
    }
    ta.addEventListener('keydown', onKeyDown)
    return () => ta.removeEventListener('keydown', onKeyDown)
  }, []) // ← runs once only

  // Track blur — tells us WHEN and WHY focus is lost
  useEffect(() => {
    const ta = document.getElementById('fil-prompt') as HTMLTextAreaElement | null
    if (!ta) return
    const onBlur = (e: FocusEvent) => {
      const to = (e.relatedTarget as HTMLElement | null)?.tagName ?? 'null'
      const el = document.getElementById('fil-dbg')
      if (el) el.textContent = `blur → ${to}`
    }
    ta.addEventListener('blur', onBlur)
    return () => ta.removeEventListener('blur', onBlur)
  }, [])

  const selectModel = (m: ModelId) => {
    setModel(m)
    if (modelRef) modelRef.current = m
  }

  return (
    <div>
      {/* Model */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#8A8A8A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
          Model
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {MODELS.map((m) => (
            <button key={m.id} type="button" onClick={() => selectModel(m.id)} style={{
              fontFamily: 'monospace', fontSize: '12px', padding: '10px 12px',
              border: `1px solid ${model === m.id ? '#0D0D0D' : '#E5E2DA'}`,
              background: model === m.id ? '#0D0D0D' : '#fff',
              color: model === m.id ? '#fff' : '#8A8A8A',
              textAlign: 'left', cursor: 'pointer', borderRadius: 0,
            }}>
              <div style={{ fontWeight: 700 }}>{m.label}</div>
              <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '2px' }}>{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* System prompt — NO React event handlers */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#8A8A8A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
          System prompt (optional)
        </div>
        <textarea
          id="fil-system"
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
            width: '100%', fontFamily: 'monospace', fontSize: '16px',
            lineHeight: '1.6', padding: '10px 12px',
            border: '1px solid #E5E2DA', background: '#F7F4EE',
            color: '#0D0D0D', resize: 'none', outline: 'none',
            boxSizing: 'border-box', display: 'block', borderRadius: 0,
          }}
        />
      </div>

      {/* Prompt — NO React event handlers, NO value, NO onChange, NO key */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#8A8A8A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
          Prompt
        </div>
        <textarea
          id="fil-prompt"
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
            width: '100%', fontFamily: 'monospace', fontSize: '16px',
            lineHeight: '1.6', padding: '10px 12px',
            border: '1px solid #E5E2DA', background: '#fff',
            color: '#0D0D0D', resize: 'none', outline: 'none',
            boxSizing: 'border-box', display: 'block', borderRadius: 0,
          }}
        />
        <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#8A8A8A', marginTop: '4px' }}>
          Cmd+Enter to run
        </div>
      </div>

      <button type="button" onClick={() => runRef.current?.()} style={{
        width: '100%', fontFamily: 'monospace', fontSize: '13px', padding: '12px',
        border: '1px solid #0D0D0D', background: '#fff', color: '#0D0D0D',
        cursor: 'pointer', borderRadius: 0,
      }}>
        Run →
      </button>
    </div>
  )
}, () => true) // ← props NEVER change → component NEVER re-renders from outside

// TypeScript helper
type RefObject<T> = React.MutableRefObject<T>

// ── RouterPage — only holds output state ─────────────────────────────────────
export default function RouterPage() {
  const runRef  = useRef<() => void>(() => {})
  const modelRef = useRef<ModelId>('auto')

  const [loading,  setLoading]  = useState(false)
  const [response, setResponse] = useState('')
  const [trace,    setTrace]    = useState<TraceInfo | null>(null)
  const [rawJson,  setRawJson]  = useState<string | null>(null)
  const [showRaw,  setShowRaw]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)



  const handleRun = useCallback(async () => {
    const prompt = (document.getElementById('fil-prompt') as HTMLTextAreaElement | null)?.value?.trim() ?? ''
    const system = (document.getElementById('fil-system') as HTMLTextAreaElement | null)?.value?.trim() ?? ''
    const model  = modelRef.current
    if (!prompt) return

    setLoading(true); setResponse(''); setTrace(null); setRawJson(null); setError(null)

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
      saveLog({ model_requested: model, ...t, trace_id: data.id || crypto.randomUUID(), prompt })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  runRef.current = handleRun

  return (
    <div style={{ fontFamily: 'monospace' }}>

      {/* Title */}
      <div style={{ borderBottom: '1px solid #E5E2DA', padding: '16px 20px 12px' }}>
        <div style={{ fontSize: '18px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-barlow)' }}>
          Unified Router
        </div>
        <div style={{ fontSize: '12px', color: '#8A8A8A', marginTop: '2px' }}>
          Route any prompt to any model.
        </div>
      </div>

      {/* Split: input left, output right on desktop */}
      <div style={{ display: 'flex', flexDirection: 'row', minHeight: 'calc(100vh - 112px)' }}>

        {/* Left panel */}
        <div style={{ width: '42%', borderRight: '1px solid #E5E2DA', padding: '20px', flexShrink: 0 }}
          className="router-left">
          <InputPanel runRef={runRef} modelRef={modelRef} />
        </div>

        {/* Right panel */}
        <div style={{ flex: 1, overflow: 'auto' }} className="router-right">
          {loading && (
            <div style={{ padding: '20px', fontSize: '13px', color: '#8A8A8A' }}>Routing request...</div>
          )}
          {!loading && error && (
            <div style={{ margin: '20px', border: '1px solid #6a2a2a', padding: '12px', fontSize: '13px', color: '#6a2a2a' }}>{error}</div>
          )}
          {!loading && !error && !response && (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#C8C4BC', fontSize: '13px' }}>
              Response appears here.
            </div>
          )}
          {(trace || response) && (
            <>
              {trace && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', padding: '10px 16px', background: '#F7F4EE', borderBottom: '1px solid #E5E2DA' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>{trace.model_used}</span>
                  <span style={{ fontSize: '11px', color: '#8A8A8A' }}>{trace.tokens_in}→{trace.tokens_out} tok</span>
                  <span style={{ fontSize: '11px', color: '#8A8A8A' }}>{trace.latency_ms}ms</span>
                  <span style={{ fontSize: '10px', padding: '2px 6px', border: `1px solid ${trace.status === 'ok' ? '#2a6a3a' : '#6a2a2a'}`, color: trace.status === 'ok' ? '#2a6a3a' : '#6a2a2a' }}>{trace.status}</span>
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
              <div style={{ padding: '16px 20px' }}>
                {!showRaw && response && (
                  <div style={{ fontSize: '14px', lineHeight: 1.7, whiteSpace: 'pre-wrap', color: '#0D0D0D' }}>{response}</div>
                )}
                {showRaw && rawJson && (
                  <pre style={{ fontSize: '12px', lineHeight: 1.6, whiteSpace: 'pre-wrap', background: '#F7F4EE', padding: '16px', overflowX: 'auto', color: '#0D0D0D', margin: 0 }}>{rawJson}</pre>
                )}
              </div>
            </>
          )}
        </div>

      </div>

      {/* Mobile: stack vertically */}
      <style>{`
        @media (max-width: 768px) {
          .router-left { width: 100% !important; border-right: none !important; border-bottom: 1px solid #E5E2DA; }
          div[style*="flex-direction: row"] { flex-direction: column !important; }
        }
      `}</style>

    </div>
  )
}
