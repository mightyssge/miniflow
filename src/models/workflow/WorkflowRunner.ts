// src/models/workflow/WorkflowRunner.ts
export const parseJavaExecutionLogs = (stdout: string, nodes: any[]) => {
  const steps: any[] = [];
  const lines = stdout.split('\n');
  let currentStep: any = null;

  lines.forEach((line) => {
    const nodeMatch = line.match(/Nodo:\s+([a-zA-Z0-9\-]+)\s+\[([^\]]+)\]/);
    if (nodeMatch) {
      currentStep = {
        nodeId: nodeMatch[1].trim(),
        nodeType: nodeMatch[2].trim(),
        status: "SUCCESS",
        nodeLabel: nodes.find(n => n.id === nodeMatch[1].trim())?.data?.label || "Nodo",
        durationMs: 0, inputData: null, outputData: null, configData: null, details: null
      };
      steps.push(currentStep);
    } else if (currentStep) {
      if (line.includes("-> INPUT DATA:")) currentStep.inputData = tryParse(line, "INPUT DATA:");
      if (line.includes("-> CONFIG:")) currentStep.configData = tryParse(line, "CONFIG:");
      if (line.includes("OUTPUT DATA -->:")) currentStep.outputData = tryParse(line, "OUTPUT DATA -->:");
      if (line.includes("NODE_EXEC_DETAILS -->:")) currentStep.details = tryParse(line, "NODE_EXEC_DETAILS -->:");
      if (line.includes("error\":")) {
        currentStep.status = "ERROR";
        currentStep.error = "Error in node execution";
      }
      if (line.includes("DURATION -->:")) {
        const match = line.match(/DURATION -->:\s+(\d+)ms/);
        if (match) currentStep.durationMs = parseInt(match[1], 10);
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