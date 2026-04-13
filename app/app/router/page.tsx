'use client'

import {
  useState, useRef, useCallback,
  memo, forwardRef, useImperativeHandle,
} from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type ModelId = 'auto' | 'claude' | 'gpt' | 'gemini'

interface TraceInfo {
  model_used: string
  tokens_in: number
  tokens_out: number
  latency_ms: number
  status: string
}

interface InputValues {
  prompt: string
  system: string
  model: ModelId
}

interface InputHandle {
  getValues: () => InputValues
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function saveTraceLog(data: {
  model_requested: string; model_used: string; tokens_in: number
  tokens_out: number; latency_ms: number; status: string
  trace_id: string; prompt: string
}) {
  if (typeof window === 'undefined') return
  const LOGS_KEY = 'filament_trace_logs'
  const log = {
    id: data.trace_id,
    timestamp: new Date().toISOString(),
    model_requested: data.model_requested,
    model_used: data.model_used,
    tokens_in: data.tokens_in,
    tokens_out: data.tokens_out,
    latency_ms: data.latency_ms,
    status: data.status,
    prompt_preview: data.prompt.substring(0, 80),
  }
  const existing = JSON.parse(localStorage.getItem(LOGS_KEY) || '[]')
  localStorage.setItem(LOGS_KEY, JSON.stringify([log, ...existing].slice(0, 200)))
}

const MODEL_DESCRIPTIONS: Record<ModelId, string> = {
  auto: 'Auto-select',
  claude: 'claude-sonnet-4',
  gpt: 'gpt-4o',
  gemini: 'gemini-1.5-pro',
}
const MODELS: ModelId[] = ['auto', 'claude', 'gpt', 'gemini']

// ─── ModelSelector — isolated so its state never touches textarea ─────────────
const ModelSelector = memo(function ModelSelector({
  value, onChange,
}: { value: ModelId; onChange: (m: ModelId) => void }) {
  return (
    <div>
      <label className="font-mono text-[11px] text-[#8A8A8A] uppercase tracking-widest block mb-3">
        Model
      </label>
      <div className="grid grid-cols-2 gap-2">
        {MODELS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            className={`font-mono text-[12px] px-3 py-2.5 border text-left transition-colors ${
              value === m
                ? 'border-[#0D0D0D] bg-[#0D0D0D] text-white'
                : 'border-[#E5E2DA] text-[#8A8A8A] hover:border-[#0D0D0D] hover:text-[#0D0D0D]'
            }`}
          >
            <span className="font-bold block">{m.toUpperCase()}</span>
            <span className="text-[10px] opacity-60 mt-0.5 truncate block">{MODEL_DESCRIPTIONS[m]}</span>
          </button>
        ))}
      </div>
    </div>
  )
})

// ─── InputSection ─────────────────────────────────────────────────────────────
// Owns its own model state + uncontrolled textarea refs.
// Parent only calls getValues() on submit — never reads on keystroke.
// React.memo prevents any parent re-render from touching this component.
const InputSection = memo(forwardRef<InputHandle, { onRun: () => void; loading: boolean }>(
  function InputSection({ onRun, loading }, ref) {
    const [model, setModel] = useState<ModelId>('auto')
    const [showSystem, setShowSystem] = useState(false)
    const promptRef = useRef<HTMLTextAreaElement>(null)
    const systemRef = useRef<HTMLTextAreaElement>(null)

    // Expose values to parent without causing re-renders
    useImperativeHandle(ref, () => ({
      getValues: () => ({
        prompt: promptRef.current?.value?.trim() ?? '',
        system: systemRef.current?.value?.trim() ?? '',
        model,
      }),
    }), [model])

    return (
      <div className="flex flex-col gap-5 p-4 md:p-6">
        {/* Model selector is isolated — changing it only re-renders ModelSelector + InputSection, not OutputSection */}
        <ModelSelector value={model} onChange={setModel} />

        {/* System prompt — uncontrolled */}
        <div>
          <button
            type="button"
            onClick={() => setShowSystem((s) => !s)}
            className="font-mono text-[11px] text-[#8A8A8A] uppercase tracking-widest flex items-center gap-2"
          >
            System prompt
            <span className={`transition-transform inline-block ${showSystem ? 'rotate-180' : ''}`}>▾</span>
          </button>
          {showSystem && (
            <textarea
              ref={systemRef}
              placeholder="You are a helpful assistant."
              rows={3}
              className="w-full mt-3 font-mono text-[12px] p-3 border border-[#E5E2DA] bg-[#F7F4EE] text-[#0D0D0D] resize-none focus:outline-none focus:border-[#0D0D0D] placeholder-[#8A8A8A]"
            />
          )}
        </div>

        {/* Prompt — uncontrolled, no value/onChange, no key */}
        <div>
          <label className="font-mono text-[11px] text-[#8A8A8A] uppercase tracking-widest block mb-3">
            Prompt
          </label>
          <textarea
            ref={promptRef}
            placeholder="What is an embedding?"
            rows={7}
            className="w-full font-mono text-[13px] p-3 border border-[#E5E2DA] text-[#0D0D0D] resize-none focus:outline-none focus:border-[#0D0D0D] placeholder-[#8A8A8A] bg-white"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onRun()
            }}
          />
          <p className="font-mono text-[10px] text-[#8A8A8A] mt-1.5">Cmd+Enter to run</p>
        </div>

        <button
          type="button"
          onClick={onRun}
          disabled={loading}
          className="w-full font-mono text-[13px] py-3 border border-[#0D0D0D] text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Running...' : 'Run →'}
        </button>
      </div>
    )
  }
))

