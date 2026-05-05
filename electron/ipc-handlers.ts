import { ipcMain } from 'electron'
import { estimateTokens, getModels } from './services/token-engine'
import { analyzePrompt } from './services/prompt-analyzer'

export function registerIpcHandlers() {
  ipcMain.handle('tokens:estimate', (_, text: string, model: string) => {
    return estimateTokens(text, model)
  })

  ipcMain.handle('prompt:analyze', (_, text: string) => {
    return analyzePrompt(text)
  })

  ipcMain.handle('models:list', () => {
    return getModels()
  })
}
