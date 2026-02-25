import { memo } from "react";
import { Handle, Position } from "reactflow";
import { Copy, Merge } from "lucide-react";
import { useNodeActions } from "../NodeActionsContext";
import styles from "./ParallelNode.module.css";

const ParallelJoinNode = ({ id, data, selected }: any) => {
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
                ${data?.status === 'success' ? styles.statusSuccess : ''}
                ${data?.status === 'error' ? styles.statusError : ''}
            `} onDoubleClick={() => onEdit(id)}
                style={{
                    background: "linear-gradient(135deg, rgba(46, 20, 89, 0.8), rgba(23, 10, 45, 0.95))",
                    borderColor: "rgba(167, 139, 250, 0.25)"
                }}
            >
                <div className={styles.diamondShape}>
                    <div className={styles.iconCircleWrapper} style={{ background: "rgba(167, 139, 250, 0.15)", borderColor: "rgba(167, 139, 250, 0.25)" }}>
                        <Merge size={22} className={styles.parallelIcon} color="#a78bfa" />
                    </div>
                </div>
            </div>

            <div className={styles.labelBottom}>{data?.label || 'Barrera (Join)'}</div>

            <Handle
                type="target"
                position={Position.Left}
                id="a"
                className={styles.handleLeft}
                isConnectable={true}
            />
            {/* Opcionalmente una salida si queremos enganchar al End o siguientes nodos */}
            <Handle
                type="source"
                position={Position.Right}
                className={styles.handleRight}
                isConnectable={true}
            />
        </div>
    );
};

export default memo(ParallelJoinNode);
