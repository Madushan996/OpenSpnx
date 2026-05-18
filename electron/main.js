const { app, BrowserWindow, ipcMain, shell } = require('electron')
const path = require('path')
const fs = require('fs')

const isDev = !app.isPackaged

function getDataPath() {
  return path.join(app.getPath('userData'), 'budget-data.json')
}

function loadData() {
  const dataPath = getDataPath()
  if (!fs.existsSync(dataPath)) {
    const defaultData = {
      accounts: [{ id: 'cash', name: 'Cash', balance: 0, type: 'cash' }],
      expenses: [],
    }
    fs.writeFileSync(dataPath, JSON.stringify(defaultData, null, 2))
    return defaultData
  }
  try {
    return JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  } catch {
    return {
      accounts: [{ id: 'cash', name: 'Cash', balance: 0, type: 'cash' }],
      expenses: [],
    }
  }
}

function saveData(data) {
  fs.writeFileSync(getDataPath(), JSON.stringify(data, null, 2))
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
    title: 'OpenSpnx',
  })

  win.once('ready-to-show', () => win.show())
  win.setMenuBarVisibility(false)

  if (isDev) {
    win.loadURL('http://localhost:5173')
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

ipcMain.handle('getData', () => loadData())
ipcMain.handle('saveData', (_, data) => {
  saveData(data)
  return { success: true }
})
ipcMain.handle('openExternal', (_, url) => {
  shell.openExternal(url)
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
