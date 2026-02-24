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

  // 2.1 Restricción de Nodo PARALLEL (Debe ser antepenúltimo)
  const parallelNodes = nodes.filter(n => n.type === "parallel");
  parallelNodes.forEach(pNode => {
    const outEdges = edges.filter(e => e.source === pNode.id);
    if (outEdges.length === 0) {
      push("error", `PARALLEL "${pNode.data.label || pNode.id}" no tiene ramas de salida.`, pNode.id);
    } else {
      outEdges.forEach(edge => {
        const branchTargetNode = nodes.find(n => n.id === edge.target);
        if (!branchTargetNode) return;

        // El nodo destino no puede ser un END directamente ni puede ser otro PARALLEL. (PARALLEL -> NODO_X -> END)
        if (branchTargetNode.type === "end" || branchTargetNode.type === "parallel") {
          push("error", `La rama de PARALLEL "${pNode.data.label || pNode.id}" no puede conectar directamente a un END o PARALLEL. Debe haber una tarea intermedia.`, pNode.id);
          return;
        }

        // Revisar qué sale de ese branchTargetNode
        const targetOutEdges = edges.filter(e => e.source === branchTargetNode.id);
        if (targetOutEdges.length !== 1) {
          push("error", `El nodo "${branchTargetNode.data.label || branchTargetNode.id}" en una rama paralela debe apuntar a exactamente 1 nodo END.`, branchTargetNode.id);
        } else {
          const finalNode = nodes.find(n => n.id === targetOutEdges[0].target);
          if (finalNode?.type !== "end") {
            push("error", `El nodo "${branchTargetNode.data.label || branchTargetNode.id}" en una rama paralela DEBE apuntar a un nodo END para cumplir la regla de ser el antepenúltimo.`, branchTargetNode.id);
          }
        }
      });
    }
  });

  // 3. Configuración de Nodos
  nodes.forEach(n => issues.push(...validateNodeConfig(n, edges)));

  return {
    isValid: !issues.some(i => i.severity === "error"),
    issues
  };
};