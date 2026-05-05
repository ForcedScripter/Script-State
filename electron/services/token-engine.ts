/** Token Estimation Engine
 * Provides multi-model token counting using character/word heuristics
 * and cost estimation based on current provider pricing.
 */

interface ModelSpec {
  id: string
  name: string
  maxContext: number
  inputCostPer1k: number   // $ per 1K input tokens
  outputCostPer1k: number  // $ per 1K output tokens
  avgCharsPerToken: number
}

const MODELS: ModelSpec[] = [
  { id: 'gpt-4o', name: 'GPT-4o', maxContext: 128000, inputCostPer1k: 0.0025, outputCostPer1k: 0.01, avgCharsPerToken: 3.7 },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', maxContext: 128000, inputCostPer1k: 0.00015, outputCostPer1k: 0.0006, avgCharsPerToken: 3.7 },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', maxContext: 128000, inputCostPer1k: 0.01, outputCostPer1k: 0.03, avgCharsPerToken: 3.7 },
  { id: 'claude-4-opus', name: 'Claude 4 Opus', maxContext: 200000, inputCostPer1k: 0.015, outputCostPer1k: 0.075, avgCharsPerToken: 3.5 },
  { id: 'claude-4-sonnet', name: 'Claude 4 Sonnet', maxContext: 200000, inputCostPer1k: 0.003, outputCostPer1k: 0.015, avgCharsPerToken: 3.5 },
  { id: 'claude-3.5-haiku', name: 'Claude 3.5 Haiku', maxContext: 200000, inputCostPer1k: 0.0008, outputCostPer1k: 0.004, avgCharsPerToken: 3.5 },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', maxContext: 1000000, inputCostPer1k: 0.00125, outputCostPer1k: 0.01, avgCharsPerToken: 4.0 },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', maxContext: 1000000, inputCostPer1k: 0.0001, outputCostPer1k: 0.0004, avgCharsPerToken: 4.0 },
  { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', maxContext: 128000, inputCostPer1k: 0.0, outputCostPer1k: 0.0, avgCharsPerToken: 3.8 },
  { id: 'deepseek-v3', name: 'DeepSeek V3', maxContext: 128000, inputCostPer1k: 0.00014, outputCostPer1k: 0.00028, avgCharsPerToken: 3.6 },
]

function countTokens(text: string, charsPerToken: number): number {
  if (!text || text.trim().length === 0) return 0
  // Heuristic: use character count / avg chars per token
  // Adjusted for whitespace, punctuation, and special chars
  const cleaned = text.trim()
  const charCount = cleaned.length
  const tokens = Math.ceil(charCount / charsPerToken)
  return Math.max(1, tokens)
}

function estimateOutputTokens(inputTokens: number): number {
  // Heuristic: typical output is 1.5-3x input for conversational, 0.5x for simple queries
  if (inputTokens < 20) return Math.ceil(inputTokens * 3)
  if (inputTokens < 100) return Math.ceil(inputTokens * 2)
  if (inputTokens < 500) return Math.ceil(inputTokens * 1.5)
  return Math.ceil(inputTokens * 1.2)
}

export function estimateTokens(text: string, modelId: string) {
  const model = MODELS.find(m => m.id === modelId) || MODELS[0]
  const inputTokens = countTokens(text, model.avgCharsPerToken)
  const estimatedOutput = estimateOutputTokens(inputTokens)

  const inputCost = (inputTokens / 1000) * model.inputCostPer1k
  const outputCost = (estimatedOutput / 1000) * model.outputCostPer1k

  return {
    inputTokens,
    estimatedOutput,
    cost: {
      input: Math.round(inputCost * 1000000) / 1000000,
      output: Math.round(outputCost * 1000000) / 1000000,
      total: Math.round((inputCost + outputCost) * 1000000) / 1000000,
    },
    contextUsage: inputTokens,
    maxContext: model.maxContext,
  }
}

export function getModels() {
  return MODELS.map(m => ({
    id: m.id,
    name: m.name,
    maxContext: m.maxContext,
    inputCostPer1k: m.inputCostPer1k,
    outputCostPer1k: m.outputCostPer1k,
  }))
}
