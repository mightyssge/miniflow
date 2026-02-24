import { useState, useRef, useEffect, useMemo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Clock, MoreVertical, Pencil, Copy, Trash2, CheckCircle2 } from "lucide-react";
import { useNodeActions } from "../NodeActionsContext";
import type { NodeData, TimerConfig } from "../../../models/workflow/types";
import { useWorkflowViewModel } from "../../../viewmodels/useWorkflowViewModel";
import styles from "./TimerNode.module.css";

export default function TimerNode({ id, data, selected }: NodeProps<NodeData>) {
    const { onEdit, onDuplicate, onDelete } = useNodeActions();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // 1. Get execution state
    const { state: { runResult } } = useWorkflowViewModel();
    const stepStatus = runResult?.steps?.find((s: any) => s.nodeId === id)?.status || "idle";

    // 2. Local config
    const cfg = (data.config || {}) as Partial<TimerConfig>;
    const delayStr = cfg.delay !== undefined ? cfg.delay : 3;
    const unitStr = cfg.unit || "s";

    const totalMs = useMemo(() => {
        let ms = delayStr;
        if (unitStr === "s") ms *= 1000;
        if (unitStr === "min") ms *= 60000;
        return ms;
    }, [delayStr, unitStr]);

    // 3. Animation State
    const isRunning = stepStatus === "running";
    const isSuccess = stepStatus === "success";
    const [progress, setProgress] = useState(0); // 0 to 1
    const [timeLeftStr, setTimeLeftStr] = useState("");

    useEffect(() => {
        if (!isRunning) {
            if (!isSuccess) {
                setProgress(0);
                setTimeLeftStr("");
            }
            return;
        }

        const startTime = Date.now();
        const endTime = startTime + totalMs;
        let rafId: number;

        const tick = () => {
            const now = Date.now();
            const remaining = Math.max(0, endTime - now);

            // Progress builds from 0 up to 1 over totalMs
            const newProg = Math.min(1, 1 - (remaining / totalMs));
            setProgress(newProg);

            // Format countdown string
            const secs = (remaining / 1000).toFixed(1);
            setTimeLeftStr(`${secs}s`);

            if (remaining > 0) {
                rafId = requestAnimationFrame(tick);
            } else {
                // Reached 0 locally (backend state might take an extra couple ms)
                setTimeLeftStr("0.0s");
                setProgress(1);
            }
        };

        rafId = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(rafId);
        };
    }, [isRunning, totalMs, isSuccess]);

    // Handle menu clickaway
    useEffect(() => {
        if (!menuOpen) return;
        const close = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, [menuOpen]);

    // SVG circle calculations
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    // If isSuccess, fill the ring completely (progress = 1)
    const currentProgress = isSuccess ? 1 : progress;
    const strokeDashoffset = circumference - (currentProgress * circumference);

    return (
        <div className={`${styles.circleNode} ${selected ? styles.selected : ""}`}>
            {/* SVG Background and Progress Ring */}
            <svg className={styles.svgRing} viewBox="0 0 80 80">
                <circle
                    cx="40" cy="40" r={radius}
                    className={styles.track}
                />
                <circle
                    cx="40" cy="40" r={radius}
                    className={`${styles.progress} ${isSuccess ? styles.progressSuccess : ""}`}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                />
            </svg>

            <div className={styles.innerContent}>
                {isSuccess ? (
                    <CheckCircle2 size={24} className={styles.successIcon} />
                ) : isRunning ? (
                    <>
                        <span className={styles.countdown}>{timeLeftStr}</span>
                    </>
                ) : (
                    <>
                        <Clock size={20} className={styles.idleIcon} />
                        <span className={styles.timeDesc}>{delayStr}{unitStr}</span>
                    </>
                )}
            </div>

            <div className={styles.kebabWrap} ref={menuRef}>
                <button className={styles.kebabBtn} onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen); }}>
                    <MoreVertical size={14} />
                </button>
                {menuOpen && (
                    <div className={styles.dropdown}>
                        <button className={styles.dropdownItem} onClick={() => { onEdit(id); setMenuOpen(false); }}><Pencil size={13} /> Editar</button>
                        <button className={styles.dropdownItem} onClick={() => { onDuplicate(id); setMenuOpen(false); }}><Copy size={13} /> Duplicar</button>
                        <button className={styles.dropdownItemDanger} onClick={() => { onDelete(id); setMenuOpen(false); }}><Trash2 size={13} /> Eliminar</button>
                    </div>
                )}
            </div>
            <Handle type="target" position={Position.Left} className={styles.handleLeft} />
            <Handle type="source" position={Position.Right} className={styles.handleRight} />
        </div>
    );
}
