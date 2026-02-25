import styles from "../NodeConfigModal.module.css";
import { HttpRequestForm } from "../NodeConfigForms/HttpRequestForm";
import { CommandForm } from "../NodeConfigForms/CommandForm";
import { ConditionalForm } from "../NodeConfigForms/ConditionalForm";
import { TimerForm } from "../NodeConfigForms/TimerForm";
import { ParallelForm } from "../NodeConfigForms/ParallelForm";

export function ModalBody({ type, state, actions, isReadOnly }: any) {
    // Extraemos para que el switch sea más legible
    const { config } = state;
    const { patchConfig, patchMap } = actions;

    const renderForm = () => {
        switch (type) {
            case "start":
                return <div className={styles.infoBox}>El nodo Start es el punto de entrada del workflow. Solo puede existir uno por workflow.</div>;
            case "end":
                return <div className={styles.infoBox}>El nodo End finaliza la ejecución del workflow.</div>;
            case "http_request":
                return (
                    <HttpRequestForm
                        config={config}
                        isReadOnly={isReadOnly}
                        patchConfig={patchConfig}
                        patchMap={patchMap}
                    />
                );
            case "command":
                return (
                    <CommandForm
                        config={config}
                        isReadOnly={isReadOnly}
                        patchConfig={patchConfig}
                    />
                );
            case "conditional":
                return (
                    <ConditionalForm
                        config={config}
                        isReadOnly={isReadOnly}
                        patchConfig={patchConfig}
                    />
                );
            case "timer":
                return (
                    <TimerForm
                        config={config}
                        patchConfig={patchConfig}
                    />
                );
            case "parallel":
                return <ParallelForm />;
            default:
                return null;
        }
    };

    return (
        <>
            <div className={styles.field}>
                <label>Etiqueta</label>
                <input
                    value={state.label}
                    onChange={e => !isReadOnly && actions.setLabel(e.target.value)}
                    placeholder="Nombre del nodo"
                    disabled={isReadOnly}
                />
            </div>

            {renderForm()}

            {state.testResult && (
                <div className={styles.testResultBox}>
                    <pre>{state.testResult}</pre>
                </div>
            )}
        </>
    );
}