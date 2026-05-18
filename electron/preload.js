const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  getData: () => ipcRenderer.invoke('getData'),
  saveData: (data) => ipcRenderer.invoke('saveData', data),
  openExternal: (url) => ipcRenderer.invoke('openExternal', url),
})
