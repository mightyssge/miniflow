import { useEffect, useMemo, useState, useCallback } from "react";
import { addEdge, useNodesState, useEdgesState, MarkerType, type Connection } from "reactflow";
import { makeNode, emptyWorkflow, seedWorkflow1 } from "../models/workflow/WorkflowFactory";
import { validate } from "../models/workflow/WorkflowValidator";
import { deserializeWorkflow } from "../models/workflow/WorkflowSerializer";
import { useWorkflowStorage } from "./useWorkflowStorage";
import { useWorkflowIO } from "./useWorkflowIO";
import type { FlowNode, Workflow, NodeType, ValidationReport } from "../models/workflow/types";

export function useWorkflowViewModel(initialId?: string) {
  const { workflows, currentId, setCurrentId, persist, remove } = useWorkflowStorage();

  useEffect(() => {
    if (initialId && initialId !== currentId) {
      setCurrentId(initialId);
    }
  }, [initialId]);

  const current = useMemo(() => workflows.find(w => w.id === currentId) ?? null, [workflows, currentId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(current?.nodes ?? []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(current?.edges ?? []);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [name, setName] = useState(current?.name ?? "WORKFLOW");
  const [description, setDescription] = useState(current?.description ?? "");
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [runStatus, setRunStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [runStdout, setRunStdout] = useState("");
  const [runStderr, setRunStderr] = useState("");
  const [runExitCode, setRunExitCode] = useState<number | null>(null);
  const [runResult, setRunResult] = useState<any>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const { exportJson, exportJava } = useWorkflowIO(persist);

  useEffect(() => {
    if (!current) return;
    setName(current.name);
    setDescription(current.description);
    setNodes(current.nodes);
    setEdges(current.edges);
    setValidationReport(null);
    setSelectedNodeId(null);
    setEditingNodeId(null);
    setRunStatus("idle");
    setRunStdout("");
    setRunStderr("");
    setRunExitCode(null);
  }, [current, setNodes, setEdges]);

  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId) || null, [nodes, selectedNodeId]);
  const editingNode = useMemo(() => nodes.find(n => n.id === editingNodeId) || null, [nodes, editingNodeId]);

  const getCurrentWorkflowData = (): Workflow => ({
    id: currentId ?? crypto.randomUUID(),
    name: name.trim() || "WORKFLOW",
    description,
    nodes: nodes as FlowNode[],
    edges
  });

  const updateNodeById = useCallback((nodeId: string, patch: { label?: string; config?: any }) => {
    setNodes(nds => nds.map(n => {
      if (n.id !== nodeId) return n;
      const nextLabel = patch.label !== undefined ? patch.label : n.data.label;
      const nextConfig = patch.config !== undefined
        ? { ...(n.data as any).config, ...patch.config }
        : (n.data as any).config;
      return { ...n, data: { ...n.data, label: nextLabel, config: nextConfig } };
    }));
  }, [setNodes]);

  const duplicateNode = useCallback((nodeId: string) => {
    const source = nodes.find(n => n.id === nodeId);
    if (!source) return;
    // Block duplicating START
    if (source.type === "start" && nodes.some(n => n.type === "start")) return;
    const newNode = makeNode(source.type as NodeType, {
      x: source.position.x + 50,
      y: source.position.y + 50
    });
    newNode.data = JSON.parse(JSON.stringify(source.data));
    setNodes(nds => nds.concat(newNode));
  }, [nodes, setNodes]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes(nds => nds.filter(n => n.id !== nodeId));
    setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    if (editingNodeId === nodeId) setEditingNodeId(null);
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  }, [setNodes, setEdges, editingNodeId, selectedNodeId]);

  const actions = {
    saveCurrent: () => {
      persist(getCurrentWorkflowData());
      setLastSavedAt(new Date());
    },
    deleteCurrent: () => {
      if (currentId) remove(currentId);
    },
    validateNow: () => {
      const report = validate(nodes as FlowNode[], edges);
      setValidationReport(report);
    },
    closeValidation: () => {
      setValidationReport(null);
    },
    executeNow: async () => {
      const data = getCurrentWorkflowData();
      persist(data);
      setLastSavedAt(new Date());

      const report = validate(nodes as FlowNode[], edges);
      setValidationReport(report);

      if (!report.isValid) {
        return;
      }

      setRunStatus("running");
      setRunStdout("");
      setRunStderr("");
      setRunExitCode(null);
      setRunResult(null);

      try {
        // Enviamos formato ReactFlow directo: Node.java espera data: { label, config }
        const enginePayload = {
          name: data.name,
          nodes: (data.nodes as FlowNode[]).map(n => ({
            id: n.id,
            type: (n.type || "start").toUpperCase(),
            data: { label: n.data?.label || "", config: n.data?.config || {} },
            position: n.position
          })),
          edges: data.edges.map(e => ({
            source: e.source,
            target: e.target,
            ...(e.sourceHandle ? { sourceHandle: e.sourceHandle } : {}),
            ...(e.label ? { label: String(e.label) } : {})
          }))
        };
        const res = await window.electronAPI.runWorkflow(JSON.stringify(enginePayload));
        setRunExitCode(res.exitCode ?? null);
        setRunStdout(res.stdout || "");
        setRunStderr(res.stderr || "");

        // ── Parse STDOUT to reconstruct the steps array ──
        const steps: any[] = [];
        const lines = (res.stdout || "").split('\n');

        let currentStep: any = null;
        let stepStartLine = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const nodeMatch = line.match(/Nodo:\s+([a-zA-Z0-9\-]+)\s+\[([^\]]+)\]/);
          if (nodeMatch) {
            currentStep = {
              nodeId: nodeMatch[1].trim(),
              nodeType: nodeMatch[2].trim(),
              status: "SUCCESS",
              durationMs: 0,
              error: null,
              inputData: null,
              outputData: null,
              configData: null,
              details: null
            };
            stepStartLine = i;

            // Try to find the real label from the data.nodes
            const actualNode = data.nodes.find(n => n.id === currentStep.nodeId);
            if (actualNode && actualNode.data?.label) {
              currentStep.nodeLabel = actualNode.data.label;
            }
            steps.push(currentStep);
          } else if (currentStep) {
            if (line.includes("-> INPUT DATA:")) {
              try {
                const jsonStr = line.substring(line.indexOf("INPUT DATA:") + 11).trim();
                currentStep.inputData = jsonStr ? JSON.parse(jsonStr) : {};
              } catch (e) { /* ignore */ }
            } else if (line.includes("-> CONFIG:")) {
              try {
                const jsonStr = line.substring(line.indexOf("CONFIG:") + 7).trim();
                currentStep.configData = jsonStr ? JSON.parse(jsonStr) : {};
              } catch (e) { /* ignore */ }
            } else if (line.includes("OUTPUT DATA -->:")) {
              try {
                const jsonStr = line.substring(line.indexOf("OUTPUT DATA -->:") + 16).trim();
                currentStep.outputData = jsonStr ? JSON.parse(jsonStr) : {};
              } catch (e) { /* ignore */ }
            } else if (line.includes("NODE_EXEC_DETAILS -->:")) {
              try {
                const jsonStr = line.substring(line.indexOf("NODE_EXEC_DETAILS -->:") + 22).trim();
                currentStep.details = jsonStr ? JSON.parse(jsonStr) : {};
              } catch (e) { /* ignore */ }
            } else if (line.includes("error\":")) {
              // Basic heuristic for error
              currentStep.status = "ERROR";
              const errMatch = line.match(/error=([^,}]+)/) || line.match(/"error"\s*:\s*"([^"]+)"/);
              if (errMatch) {
                currentStep.error = errMatch[1].trim();
              } else {
                currentStep.error = "Error in node execution";
              }
            }
          }

          if (currentStep) {
            // Fake duration based on log lines distance (min 2ms)
            currentStep.durationMs = Math.max(2, (i - stepStartLine) * 12);
          }
        }

        const hasErrors = steps.some(s => s.status === "ERROR") || !res.ok;
        setRunResult({
          status: hasErrors ? "FAILED" : "SUCCESS",
          duration: steps.reduce((acc, step) => acc + step.durationMs, 0),
          steps,
          rawStdout: res.stdout || ""
        });

        setRunStatus(hasErrors ? "error" : "success");
      } catch (e: any) {
        setRunStderr(String(e?.message || e || "Error"));
        setRunStatus("error");
      }
    },
    addNode: (type: NodeType, position?: { x: number; y: number }) => {
      // START unique guard
      if (type === "start" && nodes.some(n => n.type === "start")) return;
      const bump = (nodes?.length || 0) * 30;
      const pos = position ?? { x: 260 + bump, y: 220 + bump };
      setNodes(nds => nds.concat(makeNode(type, pos)));
    },
    onConnect: (params: Connection) =>
      setEdges(eds => {
        const isTrue = params.sourceHandle === "true";
        const isFalse = params.sourceHandle === "false";
        const label = isTrue ? "TRUE" : isFalse ? "FALSE" : undefined;
        const edgeColor = isTrue ? "#28b478" : isFalse ? "#d23750" : undefined;

        const next: any = {
          ...params,
          id: crypto.randomUUID(),
          type: "smoothstep",
          label,
          ...(edgeColor && {
            style: { stroke: edgeColor, strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor, width: 15, height: 12 },
            labelStyle: { fill: edgeColor, fontWeight: 700, fontSize: 11 },
            labelBgStyle: { fill: "rgba(14, 20, 36, 0.85)", stroke: edgeColor, strokeWidth: 1 },
            labelBgPadding: [6, 4] as [number, number],
            labelBgBorderRadius: 6
          })
        };

        return addEdge(next, eds);
      }),
    updateSelectedNode: (patch: { label?: string; config?: any }) => {
      if (selectedNodeId) updateNodeById(selectedNodeId, patch);
    },
    updateNodeById,
    duplicateNode,
    deleteNode
  };

  return {
    state: { workflows, currentId, nodes, edges, name, description, validationReport, selectedNode, editingNode, editingNodeId, runStatus, runStdout, runStderr, runExitCode, runResult, lastSavedAt },
    handlers: {
      ...actions,
      setName,
      setDescription,
      setCurrentId,
      setNodes,
      setEdges,
      onNodesChange,
      onEdgesChange,
      setEditingNodeId,
      onNodeClick: (_: any, node: any) => setSelectedNodeId(node.id),
      onNodeDoubleClick: (_: any, node: any) => setEditingNodeId(node.id),
      createNewWorkflow: () => persist(emptyWorkflow()),
      createWorkflow1: () => persist(seedWorkflow1()),
      exportJson: () => {
        const data = getCurrentWorkflowData();
        persist(data);
        exportJson(data);
      },
      exportJava: () => {
        const data = getCurrentWorkflowData();
        persist(data);
        exportJava(data);
      },
      importWorkflow: (raw: any) => {
        const wf = deserializeWorkflow(raw, raw.id);
        persist(wf);
      }
    }
  };
}
