import { ipcMain } from "electron";
import { runJavaTest } from "../services/javaRunner.js";
import { runWorkflow } from "../services/workflowRunner.js";

/**
 * Registra los handlers IPC relacionados con ejecución de workflows.
 * 
 * Estos handlers delegan la lógica real a los servicios,
 * manteniendo este módulo solo como capa de comunicación IPC.
 */
export function registerWorkflowHandlers() {

  // Ejecuta un workflow de prueba (ej: crear carpeta)
  ipcMain.handle("run-java-test", async (_event, name) => {
    return await runJavaTest(name);
  });

  // Ejecuta un workflow completo enviando el JSON al motor Java
  ipcMain.handle("run-workflow", async (_event, workflowJson) => {
    return await runWorkflow(workflowJson);
  });

}
