// src/models/workflow/WorkflowRunner.ts
import type { MiniflowNode, ExecutionStep } from './coreTypes';

export const parseJavaExecutionLogs = (stdout: string, nodes: MiniflowNode[]): ExecutionStep[] => {
  const steps: ExecutionStep[] = [];

  stdout.split('\n').forEach((line) => {
    const idMatch = line.match(/\[JAVA-STDOUT\]:\s*\[([^\]]+)\]/);
    if (!idMatch) return;

    const nodeId = idMatch[1].trim();
    let step = steps.find(s => s.nodeId === nodeId);

    if (!step) {
      step = initializeStep(line, nodeId, nodes);
      if (step) steps.push(step);
    }

    if (step) {
      applyLineToStep(step, line);
    }
  });

  return steps;
};

const initializeStep = (line: string, nodeId: string, nodes: MiniflowNode[]): ExecutionStep | undefined => {
  const typeMatch = line.match(/Nodo:\s+[^\s]+\s+\[([^\]]+)\]/);
  if (!typeMatch) return undefined;
  return {
    nodeId,
    nodeType: typeMatch[1].trim(),
    status: "SUCCESS",
    nodeLabel: nodes.find(n => n.id === nodeId)?.data?.label || "Nodo",
    durationMs: 0,
    inputData: null,
    outputData: null,
    configData: null,
    details: null
  };
};

const applyLineToStep = (step: ExecutionStep, line: string) => {
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
};

const tryParse = (line: string, marker: string) => {
  try {
    const jsonStr = line.substring(line.indexOf(marker) + marker.length).trim();
    return jsonStr ? JSON.parse(jsonStr) : {};
  } catch { return null; }
};