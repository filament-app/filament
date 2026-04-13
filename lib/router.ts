import { ModelId } from '@/types'

export function selectModel(prompt: string): 'claude' | 'gpt' | 'gemini' | 'venice' {
  const lower = prompt.toLowerCase()
  
  // Code generation signals → GPT-4o
  const codeSignals = /```|function |const |let |var |def |class |import |export |<\/?[a-z]+>|=>|async |await /.test(prompt)
  if (codeSignals) return 'gpt'
  
  // Long-form reasoning → Claude
  if (prompt.length > 500) return 'claude'
  
  // Factual/search-heavy → Gemini
  const factualSignals = /what is|who is|when did|where is|how many|define |explain |list |fact|history|science/.test(lower)
  if (factualSignals) return 'gemini'
  
  // Default to Claude for general tasks
  if (prompt.length > 200) return 'claude'
  
  return 'gemini'
}

export function resolveModel(model: ModelId, prompt: string): 'claude' | 'gpt' | 'gemini' | 'venice' {
  if (model === 'auto') return selectModel(prompt)
  return model as 'claude' | 'gpt' | 'gemini' | 'venice'
}
