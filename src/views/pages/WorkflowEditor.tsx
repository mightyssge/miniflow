import { useCallback, useEffect, useRef, useMemo, useState } from "react";
import ReactFlow, { Background, BackgroundVariant, MarkerType, ReactFlowProvider, useReactFlow } from "reactflow";
import { useNavigate, useParams } from "react-router-dom";
import {
    Save, CheckCircle, Play,
    Download, Trash2, Clipboard, AlertTriangle,
    Activity, Loader2, ChevronRight, ChevronDown
} from "lucide-react";
import confetti from "canvas-confetti";
import "reactflow/dist/style.css";

import { nodeTypes } from "../components/nodes/nodeTypes";
import { useWorkflowViewModel } from "../../viewmodels/useWorkflowViewModel";
import { serializeWorkflow, deserializeWorkflow } from "../../models/workflow/WorkflowSerializer";
import { Sidebar } from "../components/Sidebar";
import { NodeConfigModal } from "../components/NodeConfigModal";
import { NodeActionsProvider } from "../components/NodeActionsContext";
import ValidationPanel from "../components/ValidationPanel";
import type { NodeType } from "../../models/workflow/types";

import styles from "./WorkflowEditor.module.css";

function formatTimeAgo(date: Date | null): string {
    if (!date) return "Sin guardar";
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    let h = date.getHours();
    const min = date.getMinutes().toString().padStart(2, "0");
    const ampm = h >= 12 ? "pm" : "am";
    h = h % 12 || 12;
    return `Última vez guardado el ${d}/${m}/${y} ${h}:${min}${ampm}`;
}

