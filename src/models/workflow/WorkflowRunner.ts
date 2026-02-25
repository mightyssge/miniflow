// src/models/workflow/WorkflowRunner.ts
export const parseJavaExecutionLogs = (stdout: string, nodes: any[]) => {
  const steps: any[] = [];
  const lines = stdout.split('\n');

  lines.forEach((line) => {
    // Thread-safe isolation: Buscamos el ID inyectado explícitamente [JAVA-STDOUT]: [node-id]
    const idMatch = line.match(/\[JAVA-STDOUT\]:\s*\[([^\]]+)\]/);
    if (!idMatch) return; // Si no tiene un ID explícito, es un log global, lo ignoramos

    const nodeId = idMatch[1].trim();
    let step = steps.find(s => s.nodeId === nodeId);

    // Si es la primera vez que leemos algo de este nodo, revisamos si es la línea de inicialización "Nodo: ID [TIPO]"
    if (!step) {
      const typeMatch = line.match(/Nodo:\s+[^\s]+\s+\[([^\]]+)\]/);
      if (typeMatch) {
        step = {
          nodeId: nodeId,
          nodeType: typeMatch[1].trim(),
          status: "SUCCESS",
          nodeLabel: nodes.find(n => n.id === nodeId)?.data?.label || "Nodo",
          durationMs: 0, inputData: null, outputData: null, configData: null, details: null
        };
        steps.push(step);
      }
    }

    if (step) {
      if (line.includes("-> INPUT DATA:")) step.inputData = tryParse(line, "INPUT DATA:");
      if (line.includes("-> CONFIG:")) step.configData = tryParse(line, "CONFIG:");
      if (line.includes("OUTPUT DATA -->:")) step.outputData = tryParse(line, "OUTPUT DATA -->:");
      if (line.includes("NODE_EXEC_DETAILS -->:")) step.details = tryParse(line, "NODE_EXEC_DETAILS -->:");
      if (line.includes("Resultado: ERROR -->")) {
        step.status = "ERROR";
        step.error = line.split("Resultado: ERROR -->")[1]?.trim() || "Error en ejecución";
      }
      if (line.includes("DURATION -->:")) {
        const match = line.match(/DURATION -->:\s+(\d+)ms/);
        if (match) step.durationMs = parseInt(match[1], 10);
      }
    }
  });
  return steps;
};

const tryParse = (line: string, marker: string) => {
  try {
    const jsonStr = line.substring(line.indexOf(marker) + marker.length).trim();
    return jsonStr ? JSON.parse(jsonStr) : {};
  } catch { return null; }
};