import styles from "../NodeConfigModal.module.css";
import { Navigation } from "lucide-react";

export function ParallelForm() {
    return (
        <div className={styles.infoBox} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'rgba(120, 180, 255, 0.05)', borderColor: 'rgba(120, 180, 255, 0.2)' }}>
            <Navigation size={20} color="#a5ceff" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
                <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: '#e6edf3' }}>Configuración Concurrente</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#8b949e', lineHeight: 1.5 }}>
                    Este nodo actuará como un ramificador (split). Conecta múltiples cables de salida desde este nodo hacia otras acciones.<br /><br />
                    <strong>Importante:</strong> Al ser un nodo concurrente que no requiere esperar (Fire-And-Forget), debe ser obligatoriamente el <em>antepenúltimo</em> nodo. Todas sus ramas hijas deben conectar directamente a un nodo END.
                </p>
            </div>
        </div>
    );
}
