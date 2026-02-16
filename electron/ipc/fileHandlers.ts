import { ipcMain, dialog } from "electron";
import fs from "fs";

/**
 * Registra los handlers IPC para abrir y guardar archivos JSON.
 * Permite que el renderer interactúe con el sistema de archivos
 * a través del proceso principal.
 */
export function registerFileHandlers() {

  // =============================
  // Guardar archivo JSON
  // =============================
  ipcMain.handle("save-json", async (_event, content) => {

    // Abre diálogo para elegir dónde guardar
    const { filePath } = await dialog.showSaveDialog({
      filters: [{ name: "JSON Files", extensions: ["json"] }],
    });

    // Si el usuario cancela
    if (!filePath) return null;

    // Guarda el contenido formateado
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));

    return filePath;
  });

  // =============================
  // Abrir archivo JSON
  // =============================
  ipcMain.handle("open-json", async () => {

    // Abre diálogo para seleccionar archivo
    const { filePaths } = await dialog.showOpenDialog({
      filters: [{ name: "JSON Files", extensions: ["json"] }],
      properties: ["openFile"],
    });

    if (filePaths.length === 0) return null;

    // Lee y devuelve el contenido parseado
    const data = fs.readFileSync(filePaths[0], "utf-8");
    return JSON.parse(data);
  });

}
