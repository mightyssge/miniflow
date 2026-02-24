import { Terminal } from "lucide-react";
import { type NodeProps } from "reactflow";
import type { CommandConfig } from "../../../models/workflow/types";
import BaseNodeWrapper from "./BaseNodeWrapper";
import base from "./BaseNode.module.css";

// Definimos la forma exacta de la data que este componente espera recibir
interface CommandNodeData {
  label: string;
  config: CommandConfig;
}

export default function CommandNode({ id, data }: NodeProps<CommandNodeData>) {
  const { command, args } = data.config;

  return (
    <BaseNodeWrapper 
      id={id} 
      typeLabel="COMMAND" 
      icon={<Terminal size={13} />} 
      color="#a78bfa"
    >
      <div className={base.nodeLabel}>{data.label || "Command"}</div>
      <div className={base.nodeHint}>
        {command || "No command"} {args || ""}
      </div>
    </BaseNodeWrapper>
  );
}