// ─── OutputSection — isolated so response updates never touch InputSection ────
const OutputSection = memo(function OutputSection({
  trace, loading, error, response, rawJson, showRaw, setShowRaw,
}: {
  trace: TraceInfo | null
  loading: boolean
  error: string | null
  response: string
  rawJson: string | null
  showRaw: boolean
  setShowRaw: (v: boolean) => void
}) {
  return (
    <div className="flex flex-col min-h-[280px] md:h-full">
      {trace && (
        <div className="border-t md:border-t-0 border-b border-[#E5E2DA] px-4 py-2.5 flex items-center gap-3 bg-[#F7F4EE] flex-wrap shrink-0">
          <span className="font-mono text-[11px] text-[#0D0D0D] font-bold uppercase">{trace.model_used}</span>
          <span className="font-mono text-[11px] text-[#8A8A8A]">{trace.tokens_in}→{trace.tokens_out} tok</span>
          <span className="font-mono text-[11px] text-[#8A8A8A]">{trace.latency_ms}ms</span>
          <span className={`font-mono text-[10px] px-2 py-0.5 border ${
            trace.status === 'ok' ? 'border-[#2a6a3a] text-[#2a6a3a]' :
            trace.status === 'fallback' ? 'border-[#6a5a2a] text-[#6a5a2a]' :
            'border-[#6a2a2a] text-[#6a2a2a]'
          }`}>{trace.status}</span>
          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowRaw(!showRaw)}
              className="font-mono text-[11px] text-[#8A8A8A] hover:text-[#0D0D0D] transition-colors"
            >
              {showRaw ? 'Response' : 'Raw JSON'}
            </button>
            {response && (
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(showRaw ? rawJson || '' : response)}
                className="font-mono text-[11px] text-[#8A8A8A] hover:text-[#0D0D0D] transition-colors"
              >
                Copy
              </button>
            )}
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-[#0D0D0D] animate-pulse" />
            <span className="font-mono text-[13px] text-[#8A8A8A]">Routing request...</span>
          </div>
        )}
        {error && (
          <div className="border border-[#6a2a2a] p-4 font-mono text-[13px] text-[#6a2a2a]">{error}</div>
        )}
        {!loading && !error && !response && (
          <div className="text-center py-16">
            <p className="font-mono text-[13px] text-[#8A8A8A]">Response appears here.</p>
            <p className="font-mono text-[11px] text-[#E5E2DA] mt-2">Enter a prompt and click Run.</p>
          </div>
        )}
        {!loading && !error && response && !showRaw && (
          <div className="font-mono text-[13px] text-[#0D0D0D] leading-relaxed whitespace-pre-wrap">
            {response}
          </div>
        )}
        {!loading && rawJson && showRaw && (
          <pre className="font-mono text-[12px] text-[#0D0D0D] leading-relaxed whitespace-pre-wrap overflow-x-auto bg-[#F7F4EE] p-4 border border-[#E5E2DA]">
            {rawJson}
          </pre>
        )}
      </div>
    </div>
  )
})

// ─── Page — only holds output state, never touches InputSection on re-render ──
export default function RouterPage() {
  const inputRef = useRef<InputHandle>(null)

  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState('')
  const [trace, setTrace] = useState<TraceInfo | null>(null)
  const [rawJson, setRawJson] = useState<string | null>(null)
  const [showRaw, setShowRaw] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Stable reference — no dependencies that change on keystroke
  const handleRun = useCallback(async () => {
    if (!inputRef.current) return
    const { prompt, system, model } = inputRef.current.getValues()
    if (!prompt) return

    setLoading(true)
    setResponse('')
    setTrace(null)
    setRawJson(null)
    setError(null)

    const start = Date.now()
    try {
      const res = await fetch('/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model, system: system || undefined }),
      })
      const data = await res.json()
      const elapsed = Date.now() - start

      if (!res.ok) { setError(data.error || 'Request failed'); return }

      setRawJson(JSON.stringify(data, null, 2))
      setResponse(data.choices?.[0]?.message?.content || '')
      const traceInfo = {
        model_used: data.filament?.model_used || data.model || 'unknown',
        tokens_in: data.usage?.prompt_tokens || 0,
        tokens_out: data.usage?.completion_tokens || 0,
        latency_ms: data.filament?.latency_ms || elapsed,
        status: data.filament?.status || 'ok',
      }
      setTrace(traceInfo)
      saveTraceLog({
        model_requested: model,
        model_used: traceInfo.model_used,
        tokens_in: traceInfo.tokens_in,
        tokens_out: traceInfo.tokens_out,
        latency_ms: traceInfo.latency_ms,
        status: traceInfo.status,
        trace_id: data.id || crypto.randomUUID(),
        prompt,
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }, []) // empty deps — reads values from ref, not state

  return (
    <>
      <div className="border-b border-[#E5E2DA] px-4 md:px-6 py-4">
        <h1 className="font-[family-name:var(--font-barlow)] font-bold text-[20px] uppercase tracking-wide text-[#0D0D0D]">
          Unified Router
        </h1>
        <p className="font-mono text-[12px] text-[#8A8A8A] mt-0.5">Route any prompt to any model.</p>
      </div>

      {/* Stack on mobile, split on desktop */}
      <div className="flex flex-col md:flex-row md:h-[calc(100vh-108px)]">
        <div className="w-full md:w-[40%] md:border-r border-[#E5E2DA] md:overflow-y-auto">
          <InputSection ref={inputRef} onRun={handleRun} loading={loading} />
        </div>
        <div className="flex-1 md:overflow-hidden">
          <OutputSection
            trace={trace}
            loading={loading}
            error={error}
            response={response}
            rawJson={rawJson}
            showRaw={showRaw}
            setShowRaw={setShowRaw}
          />
        </div>
      </div>
    </>
  )
}
