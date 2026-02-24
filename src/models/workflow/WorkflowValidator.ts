import type { FlowNode, FlowEdge, ValidationReport, ValidationIssue } from "./types";
import { detectCycle, getReachability } from "./validation/GraphUtils";
import { validateNodeConfig } from "./validation/NodeRules";

export const validate = (nodes: FlowNode[], edges: FlowEdge[]): ValidationReport => {
  const issues: ValidationIssue[] = [];
  const push = (sev: ValidationIssue["severity"], msg: string, id?: string) => 
    issues.push({ severity: sev, message: msg, nodeId: id, action: id ? "focus" : "none" });

  // 1. Reglas Globales (START/END)
  const starts = nodes.filter(n => n.type === "start");
  if (starts.length !== 1) push("error", "Debe existir exactamente 1 nodo START.");
  
  const ends = nodes.filter(n => n.type === "end");
  if (ends.length !== 1) push("error", "Debe existir exactamente 1 nodo END.");

  // 2. Topología
  if (detectCycle(nodes, edges)) push("error", "No se permiten ciclos en el workflow.");

  const startId = starts[0]?.id || null;
  const reach = getReachability(startId, nodes, edges);
  nodes.filter(n => startId && !reach[n.id]).forEach(n => push("warning", `Nodo "${n.data.label}" inalcanzable.`, n.id));

  // 3. Configuración de Nodos
  nodes.forEach(n => issues.push(...validateNodeConfig(n, edges)));

  return {
    isValid: !issues.some(i => i.severity === "error"),
    issues
  };
};