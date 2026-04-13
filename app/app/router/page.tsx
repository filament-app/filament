'use client'

import { useState, useCallback } from 'react'

function saveTraceLog(data: {
  model_requested: string
  model_used: string
  tokens_in: number
  tokens_out: number
  latency_ms: number
  status: string
  trace_id: string
  prompt: string
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

type ModelId = 'auto' | 'claude' | 'gpt' | 'gemini'

interface TraceInfo {
  model_used: string
  tokens_in: number
  tokens_out: number
  latency_ms: number
  status: string
}

const MODEL_DESCRIPTIONS: Record<ModelId, string> = {
  auto: 'Auto-select',
  claude: 'claude-sonnet-4',
  gpt: 'gpt-4o',
  gemini: 'gemini-1.5-pro',
}

const MODELS: ModelId[] = ['auto', 'claude', 'gpt', 'gemini']

export default function RouterPage() {
  const [model, setModel] = useState<ModelId>('auto')
  const [prompt, setPrompt] = useState('')
  const [system, setSystem] = useState('')
  const [showSystem, setShowSystem] = useState(false)
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState('')
  const [trace, setTrace] = useState<TraceInfo | null>(null)
  const [rawJson, setRawJson] = useState<string | null>(null)
  const [showRaw, setShowRaw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mobileTab, setMobileTab] = useState<'input' | 'output'>('input')

  const handleRun = useCallback(async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setResponse('')
    setTrace(null)
    setRawJson(null)
    setError(null)
    setMobileTab('output')

    const start = Date.now()

    try {
      const res = await fetch('/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          model,
          system: system.trim() || undefined,
        }),
      })

      const data = await res.json()
      const elapsed = Date.now() - start

      if (!res.ok) {
        setError(data.error || 'Request failed')
        return
      }

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
        prompt: prompt.trim(),
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }, [prompt, model, system])

  // ── Input panel JSX (inline — NOT a sub-component to avoid remount) ──
  const inputPanel = (
    <div className="flex flex-col gap-5 p-4 md:p-6 h-full overflow-y-auto">
      {/* Model selector */}
      <div>
        <label className="font-mono text-[11px] text-[#8A8A8A] uppercase tracking-widest block mb-3">
          Model
        </label>
        <div className="grid grid-cols-2 gap-2">
          {MODELS.map((m) => (
            <button
              key={m}
              onClick={() => setModel(m)}
              className={`font-mono text-[12px] px-3 py-2.5 border text-left transition-colors ${
                model === m
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

      {/* System prompt */}
      <div>
        <button
          onClick={() => setShowSystem(!showSystem)}
          className="font-mono text-[11px] text-[#8A8A8A] uppercase tracking-widest flex items-center gap-2"
        >
          System prompt
          <span className={`transition-transform inline-block ${showSystem ? 'rotate-180' : ''}`}>▾</span>
        </button>
        {showSystem && (
          <textarea
            value={system}
            onChange={(e) => setSystem(e.target.value)}
            placeholder="You are a helpful assistant."
            rows={3}
            className="w-full mt-3 font-mono text-[12px] p-3 border border-[#E5E2DA] bg-[#F7F4EE] text-[#0D0D0D] resize-none focus:outline-none focus:border-[#0D0D0D] placeholder-[#8A8A8A]"
          />
        )}
      </div>

      {/* Prompt */}
      <div className="flex-1 flex flex-col">
        <label className="font-mono text-[11px] text-[#8A8A8A] uppercase tracking-widest block mb-3">
          Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="What is an embedding?"
          rows={6}
          className="w-full flex-1 font-mono text-[13px] p-3 border border-[#E5E2DA] text-[#0D0D0D] resize-none focus:outline-none focus:border-[#0D0D0D] placeholder-[#8A8A8A] bg-white"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleRun()
          }}
        />
        <p className="font-mono text-[10px] text-[#8A8A8A] mt-1">Cmd+Enter to run</p>
      </div>

      <button
        onClick={handleRun}
        disabled={loading || !prompt.trim()}
        className="w-full font-mono text-[13px] py-3 border border-[#0D0D0D] text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Running...' : 'Run →'}
      </button>
    </div>
  )

  // ── Output panel JSX (inline) ──
  const outputPanel = (
    <div className="flex flex-col h-full">
      {trace && (
        <div className="border-b border-[#E5E2DA] px-4 py-2.5 flex items-center gap-3 bg-[#F7F4EE] flex-wrap">
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
              onClick={() => setShowRaw(!showRaw)}
              className="font-mono text-[11px] text-[#8A8A8A] hover:text-[#0D0D0D] transition-colors"
            >
              {showRaw ? 'Response' : 'Raw JSON'}
            </button>
            {response && (
              <button
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
          <div className="border border-[#6a2a2a] p-4 font-mono text-[13px] text-[#6a2a2a]">
            {error}
          </div>
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

  return (
    <>
      {/* Page header */}
      <div className="border-b border-[#E5E2DA] px-4 md:px-6 py-4">
        <h1 className="font-[family-name:var(--font-barlow)] font-bold text-[20px] uppercase tracking-wide text-[#0D0D0D]">
          Unified Router
        </h1>
        <p className="font-mono text-[12px] text-[#8A8A8A] mt-0.5">Route any prompt to any model.</p>
      </div>

      {/* Mobile tab switcher */}
      <div className="md:hidden flex border-b border-[#E5E2DA]">
        <button
          onClick={() => setMobileTab('input')}
          className={`flex-1 font-mono text-[12px] py-2.5 border-r border-[#E5E2DA] transition-colors ${
            mobileTab === 'input' ? 'bg-[#0D0D0D] text-white' : 'text-[#8A8A8A]'
          }`}
        >
          Input
        </button>
        <button
          onClick={() => setMobileTab('output')}
          className={`flex-1 font-mono text-[12px] py-2.5 transition-colors ${
            mobileTab === 'output' ? 'bg-[#0D0D0D] text-white' : 'text-[#8A8A8A]'
          }`}
        >
          {loading ? 'Running...' : `Output${trace ? ' ✓' : ''}`}
        </button>
      </div>

      {/* Mobile: show one panel at a time using visibility, NOT conditional render */}
      <div className="md:hidden" style={{ minHeight: 'calc(100vh - 160px)' }}>
        <div className={mobileTab === 'input' ? 'block' : 'hidden'}>
          {inputPanel}
        </div>
        <div className={mobileTab === 'output' ? 'block' : 'hidden'}>
          {outputPanel}
        </div>
      </div>

      {/* Desktop: split pane */}
      <div className="hidden md:flex" style={{ height: 'calc(100vh - 108px)' }}>
        <div className="w-[40%] border-r border-[#E5E2DA] flex flex-col overflow-y-auto">
          {inputPanel}
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          {outputPanel}
        </div>
      </div>
    </>
  )
}
