import { NextResponse } from 'next/server'
import { resolveModel } from '@/lib/router'
import { callClaude } from '@/lib/providers/anthropic'
import { callGPT } from '@/lib/providers/openai'
import { callGemini } from '@/lib/providers/gemini'
import { callVenice } from '@/lib/providers/venice'
import { ModelId } from '@/types'

export async function POST(req: Request) {
  const startTime = Date.now()

  try {
    const body = await req.json()
    const { prompt, model = 'auto', system, session_id } = body

    if (!prompt) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
    }

    // Accept any fl- key — no DB validation needed
    const authHeader = req.headers.get('Authorization')
    const key = authHeader?.replace('Bearer ', '') || ''
    const keyPrefix = key.substring(0, 10) || 'anonymous'

    // Resolve model
    const selectedModel: ModelId = resolveModel(model as ModelId, prompt)
    let modelUsed: ModelId = selectedModel
    let content = ''
    let tokens_in = 0
    let tokens_out = 0
    let status = 'ok'
    let errorMsg: string | null = null

    // Route to provider
    try {
      if (selectedModel === 'claude') {
        const result = await callClaude({ prompt, system })
        content = result.content
        tokens_in = result.tokens_in
        tokens_out = result.tokens_out
      } else if (selectedModel === 'gpt') {
        const result = await callGPT({ prompt, system })
        content = result.content
        tokens_in = result.tokens_in
        tokens_out = result.tokens_out
      } else if (selectedModel === 'gemini') {
        const result = await callGemini({ prompt, system })
        content = result.content
        tokens_in = result.tokens_in
        tokens_out = result.tokens_out
      } else if (selectedModel === 'venice') {
        const result = await callVenice({ prompt, system })
        content = result.content
        tokens_in = result.tokens_in
        tokens_out = result.tokens_out
      }
    } catch (providerError: unknown) {
      // Fallback chain: try claude, then venice
      status = 'fallback'
      errorMsg = providerError instanceof Error ? providerError.message : 'Provider error'
      try {
        const fallback: ModelId = selectedModel === 'claude' ? 'venice' : 'claude'
        modelUsed = fallback
        if (fallback === 'venice') {
          const result = await callVenice({ prompt, system })
          content = result.content
          tokens_in = result.tokens_in
          tokens_out = result.tokens_out
        } else {
          const result = await callClaude({ prompt, system })
          content = result.content
          tokens_in = result.tokens_in
          tokens_out = result.tokens_out
        }
        status = 'fallback'
      } catch {
        status = 'error'
        content = 'All providers failed. Check API keys in Vercel env vars.'
      }
    }

    const latency_ms = Date.now() - startTime
    const traceId = crypto.randomUUID()

    return NextResponse.json({
      id: traceId,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: modelUsed,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content,
          },
          finish_reason: 'stop',
        }
      ],
      usage: {
        prompt_tokens: tokens_in,
        completion_tokens: tokens_out,
        total_tokens: tokens_in + tokens_out,
      },
      filament: {
        model_requested: model,
        model_used: modelUsed,
        latency_ms,
        status,
        trace_id: traceId,
        key_prefix: keyPrefix,
        session_id: session_id || null,
        error: errorMsg,
      }
    })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
