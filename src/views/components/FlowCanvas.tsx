import { ReactFlow, Background, BackgroundVariant, MarkerType } from "reactflow";
import { NodeActionsProvider } from "./NodeActionsContext";
import { nodeTypes } from "./nodes/nodeTypes";
import "reactflow/dist/style.css";
import React from "react";

interface FlowCanvasProps {
    state: any;
    handlers: any;
    nodeActions: any;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    wrapperRef: React.RefObject<HTMLDivElement | null>;
}

export function FlowCanvas({
    state,
    handlers,
    nodeActions,
    onDragOver,
    onDrop,
    wrapperRef
}: FlowCanvasProps) {
    return (
        <main className="miniflow-canvas-wrap" ref={wrapperRef} style={{ flex: 1, position: 'relative' }}>
            <NodeActionsProvider actions={nodeActions}>
                <ReactFlow
                    nodes={state.nodes}
                    edges={state.edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={handlers.onNodesChange}
                    onEdgesChange={handlers.onEdgesChange}
                    onConnect={handlers.onConnect}
                    onNodeClick={handlers.onNodeClick}
                    onNodeDoubleClick={handlers.onNodeDoubleClick}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    fitView
                    defaultEdgeOptions={{ markerEnd: { type: MarkerType.ArrowClosed } }}
                >
                    <Background variant={BackgroundVariant.Dots} gap={18} size={1} />
                </ReactFlow>
            </NodeActionsProvider>
        </main>
    );
}
