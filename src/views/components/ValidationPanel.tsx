import { X, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { ValidationIssueRow } from "./ValidationPanelParts/ValidationIssueRow";
import { getIssueCounts } from "./ValidationPanelParts/ValidationUtils";
import styles from "./ValidationPanel.module.css";

export default function ValidationPanel({ report, onClose, onFocusNode }: any) {
    const counts = getIssueCounts(report.issues);

    return (
        <div className={styles.panel}>
            {/* ── Header ── */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <span className={styles.title}>Reporte</span>
                    <span className={report.isValid ? styles.badgeValid : styles.badgeInvalid}>
                        {report.isValid ? "✓ Válido" : "✗ Inválido"}
                    </span>
                    <span className={styles.sep} />
                    
                    {counts.error > 0 && <span className={`${styles.count} ${styles.sevError}`}><AlertCircle size={14}/> {counts.error}</span>}
                    {counts.warning > 0 && <span className={`${styles.count} ${styles.sevWarning}`}><AlertTriangle size={14}/> {counts.warning}</span>}
                    {counts.info > 0 && <span className={`${styles.count} ${styles.sevInfo}`}><Info size={14}/> {counts.info}</span>}
                </div>
                <button className={styles.closeBtn} onClick={onClose}><X size={16} /></button>
            </div>

            {/* ── Body ── */}
            <div className={styles.body}>
                {report.issues.length === 0 ? (
                    <div className={styles.emptyState}>
                        <AlertCircle size={28} className={styles.emptyIcon} />
                        <strong>¡Todo bien!</strong>
                        <span>No se encontraron problemas</span>
                    </div>
                ) : (
                    report.issues.map((issue: any, i: number) => (
                        <ValidationIssueRow key={i} issue={issue} onFocus={onFocusNode} />
                    ))
                )}
            </div>

            <div className={styles.footer}>
                {report.isValid ? "Workflow listo para ejecución" : "Corrige los errores para continuar"}
            </div>
        </div>
    );
}