import { type ReactNode } from "react";
import { Handle, Position } from "reactflow";
import NodeMenu from "./NodeMenu";
import base from "./BaseNode.module.css";

interface Props {
  id: string;
  typeLabel: string;
  icon: ReactNode;
  color: string;
  children: ReactNode;
  showTarget?: boolean;
  showSource?: boolean;
}

export default function BaseNodeWrapper({ 
  id, typeLabel, icon, color, children, showTarget = true, showSource = true 
}: Props) {
  return (
    <div className={base.nodeBox} style={{ borderLeft: `3px solid ${color}` }}>
      <div className={base.nodeHeader}>
        <div className={base.nodeTypeBadge} style={{ color }}>
          {icon} {typeLabel}
        </div>
        {/* Usamos el componente atómico */}
        <NodeMenu id={id} className={base.kebabWrap} />
      </div>
      {children}
      {showTarget && <Handle type="target" position={Position.Left} />}
      {showSource && <Handle type="source" position={Position.Right} />}
    </div>
  );
}