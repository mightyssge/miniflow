import { spawn } from "child_process";
import path from "path";
import { app } from "electron";

export function runJavaTest(name: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Ruta absoluta a la carpeta del motor
    const engineDir = path.join(app.getAppPath(), "dist-java-engine");
    
    // Ejecuta: java -jar engine.jar <name> dentro de esa carpeta
    const process = spawn("java", ["-jar", "engine.jar", name], {
      cwd: engineDir
    });

    let output = "";
    process.stdout.on("data", (data) => { output += data.toString(); });
    process.stderr.on("data", (data) => { console.error("Java error:", data.toString()); });

    process.on("close", () => resolve(output));
    process.on("error", (err) => reject(err));
  });
}