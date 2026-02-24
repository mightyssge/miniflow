import { useState, useEffect, useRef } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import styles from "../../pages/Dashboard.module.css";

export function KebabMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const close = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, [open]);

    return (
        <div className={styles.menuWrap} ref={ref}>
            <button
                className={styles.kebab}
                onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
            >
                <MoreVertical size={16} />
            </button>
            {open && (
                <div className={styles.dropdown}>
                    <button
                        className={styles.dropdownItem}
                        onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(); }}
                    >
                        <Pencil size={14} /> Editar Detalles
                    </button>
                    <button
                        className={styles.dropdownItemDanger}
                        onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(); }}
                    >
                        <Trash2 size={14} /> Eliminar
                    </button>
                </div>
            )}
        </div>
    );
}
