import { useState, useEffect, useCallback } from "react";
import {
    Zap, Globe, GitBranch, Terminal, Flag,
    X, FlaskConical
} from "lucide-react";
import { CustomSelect } from "./CustomSelect";
import styles from "./NodeConfigModal.module.css";
import type { TimerConfig } from "../../models/workflow/types";

const TYPE_META: Record<string, { icon: any; color: string; label: string }> = {
    start: { icon: Zap, color: "#28b478", label: "START" },
    http_request: { icon: Globe, color: "#78b4ff", label: "HTTP_REQUEST" },
    conditional: { icon: GitBranch, color: "#f5a623", label: "CONDITIONAL" },
    command: { icon: Terminal, color: "#a78bfa", label: "COMMAND" },
    end: { icon: Flag, color: "#d23750", label: "END" },
};

interface Props {
    node: any;
    execStep?: any; // The execution data passed from the timeline if it was opened from there
    initialTab?: "parameters" | "input" | "config" | "output" | "details";
    onSave: (nodeId: string, patch: { label?: string; config?: any }) => void;
    onClose: () => void;
}

export function NodeConfigModal({ node, execStep, initialTab = "parameters", onSave, onClose }: Props) {
    const type = node?.type || "start";
    const meta = TYPE_META[type] || TYPE_META.start;
    const Icon = meta.icon;

    const [activeTab, setActiveTab] = useState<"parameters" | "input" | "config" | "output" | "details">(initialTab);

    const [label, setLabel] = useState(node?.data?.label || "");
    const [config, setConfig] = useState<any>({ ...(node?.data?.config || {}) });
    const [testResult, setTestResult] = useState<string | null>(null);

    useEffect(() => {
        if (!node) return;
        setLabel(node.data?.label || "");
        setConfig({ ...(node.data?.config || {}) });
        setTestResult(null);
    }, [node]);

    const handleEscape = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
    }, [onClose]);

    useEffect(() => {
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [handleEscape]);

    if (!node) return null;

    const patchConfig = (key: string, value: any) => setConfig((c: any) => ({ ...c, [key]: value }));
    const patchMap = (key: string, value: string) =>
        setConfig((c: any) => ({ ...c, map: { ...(c.map || {}), [key]: value } }));

    const handleSave = () => {
        if (!execStep) {
            onSave(node.id, { label, config });
        }
        onClose();
    };

    const isReadOnly = !!execStep;

    const handleTest = () => {
        setTestResult("⏳ Función disponible próximamente — requiere integración con el motor de ejecución.");
    };

    const canTest = type === "http_request" || type === "command" || type === "conditional";

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                {/* ── Header ── */}
                <div className={styles.header}>
                    <div className={styles.headerTitleRow}>
                        <div className={styles.headerLeft}>
                            <Icon size={18} color={meta.color} strokeWidth={2.2} />
                            <span className={styles.headerType} style={{ color: meta.color }}>{meta.label}</span>
                        </div>
                        <div className={styles.headerRight}>
                            {canTest && (
                                <button className={styles.testBtn} onClick={handleTest}>
                                    <FlaskConical size={14} /> Probar
                                </button>
                            )}
                            <button className={styles.closeBtn} onClick={onClose}>
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* ── Tabs Navigation ── */}
                    <div className={styles.tabsRow}>
                        <button
                            className={`${styles.tabBtn} ${activeTab === 'parameters' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('parameters')}
                        >
                            Parameters
                        </button>
                        {(execStep || type !== 'start') && (
                            <button
                                className={`${styles.tabBtn} ${activeTab === 'input' ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab('input')}
                            >
                                Input
                            </button>
                        )}
                        {execStep && (
                            <button
                                className={`${styles.tabBtn} ${activeTab === 'config' ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab('config')}
                            >
                                Config
                            </button>
                        )}
                        {execStep && (
                            <button
                                className={`${styles.tabBtn} ${activeTab === 'output' ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab('output')}
                            >
                                Output
                            </button>
                        )}
                        {execStep && (
                            <button
                                className={`${styles.tabBtn} ${activeTab === 'details' ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab('details')}
                            >
                                Exec. Details
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Body ── */}
                <div className={styles.body}>

                    {activeTab === 'parameters' && (
                        <>
                            {/* Label — always */}
                            <div className={styles.field}>
                                <label>Etiqueta</label>
                                <input
                                    value={label}
                                    onChange={e => !isReadOnly && setLabel(e.target.value)}
                                    placeholder="Nombre del nodo"
                                    disabled={isReadOnly}
                                />
                            </div>

                            {/* ── START ── */}
                            {type === "start" && (
                                <div className={styles.infoBox}>
                                    El nodo Start es el punto de entrada del workflow. Solo puede existir uno por workflow.
                                </div>
                            )}

                            {/* ── END ── */}
                            {type === "end" && (
                                <div className={styles.infoBox}>
                                    El nodo End finaliza la ejecución del workflow.
                                </div>
                            )}

                            {/* ── HTTP_REQUEST ── */}
                            {type === "http_request" && (
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
                            )}

                            {/* ── COMMAND ── */}
                            {type === "command" && (
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
                            )}

                            {/* ── CONDITIONAL ── */}
                            {type === "conditional" && (
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
                            )}

                            {type === "timer" && (
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
                            )}

                            {/* ── Test Result ── */}
                            {testResult && activeTab === 'parameters' && (
                                <div className={styles.testResultBox}>
                                    <pre>{testResult}</pre>
                                </div>
                            )}

                            {/* End Parameters Tab content */}
                        </>
                    )}

                    {/* ── INPUT TAB ── */}
                    {activeTab === 'input' && (
                        <div className={styles.jsonViewer}>
                            {execStep?.inputData ? (
                                <pre>{JSON.stringify(execStep.inputData, null, 2)}</pre>
                            ) : (
                                <div className={styles.emptyState}>
                                    No hay datos de entrada previos para mostrar.
                                    <br /><br />
                                    Ejecuta el workflow para visualizar qué datos recibe este nodo.
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── CONFIG TAB ── */}
                    {activeTab === 'config' && (
                        <div className={styles.jsonViewer}>
                            {execStep?.configData ? (
                                <pre>{JSON.stringify(execStep.configData, null, 2)}</pre>
                            ) : (
                                <div className={styles.emptyState}>
                                    No hay metadata de configuración dinámica para mostrar.
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── OUTPUT TAB ── */}
                    {activeTab === 'output' && (
                        <div className={styles.jsonViewer}>
                            {execStep?.outputData ? (
                                <pre>{JSON.stringify(execStep.outputData, null, 2)}</pre>
                            ) : (
                                <div className={styles.emptyState}>
                                    No hay variables de salida para mostrar.
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── DETAILS TAB ── */}
                    {activeTab === 'details' && (
                        <div className={styles.jsonViewer}>
                            {execStep?.details ? (
                                <pre>{JSON.stringify(execStep.details, null, 2)}</pre>
                            ) : (
                                <div className={styles.emptyState}>
                                    No hay detalles de ejecución disponibles para este nodo.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className={styles.footer}>
                    {activeTab === 'parameters' && !isReadOnly ? (
                        <>
                            <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
                            <button className={styles.saveBtn} onClick={handleSave}>Guardar parámetros</button>
                        </>
                    ) : (
                        <button className={styles.saveBtn} onClick={onClose}>Cerrar vista</button>
                    )}
                </div>
            </div>
        </div>
    );
}
