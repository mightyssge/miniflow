// electron/services/workflowRunner.ts
import { spawn } from "child_process";
import { BrowserWindow, app } from "electron";
import path from "path";

export function runWorkflow(workflowJson: any): Promise<{ ok: boolean; exitCode: number; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const engineDir = path.join(app.getAppPath(), "dist-java-engine");
    
    // Lanzamos el proceso dentro de la carpeta correcta
    const process = spawn("java", ["-jar", "engine.jar"], {
      cwd: engineDir
    });
    
    const mainWindow = BrowserWindow.getAllWindows()[0];
    let fullStdout = "";
    let fullStderr = "";

    // Escribimos el JSON al motor
    process.stdin.write(JSON.stringify(workflowJson));
    process.stdin.end();

    process.stdout.on("data", (data) => {
      const chunk = data.toString();
      fullStdout += chunk;

      // Quitamos el prefijo manual de aquí porque el chunk ya lo trae de Java
      // Solo hacemos trim para evitar saltos de línea extra en la terminal de Node
      console.log(chunk.trim()); 
      
      if (mainWindow) {
        mainWindow.webContents.send("workflow-log-stdout", chunk);
      }
    });

    process.stderr.on("data", (data) => {
      const chunk = data.toString();
      fullStderr += chunk;

      // Aquí sí podemos mantener el prefijo si Java no lo pone en stderr
      console.error(`[JAVA-STDERR]: ${chunk.trim()}`);
      
      if (mainWindow) {
        mainWindow.webContents.send("workflow-log-stderr", chunk);
      }
    });

    process.on("close", (code) => {
      console.log(`[JAVA]: Proceso finalizado con código ${code}`);
      // Resolvemos con el objeto que espera tu ViewModel
      resolve({
        ok: code === 0,
        exitCode: code ?? 0,
        stdout: fullStdout,
        stderr: fullStderr
      });
    });

    process.on("error", (err) => {
      console.error("[JAVA]: Error al iniciar el proceso", err);
      reject(err);
    });
  });
}