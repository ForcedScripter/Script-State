import { create } from 'zustand'
import type { TokenEstimate, PromptAnalysis, ModelInfo } from '../types'
import { estimateTokensFallback, analyzePromptFallback, getModelsFallback } from '../services/fallback'

const hasIPC = () => typeof window !== 'undefined' && !!window.scriptState?.estimateTokens

interface MetricsState {
  detectedText: string
  selectedModel: string
  models: ModelInfo[]
  tokenEstimate: TokenEstimate | null
  promptAnalysis: PromptAnalysis | null
  isAnalyzing: boolean
  source: string // 'clipboard' | 'manual' | 'idle'
  lastUpdated: number
  setDetectedText: (text: string, source?: string) => void
  setSelectedModel: (model: string) => void
  updateMetrics: () => Promise<void>
  loadModels: () => Promise<void>
}

export const useMetricsStore = create<MetricsState>((set, get) => ({
  detectedText: '',
  selectedModel: 'gpt-4o',
  models: [],
  tokenEstimate: null,
  promptAnalysis: null,
  isAnalyzing: false,
  source: 'idle',
  lastUpdated: 0,

  setDetectedText: (text, source = 'clipboard') => {
    set({ detectedText: text, source })
    get().updateMetrics()
  },

  setSelectedModel: (model) => {
    set({ selectedModel: model })
    if (get().detectedText) get().updateMetrics()
  },

  loadModels: async () => {
    try {
      const models = hasIPC() ? await window.scriptState.getModels() : getModelsFallback()
      set({ models })
    } catch {
      set({ models: getModelsFallback() })
    }
  },

  updateMetrics: async () => {
    const { detectedText, selectedModel } = get()
    if (!detectedText.trim()) {
      set({ tokenEstimate: null, promptAnalysis: null, source: 'idle' })
      return
    }
    set({ isAnalyzing: true })
    try {
      let tokenEstimate: TokenEstimate
      let promptAnalysis: PromptAnalysis

      if (hasIPC()) {
        ;[tokenEstimate, promptAnalysis] = await Promise.all([
          window.scriptState.estimateTokens(detectedText, selectedModel),
          window.scriptState.analyzePrompt(detectedText),
        ])
      } else {
        tokenEstimate = estimateTokensFallback(detectedText, selectedModel)
        promptAnalysis = analyzePromptFallback(detectedText)
      }

      set({ tokenEstimate, promptAnalysis, isAnalyzing: false, lastUpdated: Date.now() })
    } catch {
      set({ isAnalyzing: false })
    }
  },
}))
