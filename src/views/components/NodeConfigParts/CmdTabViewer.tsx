import { Terminal } from "lucide-react";
import styles from "../NodeConfigModal.module.css";
import type { ExecutionStep } from "../../../models/workflow/coreTypes";

interface Props {
    execStep?: ExecutionStep | null;
}

export function CmdTabViewer({ execStep }: Props) {
    if (!execStep || !execStep.details) {
        return (
            <div className={styles.emptyState}>
                No hay detalles de ejecución disponibles para este comando.
            </div>
        );
    }

    const details = execStep.details as {
        fullCommandExecuted?: string;
        stdout?: string;
        stderr?: string;
        exitCode?: number;
    };

    const isError = details.exitCode !== 0;

    return (
        <div style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Fake Window Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#2d333b',
                padding: '6px 12px',
                borderTopLeftRadius: '6px',
                borderTopRightRadius: '6px',
                borderBottom: '1px solid #1e2327',
                color: '#adbac7',
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'sans-serif'
            }}>
                <Terminal size={14} /> Miniflow Command Prompt
            </div>

            {/* Terminal Body */}
            <div style={{
                background: '#0c0c0c',
                color: '#cccccc',
                fontFamily: "'Consolas', 'Courier New', monospace",
                fontSize: '13px',
                padding: '12px',
                borderBottomLeftRadius: '6px',
                borderBottomRightRadius: '6px',
                border: '1px solid #30363d',
                borderTop: 'none',
                flex: 1,
                overflowY: 'auto',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
                lineHeight: '1.6'
            }}>
                <div style={{ marginBottom: '8px', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                    <span style={{ color: '#cccccc', marginRight: '8px' }}>C:\miniflow&gt;</span>
                    <span style={{ color: '#ffffff' }}>{details.fullCommandExecuted || "unknown_command"}</span>
                </div>

                {details.stdout && (
                    <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#cccccc', marginBottom: '8px' }}>
                        {details.stdout.trimEnd()}
                    </div>
                )}

                {details.stderr && (
                    <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#ff5555', marginTop: '8px', marginBottom: '8px' }}>
                        {details.stderr.trimEnd()}
                    </div>
                )}

                <div style={{ marginTop: '16px', color: isError ? '#ff5555' : '#55ff55' }}>
                    C:\miniflow&gt; echo %errorlevel%<br />
                    {details.exitCode}<br /><br />
                    [Proceso finalizado {isError ? 'con errores ' : 'exitosamente '}(código {details.exitCode})]
                </div>
            </div>
        </div>
    );
}
