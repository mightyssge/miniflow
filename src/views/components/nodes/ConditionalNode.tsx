import { GitBranch } from "lucide-react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { ConditionalConfig } from "../../../models/workflow/types";
import BaseNodeWrapper from "./BaseNodeWrapper";
import base from "./BaseNode.module.css";

// Tipado estricto basado en tus interfaces de types.ts
interface ConditionalNodeData {
  label: string;
  config: ConditionalConfig;
}

export default function ConditionalNode({ id, data }: NodeProps<ConditionalNodeData>) {
  const { config } = data;

  // Lógica de visualización de la condición (Data Clump encapsulado)
  const conditionDisplay = config.expression
    ? `${config.expression.leftOperand} ${config.expression.operator} ${config.expression.rightOperand}`
    : config.condition || "";

  return (
    <BaseNodeWrapper
      id={id}
      typeLabel="CONDITIONAL"
      icon={<GitBranch size={13} />}
      color="#f5a623"
      showSource={false} // Desactivamos el source automático para poner los nuestros
    >
      <div className={base.nodeLabel}>{data.label || "Evaluar"}</div>
      {conditionDisplay && <div className={base.nodeHint}>{conditionDisplay}</div>}

      {/* Handles específicos de Condicional: TRUE y FALSE */}
      <Handle
        id="true"
        type="source"
        position={Position.Right}
        style={{ top: "38%", background: "#28b478", borderColor: "#28b478" }}
      />
      <Handle
        id="false"
        type="source"
        position={Position.Right}
        style={{ top: "75%", background: "#d23750", borderColor: "#d23750" }}
      />
    </BaseNodeWrapper>
  );
}