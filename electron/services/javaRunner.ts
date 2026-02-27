import { spawn } from "child_process";
import path from "path";
import { app } from "electron";

export function runJavaTest(name: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Ruta absoluta a la carpeta del motor
    const engineDir = app.isPackaged
      ? path.join(process.resourcesPath, "dist-java-engine")
      : path.join(app.getAppPath(), "dist-java-engine");

    // Ejecuta: java -jar engine.jar <name> dentro de esa carpeta
    const engineProcess = spawn("java", ["-jar", "engine.jar", name], {
      cwd: engineDir
    });

    let output = "";
    engineProcess.stdout.on("data", (data) => { output += data.toString(); });
    engineProcess.stderr.on("data", (data) => { console.error("Java error:", data.toString()); });

    engineProcess.on("close", () => resolve(output));
    engineProcess.on("error", (err) => reject(err));
  });
}