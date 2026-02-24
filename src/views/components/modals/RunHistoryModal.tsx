import { useState, useEffect } from "react";
import { LocalStorage } from "../../../models/storage/LocalStorage";
import styles from "../../pages/WorkflowEditor.module.css";
import { Clock, CheckCircle, XCircle, Search, Activity, ChevronRight } from "lucide-react";

interface Props {
    workflowId: string;
    onClose: () => void;
    onLoadRun: (run: any) => void;
}

export function RunHistoryModal({ workflowId, onClose, onLoadRun }: Props) {
    const [runs, setRuns] = useState<any[]>([]);

    useEffect(() => {
        setRuns(LocalStorage.loadRuns(workflowId));
    }, [workflowId]);

    const formatTimestamp = (ts: number) => {
        return new Intl.DateTimeFormat('es-PE', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(new Date(ts));
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={`${styles.modalBox} ${styles.historyModalBox}`} onClick={e => e.stopPropagation()}>

                <div className={styles.historyModalHeader}>
                    <div className={styles.historyModalTitleGroup}>
                        <div className={styles.historyModalIcon}>
                            <Activity size={20} />
                        </div>
                        <div>
                            <h3 className={styles.historyModalTitle}>Historial de Ejecuciones</h3>
                            <p className={styles.historyModalSubtitle}>Registro detallado de los trabajos recientes</p>
                        </div>
                    </div>
                    <button className={styles.closeBtnLg} onClick={onClose}>×</button>
                </div>

                <div className={styles.historyBody}>
                    {runs.length === 0 ? (
                        <div className={styles.historyEmptyState}>
                            <div className={styles.historyEmptyIcon}>
                                <Search size={48} strokeWidth={1} />
                            </div>
                            <p className={styles.historyEmptyTitle}>No hay datos disponibles</p>
                            <p className={styles.historyEmptyText}>
                                Este workflow aún no tiene ejecuciones registradas en el historial local.
                                ¡Presiona Ejecutar para comenzar a guardar el rastreo!
                            </p>
                        </div>
                    ) : (
                        <div className={styles.historyTableContainer}>
                            <table className={styles.historyTable}>
                                <thead>
                                    <tr>
                                        <th>Fecha y Hora</th>
                                        <th>Estado</th>
                                        <th>Duración</th>
                                        <th style={{ textAlign: 'right' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {runs.map(run => (
                                        <tr key={run.id} className={styles.historyRow}>
                                            <td className={styles.historyCellTime}>
                                                {formatTimestamp(run.timestamp)}
                                            </td>
                                            <td>
                                                {run.status === "SUCCESS" ? (
                                                    <span className={`${styles.historyBadge} ${styles.historyBadgeSuccess}`}>
                                                        <CheckCircle size={14} /> Exitoso
                                                    </span>
                                                ) : (
                                                    <span className={`${styles.historyBadge} ${styles.historyBadgeError}`}>
                                                        <XCircle size={14} /> Fallido
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <div className={styles.historyDuration}>
                                                    <Clock size={13} /> {run.duration}ms
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button
                                                    onClick={() => {
                                                        onLoadRun(run);
                                                        onClose();
                                                    }}
                                                    className={styles.historyActionBtn}
                                                >
                                                    Ver Detalles
                                                    <ChevronRight size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
