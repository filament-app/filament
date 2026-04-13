'use client'

import { useState, useRef, useCallback, memo } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type ModelId = 'auto' | 'claude' | 'gpt' | 'gemini'

interface TraceInfo {
  model_used: string
  tokens_in: number
  tokens_out: number
  latency_ms: number
  status: string
}

const MODELS: { id: ModelId; label: string; desc: string }[] = [
  { id: 'auto',   label: 'AUTO',   desc: 'Auto-select' },
  { id: 'claude', label: 'CLAUDE', desc: 'claude-sonnet-4' },
  { id: 'gpt',    label: 'GPT',    desc: 'gpt-4o' },
  { id: 'gemini', label: 'GEMINI', desc: 'gemini-1.5-pro' },
]

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

// ─── PromptSection ─────────────────────────────────────────────────────────────
// Rules that GUARANTEE no focus loss:
//
// 1. Defined at MODULE LEVEL — React always sees the same component type.
//    A component defined inside another function gets a new type every render,
//    forcing React to unmount+remount it (the #1 cause of focus loss).
//
// 2. memo(() => true) — this component will NEVER re-render due to prop changes.
//    Internal state changes (model selection) still work normally.
//
// 3. Both refs (onRunRef, modelRef) are stable — their identity never changes,
//    only their .current value updates. So memo sees the same props every time.
//
// 4. Textareas are UNCONTROLLED — no value/onChange. React will never diff
//    or touch the textarea DOM node after initial render.
//
// 5. No key={...} on textareas — a changing key forces unmount+remount.

const PromptSection = memo(
  function PromptSection({
    onRunRef,
    modelRef,
  }: {
    onRunRef: React.MutableRefObject<() => void>
    modelRef: React.MutableRefObject<ModelId>
  }) {
    const [model, setModel] = useState<ModelId>('auto')

    const selectModel = (m: ModelId) => {
      setModel(m)
      modelRef.current = m
    }

    const TA: React.CSSProperties = {
      width: '100%',
      fontFamily: 'monospace',
      fontSize: '16px',
      lineHeight: '1.6',
      padding: '10px 12px',
      border: '1px solid #E5E2DA',
      color: '#0D0D0D',
      resize: 'none',
      outline: 'none',
      boxSizing: 'border-box',
      display: 'block',
      borderRadius: 0,
      WebkitAppearance: 'none',
    }

    return (
      <div>
        {/* Model selector */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#8A8A8A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
            Model
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {MODELS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => selectModel(m.id)}
                style={{
                  fontFamily: 'monospace', fontSize: '12px',
                  padding: '10px 12px', textAlign: 'left', cursor: 'pointer',
                  border: `1px solid ${model === m.id ? '#0D0D0D' : '#E5E2DA'}`,
                  background: model === m.id ? '#0D0D0D' : '#fff',
                  color: model === m.id ? '#fff' : '#8A8A8A',
                  borderRadius: 0,
                }}
              >
                <div style={{ fontWeight: 700 }}>{m.label}</div>
                <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '2px' }}>{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* System prompt — uncontrolled, NO value prop, NO onChange */}
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
            style={{ ...TA, background: '#F7F4EE' }}
          />
        </div>

        {/* Prompt — uncontrolled, NO value prop, NO onChange, NO key */}
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
            style={{ ...TA, background: '#fff' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                onRunRef.current()
              }
            }}
          />
          <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#8A8A8A', marginTop: '4px' }}>
            Cmd+Enter to run
          </div>
        </div>

        {/* Run button */}
        <button
          type="button"
          onClick={() => onRunRef.current()}
          style={{
            width: '100%', fontFamily: 'monospace', fontSize: '13px',
            padding: '12px', border: '1px solid #0D0D0D',
            background: '#fff', color: '#0D0D0D', cursor: 'pointer',
            borderRadius: 0,
          }}
        >
          Run →
        </button>
      </div>
    )
  },
  () => true  // props never change → component never re-renders from outside
)

// ─── Page ─────────────────────────────────────────────────────────────────────
// Holds only OUTPUT state. PromptSection is completely isolated from this.
export default function RouterPage() {
  // These two refs are the ONLY connection to PromptSection.
  // Refs have stable identity — passing them as props never triggers re-render.
  const onRunRef  = useRef<() => void>(() => {})
  const modelRef  = useRef<ModelId>('auto')

  const [loading,  setLoading]  = useState(false)
  const [response, setResponse] = useState('')
  const [trace,    setTrace]    = useState<TraceInfo | null>(null)
  const [rawJson,  setRawJson]  = useState<string | null>(null)
  const [showRaw,  setShowRaw]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  // handleRun reads inputs from DOM — never needs to be recreated
  const handleRun = useCallback(async () => {
    const prompt = (document.getElementById('fil-prompt') as HTMLTextAreaElement | null)?.value?.trim() ?? ''
    const system = (document.getElementById('fil-system') as HTMLTextAreaElement | null)?.value?.trim() ?? ''
    const model  = modelRef.current
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
      saveLog({ model_requested: model, ...t, trace_id: data.id || crypto.randomUUID(), prompt })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }, []) // ← empty deps: handleRun is stable forever

  // Keep ref in sync — updating ref.current does NOT trigger re-renders
  onRunRef.current = handleRun

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

      {/*
        PromptSection receives only stable refs as props.
        memo(() => true) guarantees it never re-renders from outside.
        Any state change in RouterPage (loading, response, etc.)
        has ZERO effect on PromptSection or its textareas.
      */}
      <PromptSection onRunRef={onRunRef} modelRef={modelRef} />

      {/* Separator */}
      <div style={{ borderTop: '1px solid #E5E2DA', marginTop: '28px', paddingTop: '20px' }}>

        {/* Loading */}
        {loading && (
          <div style={{ fontSize: '13px', color: '#8A8A8A', padding: '8px 0', fontFamily: 'monospace' }}>
            Routing request...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ border: '1px solid #6a2a2a', padding: '12px', fontSize: '13px', color: '#6a2a2a', fontFamily: 'monospace' }}>
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && !response && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#8A8A8A', fontSize: '13px', fontFamily: 'monospace' }}>
            Response appears here after you run a prompt.
          </div>
        )}

        {/* Trace bar */}
        {!loading && trace && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '16px', padding: '10px 12px', background: '#F7F4EE', fontFamily: 'monospace' }}>
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

        {/* Response */}
        {!loading && response && !showRaw && (
          <div style={{ fontSize: '14px', lineHeight: 1.7, whiteSpace: 'pre-wrap', color: '#0D0D0D', fontFamily: 'monospace' }}>
            {response}
          </div>
        )}
        {!loading && rawJson && showRaw && (
          <pre style={{ fontSize: '12px', lineHeight: 1.6, whiteSpace: 'pre-wrap', background: '#F7F4EE', padding: '16px', overflowX: 'auto', color: '#0D0D0D', margin: 0, fontFamily: 'monospace' }}>
            {rawJson}
          </pre>
        )}
      </div>
    </div>
  )
}
