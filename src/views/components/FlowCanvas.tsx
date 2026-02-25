import { ReactFlow, Background, BackgroundVariant, MarkerType } from "reactflow";
import { NodeActionsProvider } from "./NodeActionsContext";
import "reactflow/dist/style.css";
import React from "react";
import StartNode from "./nodes/StartNode";
import HttpRequestNode from "./nodes/HttpRequestNode";
import CommandNode from "./nodes/CommandNode";
import ConditionalNode from "./nodes/ConditionalNode";
import EndNode from "./nodes/EndNode";
import TimerNode from "./nodes/TimerNode";
import ParallelNode from "./nodes/ParallelNode";
import ParallelJoinNode from "./nodes/ParallelJoinNode";

const nodeTypes = {
    start: StartNode,
    http_request: HttpRequestNode,
    command: CommandNode,
    conditional: ConditionalNode,
    end: EndNode,
    timer: TimerNode,
    parallel: ParallelNode,
    parallel_join: ParallelJoinNode
};

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
    const displayEdges = React.useMemo(() => {
        return (state.edges || []).map((e: any) => {
            if (e.sourceHandle === 'true' && !e.label) {
                return {
                    ...e,
                    label: 'TRUE',
                    labelStyle: { fill: '#28b478', fontWeight: 800, fontSize: 11, letterSpacing: '0.5px' },
                    labelBgStyle: { fill: '#0a101e', fillOpacity: 0.8 },
                    labelBgPadding: [4, 2],
                    labelBgBorderRadius: 4
                };
            }
            if (e.sourceHandle === 'false' && !e.label) {
                return {
                    ...e,
                    label: 'FALSE',
                    labelStyle: { fill: '#d23750', fontWeight: 800, fontSize: 11, letterSpacing: '0.5px' },
                    labelBgStyle: { fill: '#0a101e', fillOpacity: 0.8 },
                    labelBgPadding: [4, 2],
                    labelBgBorderRadius: 4
                };
            }
            return e;
        });
    }, [state.edges]);

    return (
        <main className="miniflow-canvas-wrap" ref={wrapperRef} style={{ flex: 1, position: 'relative' }}>
            <NodeActionsProvider actions={nodeActions}>
                <ReactFlow
                    nodes={state.nodes}
                    edges={displayEdges}
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
