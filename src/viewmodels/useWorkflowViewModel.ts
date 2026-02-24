import { useState, useMemo, useEffect } from "react";
import { useNodesState, useEdgesState, addEdge } from "reactflow";
import { useWorkflowStorage } from "./useWorkflowStorage";
import { useWorkflowExecution } from "./useWorkflowExecution";
import { validate } from "../models/workflow/WorkflowValidator";
import { makeNode } from "../models/workflow/WorkflowFactory";
import { useToast } from "../contexts/ToastContext";

export function useWorkflowViewModel(initialId?: string) {
  const { workflows, currentId, setCurrentId, persist, remove } = useWorkflowStorage();
  const { runStatus, runResult, run } = useWorkflowExecution();
  const { showToast } = useToast();

  // Usamos el initialId para establecer el workflow activo al montar el componente
  useEffect(() => {
    if (initialId && initialId !== currentId) {
      setCurrentId(initialId);
    }
  }, [initialId, currentId, setCurrentId]);

  const current = useMemo(() =>
    workflows.find(w => w.id === currentId) || null,
    [workflows, currentId]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [validationReport, setValidationReport] = useState<any>(null);

  // Sincronizar nodos y bordes cuando cambia el workflow seleccionado
  useEffect(() => {
    if (current) {
      setNodes(current.nodes);
      setEdges(current.edges);
    }
  }, [current, setNodes, setEdges]);

  const getSnapshot = () => ({
    id: currentId || crypto.randomUUID(),
    name: current?.name || "WORKFLOW",
    description: current?.description || "",
    lastRunAt: new Date().toISOString(),
    nodes,
    edges
  });

  const updateNodeById = (id: string, partialData: any) => {
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, ...partialData } } : n));
  };

  const duplicateNode = (id: string) => {
    setNodes(nds => {
      const target = nds.find(n => n.id === id);
      if (!target) return nds;
      return nds.concat({
        ...target,
        id: crypto.randomUUID(),
        position: { x: target.position.x + 50, y: target.position.y + 50 }
      });
    });
  };

  const deleteNode = (id: string) => {
    setNodes(nds => nds.filter(n => n.id !== id));
    setEdges(eds => eds.filter(e => e.source !== id && e.target !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  const handlers = {
    onNodesChange,
    onEdgesChange,
    onConnect: (params: any) => setEdges(eds => addEdge({ ...params, type: 'smoothstep' }, eds)),
    save: () => { persist(getSnapshot() as any); showToast("Workflow guardado correctamente"); },
    saveCurrent: () => { persist(getSnapshot() as any); showToast("Workflow guardado correctamente"); }, // Alias
    deleteCurrent: () => currentId && remove(currentId),
    addNode: (type: any, position?: any) => setNodes(nds => nds.concat(makeNode(type, position || { x: 150, y: 150 }))),
    validate: () => setValidationReport(validate(nodes as any, edges)),
    validateNow: () => setValidationReport(validate(nodes as any, edges)), // Alias
    closeValidation: () => setValidationReport(null),
    execute: async () => {
      const report = validate(nodes as any, edges);
      setValidationReport(report);
      if (report.isValid) {
        persist(getSnapshot() as any);
        await run(getSnapshot());
      }
    },
    executeNow: async () => {
      const report = validate(nodes as any, edges);
      setValidationReport(report);
      if (report.isValid) {
        persist(getSnapshot() as any);
        await run(getSnapshot());
      }
    }, // Alias
    onNodeClick: (_: any, node: any) => setSelectedNodeId(node.id),
    setCurrentId,
    setNodes,
    setEdges,
    setEditingNodeId: setSelectedNodeId,
    updateNodeById,
    duplicateNode,
    deleteNode
  };

  return {
    state: { nodes, edges, current, runStatus, runResult, validationReport, selectedNodeId },
    handlers
  };
}