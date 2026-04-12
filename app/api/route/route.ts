import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveModel } from '@/lib/router'
import { callClaude } from '@/lib/providers/anthropic'
import { callGPT } from '@/lib/providers/openai'
import { callGemini } from '@/lib/providers/gemini'
import { ModelId } from '@/types'

async function validateApiKey(supabase: ReturnType<typeof createClient>, key: string) {
  // Look up by prefix for efficiency
  const prefix = key.substring(0, 10)
  const { data: keys } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key_prefix', prefix)
    .eq('revoked', false)
  
  if (!keys || keys.length === 0) return null
  
  // For demo/development: accept any key starting with fl-
  // In production: bcrypt verify each matching key
  const matchingKey = keys[0]
  return matchingKey
}

export async function POST(req: Request) {
  const startTime = Date.now()
  
  try {
    const body = await req.json()
    const { prompt, model = 'auto', system, tools = [], session_id } = body

    if (!prompt) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
    }

    // Auth
    const authHeader = req.headers.get('Authorization')
    const supabase = createClient()
    let userId: string | null = null
    let keyPrefix: string | null = null

    if (authHeader?.startsWith('Bearer ')) {
      const key = authHeader.replace('Bearer ', '')
      if (key.startsWith('fl-')) {
        const apiKey = await validateApiKey(supabase, key)
        if (apiKey) {
          userId = apiKey.user_id
          keyPrefix = apiKey.key_prefix
          // Update last_used
          await supabase.from('api_keys').update({ last_used: new Date().toISOString() }).eq('id', apiKey.id)
        }
      } else {
        // Try Supabase JWT
        const { data: { user } } = await supabase.auth.getUser(key)
        if (user) userId = user.id
      }
    }

    // Resolve model
    const selectedModel = resolveModel(model as ModelId, prompt)
    let content = ''
    let tokens_in = 0
    let tokens_out = 0
    let status: 'ok' | 'error' | 'fallback' = 'ok'
    let modelUsed = selectedModel
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
      }
    } catch (providerError: unknown) {
      // Fallback logic: try next model
      status = 'fallback'
      errorMsg = providerError instanceof Error ? providerError.message : 'Provider error'
      try {
        const fallback = selectedModel === 'claude' ? 'gpt' : 'claude'
        modelUsed = fallback
        if (fallback === 'gpt') {
          const result = await callGPT({ prompt, system })
          content = result.content
          tokens_in = result.tokens_in
          tokens_out = result.tokens_out
        } else {
          const result = await callClaude({ prompt, system })
          content = result.content
          tokens_in = result.tokens_in
          tokens_out = result.tokens_out
        }
      } catch {
        status = 'error'
        content = 'All providers failed. Check API keys.'
      }
    }

    const latency_ms = Date.now() - startTime
    const traceId = crypto.randomUUID()

    // Log trace
    if (userId) {
      await supabase.from('trace_logs').insert({
        id: traceId,
        user_id: userId,
        api_key_prefix: keyPrefix,
        session_id: session_id || null,
        model_requested: model,
        model_used: modelUsed,
        tokens_in,
        tokens_out,
        latency_ms,
        status,
        error: errorMsg,
      })
    }

    // Return OpenAI-compatible response
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
      // Filament-specific fields
      filament: {
        model_requested: model,
        model_used: modelUsed,
        latency_ms,
        status,
        trace_id: traceId,
      }
    })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
