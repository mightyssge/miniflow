import { Flag } from "lucide-react";
import { type NodeProps } from "reactflow";
import BaseNodeWrapper from "./BaseNodeWrapper";
import base from "./BaseNode.module.css";

// Para el EndNode, según tus tipos, la config es básicamente vacía: Record<string, never>
interface EndNodeData {
  label: string;
}

export default function EndNode({ id, data }: NodeProps<EndNodeData>) {
  return (
    <BaseNodeWrapper 
      id={id} 
      typeLabel="END" 
      icon={<Flag size={13} />} 
      color="#d23750"
      showSource={false} // Un nodo de fin no tiene salida
    >
      <div className={base.nodeLabel}>{data.label || "Fin"}</div>
      <div className={base.nodeHint}>Final del workflow</div>
    </BaseNodeWrapper>
  );
}