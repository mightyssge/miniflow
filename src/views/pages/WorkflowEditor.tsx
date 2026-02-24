import { useEffect, useRef } from "react";
import { ReactFlowProvider } from "reactflow";
import { useParams } from "react-router-dom";
import confetti from "canvas-confetti";
import "reactflow/dist/style.css";

import { useWorkflowViewModel } from "../../viewmodels/useWorkflowViewModel";
import { useWorkflowEditorController } from "../../viewmodels/useWorkflowEditorController";
import { FlowCanvas } from "../components/FlowCanvas";
import { Sidebar } from "../components/Sidebar";
import { WorkflowHeader } from "../components/editor/WorkflowHeader";
import { EngineStatusPill } from "../components/editor/EngineStatusPill";
import { NodeConfigModal } from "../components/NodeConfigModal";
import ValidationPanel from "../components/ValidationPanel";
import { ImportWorkflowModal } from "../components/modals/ImportWorkflowModal";
import { DeleteWorkflowModal } from "../components/modals/DeleteWorkflowModal";
import styles from "./WorkflowEditor.module.css";

function EditorInner() {
    const { id } = useParams<{ id: string }>();
    const { state, handlers } = useWorkflowViewModel(id);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const {
        uiState, uiSetters,
        io, canvas,
        handlers: uiHandlers
    } = useWorkflowEditorController(state, handlers);

    useEffect(() => {
        if (state.runStatus === "success") {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.9 },
                colors: ['#28b478', '#78b4ff', '#a78bfa'],
                zIndex: 9999
            });
        }
    }, [state.runStatus]);

    return (
        <div className={styles.app}>
            <Sidebar state={state} handlers={handlers} />
            <div className={styles.main}>
                <WorkflowHeader
                    name={state.current?.name || "Sin Nombre"}
                    lastSavedAt={state.current?.lastSavedAt}
                    handlers={handlers}
                    serializeAndCopy={uiHandlers.handleSerializeAndCopy}
                    serializeAndDownload={uiHandlers.handleSerializeAndDownload}
                    handleFileUpload={io.onFileChange}
                    onDeleteRequest={uiHandlers.handleDeleteRequest}
                    onImportTextRequest={uiHandlers.handleImportTextRequest}
                    fileInputRef={io.fileInputRef}
                    triggerImport={io.triggerImport}
                />
                <FlowCanvas
                    state={state}
                    handlers={handlers}
                    nodeActions={canvas.nodeActions}
                    onDragOver={canvas.onDragOver}
                    onDrop={canvas.onDrop}
                    wrapperRef={wrapperRef}
                />
                {state.validationReport && (
                    <ValidationPanel
                        report={state.validationReport}
                        onClose={handlers.closeValidation}
                        onFocusNode={uiHandlers.handleFocusNode}
                    />
                )}
                <EngineStatusPill
                    runStatus={state.runStatus}
                    runResult={state.runResult}
                    runStdout={state.runResult?.stdout || ""}
                    runStderr={state.runResult?.stderr || ""}
                    pillTab={uiState.pillTab}
                    setPillTab={uiSetters.setPillTab}
                    executeNow={handlers.executeNow}
                    nodes={state.nodes}
                    setTimelineStep={uiSetters.setTimelineStep}
                    setEditingNodeId={handlers.setEditingNodeId}
                />
            </div>

            {state.editingNodeId && (
                <NodeConfigModal
                    node={state.nodes.find((n: any) => n.id === state.editingNodeId)}
                    execStep={uiState.timelineStep}
                    initialTab={uiState.timelineStep ? "output" : "parameters"}
                    onSave={handlers.updateNodeById}
                    onClose={uiHandlers.handleCloseConfigModal}
                />
            )}
            {uiState.importOpen && (
                <ImportWorkflowModal
                    importJson={uiState.importJson}
                    setImportJson={uiSetters.setImportJson}
                    onClose={uiHandlers.handleCloseImportModal}
                    onImport={uiHandlers.handleImportWorkflow}
                />
            )}
            {uiState.deleteOpen && (
                <DeleteWorkflowModal
                    workflowName={state.current?.name || "Sin Nombre"}
                    onClose={uiHandlers.handleCloseDeleteModal}
                    onConfirm={uiHandlers.handleConfirmDelete}
                />
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
