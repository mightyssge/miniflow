import type { Workflow } from "./types"

/**
 * REFACTOR: Extract Method (Pág. 12). 
 * Sacamos la limpieza de config a una función pura y aislada.
 */
const cleanConfig = (config: Record<string, unknown>) => 
    Object.fromEntries(
        Object.entries(config).filter(([_, v]) => 
            v !== undefined && (typeof v !== "string" || v.trim() !== "")
        )
    );

export const serializeWorkflow = (wf: Workflow) => ({
    name: wf.name,
    description: wf.description,
    nodes: wf.nodes.map(node => ({
        id: node.id,
        type: (node.type || "start").toUpperCase(),
        label: node.data?.label || "",
        config: node.data?.config ? cleanConfig(node.data.config as Record<string, unknown>) : {},
        position: node.position
    })),
    edges: wf.edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        ...(edge.sourceHandle && { sourceHandle: edge.sourceHandle }),
        ...(edge.label && { label: String(edge.label) })
    }))
});