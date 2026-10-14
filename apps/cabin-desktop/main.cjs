const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const flow = require('./cabin-flow.js');
app.setName('Cabin');
app.setPath('userData', path.join(app.getPath('appData'), 'Soullab Cabin'));
if (!app.requestSingleInstanceLock()) { app.quit(); } else {
  let home;
  const homeUrl = pathToFileURL(path.join(__dirname, 'index.html')).href;
  const allowed = url => url.startsWith('http://127.0.0.1:43121/');
  function authorize(event) {
    if (!home || event.sender !== home.webContents ||
        event.senderFrame !== home.webContents.mainFrame ||
        event.senderFrame.url !== homeUrl) throw new Error('CABIN_CALLER_DENIED');
  }
  function createHome() {
    home = new BrowserWindow({ title: 'Cabin', width: 860, height: 680,
      backgroundColor: '#e7eee3',
      webPreferences: { preload: path.join(__dirname, 'preload.cjs'),
        nodeIntegration: false, contextIsolation: true, sandbox: true } });
    home.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    home.webContents.on('will-navigate', event => event.preventDefault());
    home.loadFile(path.join(__dirname, 'index.html'));
  }
  ipcMain.handle('cabin:readiness', event => { authorize(event); return flow.inspectCabin(); });
  ipcMain.handle('cabin:open', async event => {
    authorize(event);
    return flow.openCabin({ openView: async url => {
      const view = new BrowserWindow({ title: 'Cabin — local workspace', width: 1200, height: 850,
        webPreferences: { nodeIntegration: false, contextIsolation: true,
          sandbox: true, partition: 'persist:soullab-cabin-local' } });
      view.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
      view.webContents.on('will-navigate', (event, destination) => {
        if (!allowed(destination)) event.preventDefault();
      });
      view.webContents.session.webRequest.onBeforeRequest((request, callback) =>
        callback({ cancel: !allowed(request.url) }));
      try { await view.loadURL(url); } catch (error) { view.destroy(); throw error; }
    } });
  });
  app.on('second-instance', () => {
    if (home && !home.isDestroyed()) { home.restore(); home.focus(); }
  });
  app.whenReady().then(() => {
    if (process.platform === 'darwin') app.dock.setIcon(path.join(process.resourcesPath, 'Cabin.png'));
    createHome();
  });
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createHome(); });
  app.on('window-all-closed', () => app.quit());
}
