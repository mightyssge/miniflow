import { Zap } from "lucide-react";
import { type NodeProps } from "reactflow";
import BaseNodeWrapper from "./BaseNodeWrapper";
import base from "./BaseNode.module.css";

// Tipado específico para el nodo de inicio
interface StartNodeData {
  label: string;
}

export default function StartNode({ id, data }: NodeProps<StartNodeData>) {
  return (
    <BaseNodeWrapper 
      id={id} 
      typeLabel="START" 
      icon={<Zap size={13} />} 
      color="#28b478"
      showTarget={false}  // Un nodo de inicio no recibe conexiones
      showSource={true}   // Solo tiene salida
    >
      <div className={base.nodeLabel}>{data.label || "Inicio"}</div>
      <div className={base.nodeHint}>1 por workflow</div>
    </BaseNodeWrapper>
  );
}