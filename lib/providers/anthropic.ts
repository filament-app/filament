import Anthropic from '@anthropic-ai/sdk'

function getClient() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || 'placeholder',
  })
}

interface AnthropicCallParams {
  prompt: string
  system?: string
  maxTokens?: number
}

interface ProviderResponse {
  content: string
  tokens_in: number
  tokens_out: number
}

export async function callClaude(params: AnthropicCallParams): Promise<ProviderResponse> {
  const { prompt, system, maxTokens = 1024 } = params

  const messages: Anthropic.Messages.MessageParam[] = [
    { role: 'user', content: prompt }
  ]

  const response = await getClient().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    ...(system ? { system } : {}),
    messages,
  })

  const content = response.content
    .filter(block => block.type === 'text')
    .map(block => (block as Anthropic.Messages.TextBlock).text)
    .join('')

  return {
    content,
    tokens_in: response.usage.input_tokens,
    tokens_out: response.usage.output_tokens,
  }
}
