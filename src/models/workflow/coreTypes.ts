// src/models/workflow/coreTypes.ts

export interface MiniflowNode {
    id: string;
    type?: string;
    position: { x: number; y: number };
    data: { label: string;[key: string]: unknown };
    config?: Record<string, unknown>;
}

export interface MiniflowEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
    label?: string;
    animated?: boolean;
    style?: React.CSSProperties;
}

export interface SystemWorkflow {
    id: string;
    name: string;
    nodes: MiniflowNode[];
    edges: MiniflowEdge[];
    createdAt?: number;
    updatedAt?: number;
}

export interface ExecutionStep {
    nodeId: string;
    nodeType: string;
    status: 'SUCCESS' | 'ERROR' | 'idle' | 'running';
    nodeLabel: string;
    durationMs: number;
    inputData: unknown;
    outputData: unknown;
    configData: unknown;
    details: unknown;
    error?: string;
}

export interface WorkflowExecutionResult {
    id: string;
    timestamp: number;
    status: 'SUCCESS' | 'FAILED' | 'idle' | 'running';
    steps: ExecutionStep[];
    rawStdout?: string;
    error?: string;
    exitCode?: number;
    duration?: number;
}
