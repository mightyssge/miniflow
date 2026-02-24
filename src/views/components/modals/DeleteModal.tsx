import type { Workflow } from "../../../models/workflow/types";
import { AlertTriangle } from "lucide-react";
import styles from "../../pages/Dashboard.module.css";

export function DeleteModal({ wf, onClose, onConfirm }: { wf: Workflow; onClose: () => void; onConfirm: () => void }) {
    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.deleteIcon}><AlertTriangle size={40} color="#d23750" /></div>
                <div className={styles.modalTitle}>Eliminar Workflow</div>
                <p className={styles.deleteMessage}>
                    ¿Estás seguro de que deseas eliminar <strong>{wf.name || "Sin título"}</strong>? Esta acción no se puede deshacer.
                </p>
                <div className={styles.modalActions}>
                    <button className={styles.btnGhost} onClick={onClose}>Cancelar</button>
                    <button className={styles.btnDanger} onClick={onConfirm}>Eliminar</button>
                </div>
            </div>
        </div>
    );
}
