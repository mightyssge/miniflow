import { useState } from "react";
import styles from "../pages/Dashboard.module.css";

export function CreateModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string, desc: string) => void }) {
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onCreate(name.trim(), desc.trim());
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <form className={styles.modal} onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
                <div className={styles.modalTitle}>Crear Nuevo Workflow</div>
                <div className={styles.modalSubtitle}>Define la identidad de tu workflow antes de entrar al constructor.</div>

                <div className={styles.modalField}>
                    <label>Nombre *</label>
                    <input
                        autoFocus
                        placeholder="Mi Workflow"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                </div>

                <div className={styles.modalField}>
                    <label>Descripción</label>
                    <textarea
                        placeholder="¿Qué hace este workflow?"
                        value={desc}
                        onChange={e => setDesc(e.target.value)}
                    />
                </div>

                <div className={styles.modalActions}>
                    <button type="button" className={styles.btnGhost} onClick={onClose}>Cancelar</button>
                    <button type="submit" className={styles.btnPrimary} disabled={!name.trim()}>Crear</button>
                </div>
            </form>
        </div>
    );
}
