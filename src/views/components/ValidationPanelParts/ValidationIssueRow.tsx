import { ArrowRight } from "lucide-react";
import { SEVERITY_MAP } from "./ValidationUtils";
import styles from "./ValidationPanel.module.css";

export function ValidationIssueRow({ issue, onFocus }: { issue: any, onFocus: (id: string) => void }) {
    const { icon: Icon, cls, label } = SEVERITY_MAP[issue.severity as keyof typeof SEVERITY_MAP];

    return (
        <div className={styles.issueRow}>
            <Icon size={18} className={cls} />
            <div className={styles.issueContent}>
                <div className={styles.issueHead}>
                    <span className={`${styles.badge} ${cls}`}>{label}</span>
                    {issue.nodeId && (
                        <span className={styles.nodeTag}>Node: {issue.nodeId.substring(0, 8)}…</span>
                    )}
                </div>
                <p className={styles.issueMsg}>{issue.message}</p>
                {issue.action === "focus" && issue.nodeId && (
                    <button className={styles.focusBtn} onClick={() => onFocus(issue.nodeId)}>
                        Ir al nodo <ArrowRight size={12} />
                    </button>
                )}
            </div>
        </div>
    );
}