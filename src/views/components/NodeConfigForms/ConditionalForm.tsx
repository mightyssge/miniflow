import { CustomSelect } from "../CustomSelect";
import styles from "../NodeConfigModal.module.css";

interface Props {
    config: any;
    isReadOnly: boolean;
    patchConfig: (key: string, value: any) => void;
}

export function ConditionalForm({ config, isReadOnly, patchConfig }: Props) {
    return (
        <>
            <div className={styles.sectionLabel}>Condición</div>

            <div className={styles.conditionRow}>
                <div className={styles.field} style={{ flex: 2 }}>
                    <label>Operando izquierdo</label>
                    <input value={config.leftOperand || ""} onChange={e => !isReadOnly && patchConfig("leftOperand", e.target.value)} placeholder="{{response.status}}" disabled={isReadOnly} />
                </div>
                <div className={styles.field} style={{ flex: 1 }}>
                    <label>Operador</label>
                    <CustomSelect
                        value={config.operator || "=="}
                        onChange={v => !isReadOnly && patchConfig("operator", v)}
                        options={[
                            { value: "==", label: "==" },
                            { value: "!=", label: "!=" },
                            { value: ">", label: ">" },
                            { value: "<", label: "<" },
                            { value: ">=", label: ">=" },
                            { value: "<=", label: "<=" },
                            { value: "contains", label: "contains" },
                        ]}
                        disabled={isReadOnly}
                    />
                </div>
                <div className={styles.field} style={{ flex: 2 }}>
                    <label>Operando derecho</label>
                    <input value={config.rightOperand || ""} onChange={e => !isReadOnly && patchConfig("rightOperand", e.target.value)} placeholder="200" disabled={isReadOnly} />
                </div>
            </div>

            {(config.leftOperand || config.rightOperand) && (
                <div className={styles.conditionPreview}>
                    <span className={styles.previewLabel}>Preview:</span>
                    <code>{config.leftOperand || "?"} {config.operator || "=="} {config.rightOperand || "?"}</code>
                </div>
            )}

            <div className={styles.field}>
                <label>Expresión completa (alternativo)</label>
                <input value={config.condition || ""} onChange={e => !isReadOnly && patchConfig("condition", e.target.value)} placeholder="context.status == 200" disabled={isReadOnly} />
            </div>

            <div className={styles.infoBox}>
                Las rutas TRUE y FALSE se asignan automáticamente a los handles del nodo.
            </div>

            <div className={styles.sectionLabel}>Configuración</div>
            <div className={styles.field}>
                <label>Política de error</label>
                <CustomSelect
                    value={config.errorPolicy || "STOP_ON_FAIL"}
                    onChange={v => patchConfig("errorPolicy", v)}
                    options={[
                        { value: "STOP_ON_FAIL", label: "STOP_ON_FAIL" },
                        { value: "CONTINUE_ON_FAIL", label: "CONTINUE_ON_FAIL" },
                    ]}
                />
            </div>
        </>
    );
}