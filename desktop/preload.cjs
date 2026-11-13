const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('tpDesktop', {
  hasApiKey: () => ipcRenderer.invoke('tp:key:has'),
  setApiKey: (key) => ipcRenderer.invoke('tp:key:set', key),
  clearApiKey: () => ipcRenderer.invoke('tp:key:clear'),
  testConnection: () => ipcRenderer.invoke('tp:key:test'),
  getDataDir: () => ipcRenderer.invoke('tp:data:dir'),
  openDataDir: () => ipcRenderer.invoke('tp:data:open'),
  checkUpdate: () => ipcRenderer.invoke('tp:update:check'),
  windowControls: {
    minimize: () => ipcRenderer.invoke('tp:win:minimize'),
    toggleMaximize: () => ipcRenderer.invoke('tp:win:maximize'),
    close: () => ipcRenderer.invoke('tp:win:close'),
  },
})
