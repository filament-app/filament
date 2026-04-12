import OpenAI from 'openai'

function getClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'placeholder',
  })
}

interface OpenAICallParams {
  prompt: string
  system?: string
  maxTokens?: number
}

interface ProviderResponse {
  content: string
  tokens_in: number
  tokens_out: number
}

export async function callGPT(params: OpenAICallParams): Promise<ProviderResponse> {
  const { prompt, system, maxTokens = 1024 } = params

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = []
  if (system) {
    messages.push({ role: 'system', content: system })
  }
  messages.push({ role: 'user', content: prompt })

  const response = await getClient().chat.completions.create({
    model: 'gpt-4o',
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
