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

  // 2.1 Restricción de Nodo PARALLEL (Modelo Fork/Join)
  const parallelNodes = nodes.filter(n => n.type === "parallel");
  parallelNodes.forEach(pNode => {
    const outEdges = edges.filter(e => e.source === pNode.id);
    if (outEdges.length === 0) {
      push("error", `PARALLEL "${pNode.data.label || pNode.id}" no tiene ramas de salida.`, pNode.id);
    }
    // Ejecutamos un BFS en cada rama que sale del nodo PARALLEL
    // El objetivo es asegurar que la ramificación no conduzca a la nada o al END directamente
    // Debe cruzarse obligatoriamente con un PARALLEL_JOIN.
    const queue = [...outEdges.map(e => e.target)];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const currentNode = nodes.find(n => n.id === currentId);
      if (!currentNode) continue;

      if (currentNode.type === "parallel_join") {
        // Encontramos la barrera de sincronización sana y salva para esta rama. Fin de exploración.
        continue;
      }

      const nextEdges = edges.filter(e => e.source === currentId);
      if (nextEdges.length === 0) {
        // Llegamos a un callejón sin salida (Ej. un nodo END u otro nodo suelto) que NO es Join.
        push("error", `Una de las ramas originadas en el nodo PARALLEL "${pNode.data.label || pNode.id}" finaliza prematuramente en "${currentNode.data.label || currentNode.id}" sin pasar por una Barrera Join.`, pNode.id);
        break;
      }

      nextEdges.forEach(e => queue.push(e.target));
    }
  });

  const joinNodes = nodes.filter(n => n.type === "parallel_join");
  joinNodes.forEach(jNode => {
    const inEdges = edges.filter(e => e.target === jNode.id);
    if (inEdges.length < 2) {
      push("warning", `Barrera "${jNode.data.label || jNode.id}" debería recibir 2 o más conexiones entrantes para ser un Join real.`, jNode.id);
    }
    const outEdges = edges.filter(e => e.source === jNode.id);
    if (outEdges.length === 0) {
      push("warning", `Barrera "${jNode.data.label || jNode.id}" bloquea el flujo si no tiene una salida conectada.`, jNode.id);
    }
  });

  // 3. Configuración de Nodos
  nodes.forEach(n => issues.push(...validateNodeConfig(n, edges)));

  return {
    isValid: !issues.some(i => i.severity === "error"),
    issues
  };
};