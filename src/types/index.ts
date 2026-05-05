export interface TokenEstimate {
  inputTokens: number
  estimatedOutput: number
  cost: { input: number; output: number; total: number }
  contextUsage: number
  maxContext: number
}

export interface PromptAnalysis {
  score: number
  grade: string
  factors: Array<{ name: string; score: number; tip: string }>
  suggestions: string[]
}

export interface ModelInfo {
  id: string
  name: string
  maxContext: number
  inputCostPer1k: number
  outputCostPer1k: number
}

export type WindowType = 'widget' | 'app'

// Extend Window for the preload API
declare global {
  interface Window {
    scriptState: {
      hideWidget: () => void
      showWidget: () => void
      openApp: () => void
      closeApp: () => void
      minimizeApp: () => void
      resizeWidget: (w: number, h: number) => void
      readClipboard: () => Promise<string>
      onClipboardChange: (cb: (text: string) => void) => () => void
      estimateTokens: (text: string, model: string) => Promise<TokenEstimate>
      analyzePrompt: (text: string) => Promise<PromptAnalysis>
      getModels: () => Promise<ModelInfo[]>
      getWindowType: () => string
    }
  }
}
