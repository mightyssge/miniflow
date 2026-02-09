import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { loadAll, saveAll } from "../../models/storage/LocalStorage";
import { emptyWorkflow } from "../../models/workflow/WorkflowFactory";
import type { Workflow } from "../../models/workflow/types";
import styles from "./Dashboard.module.css";

export function Dashboard() {
    const navigate = useNavigate();
    const [workflows, setWorkflows] = useState<Workflow[]>(() => loadAll());

    const handleCreate = () => {
        const wf = emptyWorkflow();
        const next = [wf, ...workflows];
        saveAll(next);
        setWorkflows(next);
        navigate(`/editor/${wf.id}`);
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm("¿Eliminar este workflow?")) return;
        const next = workflows.filter(w => w.id !== id);
        saveAll(next);
        setWorkflows(next);
    };

    const handleEdit = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        navigate(`/editor/${id}`);
    };

    return (
        <div className={styles.dashboard}>
            <header className={styles.topbar}>
                <div className={styles.title}>
                    <Link to="/" className={styles.brandLink}>MINIFLOW</Link>
                    <span style={{ opacity: 0.2 }}>/</span>
                    <h1 className={styles.titleText}>Your Workflows</h1>
                </div>
                <div className={styles.actions}>
                    <button className={styles.btnPrimary} onClick={handleCreate}>
                        + Create New
                    </button>
                </div>
            </header>

            {workflows.length === 0 ? (
                <div className={styles.empty}>
                    <div className={styles.emptyIcon}>📦</div>
                    <p className={styles.emptyText}>
                        No workflows yet. Start automating with MINIFLOW.
                    </p>
                    <button className={styles.btnPrimary} onClick={handleCreate}>
                        + Create your first workflow
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
                                <span className={styles.cardName}>{wf.name || "Untitled"}</span>
                                <span
                                    className={`${styles.statusDot} ${wf.nodes.length > 0 ? styles.active : styles.idle}`}
                                />
                            </div>
                            <div className={styles.cardDesc}>
                                {wf.description || "No description"}
                            </div>
                            <div className={styles.cardMeta}>
                                <span>🔗 {wf.nodes.length} nodes</span>
                                <span>↔ {wf.edges.length} connections</span>
                            </div>
                            <div className={styles.cardActions}>
                                <button
                                    className={styles.btnSmall}
                                    onClick={(e) => handleEdit(e, wf.id)}
                                >
                                    Edit
                                </button>
                                <button
                                    className={styles.btnSmallDanger}
                                    onClick={(e) => handleDelete(e, wf.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
