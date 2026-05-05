/**
 * Browser-side fallback implementations for when Electron IPC is unavailable.
 * These mirror the logic in electron/services/ so the widget works in both
 * Electron and browser preview modes.
 */

import type { TokenEstimate, PromptAnalysis, ModelInfo } from '../types'

// --- Token Engine (browser fallback) ---
const MODELS: Array<ModelInfo & { avgCharsPerToken: number }> = [
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

function countTokens(text: string, cpt: number): number {
  if (!text?.trim()) return 0
  return Math.max(1, Math.ceil(text.trim().length / cpt))
}

function estOutput(input: number): number {
  if (input < 20) return Math.ceil(input * 3)
  if (input < 100) return Math.ceil(input * 2)
  if (input < 500) return Math.ceil(input * 1.5)
  return Math.ceil(input * 1.2)
}

export function estimateTokensFallback(text: string, modelId: string): TokenEstimate {
  const model = MODELS.find(m => m.id === modelId) || MODELS[0]
  const inputTokens = countTokens(text, model.avgCharsPerToken)
  const estimatedOutput = estOutput(inputTokens)
  const ic = (inputTokens / 1000) * model.inputCostPer1k
  const oc = (estimatedOutput / 1000) * model.outputCostPer1k
  return {
    inputTokens, estimatedOutput,
    cost: { input: Math.round(ic * 1e6) / 1e6, output: Math.round(oc * 1e6) / 1e6, total: Math.round((ic + oc) * 1e6) / 1e6 },
    contextUsage: inputTokens, maxContext: model.maxContext,
  }
}

export function getModelsFallback(): ModelInfo[] {
  return MODELS.map(({ avgCharsPerToken, ...m }) => m)
}

// --- Prompt Analyzer (browser fallback) ---
function scoreFactor(name: string, score: number, weight: number, tip: string) {
  return { name, score, weight, tip }
}

export function analyzePromptFallback(text: string): PromptAnalysis {
  if (!text?.trim()) return { score: 0, grade: '-', factors: [], suggestions: ['Start typing a prompt to see quality analysis'] }

  const factors = [
    (() => {
      const len = text.trim().length
      if (len < 15) return scoreFactor('Length', 10, 0.15, 'Prompt is too short — add more detail')
      if (len < 40) return scoreFactor('Length', 30, 0.15, 'Add specific requirements or constraints')
      if (len < 100) return scoreFactor('Length', 55, 0.15, 'Try adding examples or desired format')
      if (len < 300) return scoreFactor('Length', 80, 0.15, 'Ensure all key details are included')
      if (len < 800) return scoreFactor('Length', 95, 0.15, 'Excellent detail level')
      if (len < 2000) return scoreFactor('Length', 90, 0.15, 'Very detailed — stay focused')
      return scoreFactor('Length', 75, 0.15, 'Consider breaking into smaller prompts')
    })(),
    (() => {
      let s = 0
      ;[/\d+/, /["'].+?["']/, /\b(exactly|specifically|must|should)\b/i, /\b(e\.g\.|for example|such as)\b/i, /\b(step \d|first|second|then)\b/i, /\b(json|csv|html|code|list|table)\b/i]
        .forEach(r => { if (r.test(text)) s += 16 })
      s = Math.min(100, s)
      return scoreFactor('Specificity', s, 0.25, s < 50 ? 'Add numbers, examples, format requirements' : 'Good specificity')
    })(),
    (() => {
      let s = 20
      if (text.split('\n').filter(l => l.trim()).length > 1) s += 15
      if (/^[-*•]\s/m.test(text)) s += 20
      if (/^#+\s/m.test(text)) s += 15
      if (/^\d+[.)]\s/m.test(text)) s += 20
      if (/```/.test(text)) s += 15
      s = Math.min(100, s)
      return scoreFactor('Structure', s, 0.15, s < 50 ? 'Use bullets or numbered lists to organize' : 'Well structured')
    })(),
    (() => {
      const sents = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
      const avg = sents.length > 0 ? sents.reduce((a, s) => a + s.trim().split(/\s+/).length, 0) / sents.length : 0
      let s = avg >= 8 && avg <= 25 ? 90 : avg < 8 ? 60 : avg > 40 ? 35 : 70
      return scoreFactor('Clarity', Math.max(0, Math.min(100, s)), 0.2, s < 60 ? 'Use clearer, shorter sentences' : 'Good clarity')
    })(),
    (() => {
      let s = 10
      ;[/\b(create|generate|write|build|make|design|implement)\b/i, /\b(explain|describe|summarize|analyze)\b/i, /\b(fix|debug|solve|optimize|improve)\b/i, /\b(translate|convert|transform|format)\b/i, /\b(list|find|search|identify|extract)\b/i, /\?/]
        .forEach(p => { if (p.test(text)) s += 15 })
      s = Math.min(100, s)
      return scoreFactor('Intent', s, 0.25, s < 50 ? 'Start with a clear action verb' : 'Clear intent detected')
    })(),
  ]

  const tw = factors.reduce((a, f) => a + f.weight, 0)
  const score = Math.round(factors.reduce((a, f) => a + f.score * f.weight, 0) / tw)
  const grade = score >= 90 ? 'A+' : score >= 85 ? 'A' : score >= 80 ? 'A-' : score >= 75 ? 'B+' : score >= 70 ? 'B' : score >= 65 ? 'B-' : score >= 60 ? 'C+' : score >= 55 ? 'C' : score >= 50 ? 'C-' : score >= 40 ? 'D' : 'F'
  const suggestions = [...factors].sort((a, b) => a.score - b.score).slice(0, 3).filter(f => f.score < 80).map(f => f.tip)

  return { score, grade, factors: factors.map(f => ({ name: f.name, score: f.score, tip: f.tip })), suggestions }
}
