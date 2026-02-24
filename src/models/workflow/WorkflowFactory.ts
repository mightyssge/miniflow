import type { Workflow, FlowNode, NodeType } from "./types"
import { NODE_DEFAULTS } from "./defaults";

export const uid = () => crypto.randomUUID();

export function makeNode<T extends NodeType>(
  type: T, 
  position: { x: number; y: number }, 
  overrides?: { label?: string; config?: any }
): FlowNode {
  // Label lógico
  const label = overrides?.label || 
    (type === 'start' ? 'Inicio' : type === 'end' ? 'Fin' : type.toUpperCase());
  
  // Config segura: si no hay default (como en start/end), devolvemos {}
  const defaultFn = NODE_DEFAULTS[type as keyof typeof NODE_DEFAULTS];
  const config = overrides?.config || (defaultFn ? defaultFn() : {});

  return { id: uid(), type, position, data: { label, config } } as FlowNode;
}

export const createEmptyWorkflow = (name = "WORKFLOW"): Workflow => ({
  id: uid(), 
  name, 
  description: "", 
  nodes: [], 
  edges: [], 
  validationStatus: 'pending'
});