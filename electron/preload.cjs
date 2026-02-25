const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', {
  downloadVideo: (url, filename) => ipcRenderer.send('download-video', { url, filename }),
  downloadFile: (url, filename) => ipcRenderer.send('download-file', { url, filename })
});
