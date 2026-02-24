import { Globe } from "lucide-react";
import { type NodeProps } from "reactflow";
import type { HttpRequestConfig } from "../../../models/workflow/types";
import BaseNodeWrapper from "./BaseNodeWrapper";
import base from "./BaseNode.module.css";

// 1. Tipado estricto para evitar el error de 'NodeData' que no existía
// y eliminar el uso de 'any' en la configuración.
interface HttpRequestNodeData {
  label: string;
  config: HttpRequestConfig;
}

export default function HttpRequestNode({ id, data }: NodeProps<HttpRequestNodeData>) {
  // 2. Destructuring limpio. Gracias al tipado, TS ya sabe qué hay en config.
  const { method, url } = data.config;

  return (
    <BaseNodeWrapper 
      id={id} 
      typeLabel="HTTP_REQUEST" 
      icon={<Globe size={13} />} 
      color="#78b4ff" // Mantenemos tu color original
    >
      {/* 3. El contenido es puramente declarativo ahora */}
      <div className={base.nodeLabel}>{data.label || "Consultar API"}</div>
      
      <div className={base.nodeHint}>
        <span style={{ fontWeight: 800, marginRight: '4px', color: '#78b4ff' }}>
          {method || "GET"}
        </span>
        {url || "api/v1/resource"}
      </div>
    </BaseNodeWrapper>
  );
}