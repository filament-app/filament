// Venice.ai — OpenAI-compatible API
// Base URL: https://api.venice.ai/api/v1
import OpenAI from 'openai'

function getClient() {
  return new OpenAI({
    apiKey: process.env.VENICE_API_KEY || 'placeholder',
    baseURL: 'https://api.venice.ai/api/v1',
  })
}

interface VeniceCallParams {
  prompt: string
  system?: string
  maxTokens?: number
}

interface ProviderResponse {
  content: string
  tokens_in: number
  tokens_out: number
}

export async function callVenice(params: VeniceCallParams): Promise<ProviderResponse> {
  const { prompt, system, maxTokens = 1024 } = params

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = []
  if (system) {
    messages.push({ role: 'system', content: system })
  }
  messages.push({ role: 'user', content: prompt })

  const response = await getClient().chat.completions.create({
    model: 'llama-3.3-70b',
    max_tokens: maxTokens,
    messages,
  })

  const content = response.choices[0]?.message?.content || ''
  const usage = response.usage

  return {
    content,
    tokens_in: usage?.prompt_tokens || 0,
    tokens_out: usage?.completion_tokens || 0,
  }
}
