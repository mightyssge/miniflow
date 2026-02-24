import { ChevronDown, ChevronRight } from "lucide-react";
import styles from "./Sidebar.module.css";

export function SectionHeader({ title, open, onToggle, collapsed }: any) {
  if (collapsed) return null;
  return (
    <button className={styles.sectionHeader} onClick={onToggle}>
      {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      <span>{title}</span>
    </button>
  );
}

export function NodePaletteCard({ nodeDef, collapsed, stateNodes, onAdd }: any) {
  const Icon = nodeDef.icon;
  const isStartDisabled = nodeDef.type === "start" && stateNodes.some((n: any) => n.type === "start");

  const handleDragStart = (e: React.DragEvent) => {
    if (isStartDisabled) return e.preventDefault();
    e.dataTransfer.setData("application/miniflow-node", nodeDef.type);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <button
      className={`${styles.nodeCard} ${collapsed ? styles.nodeCardCollapsed : ""}`}
      onClick={() => !isStartDisabled && onAdd(nodeDef.type)}
      style={isStartDisabled ? { opacity: 0.35, cursor: "not-allowed" } : undefined}
      draggable={!isStartDisabled}
      onDragStart={handleDragStart}
    >
      <Icon size={16} color={nodeDef.color} strokeWidth={2.2} />
      {!collapsed && <span>{nodeDef.label}</span>}
    </button>
  );
}