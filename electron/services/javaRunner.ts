import { spawn } from "child_process";

/**
 * Ejecuta el motor Java pasando un argumento (name).
 * 
 * - Lanza el JAR como proceso hijo.
 * - Captura la salida estándar (stdout).
 * - Devuelve el resultado cuando el proceso termina.
 */
export function runJavaTest(name: string): Promise<string> {

  return new Promise((resolve, reject) => {

    // Ejecuta: java -jar engine.jar <name>
    const process = spawn("java", ["-jar", "engine.jar", name]);

    let output = "";

    // Acumula la salida estándar del proceso Java
    process.stdout.on("data", (data) => {
      output += data.toString();
    });

    // Muestra errores en consola (stderr)
    process.stderr.on("data", (data) => {
      console.error("Java error:", data.toString());
    });

    // Cuando el proceso finaliza, resolvemos la promesa con la salida
    process.on("close", () => {
      resolve(output);
    });

    // Si ocurre un error al iniciar el proceso
    process.on("error", (err) => {
      reject(err);
    });

  });

}
