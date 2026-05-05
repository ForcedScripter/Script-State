import { app, BrowserWindow, globalShortcut, screen, ipcMain, Tray, Menu, nativeImage, clipboard } from 'electron'
import { join } from 'path'
import { registerIpcHandlers } from './ipc-handlers'

// ── Window Dimensions ──
const WIDGET_W = 290
const WIDGET_H = 210
const APP_W = 520
const APP_H = 700

let widgetWindow: BrowserWindow | null = null
let appWindow: BrowserWindow | null = null
let tray: Tray | null = null

// ── Clipboard Monitor ──
let lastClipboard = ''
let clipboardInterval: ReturnType<typeof setInterval> | null = null

function startClipboardMonitor() {
  clipboardInterval = setInterval(() => {
    try {
      const text = clipboard.readText().trim()
      if (text && text !== lastClipboard && text.length > 10) {
        lastClipboard = text
        // Send to widget renderer
        widgetWindow?.webContents.send('clipboard:change', text)
        appWindow?.webContents.send('clipboard:change', text)
      }
    } catch { /* ignore clipboard errors */ }
  }, 800)
}

function stopClipboardMonitor() {
  if (clipboardInterval) clearInterval(clipboardInterval)
}

// ── Widget Window (small floating box) ──
function createWidget() {
  const { width: sw } = screen.getPrimaryDisplay().workAreaSize

  widgetWindow = new BrowserWindow({
    width: WIDGET_W,
    height: WIDGET_H,
    x: sw - WIDGET_W - 16,
    y: 16,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    roundedCorners: true,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  })

  widgetWindow.setAlwaysOnTop(true, 'screen-saver', 1)

  const url = process.env.VITE_DEV_SERVER_URL
  if (url) {
    widgetWindow.loadURL(url + '#widget')
  } else {
    widgetWindow.loadFile(join(__dirname, '../dist/index.html'), { hash: 'widget' })
  }

  widgetWindow.on('closed', () => { widgetWindow = null })
}

// ── App Window (full analysis & settings) ──
function createAppWindow() {
  if (appWindow) {
    appWindow.show()
    appWindow.focus()
    return
  }

  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize

  appWindow = new BrowserWindow({
    width: APP_W,
    height: APP_H,
    x: Math.round((sw - APP_W) / 2),
    y: Math.round((sh - APP_H) / 2),
    frame: false,
    transparent: true,
    resizable: true,
    minWidth: 420,
    minHeight: 500,
    hasShadow: true,
    roundedCorners: true,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  const url = process.env.VITE_DEV_SERVER_URL
  if (url) {
    appWindow.loadURL(url + '#app')
  } else {
    appWindow.loadFile(join(__dirname, '../dist/index.html'), { hash: 'app' })
  }

  // Don't quit when app window closes — widget keeps running
  appWindow.on('closed', () => { appWindow = null })
}

// ── System Tray ──
function createTray() {
  const iconPath = join(__dirname, '../assets/icons/icon.png')
  let icon: Electron.NativeImage
  try {
    icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
  } catch {
    icon = nativeImage.createEmpty()
  }

  tray = new Tray(icon)
  tray.setToolTip('Script State — AI Coding Companion')

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Widget', click: () => { widgetWindow?.show(); widgetWindow?.focus() } },
    { label: 'Open Dashboard', click: () => createAppWindow() },
    { type: 'separator' },
    { label: 'Hide Widget', click: () => widgetWindow?.hide() },
    { type: 'separator' },
    { label: 'Quit Script State', click: () => { stopClipboardMonitor(); app.quit() } },
  ])

  tray.setContextMenu(contextMenu)
  tray.on('click', () => {
    if (widgetWindow?.isVisible()) {
      widgetWindow.hide()
    } else {
      widgetWindow?.show()
      widgetWindow?.focus()
    }
  })
  tray.on('double-click', () => createAppWindow())
}

// ── IPC Handlers ──
function setupIPC() {
  ipcMain.on('widget:hide', () => widgetWindow?.hide())
  ipcMain.on('widget:show', () => { widgetWindow?.show(); widgetWindow?.focus() })
  ipcMain.on('app:open', () => createAppWindow())
  ipcMain.on('app:close', () => appWindow?.close())
  ipcMain.on('app:minimize', () => appWindow?.minimize())

  ipcMain.on('widget:resize', (_, w: number, h: number) => {
    if (!widgetWindow) return
    const bounds = widgetWindow.getBounds()
    widgetWindow.setBounds({ x: bounds.x, y: bounds.y, width: w, height: h }, true)
  })

  // Get current clipboard
  ipcMain.handle('clipboard:read', () => clipboard.readText())
}

// ── App Lifecycle ──
app.whenReady().then(() => {
  createWidget()
  createTray()
  setupIPC()
  registerIpcHandlers()
  startClipboardMonitor()

  // Global hotkey: Ctrl+Shift+S
  globalShortcut.register('CommandOrControl+Shift+S', () => {
    if (widgetWindow?.isVisible()) {
      widgetWindow.hide()
    } else {
      widgetWindow?.show()
      widgetWindow?.focus()
    }
  })
})

// Keep app running in background (system tray) even when all windows close
app.on('window-all-closed', () => {
  // Don't quit — keep running in system tray
})

app.on('before-quit', () => {
  stopClipboardMonitor()
  globalShortcut.unregisterAll()
})

app.on('activate', () => {
  if (!widgetWindow) createWidget()
})
