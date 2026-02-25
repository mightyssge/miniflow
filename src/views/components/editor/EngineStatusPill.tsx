import { ChevronRight } from "lucide-react";
import styles from "../../pages/WorkflowEditor.module.css";
import { useState } from "react";
import { EngineStatusIcon, EngineStatusLabel } from "./EngineStatusIcon";
import { StepsTimeline } from "./EngineStatusViews";

interface EngineStatusPillProps {
    runStatus: "idle" | "running" | "success" | "error";
    runResult: any;
    runStdout: string;
    runStderr: string;
    pillTab: "steps" | "terminal";
    setPillTab: (tab: "steps" | "terminal") => void;
    executeNow: () => void;
    nodes: any[];
    setTimelineStep: (step: any) => void;
    setEditingNodeId: (id: string | null) => void;
}

export function EngineStatusPill({
    runStatus, runResult, runStdout, runStderr,
    pillTab, setPillTab,
    executeNow, nodes,
    setTimelineStep, setEditingNodeId
}: EngineStatusPillProps) {
    const [statusExpanded, setStatusExpanded] = useState(false);

    return (
        <div className={styles.statusPillWrap}>
            <button
                className={`${styles.statusPill} ${styles[`statusPill_${runStatus}`]}`}
                onClick={() => {
                    if (runStatus === "idle") {
                        executeNow();
                    } else if (runStatus !== "running") {
                        setStatusExpanded(!statusExpanded);
                    }
                }}
                title={runStatus === "idle" ? "Click para ejecutar" : runStatus === "running" ? "Ejecutando…" : "Click para ver detalles"}
            >
                <EngineStatusIcon status={runStatus} />
                <EngineStatusLabel status={runStatus} />

                {runResult && (runStatus === "success" || runStatus === "error") && (
                    <span className={styles.statusDurationBadge}>
                        {runResult.duration || 0}ms
                    </span>
                )}

                {(runStatus === "success" || runStatus === "error") && (
                    <ChevronRight size={14} className={`${styles.statusChevron} ${statusExpanded ? styles.cxExpanded : ''}`} />
                )}
            </button>

            {/* Tickers */}
            {runStatus === "running" && runStdout && (
                <div className={styles.runTicker}>
                    {runStdout.trim().split('\n').pop() || "..."}
                </div>
            )}

            {/* Error Snippet */}
            {runStatus === "error" && runStderr && !statusExpanded && (
                <div className={styles.errorTicker}>
                    {runStderr.trim().split('\n')[0] || "..."}
                </div>
            )}

            {statusExpanded && runStatus !== "running" && runStatus !== "idle" && (
                <div className={styles.statusDetail}>
                    <div className={styles.pillTabs}>
                        <button
                            className={`${styles.pillTabBtn} ${pillTab === 'steps' ? styles.pillTabBtnActive : ''}`}
                            onClick={() => setPillTab('steps')}
                        >Pasos</button>
                        <button
                            className={`${styles.pillTabBtn} ${pillTab === 'terminal' ? styles.pillTabBtnActive : ''}`}
                            onClick={() => setPillTab('terminal')}
                        >Terminal</button>
                    </div>

                    {pillTab === 'steps' && (
                        <StepsTimeline
                            steps={runResult?.steps}
                            nodes={nodes}
                            setTimelineStep={setTimelineStep}
                            setEditingNodeId={setEditingNodeId}
                        />
                    )}

                    {pillTab === 'terminal' && (
                        <div className={styles.terminalView}>
                            <pre className={styles.terminalPre}>{runResult?.rawStdout || "No hay salida estándar (stdout) disponible."}</pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
