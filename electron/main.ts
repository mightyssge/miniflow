import { app } from "electron";
import { createMainWindow } from "./windows/createMainWindow.js";
import { registerFileHandlers } from "./ipc/fileHandlers.js";
import { registerWorkflowHandlers } from "./ipc/workflowHandlers.js";

// Cuando Electron esté listo
app.whenReady().then(() => {

  // Crear ventana principal
  createMainWindow();

  // Registrar handlers IPC
  registerFileHandlers();
  registerWorkflowHandlers();

});

// Cerrar app cuando todas las ventanas se cierren (Windows/Linux)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
