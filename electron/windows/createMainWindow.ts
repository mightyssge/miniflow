// electron/windows/createMainWindow.ts
import { BrowserWindow, app } from "electron";
import path from "path";

export function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 800,
    autoHideMenuBar: true,
    title: "Miniflow",
    webPreferences: {
      // app.getAppPath() nos sitúa en la raíz del proyecto
      // Luego entramos a dist-electron donde están tus .js
      preload: path.join(app.getAppPath(), "dist-electron", "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.NODE_ENV !== "production") {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "dist/index.html"));
  }
}