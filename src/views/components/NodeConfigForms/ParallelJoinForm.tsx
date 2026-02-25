import { AlertCircle } from "lucide-react";
import styles from "../NodeConfigPanel.module.css";

export function ParallelJoinForm() {
    return (
        <div className={styles.section}>
            <label>Configuración de Barrera (Join)</label>
            <div className={styles.small} style={{ marginTop: 8, color: "#a78bfa" }}>
                Este nodo actúa como una barrera de contención. El motor de ejecución pausará el avance y esperará pacientemente a que todas las ramificaciones paralelas que ingresen a él terminen de ejecutarse antes de continuar hacia el nodo siguiente.
            </div>

            <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: "rgba(245, 166, 35, 0.1)", border: "1px solid rgba(245, 166, 35, 0.3)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#f5a623", fontWeight: 600, fontSize: 13, marginBottom: 8 }}>
                    <AlertCircle size={14} />
                    Regla Estricta
                </div>
                <div className={styles.small} style={{ color: "#f5a623" }}>
                    Asegúrate de conectar <b>TODAS</b> las ramas de tus operaciones en paralelo a este nodo Barrera. Cualquier flujo paralelo que no conecte a un Join lanzará un error de validación.
                </div>
            </div>
        </div>
    );
}
