import { createEmptyWorkflow, makeNode, uid } from "./WorkflowFactory";
import type { Workflow } from "./types";

export const seedWorkflow1 = (): Workflow => {
  const w = createEmptyWorkflow("WORKFLOW_1");
  const nodes = [
    makeNode("start", { x: 80, y: 220 }),
    makeNode("http_request", { x: 360, y: 220 }),
    makeNode("conditional", { x: 650, y: 220 }),
    makeNode("command", { x: 960, y: 160 }, { label: "Procesar datos" }),
    makeNode("command", { x: 960, y: 300 }, { label: "Registrar error" }),
    makeNode("end", { x: 1250, y: 230 })
  ];

  const [start, http, cond, ok, fail, end] = nodes;
  const connect = (s: string, t: string, opts = {}) => ({ id: uid(), source: s, target: t, type: "smoothstep", ...opts });

  w.nodes = nodes;
  w.edges = [
    connect(start.id, http.id),
    connect(http.id, cond.id),
    connect(cond.id, ok.id, { sourceHandle: "true", label: "TRUE" }),
    connect(cond.id, fail.id, { sourceHandle: "false", label: "FALSE" }),
    connect(ok.id, end.id),
    connect(fail.id, end.id),
  ];
  return w;
};