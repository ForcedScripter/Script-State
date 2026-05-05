import { create } from 'zustand'

interface SettingsState {
  showTokens: boolean
  showQuality: boolean
  showContext: boolean
  showCost: boolean
  showLatency: boolean
  showThroughput: boolean
  toggle: (key: keyof Omit<SettingsState, 'toggle'>) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  showTokens: true,
  showQuality: true,
  showContext: true,
  showCost: true,
  showLatency: true,
  showThroughput: false,
  toggle: (key) => set((s) => ({ [key]: !s[key] } as any)),
}))
