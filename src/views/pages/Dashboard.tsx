import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { MoreVertical, Pencil, Trash2, Plus, Zap, ArrowLeftRight, Clock, Package } from "lucide-react";
import { loadAll, saveAll } from "../../models/storage/LocalStorage";
import { emptyWorkflow } from "../../models/workflow/WorkflowFactory";
import type { Workflow } from "../../models/workflow/types";
import styles from "./Dashboard.module.css";

function formatDate(iso?: string) {
    if (!iso) return "Nunca ejecutado";
    const d = new Date(iso);
    return `Última ejecución: ${d.toLocaleDateString("es-PE", { month: "short", day: "numeric" })}, ${d.toLocaleTimeString("es-PE", { hour: "numeric", minute: "2-digit" })}`;
}

function StatusDot({ status }: { status?: string }) {
    const cls =
        status === "valid" ? styles.statusValid
            : status === "invalid" ? styles.statusInvalid
                : styles.statusPending;
    return <span className={`${styles.statusDot} ${cls}`} />;
}

import { CreateModal } from "../components/modals/CreateModal";
import { DeleteModal } from "../components/modals/DeleteModal";
import { EditModal } from "../components/modals/EditModal";
import { KebabMenu } from "../components/common/KebabMenu";

export function Dashboard() {
    const navigate = useNavigate();
    const [workflows, setWorkflows] = useState<Workflow[]>(() => loadAll());
    const [showCreate, setShowCreate] = useState(false);
    const [deletingWf, setDeletingWf] = useState<Workflow | null>(null);
    const [editingWf, setEditingWf] = useState<Workflow | null>(null);

    const handleCreate = (name: string, desc: string) => {
        const wf = { ...emptyWorkflow(), name, description: desc };
        const next = [wf, ...workflows];
        saveAll(next);
        setWorkflows(next);
        navigate(`/editor/${wf.id}`);
    };

    const handleDelete = () => {
        if (!deletingWf) return;
        const next = workflows.filter(w => w.id !== deletingWf.id);
        saveAll(next);
        setWorkflows(next);
        setDeletingWf(null);
    };

    const handleEditSave = (name: string, desc: string) => {
        if (!editingWf) return;
        const next = workflows.map(w =>
            w.id === editingWf.id ? { ...w, name, description: desc } : w
        );
        saveAll(next);
        setWorkflows(next);
        setEditingWf(null);
    };

    return (
        <div className={styles.dashboard}>
            <header className={styles.topbar}>
                <div className={styles.title}>
                    <Link to="/" className={styles.brandLink}>MINIFLOW</Link>
                    <span style={{ opacity: 0.2 }}>/</span>
                    <h1 className={styles.titleText}>Tus Workflows</h1>
                </div>
                <button className={styles.btnPrimary} onClick={() => setShowCreate(true)}>
                    <Plus size={16} /> Crear Nuevo
                </button>
            </header>

            {workflows.length === 0 ? (
                <div className={styles.empty}>
                    <div className={styles.emptyIcon}><Package size={56} strokeWidth={1} /></div>
                    <p className={styles.emptyText}>Aún no tienes workflows. Empieza a automatizar con MINIFLOW.</p>
                    <button className={styles.btnPrimary} onClick={() => setShowCreate(true)}>
                        <Plus size={16} /> Crea tu primer workflow
                    </button>
                </div>
            ) : (
                <div className={styles.grid}>
                    {workflows.map(wf => (
                        <div
                            key={wf.id}
                            className={styles.card}
                            onClick={() => navigate(`/editor/${wf.id}`)}
                        >
                            <div className={styles.cardHeader}>
                                <StatusDot status={wf.validationStatus} />
                                <span className={styles.cardName}>{wf.name || "Sin título"}</span>
                                <KebabMenu
                                    onEdit={() => setEditingWf(wf)}
                                    onDelete={() => setDeletingWf(wf)}
                                />
                            </div>
                            <div className={styles.cardDesc}>{wf.description || "Sin descripción"}</div>
                            <div className={styles.cardMeta}>
                                <span><Zap size={12} /> {wf.nodes.length} nodos</span>
                                <span><ArrowLeftRight size={12} /> {wf.edges.length} conexiones</span>
                            </div>
                            <div className={styles.cardTimestamp}><Clock size={11} /> {formatDate(wf.lastRunAt)}</div>
                        </div>
                    ))}
                </div>
            )}

            {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
            {deletingWf && <DeleteModal wf={deletingWf} onClose={() => setDeletingWf(null)} onConfirm={handleDelete} />}
            {editingWf && <EditModal wf={editingWf} onClose={() => setEditingWf(null)} onSave={handleEditSave} />}
        </div>
    );
}
