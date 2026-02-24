
import styles from "../../pages/WorkflowEditor.module.css";
import { useToast } from "../../../contexts/ToastContext";

interface ImportWorkflowModalProps {
    importJson: string;
    setImportJson: (val: string) => void;
    onClose: () => void;
    onImport: (nodes: any[], edges: any[]) => void;
}

export function ImportWorkflowModal({ importJson, setImportJson, onClose, onImport }: ImportWorkflowModalProps) {
    const { showToast } = useToast();

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
                <h3 className={styles.modalTitle}>Importar Workflow (JSON)</h3>
                <textarea
                    className={styles.modalTextarea}
                    placeholder='Pega aquí el JSON del workflow...'
                    value={importJson}
                    onChange={e => setImportJson(e.target.value)}
                    rows={14}
                />
                <div className={styles.modalActions}>
                    <button className={styles.modalCancel} onClick={onClose}>Cancelar</button>
                    <button
                        className={styles.modalConfirm}
                        onClick={() => {
                            try {
                                const obj = JSON.parse(importJson);
                                if (!obj.nodes || !Array.isArray(obj.nodes)) {
                                    showToast("JSON inválido — debe tener un array 'nodes'");
                                    return;
                                }
                                onImport(obj.nodes, obj.edges || []);
                                onClose();
                                showToast("Workflow importado exitosamente");
                            } catch {
                                showToast("JSON inválido — revisa el formato");
                            }
                        }}
                    >
                        Importar
                    </button>
                </div>
            </div>
        </div>
    );
}
