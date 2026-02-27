import { spawn } from "child_process";
import { BrowserWindow, app } from "electron";
import path from "path";

export function runWorkflow(workflowJson: any): Promise<{ ok: boolean; exitCode: number; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const engineDir = app.isPackaged
      ? path.join(process.resourcesPath, "dist-java-engine")
      : path.join(app.getAppPath(), "dist-java-engine");

    const engineProcess = spawn("java", ["-jar", "engine.jar"], {
      cwd: engineDir
    });

    const mainWindow = BrowserWindow.getAllWindows()[0];
    let fullStdout = "";
    let fullStderr = "";
    let resolved = false; // Flag para evitar múltiples resoluciones

    const payload = typeof workflowJson === "string" ? workflowJson : JSON.stringify(workflowJson);
    engineProcess.stdin.write(payload);
    engineProcess.stdin.end();

    engineProcess.stdout.on("data", (data) => {
      const chunk = data.toString();
      fullStdout += chunk;
      console.log(chunk.trim());

      if (mainWindow) {
        mainWindow.webContents.send("workflow-log-stdout", chunk);
      }

      // EAGER RESOLUTION: Si detectamos el JSON de finalización, resolvemos ya
      if (chunk.includes("WORKFLOW_FINISHED") && !resolved) {
        try {
          const jsonStart = chunk.indexOf('{"event": "WORKFLOW_FINISHED"');
          const jsonStr = chunk.substring(jsonStart).trim();
          const eventData = JSON.parse(jsonStr);

          resolved = true;
          resolve({
            ok: eventData.status === "SUCCESS",
            exitCode: 0,
            stdout: fullStdout,
            stderr: fullStderr
          });
        } catch (e) {
          // Si el parseo falla, el 'close' actuará como fallback
        }
      }
    });

    engineProcess.stderr.on("data", (data) => {
      const chunk = data.toString();
      fullStderr += chunk;
      console.error(`[JAVA-STDERR]: ${chunk.trim()}`);

      if (mainWindow) {
        mainWindow.webContents.send("workflow-log-stderr", chunk);
      }
    });

    engineProcess.on("close", (code) => {
      if (!resolved) {
        console.log(`[JAVA]: Proceso finalizado vía close con código ${code}`);
        resolve({
          ok: code === 0,
          exitCode: code ?? 0,
          stdout: fullStdout,
          stderr: fullStderr
        });
      }
    });

    engineProcess.on("error", (err) => {
      console.error("[JAVA]: Error al iniciar el proceso", err);
      reject(err);
    });
  });
}