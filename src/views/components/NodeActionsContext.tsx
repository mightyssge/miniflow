import { createContext, useContext, type ReactNode } from "react";

interface NodeActions {
  onEdit: (nodeId: string) => void;
  onDuplicate: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
}

// 1. Iniciamos con null para detectar si el Provider falta
const NodeActionsContext = createContext<NodeActions | null>(null);

interface ProviderProps {
  children: ReactNode;
  actions: NodeActions;
}

// 2. Un Wrapper para el Provider que simplifica su uso en el layout
export function NodeActionsProvider({ children, actions }: ProviderProps) {
  return (
    <NodeActionsContext.Provider value={actions}>
      {children}
    </NodeActionsContext.Provider>
  );
}

// 3. Hook con protección de seguridad
export const useNodeActions = () => {
  const context = useContext(NodeActionsContext);
  
  if (!context) {
    throw new Error(
      "useNodeActions debe ser usado dentro de un NodeActionsProvider. " +
      "Asegúrate de envolver tu ReactFlow con este Provider."
    );
  }
  
  return context;
};