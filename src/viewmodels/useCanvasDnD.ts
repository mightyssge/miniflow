import { useCallback } from "react";
import { useReactFlow } from "reactflow";
import type { NodeType } from "../models/workflow/types";

export function useCanvasDnD(handlers: any) {
    const reactFlowInstance = useReactFlow();

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const type = e.dataTransfer.getData("application/miniflow-node") as NodeType;
        if (!type) return;

        const position = reactFlowInstance.screenToFlowPosition({ x: e.clientX, y: e.clientY });
        handlers.addNode(type, position);

        // Auto-añadir el Join node emparejado
        if (type === "parallel") {
            setTimeout(() => {
                handlers.addNode("parallel_join", { x: position.x + 350, y: position.y });
            }, 50);
        }
    }, [reactFlowInstance, handlers]);

    return { onDragOver, onDrop };
}
