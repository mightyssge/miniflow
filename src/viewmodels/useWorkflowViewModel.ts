import { useEffect, useMemo, useState, useCallback } from "react";
import { addEdge, useNodesState, useEdgesState, type Connection } from "reactflow";
import { makeNode, emptyWorkflow, seedWorkflow1 } from "../models/workflow/WorkflowFactory";
import { validate } from "../models/workflow/WorkflowValidator";
import { useWorkflowStorage } from "./useWorkflowStorage";
import { useWorkflowIO } from "./useWorkflowIO";
import type { FlowNode, Workflow, NodeType } from "../models/workflow/types";

export function useWorkflowViewModel(initialId?: string) {
  const { workflows, currentId, setCurrentId, persist, remove } = useWorkflowStorage();

  // --- Estados de Workflow ---
  const current = useMemo(() => workflows.find(w => w.id === currentId) ?? null, [workflows, currentId]);
  const [nodes, setNodes, onNodesChange] = useNodesState(current?.nodes ?? []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(current?.edges ?? []);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [name, setName] = useState(current?.name ?? "WORKFLOW");
  const [description, setDescription] = useState(current?.description ?? "");

  // --- Estados de Validación y Ejecución ---
  const [errors, setErrors] = useState<string[]>([]);
  const [hasValidated, setHasValidated] = useState(false);
  const [runStatus, setRunStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [runStdout, setRunStdout] = useState("");
  const [runStderr, setRunStderr] = useState("");
  const [runExitCode, setRunExitCode] = useState<number | null>(null);

  const { fileInputRef, exportJson, exportJava, onImportFile, openImport } = useWorkflowIO(persist);

  // Sincronización de parámetros de URL
  useEffect(() => {
    if (initialId && initialId !== currentId) setCurrentId(initialId);
  }, [initialId, currentId, setCurrentId]);

  // Reset de estados al cambiar de Workflow seleccionado
  useEffect(() => {
    if (!current) return;
    setName(current.name);
    setDescription(current.description);
    setNodes(current.nodes);
    setEdges(current.edges);
    setErrors([]);
    setHasValidated(false);
    setRunStatus("idle");
    setRunStdout("");
    setRunStderr("");
  }, [current, setNodes, setEdges]);

  // --- SUSCRIPCIÓN A LOGS (Previene error de 'undefined' si el preload falla) ---
  useEffect(() => {
    // Si la API no está inyectada, no intentamos suscribirnos (evita pantalla blanca)
    if (!window.electronAPI || !window.electronAPI.onWorkflowLog) {
      console.warn("Electron API no detectada o incompleta.");
      return;
    }

    const unsubLog = window.electronAPI.onWorkflowLog((data: string) => {
      setRunStdout(prev => prev + data);
    });

    const unsubError = window.electronAPI.onWorkflowError((data: string) => {
      setRunStderr(prev => prev + data);
    });

    return () => {
      if (unsubLog) unsubLog();
      if (unsubError) unsubError();
    };
  }, []);

  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId) || null, [nodes, selectedNodeId]);

  const getCurrentWorkflowData = useCallback((): Workflow => ({
    id: currentId ?? crypto.randomUUID(),
    name: name.trim() || "WORKFLOW",
    description,
    nodes: nodes as FlowNode[],
    edges
  }), [currentId, name, description, nodes, edges]);

  const actions = {
    saveCurrent: () => persist(getCurrentWorkflowData()),
    
    deleteCurrent: () => currentId && remove(currentId),
    
    validateNow: () => {
      setErrors(validate(nodes as FlowNode[], edges));
      setHasValidated(true);
    },

    executeNow: async () => {
      const data = getCurrentWorkflowData();
      persist(data);

      const errs = validate(nodes as FlowNode[], edges);
      setErrors(errs);
      setHasValidated(true);

      if (errs.length) {
        alert("No se puede ejecutar: el workflow es inválido.");
        return;
      }

      setRunStatus("running");
      setRunStdout("");
      setRunStderr("");
      setRunExitCode(null);

      try {
        if (!window.electronAPI) throw new Error("Entorno Electron no disponible");

        // Enviamos el objeto directamente (Electron lo serializa automáticamente)
        const result = await window.electronAPI.runWorkflow(data);
        
        setRunExitCode(result.exitCode ?? 0);
        // Ajustado a 'ok' para coincidir con tu interfaz declarada
        setRunStatus(result.success ? "success" : "error");
      } catch (e: any) {
        setRunStatus("error");
        setRunStderr(prev => prev + `\n[UI-ERROR]: ${e.message || String(e)}`);
      }
    },

    addNode: (type: NodeType) => {
      const bump = (nodes?.length || 0) * 30;
      setNodes(nds => nds.concat(makeNode(type, { x: 260 + bump, y: 220 + bump })));
    },

    onConnect: (params: Connection) => setEdges(eds => {
      const label = params.sourceHandle === "true" ? "TRUE" : 
                    params.sourceHandle === "false" ? "FALSE" : undefined;
      return addEdge({ ...params, id: crypto.randomUUID(), type: "smoothstep", label }, eds);
    }),

    updateSelectedNode: (patch: { label?: string; config?: any }) => {
      setNodes(nds => nds.map(n => {
        if (n.id !== selectedNodeId) return n;
        const currentData = n.data as any;
        const nextConfig = patch.config ? { ...currentData.config, ...patch.config } : currentData.config;
        return { ...n, data: { ...currentData, label: patch.label ?? currentData.label, config: nextConfig } };
      }));
    }
  };

  return {
    state: { workflows, currentId, nodes, edges, name, description, errors, hasValidated, selectedNode, runStatus, runStdout, runStderr, runExitCode },
    refs: { fileInputRef },
    handlers: {
      ...actions,
      setName,
      setDescription,
      setCurrentId,
      onNodesChange,
      onEdgesChange,
      onNodeClick: (_: any, node: any) => setSelectedNodeId(node.id),
      createNewWorkflow: () => persist(emptyWorkflow()),
      createWorkflow1: () => persist(seedWorkflow1()),
      exportJson: () => {
        const d = getCurrentWorkflowData(); persist(d); exportJson(d);
      },
      exportJava: () => {
        const d = getCurrentWorkflowData(); persist(d); exportJava(d);
      },
      onImportFile,
      openImport
    }
  };
}