import { Activity, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import styles from "../../pages/WorkflowEditor.module.css";

interface EngineStatusIconProps {
    status: "idle" | "running" | "success" | "error";
}

export function EngineStatusIcon({ status }: EngineStatusIconProps) {
    if (status === "idle") return <Activity size={16} className={styles.iconIdle} />;
    if (status === "running") return <Loader2 size={16} className={styles.iconSpin} />;
    if (status === "success") return <CheckCircle size={16} className={styles.iconPop} />;
    return <AlertTriangle size={16} className={styles.iconShake} />;
}

export function EngineStatusLabel({ status }: EngineStatusIconProps) {
    const mapLabel = {
        idle: "Motor listo",
        running: "Motor ejecutando",
        success: "Ejecución exitosa",
        error: "Error en ejecución"
    };
    return <span className={styles.statusLabel}>{mapLabel[status]}</span>;
}
