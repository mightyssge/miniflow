import { useState } from "react";
import {
    Save, CheckCircle, Play, Download,
    Trash2, Clipboard, ChevronDown, List
} from "lucide-react";
import styles from "../../pages/WorkflowEditor.module.css";

interface WorkflowHeaderProps {
    name: string;
    lastRunAt?: string;
    handlers: any;
    serializeAndCopy: () => void;
    serializeAndDownload: () => void;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDeleteRequest: () => void;
    onImportTextRequest: () => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    triggerImport: () => void;
}

function formatTimeAgo(dateStr?: string): string {
    if (!dateStr) return "Nunca ejecutado";
    const date = new Date(dateStr);
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    let h = date.getHours();
    const min = date.getMinutes().toString().padStart(2, "0");
    const ampm = h >= 12 ? "pm" : "am";
    h = h % 12 || 12;
    return `Última vez guardado el ${d}/${m}/${y} ${h}:${min}${ampm}`;
}

export function WorkflowHeader({
    name,
    lastRunAt,
    handlers,
    serializeAndCopy,
    serializeAndDownload,
    handleFileUpload,
    onDeleteRequest,
    onImportTextRequest,
    fileInputRef,
    triggerImport
}: WorkflowHeaderProps) {
    const [toolsMenuOpen, setToolsMenuOpen] = useState(false);

    return (
        <header className={styles.topbar}>
            <div className={styles.timestamp} style={{ flex: 1, textAlign: 'left', marginLeft: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>{name}</span>
                <span style={{ opacity: 0.5, fontSize: '12px' }}>|</span>
                <span>{formatTimeAgo(lastRunAt)}</span>
            </div>

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
                <button className={`${styles.tbBtn} ${styles.tbSubtle}`} onClick={() => handlers.setHistoryOpen(true)} title="Historial">
                    <List size={15} /> Historial
                </button>

                <div className={styles.tbSep} />

                <input
                    type="file"
                    accept=".json"
                    style={{ display: "none" }}
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                />

                <div style={{ position: 'relative' }}>
                    <button
                        className={`${styles.tbBtn} ${styles.tbSubtle}`}
                        onClick={() => setToolsMenuOpen(!toolsMenuOpen)}
                    >
                        Herramientas <ChevronDown size={14} style={{ marginLeft: 4 }} />
                    </button>

                    {toolsMenuOpen && (
                        <div className={styles.toolsDropdown}>
                            <button className={styles.dropdownItem} onClick={() => { setToolsMenuOpen(false); onImportTextRequest(); }}>
                                <Download size={14} /> Importar Texto
                            </button>
                            <button className={styles.dropdownItem} onClick={() => { setToolsMenuOpen(false); triggerImport(); }}>
                                <Download size={14} /> Importar Archivo
                            </button>
                            <div className={styles.dropdownDivider} />
                            <button className={styles.dropdownItem} onClick={() => { setToolsMenuOpen(false); serializeAndCopy(); }}>
                                <Clipboard size={14} /> Copiar JSON
                            </button>
                            <button className={styles.dropdownItem} onClick={() => { setToolsMenuOpen(false); serializeAndDownload(); }}>
                                <Clipboard size={14} /> Guardar JSON
                            </button>
                        </div>
                    )}
                </div>

                <div className={styles.tbSep} />

                <button className={`${styles.tbBtn} ${styles.tbDanger}`} onClick={onDeleteRequest} title="Eliminar workflow">
                    <Trash2 size={14} />
                </button>
            </div>
        </header>
    );
}
