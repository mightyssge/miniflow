import { memo } from "react";
import { Handle, Position } from "reactflow";
import { Copy, Navigation } from "lucide-react";
import { useNodeActions } from "../NodeActionsContext";
import styles from "./ParallelNode.module.css";

const ParallelNode = ({ id, data, selected }: any) => {
    const { onEdit, onDuplicate, onDelete } = useNodeActions();

    return (
        <div style={{ position: "relative" }}>
            {selected && (
                <div className={styles.actionBar} style={{ top: "-38px" }}>
                    <button onClick={() => onDuplicate(id)} title="Duplicar"><Copy size={13} /></button>
                    <button onClick={() => onDelete(id)} title="Eliminar" className={styles.btnDanger}>×</button>
                </div>
            )}

            <div className={`
                ${styles.parallelNode} 
                ${selected ? styles.selected : ''} 
                ${data.status === 'success' ? styles.statusSuccess : ''}
                ${data.status === 'error' ? styles.statusError : ''}
            `} onDoubleClick={() => onEdit(id)}>
                <div className={styles.diamondShape}>
                    <div className={styles.iconCircleWrapper}>
                        <Navigation size={22} className={styles.parallelIcon} />
                    </div>
                </div>
            </div>

            <div className={styles.labelBottom}>{data.label || 'Paralelo'}</div>

            <Handle
                type="target"
                position={Position.Top}
                className={styles.handleTop}
                isConnectable={true}
            />
            {/* El nodo PARALLEL permite múltiples aristas de salida hacia abajo */}
            <Handle
                type="source"
                position={Position.Bottom}
                className={styles.handleBottom}
                isConnectable={true}
            />
        </div>
    );
};

export default memo(ParallelNode);
