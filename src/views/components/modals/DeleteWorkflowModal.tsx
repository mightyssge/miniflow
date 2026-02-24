import React from "react";
import { AlertTriangle } from "lucide-react";
import styles from "../../pages/WorkflowEditor.module.css";

interface DeleteWorkflowModalProps {
    workflowName: string;
    onClose: () => void;
    onConfirm: () => void;
}

export function DeleteWorkflowModal({ workflowName, onClose, onConfirm }: DeleteWorkflowModalProps) {
    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalBox} onClick={e => e.stopPropagation()} style={{ width: 420 }}>
                <div className={styles.deleteModalHeader}>
                    <div className={styles.deleteIconWrap}>
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className={styles.modalTitle} style={{ margin: 0 }}>Eliminar Workflow</h3>
                </div>
                <p className={styles.deleteMsg}>
                    ¿Estás seguro de que deseas eliminar <strong>{workflowName}</strong>? Esta acción no se puede deshacer.
                </p>
                <div className={styles.modalActions}>
                    <button className={styles.modalCancel} onClick={onClose}>Cancelar</button>
                    <button className={styles.deleteConfirmBtn} onClick={onConfirm}>
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
}
