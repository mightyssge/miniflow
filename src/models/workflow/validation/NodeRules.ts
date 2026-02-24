import type { FlowNode, FlowEdge, ValidationIssue } from "../types";

const edgeLabel = (e: any) => (e.label || e.sourceHandle || "").toString().trim().toUpperCase();
const nodeLabel = (n: FlowNode) => n.data?.label || n.type?.toUpperCase();

export const validateNodeConfig = (n: FlowNode, edges: FlowEdge[]): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const cfg: any = n.data?.config || {};
  const push = (msg: string) => issues.push({ severity: "error", message: msg, nodeId: n.id, action: "focus" });

  if (n.type === "http_request") {
    if (!cfg.url?.trim()) push(`HTTP_REQUEST "${nodeLabel(n)}" sin URL.`);
    if (!cfg.method?.trim()) push(`HTTP_REQUEST "${nodeLabel(n)}" sin método.`);
  }

  if (n.type === "conditional") {
    const hasCond = cfg.condition?.trim() || (cfg.leftOperand?.trim() && cfg.operator?.trim());
    if (!hasCond) push(`CONDITIONAL "${nodeLabel(n)}" sin condición.`);
    
    const labels = edges.filter(e => e.source === n.id).map(edgeLabel);
    if (!labels.includes("TRUE") || !labels.includes("FALSE")) {
      push(`CONDITIONAL "${nodeLabel(n)}" requiere salidas TRUE y FALSE.`);
    }
  }

  if (n.type === "command") {
    if (!cfg.command?.trim()) push(`COMMAND "${nodeLabel(n)}" sin comando.`);
  }

  return issues;
};