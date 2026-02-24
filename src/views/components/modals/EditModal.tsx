import { useState } from "react";
import type { Workflow } from "../../../models/workflow/types";
import styles from "../../pages/Dashboard.module.css";

export function EditModal({ wf, onClose, onSave }: { wf: Workflow; onClose: () => void; onSave: (name: string, desc: string) => void }) {
    const [name, setName] = useState(wf.name);
    const [desc, setDesc] = useState(wf.description);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSave(name.trim(), desc.trim());
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <form className={styles.modal} onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
                <div className={styles.modalTitle}>Editar Detalles del Workflow</div>
                <div className={styles.modalSubtitle}>Actualiza el nombre y la descripción de tu workflow.</div>

                <div className={styles.modalField}>
                    <label>Nombre *</label>
                    <input autoFocus value={name} onChange={e => setName(e.target.value)} />
                </div>

                <div className={styles.modalField}>
                    <label>Descripción</label>
                    <textarea value={desc} onChange={e => setDesc(e.target.value)} />
                </div>

                <div className={styles.modalActions}>
                    <button type="button" className={styles.btnGhost} onClick={onClose}>Cancelar</button>
                    <button type="submit" className={styles.btnPrimary} disabled={!name.trim()}>Guardar</button>
                </div>
            </form>
        </div>
    );
}
