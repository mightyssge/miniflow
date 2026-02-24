import type { FlowNode, FlowEdge } from "../types";

export const buildAdj = (nodes: FlowNode[], edges: FlowEdge[]) => {
  const adj: Record<string, string[]> = {};
  nodes.forEach(n => { adj[n.id] = [] });
  edges.forEach(e => { if (adj[e.source]) adj[e.source].push(e.target) });
  return adj;
};

export const detectCycle = (nodes: FlowNode[], edges: FlowEdge[]) => {
  const adj = buildAdj(nodes, edges);
  const color: Record<string, number> = {};
  let has = false;
  nodes.forEach(n => { color[n.id] = 0 });

  const dfs = (u: string) => {
    if (has) return;
    color[u] = 1;
    for (const v of adj[u] || []) {
      if (color[v] === 1) { has = true; return; }
      if (color[v] === 0) dfs(v);
    }
    color[u] = 2;
  };

  nodes.forEach(n => { if (color[n.id] === 0) dfs(n.id) });
  return has;
};

export const getReachability = (startId: string | null, nodes: FlowNode[], edges: FlowEdge[]) => {
  const adj = buildAdj(nodes, edges);
  const vis: Record<string, boolean> = {};
  const q: string[] = [];
  nodes.forEach(n => { vis[n.id] = false });
  if (startId) { vis[startId] = true; q.push(startId); }
  while (q.length) {
    const u = q.shift()!;
    for (const v of adj[u] || []) {
      if (!vis[v]) { vis[v] = true; q.push(v); }
    }
  }
  return vis;
};