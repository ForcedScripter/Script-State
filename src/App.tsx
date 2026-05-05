import { useEffect, useState } from 'react'
import { Widget } from './components/widget/Widget'
import { AppDashboard } from './components/app/AppDashboard'
import { useMetricsStore } from './stores/useMetricsStore'
import { useWidgetStore } from './stores/useWidgetStore'
import './index.css'

export default function App() {
  const [view, setView] = useState<'widget' | 'app'>('widget')
  const loadModels = useMetricsStore((s) => s.loadModels)
  const setDetectedText = useMetricsStore((s) => s.setDetectedText)
  const clipboardMonitoring = useWidgetStore((s) => s.clipboardMonitoring)

  // Determine view from URL hash
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash === 'app') setView('app')
    else setView('widget')
  }, [])

  // Load models on mount
  useEffect(() => { loadModels() }, [loadModels])

  // Listen for clipboard changes from Electron
  useEffect(() => {
    if (!clipboardMonitoring) return

    if (window.scriptState?.onClipboardChange) {
      const unsub = window.scriptState.onClipboardChange((text) => {
        setDetectedText(text, 'clipboard')
      })
      return unsub
    }

    // Browser fallback: poll clipboard via navigator API
    let running = true
    let lastText = ''
    const poll = async () => {
      while (running) {
        try {
          const text = await navigator.clipboard.readText()
          if (text && text !== lastText && text.trim().length > 10) {
            lastText = text
            setDetectedText(text, 'clipboard')
          }
        } catch { /* clipboard access denied in browser is normal */ }
        await new Promise((r) => setTimeout(r, 1000))
      }
    }
    poll()
    return () => { running = false }
  }, [clipboardMonitoring, setDetectedText])

  return view === 'widget' ? <Widget /> : <AppDashboard />
}
