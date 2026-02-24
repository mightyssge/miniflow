import { CustomSelect } from "../CustomSelect";
import styles from "../NodeConfigModal.module.css";

interface Props {
    config: any;
    isReadOnly: boolean;
    patchConfig: (key: string, value: any) => void;
    patchMap: (key: string, value: string) => void;
}

export function HttpRequestForm({ config, isReadOnly, patchConfig, patchMap }: Props) {
    return (
        <>
            <div className={styles.sectionLabel}>Parámetros</div>

            <div className={styles.row2}>
                <div className={styles.field}>
                    <label>Método</label>
                    <CustomSelect
                        value={config.method || "GET"}
                        onChange={v => !isReadOnly && patchConfig("method", v)}
                        options={[
                            { value: "GET", label: "GET" },
                            { value: "POST", label: "POST" },
                            { value: "PUT", label: "PUT" },
                            { value: "PATCH", label: "PATCH" },
                            { value: "DELETE", label: "DELETE" },
                        ]}
                        disabled={isReadOnly}
                    />
                </div>
                <div className={styles.field} style={{ flex: 2 }}>
                    <label>URL</label>
                    <input value={config.url || ""} onChange={e => !isReadOnly && patchConfig("url", e.target.value)} placeholder="https://api.ejemplo.com/v1/recurso" disabled={isReadOnly} />
                </div>
            </div>

            <div className={styles.field}>
                <label>Headers (JSON)</label>
                <textarea value={config.headers || ""} onChange={e => !isReadOnly && patchConfig("headers", e.target.value)} placeholder={'{"Authorization": "Bearer token"}'} rows={2} disabled={isReadOnly} />
            </div>

            <div className={styles.field}>
                <label>Query Parameters (JSON)</label>
                <textarea value={config.queryParams || ""} onChange={e => !isReadOnly && patchConfig("queryParams", e.target.value)} placeholder={'{"page": "1", "limit": "10"}'} rows={2} disabled={isReadOnly} />
            </div>

            {(config.method || "GET") !== "GET" && (
                <div className={styles.field}>
                    <label>Body (JSON)</label>
                    <textarea value={config.body || ""} onChange={e => !isReadOnly && patchConfig("body", e.target.value)} placeholder={'{"key": "value"}'} rows={3} disabled={isReadOnly} />
                </div>
            )}

            <div className={styles.row2}>
                <div className={styles.field}>
                    <label>Timeout (ms)</label>
                    <input type="number" value={config.timeoutMs ?? 5000} onChange={e => !isReadOnly && patchConfig("timeoutMs", Number(e.target.value))} disabled={isReadOnly} />
                </div>
                <div className={styles.field}>
                    <label>Reintentos</label>
                    <input type="number" value={config.retries ?? 0} onChange={e => !isReadOnly && patchConfig("retries", Number(e.target.value))} disabled={isReadOnly} />
                </div>
            </div>

            <div className={styles.sectionLabel}>Mapeo de Respuesta</div>

            <div className={styles.row2}>
                <div className={styles.field}>
                    <label>Mapeo status (JSONPath)</label>
                    <input value={config.map?.status || ""} onChange={e => !isReadOnly && patchMap("status", e.target.value)} placeholder="$.statusCode" disabled={isReadOnly} />
                </div>
                <div className={styles.field}>
                    <label>Mapeo payload (JSONPath)</label>
                    <input value={config.map?.payload || ""} onChange={e => !isReadOnly && patchMap("payload", e.target.value)} placeholder="$.data" disabled={isReadOnly} />
                </div>
            </div>
        </>
    );
}