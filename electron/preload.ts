import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('scriptState', {
  // Widget control
  hideWidget: () => ipcRenderer.send('widget:hide'),
  showWidget: () => ipcRenderer.send('widget:show'),
  openApp: () => ipcRenderer.send('app:open'),
  closeApp: () => ipcRenderer.send('app:close'),
  minimizeApp: () => ipcRenderer.send('app:minimize'),
  resizeWidget: (w: number, h: number) => ipcRenderer.send('widget:resize', w, h),

  // Clipboard
  readClipboard: (): Promise<string> => ipcRenderer.invoke('clipboard:read'),
  onClipboardChange: (cb: (text: string) => void) => {
    const handler = (_: any, text: string) => cb(text)
    ipcRenderer.on('clipboard:change', handler)
    return () => ipcRenderer.removeListener('clipboard:change', handler)
  },

  // Token estimation
  estimateTokens: (text: string, model: string) =>
    ipcRenderer.invoke('tokens:estimate', text, model),

  // Prompt quality analysis
  analyzePrompt: (text: string) =>
    ipcRenderer.invoke('prompt:analyze', text),

  // Model info
  getModels: () => ipcRenderer.invoke('models:list'),

  // Window type (widget vs app)
  getWindowType: (): string => {
    return window.location.hash.replace('#', '') || 'widget'
  },
})
