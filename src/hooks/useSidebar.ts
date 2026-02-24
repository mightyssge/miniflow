import { useState } from "react";

export function useSidebar(validationReport: any) {
  const [collapsed, setCollapsed] = useState(false);
  const [nodesOpen, setNodesOpen] = useState(true);
  const [summaryOpen, setSummaryOpen] = useState(true);

  const validationStatus = !validationReport ? "pending" : validationReport.isValid ? "valid" : "invalid";
  
  const statusLabel = {
    valid: "Válido",
    invalid: "Inválido",
    pending: "Pendiente"
  }[validationStatus];

  return {
    ui: { collapsed, nodesOpen, summaryOpen, validationStatus, statusLabel },
    actions: { setCollapsed, setNodesOpen, setSummaryOpen }
  };
}