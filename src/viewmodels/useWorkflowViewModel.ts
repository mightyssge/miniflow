import { useState, useMemo, useEffect } from "react";
import { useNodesState, useEdgesState, addEdge } from "reactflow";
import { useWorkflowStorage } from "./useWorkflowStorage";
import { useWorkflowExecution } from "./useWorkflowExecution";
import { validate } from "../models/workflow/WorkflowValidator";
import { makeNode } from "../models/workflow/WorkflowFactory";

export function useWorkflowViewModel(initialId?: string) {
  const { workflows, currentId, setCurrentId, persist, remove } = useWorkflowStorage();
  const { runStatus, runResult, run } = useWorkflowExecution();
  
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
    nodes,
    edges
  });

  const handlers = {
    onNodesChange,
    onEdgesChange,
    onConnect: (params: any) => setEdges(eds => addEdge({ ...params, type: 'smoothstep' }, eds)),
    save: () => persist(getSnapshot() as any),
    deleteCurrent: () => currentId && remove(currentId),
    addNode: (type: any) => setNodes(nds => nds.concat(makeNode(type, { x: 150, y: 150 }))),
    validate: () => setValidationReport(validate(nodes as any, edges)),
    execute: async () => {
      const report = validate(nodes as any, edges);
      setValidationReport(report);
      if (report.isValid) {
        persist(getSnapshot() as any);
        await run(getSnapshot());
      }
    },
    onNodeClick: (_: any, node: any) => setSelectedNodeId(node.id),
    setCurrentId // Ahora sí lo exportamos por si tu UI necesita cambiar de workflow
  };

  return {
    state: { nodes, edges, current, runStatus, runResult, validationReport, selectedNodeId },
    handlers
  };
}