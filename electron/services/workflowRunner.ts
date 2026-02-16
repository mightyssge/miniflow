import { spawn } from "child_process";

/**
 * Ejecuta el motor Java enviando un workflow completo en formato JSON.
 * 
 * - Lanza el JAR como proceso hijo.
 * - Envía el workflow por stdin.
 * - Captura la salida estándar (stdout).
 * - Resuelve la promesa cuando el proceso finaliza.
 */
export function runWorkflow(workflowJson: any): Promise<string> {

  return new Promise((resolve, reject) => {

    // Ejecuta: java -jar engine.jar
    const process = spawn("java", ["-jar", "engine.jar"]);

    let output = "";

    // Envía el JSON al proceso Java a través de stdin
    process.stdin.write(JSON.stringify(workflowJson));
    process.stdin.end(); // Importante: cerrar stdin para que Java continúe

    // Acumula la salida estándar del proceso
    process.stdout.on("data", (data) => {
      output += data.toString();
    });

    // Cuando el proceso termina, resolvemos con la salida
    process.on("close", () => {
      resolve(output);
    });

    // Si ocurre un error al iniciar o ejecutar el proceso
    process.on("error", reject);

  });

}
