import type { Workflow, FlowNode, FlowEdge, NodeType } from "./types"
import { uid } from "./WorkflowFactory"

const TYPE_MAP: Record<string, NodeType> = {
    START: "start", END: "end", HTTP_REQUEST: "http_request",
    COMMAND: "command", CONDITIONAL: "conditional", TIMER: "timer",
    PARALLEL: "parallel"
};

/**
 * REFACTOR: Eliminamos el "Magic Number" de posiciones (Pág. 30).
 * Si el nodo no tiene posición, la lógica de layout debería ser externa, 
 * pero aquí la simplificamos usando el Factory.
 */
export function deserializeWorkflow(raw: any, id?: string): Workflow {
    const nodes: FlowNode[] = (raw.nodes || []).map((pn: any, i: number) => ({
        id: pn.id || uid(),
        type: TYPE_MAP[pn.type?.toUpperCase()] || "command",
        position: pn.position || { x: 100 + (i * 50), y: 100 + (i * 50) },
        data: {
            label: pn.label || pn.data?.label || pn.type || "Nodo",
            config: pn.config || pn.data?.config || {}
        }
    })) as FlowNode[];

    const edges: FlowEdge[] = (raw.edges || []).map((pe: any) => ({
        id: uid(),
        source: pe.source,
        target: pe.target,
        type: "smoothstep",
        sourceHandle: pe.sourceHandle,
        label: pe.label
    }));

    return {
        id: id || uid(),
        name: raw.name || "WORKFLOW",
        description: raw.description || "",
        nodes,
        edges,
        validationStatus: 'pending'
    };
}