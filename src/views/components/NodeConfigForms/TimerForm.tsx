import { CustomSelect } from "../CustomSelect";
import styles from "../NodeConfigModal.module.css";
import type { TimerConfig } from "../../../models/workflow/types";

interface Props {
    config: any;
    patchConfig: (key: string, value: any) => void;
}

export function TimerForm({ config, patchConfig }: Props) {
    return (
        <>
            <div className={styles.sectionLabel}>Temporizador</div>
            <div className={styles.field}>
                <label>Tiempo de espera</label>
                <input
                    type="number"
                    value={(config as TimerConfig).delay || 3}
                    onChange={(e) => patchConfig("delay", parseInt(e.target.value) || 0)}
                    style={{ width: "100%", padding: "6px", background: "#0e1526", border: "1px solid #1e293b", color: "#e6edf3", borderRadius: "4px" }}
                />
            </div>
            <div className={styles.field}>
                <label>Unidad</label>
                <CustomSelect
                    value={(config as TimerConfig).unit || "s"}
                    onChange={v => patchConfig("unit", v)}
                    options={[
                        { value: "ms", label: "Milisegundos (ms)" },
                        { value: "s", label: "Segundos (s)" },
                        { value: "min", label: "Minutos (min)" }
                    ]}
                />
            </div>
        </>
    );
}