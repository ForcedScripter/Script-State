import { create } from 'zustand'

interface WidgetState {
  clipboardMonitoring: boolean
  setClipboardMonitoring: (v: boolean) => void
}

export const useWidgetStore = create<WidgetState>((set) => ({
  clipboardMonitoring: true,
  setClipboardMonitoring: (v) => set({ clipboardMonitoring: v }),
}))