function EditorInner() {
    const { id } = useParams<{ id: string }>();
    const { state, handlers } = useWorkflowViewModel(id);
    const reactFlowInstance = useReactFlow();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const [toast, setToast] = useState<string | null>(null);
    const [importOpen, setImportOpen] = useState(false);
    const [importJson, setImportJson] = useState("");
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [statusExpanded, setStatusExpanded] = useState(false);
    const [pillTab, setPillTab] = useState<"steps" | "terminal">("steps");
    const [timelineStep, setTimelineStep] = useState<any>(null);
    const [toolsMenuOpen, setToolsMenuOpen] = useState(false);

    // Auto-hide status pill after 8s on success
    useEffect(() => {
        if (state.runStatus === "success") {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.9 },
                colors: ['#28b478', '#78b4ff', '#a78bfa'],
                zIndex: 9999
            });
            const timer = setTimeout(() => {
                // Return to idle state optionally, or just leave it.
            }, 8000);
            return () => clearTimeout(timer);
        }
        if (state.runStatus === "running") {
            setStatusExpanded(false);
        }
    }, [state.runStatus]);

    const showToast = useCallback((msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2500);
    }, []);

    const copyToClipboard = useCallback(() => {
        handlers.saveCurrent();
        const data = { id: state.currentId, name: state.name, description: state.description, nodes: state.nodes, edges: state.edges };
        const portable = serializeWorkflow(data as any);
        navigator.clipboard.writeText(JSON.stringify(portable, null, 2));
        showToast("El workflow ha sido copiado al portapapeles");
    }, [handlers, state, showToast]);

    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const content = evt.target?.result;
            if (typeof content === "string") {
                try {
                    const parsed = JSON.parse(content);
                    const flow = deserializeWorkflow(parsed);
                    handlers.setNodes(flow.nodes);
                    handlers.setEdges(flow.edges);
                    showToast("Workflow importado desde archivo");
                } catch (err: any) {
                    showToast("Error al importar el archivo JSON");
                }
            }
        };
        reader.readAsText(file);
        e.target.value = "";
    }, [handlers, showToast]);

    const downloadJsonFile = useCallback(() => {
        handlers.saveCurrent();
        const data = { id: state.currentId, name: state.name, description: state.description, nodes: state.nodes, edges: state.edges };
        const portable = serializeWorkflow(data as any);
        const blob = new Blob([JSON.stringify(portable, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${state.name || "workflow"}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast("Archivo descargado");
    }, [handlers, state, showToast]);

    /* ── Drag & Drop ── */
    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const type = e.dataTransfer.getData("application/miniflow-node") as NodeType;
        if (!type) return;
        const position = reactFlowInstance.screenToFlowPosition({ x: e.clientX, y: e.clientY });
        handlers.addNode(type, position);
    }, [reactFlowInstance, handlers]);

    /* ── Node Actions for Context ── */
    const nodeActions = useMemo(() => ({
        onEdit: (nodeId: string) => handlers.setEditingNodeId(nodeId),
        onDuplicate: (nodeId: string) => handlers.duplicateNode(nodeId),
        onDelete: (nodeId: string) => handlers.deleteNode(nodeId)
    }), [handlers]);

    return (
        <div className={styles.app}>
            <Sidebar state={state} handlers={handlers} />

            <div className={styles.main}>
                <header className={styles.topbar}>
                    {/* ── Center: Title & Timestamp ── */}
                    <div className={styles.timestamp} style={{ flex: 1, textAlign: 'left', marginLeft: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>{state.name}</span>
                        <span style={{ opacity: 0.5, fontSize: '12px' }}>|</span>
                        <span>{formatTimeAgo(state.lastSavedAt)}</span>
                    </div>

                    {/* ── Primary Actions ── */}
                    <div className={styles.primaryActions}>
                        <button className={styles.tbBtn} onClick={handlers.saveCurrent} title="Guardar">
                            <Save size={15} /> Guardar
                        </button>
                        <button className={`${styles.tbBtn} ${styles.tbValidate}`} onClick={handlers.validateNow} title="Validar">
                            <CheckCircle size={15} /> Validar
                        </button>
                        <button className={`${styles.tbBtn} ${styles.tbExecute}`} onClick={handlers.executeNow} title="Ejecutar">
                            <Play size={15} /> Ejecutar
                        </button>

                        <div className={styles.tbSep} />

                        <input
                            type="file"
                            accept=".json"
                            style={{ display: "none" }}
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                        />

                        {/* Dropdown Herramientas */}
                        <div style={{ position: 'relative' }}>
                            <button
                                className={`${styles.tbBtn} ${styles.tbSubtle}`}
                                onClick={() => setToolsMenuOpen(!toolsMenuOpen)}
                            >
                                Herramientas <ChevronDown size={14} style={{ marginLeft: 4 }} />
                            </button>

                            {toolsMenuOpen && (
                                <div className={styles.toolsDropdown}>
                                    <button className={styles.dropdownItem} onClick={() => { setToolsMenuOpen(false); setImportJson(""); setImportOpen(true); }}>
                                        <Download size={14} /> Importar Texto
                                    </button>
                                    <button className={styles.dropdownItem} onClick={() => { setToolsMenuOpen(false); fileInputRef.current?.click(); }}>
                                        <Download size={14} /> Importar Archivo
                                    </button>
                                    <div className={styles.dropdownDivider} />
                                    <button className={styles.dropdownItem} onClick={() => { setToolsMenuOpen(false); copyToClipboard(); }}>
                                        <Clipboard size={14} /> Copiar JSON
                                    </button>
                                    <button className={styles.dropdownItem} onClick={() => { setToolsMenuOpen(false); downloadJsonFile(); }}>
                                        <Clipboard size={14} /> Guardar JSON
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className={styles.tbSep} />

                        <button className={`${styles.tbBtn} ${styles.tbDanger}`} onClick={() => setDeleteOpen(true)} title="Eliminar workflow">
                            <Trash2 size={14} />
                        </button>
                    </div>

                    {/* ── Separator ── */}
                    {/* <div className={styles.tbSep} /> */} {/* This separator is moved inside primaryActions */}

                    {/* ── Right: Secondary Actions ── */}
                    {/* <div className={styles.secondaryActions}> */} {/* This div is removed */}
                    {/* The buttons previously here are moved into primaryActions */}
                    {/* </div> */}
                </header>

                <main className={styles.canvasWrap} ref={wrapperRef}>
                    <NodeActionsProvider value={nodeActions}>
                        <ReactFlow
                            nodes={state.nodes}
                            edges={state.edges}
                            nodeTypes={nodeTypes}
                            onNodesChange={handlers.onNodesChange}
                            onEdgesChange={handlers.onEdgesChange}
                            onConnect={handlers.onConnect}
                            onNodeClick={handlers.onNodeClick}
                            onNodeDoubleClick={handlers.onNodeDoubleClick}
                            onDragOver={onDragOver}
                            onDrop={onDrop}
                            fitView
                            defaultEdgeOptions={{ markerEnd: { type: MarkerType.ArrowClosed } }}
                        >
                            <Background variant={BackgroundVariant.Dots} gap={18} size={1} />
                        </ReactFlow>
                    </NodeActionsProvider>
                </main>

                {/* ── Validation Panel ── */}
                {state.validationReport && (
                    <ValidationPanel
                        report={state.validationReport}
                        onClose={handlers.closeValidation}
                        onFocusNode={(nodeId) => {
                            const node = state.nodes.find(n => n.id === nodeId);
                            if (node) {
                                reactFlowInstance.setCenter(node.position.x + 75, node.position.y + 25, { zoom: 1.5, duration: 400 });
                            }
                        }}
                    />
                )}

                {/* ── Engine Status Pill (always visible) ── */}
                <div className={styles.statusPillWrap}>
                    <button
                        className={`${styles.statusPill} ${styles[`statusPill_${state.runStatus}`]}`}
                        onClick={() => {
                            if (state.runStatus === "idle") {
                                handlers.executeNow();
                            } else if (state.runStatus !== "running") {
                                setStatusExpanded(!statusExpanded);
                            }
                        }}
                        title={state.runStatus === "idle" ? "Click para ejecutar" : state.runStatus === "running" ? "Ejecutando…" : "Click para ver detalles"}
                    >
                        {state.runStatus === "idle" && <Activity size={16} className={styles.iconIdle} />}
                        {state.runStatus === "running" && <Loader2 size={16} className={styles.iconSpin} />}
                        {state.runStatus === "success" && <CheckCircle size={16} className={styles.iconPop} />}
                        {state.runStatus === "error" && <AlertTriangle size={16} className={styles.iconShake} />}

                        <span className={styles.statusLabel}>
                            {state.runStatus === "idle" && "Motor listo"}
                            {state.runStatus === "running" && "Motor ejecutando"}
                            {state.runStatus === "success" && "Ejecución exitosa"}
                            {state.runStatus === "error" && "Error en ejecución"}
                        </span>

                        {state.runResult && (state.runStatus === "success" || state.runStatus === "error") && (
                            <span className={styles.statusDurationBadge}>
                                {state.runResult.duration || 0}ms
                            </span>
                        )}

                        {(state.runStatus === "success" || state.runStatus === "error") && (
                            <ChevronRight size={14} className={`${styles.statusChevron} ${statusExpanded ? styles.cxExpanded : ''}`} />
                        )}
                    </button>

                    {/* Tickers */}
                    {state.runStatus === "running" && state.runStdout && (
                        <div className={styles.runTicker}>
                            {state.runStdout.trim().split('\n').pop() || "..."}
                        </div>
                    )}

                    {/* Error Snippet */}
                    {state.runStatus === "error" && state.runStderr && !statusExpanded && (
                        <div className={styles.errorTicker}>
                            {state.runStderr.trim().split('\n')[0] || "..."}
                        </div>
                    )}

                    {statusExpanded && state.runStatus !== "running" && state.runStatus !== "idle" && (
                        <div className={styles.statusDetail}>
                            {/* Terminal / Steps Tabs */}
                            <div className={styles.pillTabs}>
                                <button
                                    className={`${styles.pillTabBtn} ${pillTab === 'steps' ? styles.pillTabBtnActive : ''}`}
                                    onClick={() => setPillTab('steps')}
                                >Pasos</button>
                                <button
                                    className={`${styles.pillTabBtn} ${pillTab === 'terminal' ? styles.pillTabBtnActive : ''}`}
                                    onClick={() => setPillTab('terminal')}
                                >Terminal</button>
                            </div>

                            {/* View Content */}
                            {pillTab === 'steps' && state.runResult?.steps?.length > 0 && (
                                <div className={styles.stepsTimeline}>
                                    {state.runResult.steps.map((step: any, i: number, arr: any[]) => (
                                        <div
                                            key={i}
                                            className={`${styles.timelineItem} ${step.status === "ERROR" ? styles.timelineItemError : styles.timelineItemOk}`}
                                            style={{ cursor: "pointer" }}
                                            onClick={() => {
                                                const actualNode = state.nodes.find(n => n.id === step.nodeId);
                                                if (actualNode) {
                                                    setTimelineStep(step);
                                                    handlers.setEditingNodeId(actualNode.id);
                                                }
                                            }}
                                        >
                                            <div className={styles.timelineNode}>
                                                <div className={styles.timelineDot}></div>
                                                {i < arr.length - 1 && <div className={styles.timelineLine}></div>}
                                            </div>

                                            <div className={styles.timelineContent}>
                                                <div className={styles.timelineHeader}>
                                                    <span className={styles.timelineNodeName}>{step.nodeLabel || step.nodeId}</span>
                                                    <span className={styles.timelineNodeType}>{step.nodeType.toUpperCase()}</span>
                                                </div>
                                                <div className={styles.timelineMeta}>
                                                    <span className={`${styles.timelineStatus} ${step.status === "ERROR" ? styles.tsError : styles.tsOk}`}>
                                                        {step.status}
                                                    </span>
                                                    <span className={styles.timelineDuration}>{step.durationMs}ms</span>
                                                </div>
                                                {step.error && (
                                                    <div className={styles.timelineErrorBubble}>
                                                        <AlertTriangle size={12} /> {step.error}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {pillTab === 'terminal' && (
                                <div className={styles.terminalView}>
                                    <pre className={styles.terminalPre}>{state.runResult?.rawStdout || "No hay salida estándar (stdout) disponible."}</pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Node Config Modal ── */}
            {state.editingNode && (
                <NodeConfigModal
                    node={state.editingNode}
                    execStep={timelineStep}
                    initialTab={timelineStep ? "output" : "parameters"}
                    onSave={handlers.updateNodeById}
                    onClose={() => {
                        handlers.setEditingNodeId(null);
                        setTimelineStep(null);
                    }}
                />
            )}

            {/* ── Toast ── */}
            {toast && (
                <div className={styles.toast}>
                    <CheckCircle size={16} />
                    {toast}
                </div>
            )}

            {/* ── Import Modal ── */}
            {importOpen && (
                <div className={styles.modalOverlay} onClick={() => setImportOpen(false)}>
                    <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>Importar Workflow (JSON)</h3>
                        <textarea
                            className={styles.modalTextarea}
                            placeholder='Pega aquí el JSON del workflow...'
                            value={importJson}
                            onChange={e => setImportJson(e.target.value)}
                            rows={14}
                        />
                        <div className={styles.modalActions}>
                            <button className={styles.modalCancel} onClick={() => setImportOpen(false)}>Cancelar</button>
                            <button
                                className={styles.modalConfirm}
                                onClick={() => {
                                    try {
                                        const obj = JSON.parse(importJson);
                                        if (!obj.nodes || !Array.isArray(obj.nodes)) {
                                            showToast("JSON inválido — debe tener un array 'nodes'");
                                            return;
                                        }
                                        handlers.importWorkflow(obj);
                                        setImportOpen(false);
                                        showToast("Workflow importado exitosamente");
                                    } catch {
                                        showToast("JSON inválido — revisa el formato");
                                    }
                                }}
                            >
                                Importar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirmation Modal ── */}
            {deleteOpen && (
                <div className={styles.modalOverlay} onClick={() => setDeleteOpen(false)}>
                    <div className={styles.modalBox} onClick={e => e.stopPropagation()} style={{ width: 420 }}>
                        <div className={styles.deleteModalHeader}>
                            <div className={styles.deleteIconWrap}>
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className={styles.modalTitle} style={{ margin: 0 }}>Eliminar Workflow</h3>
                        </div>
                        <p className={styles.deleteMsg}>
                            ¿Estás seguro de que deseas eliminar <strong>{state.name}</strong>? Esta acción no se puede deshacer.
                        </p>
                        <div className={styles.modalActions}>
                            <button className={styles.modalCancel} onClick={() => setDeleteOpen(false)}>Cancelar</button>
                            <button
                                className={styles.deleteConfirmBtn}
                                onClick={() => {
                                    handlers.deleteCurrent();
                                    navigate("/workflows");
                                }}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function WorkflowEditor() {
    return (
        <ReactFlowProvider>
            <EditorInner />
        </ReactFlowProvider>
    );
}
