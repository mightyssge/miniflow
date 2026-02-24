import styles from "../NodeConfigModal.module.css";

export function ModalFooter({ activeTab, isReadOnly, onSave, onClose }: any) {
    return (
        <div className={styles.footer}>
            {activeTab === 'parameters' && !isReadOnly ? (
                <>
                    <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
                    <button className={styles.saveBtn} onClick={onSave}>Guardar parámetros</button>
                </>
            ) : (
                <button className={styles.saveBtn} onClick={onClose}>Cerrar vista</button>
            )}
        </div>
    );
}