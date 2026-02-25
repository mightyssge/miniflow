import { AlertTriangle } from "lucide-react";
import styles from "../../pages/WorkflowEditor.module.css";
import type { MiniflowNode, ExecutionStep } from "../../../models/workflow/coreTypes";

interface StepsTimelineProps {
    steps: ExecutionStep[];
    nodes: MiniflowNode[];
    setTimelineStep: (step: ExecutionStep) => void;
    setEditingNodeId: (id: string | null) => void;
}

export function StepsTimeline({ steps, nodes, setTimelineStep, setEditingNodeId }: StepsTimelineProps) {
    if (!steps || steps.length === 0) return null;

    return (
        <div className={styles.stepsTimeline}>
            {steps.map((step: ExecutionStep, i: number, arr: ExecutionStep[]) => (
                <div
                    key={i}
                    className={`${styles.timelineItem} ${step.status === "ERROR" ? styles.timelineItemError : styles.timelineItemOk}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                        const actualNode = nodes.find(n => n.id === step.nodeId);
                        if (actualNode) {
                            setTimelineStep(step);
                            setEditingNodeId(actualNode.id);
                        }
                    }}
                >
                    <div className={styles.timelineNode}>
                        <div className={styles.timelineDot}></div>
                        {i < arr.length - 1 && <div className={styles.timelineLine}></div>}
                    </div>

                    <div className={styles.timelineContent}>
                        <div className={styles.timelineHeader}>
                            <span className={styles.timelineNodeName}>{step.nodeLabel || step.nodeId}</span>
                            <span className={styles.timelineNodeType}>{step.nodeType.toUpperCase()}</span>
                        </div>
                        <div className={styles.timelineMeta}>
                            <span className={`${styles.timelineStatus} ${step.status === "ERROR" ? styles.tsError : styles.tsOk}`}>
                                {step.status}
                            </span>
                            <span className={styles.timelineDuration}>{step.durationMs}ms</span>
                        </div>
                        {step.error && (
                            <div className={styles.timelineErrorBubble}>
                                <AlertTriangle size={12} /> {step.error}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
