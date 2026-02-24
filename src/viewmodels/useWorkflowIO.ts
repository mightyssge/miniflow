import { useRef } from "react";
import { WorkflowExporters } from "../models/workflow/WorkflowExporters";
import { validate } from "../models/workflow/WorkflowValidator";
import { deserializeWorkflow } from "../models/workflow/WorkflowDeserializer";
import type { Workflow } from "../models/workflow/types";

export function useWorkflowIO(onImportSuccess: (wf: Workflow) => void) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const rawData = JSON.parse(text);

      // 1. Validamos la estructura básica antes de procesar
      if (!rawData.nodes || !rawData.edges) throw new Error("Formato JSON inválido.");

      // 2. IMPORTANTE: Convertimos de Portable JSON a ReactFlow format
      const workflow = deserializeWorkflow(rawData);

      // 3. Validamos lógica de negocio (ciclos, starts, etc)
      const report = validate(workflow.nodes, workflow.edges);
      
      if (!report.isValid) {
        const errors = report.issues.filter(i => i.severity === "error").map(i => i.message);
        throw new Error("Errores de validación:\n" + errors.slice(0, 3).join("\n"));
      }

      onImportSuccess(workflow);
    } catch (err: any) {
      console.error("[Import Error]:", err);
      alert(err.message || "Error al importar el archivo.");
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImport(file);
    e.target.value = ""; // Reset para permitir importar el mismo archivo dos veces
  };

  return {
    fileInputRef,
    onFileChange,
    exportJson: WorkflowExporters.asJson,
    exportJava: WorkflowExporters.asJava,
    triggerImport: () => fileInputRef.current?.click()
  };
}