const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

ipcMain.on('download-video', (event, { url, filename }) => {
  if (!url || typeof url !== 'string') return;

  const webContents = event.sender;
  const session = webContents.session;

  const safeFilename = path.basename(String(filename || 'video.mp4'));
  const savePath = path.join(app.getPath('downloads'), safeFilename);

  const matchesRequestedUrl = (downloadItem) => {
    try {
      if (typeof downloadItem.getURLChain === 'function') {
        const chain = downloadItem.getURLChain();
        if (Array.isArray(chain) && chain.includes(url)) return true;
      }
    } catch (e) { }

    try {
      if (typeof downloadItem.getURL === 'function') {
        return downloadItem.getURL() === url;
      }
    } catch (e) { }

    return false;
  };

  const onWillDownload = (e, item) => {
    try {
      if (!matchesRequestedUrl(item)) return;
      session.removeListener('will-download', onWillDownload);
      clearTimeout(cleanupTimer);
      item.setSavePath(savePath);
    } catch (err) {
      session.removeListener('will-download', onWillDownload);
      clearTimeout(cleanupTimer);
    }
  };

  const cleanupTimer = setTimeout(() => {
    session.removeListener('will-download', onWillDownload);
  }, 30_000);

  session.on('will-download', onWillDownload);
  try {
    webContents.downloadURL(url);
  } catch (err) {
    session.removeListener('will-download', onWillDownload);
    clearTimeout(cleanupTimer);
  }
});

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Sora2 Manager",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'), 
    },
    autoHideMenuBar: true,
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
};

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
