import { useNodeConfig } from "../../hooks/useNodeConfig";
import { TYPE_META } from "./nodeConstants";
import { ModalHeader } from "./NodeConfigParts/ModalHeader";
import { ModalBody } from "./NodeConfigParts/ModalBody";
import { ModalFooter } from "./NodeConfigParts/ModalFooter";
import { JsonTabViewer } from "./NodeConfigParts/JsonTabViewer";
import { CmdTabViewer } from "./NodeConfigParts/CmdTabViewer";
import styles from "./NodeConfigModal.module.css";

import type { MiniflowNode, ExecutionStep } from "../../models/workflow/coreTypes";

interface Props {
    node: MiniflowNode | null;
    execStep?: ExecutionStep | null;
    initialTab?: "parameters" | "input" | "config" | "output" | "details";
    onSave: (nodeId: string, patch: { label?: string; config?: Record<string, unknown> }) => void;
    onClose: () => void;
}

const generateTabs = (type: string, isReadOnly: boolean) => {
    return [
        { id: 'parameters', label: 'Parameters', show: true },
        { id: 'input', label: 'Input', show: isReadOnly },
        { id: 'config', label: 'Config', show: isReadOnly },
        { id: 'cmd', label: 'Terminal', show: isReadOnly && type === 'command' },
        { id: 'output', label: 'Output', show: isReadOnly },
        { id: 'details', label: 'Exec. Details', show: isReadOnly },
    ].filter(t => t.show);
};

export function NodeConfigModal({ node, execStep, initialTab = "parameters", onSave, onClose }: Props) {
    // 1. Pass initialTab to the hook here 👇
    const { state, actions } = useNodeConfig(node, onSave, onClose, initialTab);

    if (!node) return null;

    const type = node?.type || "start";
    const meta = TYPE_META[type] || TYPE_META.start;
    const isReadOnly = !!execStep;

    // 2. Tab logic
    const TABS = generateTabs(type, isReadOnly);

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <ModalHeader
                    meta={meta}
                    activeTab={state.activeTab}
                    onTabChange={actions.setActiveTab}
                    onTest={() => actions.setTestResult("⏳ Función disponible próximamente — requiere integración con el motor de ejecución.")}
                    showTest={false}
                    onClose={onClose}
                    tabs={TABS}
                />

                <div className={styles.body}>
                    {state.activeTab === 'parameters' ? (
                        <ModalBody
                            type={type}
                            state={state}
                            actions={actions}
                            isReadOnly={isReadOnly}
                        />
                    ) : state.activeTab === 'cmd' ? (
                        <CmdTabViewer execStep={execStep} />
                    ) : (
                        <JsonTabViewer
                            activeTab={state.activeTab}
                            execStep={execStep}
                        />
                    )}
                </div>

                <ModalFooter
                    activeTab={state.activeTab}
                    isReadOnly={isReadOnly}
                    onSave={actions.handleSave}
                    onClose={onClose}
                />
            </div>
        </div>
    );
}