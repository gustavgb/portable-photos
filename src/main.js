/* globals MAIN_WINDOW_WEBPACK_ENTRY */

const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const { initialize } = require('./backend/utils/initialize')
const { setLibraryLocation } = require('./backend/utils/setLibraryLocation')
const { setMainWindow } = require('./backend/mainWindowState')
require('./backend/ipcMain')
require('./backend/server')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit()
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      preload: path.resolve(__dirname, 'preload.js')
    }
  })

  setMainWindow(mainWindow)

  mainWindow.maximize()
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Quit',
          click () {
            app.quit()
          }
        }
      ]
    },
    {
      label: 'Library',
      submenu: [
        {
          label: 'Set library location',
          click () {
            setLibraryLocation()
          }
        },
        {
          label: 'Scan library',
          click () {
            initialize()
          }
        }
      ]
    },
    {
      label: 'Developer',
      submenu: [
        {
          label: 'Reload',
          role: 'forceReload'
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click (item, focusedWindow) {
            if (focusedWindow) focusedWindow.webContents.toggleDevTools()
          }
        }
      ]
    }
  ])

  Menu.setApplicationMenu(menu)

  initialize()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
