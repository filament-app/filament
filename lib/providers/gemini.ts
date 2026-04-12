import { GoogleGenerativeAI } from '@google/generative-ai'

function getClient() {
  return new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || 'placeholder')
}

interface GeminiCallParams {
  prompt: string
  system?: string
  maxTokens?: number
}

interface ProviderResponse {
  content: string
  tokens_in: number
  tokens_out: number
}

export async function callGemini(params: GeminiCallParams): Promise<ProviderResponse> {
  const { prompt, system, maxTokens = 1024 } = params

  const model = getClient().getGenerativeModel({
    model: 'gemini-1.5-pro',
    ...(system ? { systemInstruction: system } : {}),
    generationConfig: {
      maxOutputTokens: maxTokens,
    },
  })

  const result = await model.generateContent(prompt)
  const response = result.response
  const content = response.text()
  const usage = response.usageMetadata

  return {
    content,
    tokens_in: usage?.promptTokenCount || 0,
    tokens_out: usage?.candidatesTokenCount || 0,
  }
}
