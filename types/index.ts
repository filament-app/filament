export interface TraceLog {
  id: string
  user_id: string
  api_key_prefix: string | null
  session_id: string | null
  model_requested: string
  model_used: string
  tokens_in: number
  tokens_out: number
  latency_ms: number
  status: 'ok' | 'error' | 'fallback'
  error: string | null
  created_at: string
}

export interface ApiKey {
  id: string
  user_id: string
  key_hash: string
  key_prefix: string
  name: string | null
  created_at: string
  last_used: string | null
  revoked: boolean
}

export interface WiredTool {
  id: string
  user_id: string
  name: string
  endpoint: string
  schema: Record<string, unknown> | null
  auth_header: string | null
  active: boolean
  created_at: string
}

export interface Session {
  id: string
  user_id: string | null
  active_model: 'auto' | 'claude' | 'gpt' | 'gemini' | 'venice'
  context: Message[]
  created_at: string
  updated_at: string
}

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export type ModelId = 'claude' | 'gpt' | 'gemini' | 'venice' | 'auto'

export interface RouteRequest {
  prompt: string
  model?: ModelId
  system?: string
  tools?: WiredTool[]
  stream?: boolean
  session_id?: string
}

export interface RouteResponse {
  id: string
  model_used: ModelId
  content: string
  tokens_in: number
  tokens_out: number
  latency_ms: number
  status: 'ok' | 'error' | 'fallback'
}
