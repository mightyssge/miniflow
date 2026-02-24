import type { FlowNode, FlowEdge, ValidationIssue } from "../types";

const edgeLabel = (e: any) => (e.label || e.sourceHandle || "").toString().trim().toUpperCase();
const nodeLabel = (n: FlowNode) => n.data?.label || n.type?.toUpperCase();

type ValidationRule = (n: FlowNode, edges: FlowEdge[], cfg: any) => string[];

const RuleEngine: Record<string, ValidationRule> = {
  http_request: (n, _edges, cfg) => {
    const errs: string[] = [];
    if (!cfg.url?.trim()) errs.push(`HTTP_REQUEST "${nodeLabel(n)}" sin URL.`);
    if (!cfg.method?.trim()) errs.push(`HTTP_REQUEST "${nodeLabel(n)}" sin método.`);
    return errs;
  },
  conditional: (n, edges, cfg) => {
    const errs: string[] = [];
    const hasCond = cfg.condition?.trim() || (cfg.leftOperand?.trim() && cfg.operator?.trim());
    if (!hasCond) errs.push(`CONDITIONAL "${nodeLabel(n)}" sin condición.`);

    const labels = edges.filter(e => e.source === n.id).map(edgeLabel);
    if (!labels.includes("TRUE") || !labels.includes("FALSE")) {
      errs.push(`CONDITIONAL "${nodeLabel(n)}" requiere salidas TRUE y FALSE.`);
    }
    return errs;
  },
  command: (n, _edges, cfg) => {
    const errs: string[] = [];
    if (!cfg.command?.trim()) errs.push(`COMMAND "${nodeLabel(n)}" sin comando.`);
    return errs;
  }
};

export const validateNodeConfig = (n: FlowNode, edges: FlowEdge[]): ValidationIssue[] => {
  if (!n.type || !RuleEngine[n.type]) return [];

  const cfg: any = n.data?.config || {};
  const rulesFn = RuleEngine[n.type];

  return rulesFn(n, edges, cfg).map(msg => ({
    severity: "error",
    message: msg,
    nodeId: n.id,
    action: "focus"
  }));
};