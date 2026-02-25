import { CustomSelect } from "../CustomSelect";
import styles from "../NodeConfigModal.module.css";

interface Props {
    config: any;
    isReadOnly: boolean;
    patchConfig: (key: string, value: any) => void;
}

export function CommandForm({ config, isReadOnly, patchConfig }: Props) {
    return (
        <>
            <div className={styles.sectionLabel}>Parámetros</div>

            <div className={styles.row2}>
                <div className={styles.field}>
                    <label>Comando</label>
                    <input value={config.command || ""} onChange={e => !isReadOnly && patchConfig("command", e.target.value)} placeholder="python" disabled={isReadOnly} />
                </div>
                <div className={styles.field}>
                    <label>Ruta de script</label>
                    <input value={config.scriptPath || ""} onChange={e => !isReadOnly && patchConfig("scriptPath", e.target.value)} placeholder="C:\Users\...\script.py" disabled={isReadOnly} />
                </div>
            </div>

            <div className={styles.field}>
                <label>Argumentos</label>
                <input value={config.args || ""} onChange={e => !isReadOnly && patchConfig("args", e.target.value)} placeholder="--verbose --output result.json" disabled={isReadOnly} />
            </div>

            <div className={styles.field}>
                <label>Variables de entorno (JSON, opcional)</label>
                <textarea value={config.envVars || ""} onChange={e => !isReadOnly && patchConfig("envVars", e.target.value)} placeholder={'{"API_KEY": "xxx"}'} rows={2} disabled={isReadOnly} />
            </div>

            <div className={styles.row2}>
                <div className={styles.field}>
                    <label>Directorio de ejecución</label>
                    <input value={config.cwd || ""} onChange={e => !isReadOnly && patchConfig("cwd", e.target.value)} placeholder="C:\proyecto\" disabled={isReadOnly} />
                </div>
                <div className={styles.field}>
                    <label>Timeout (ms)</label>
                    <input type="number" value={config.timeoutMs ?? 30000} onChange={e => !isReadOnly && patchConfig("timeoutMs", Number(e.target.value))} disabled={isReadOnly} />
                </div>
            </div>

            <div className={styles.field}>
                <label>Política de error</label>
                <CustomSelect
                    value={config.errorPolicy || "STOP_ON_FAIL"}
                    onChange={v => !isReadOnly && patchConfig("errorPolicy", v)}
                    options={[
                        { value: "STOP_ON_FAIL", label: "STOP_ON_FAIL" },
                        { value: "CONTINUE_ON_FAIL", label: "CONTINUE_ON_FAIL" },
                    ]}
                    disabled={isReadOnly}
                />
            </div>

            <div className={styles.row2}>
                <div className={styles.field}>
                    <label>Captura de salida</label>
                    <CustomSelect
                        value={config.captureOutput || "stdout"}
                        onChange={v => !isReadOnly && patchConfig("captureOutput", v)}
                        options={[
                            { value: "stdout", label: "stdout" },
                            { value: "stderr", label: "stderr" },
                            { value: "both", label: "both" },
                        ]}
                        disabled={isReadOnly}
                    />
                </div>
                <div className={styles.field}>
                    <label>Output key (contexto)</label>
                    <input value={config.outputKey || ""} onChange={e => !isReadOnly && patchConfig("outputKey", e.target.value)} placeholder="commandResult" disabled={isReadOnly} />
                </div>
            </div>
        </>
    );
}