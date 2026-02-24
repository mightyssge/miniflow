import { useRef, useCallback } from "react";
import { WorkflowExporters } from "../models/workflow/WorkflowExporters";
import { validate } from "../models/workflow/WorkflowValidator";
import { serializeWorkflow } from "../models/workflow/WorkflowSerializer";
import { deserializeWorkflow } from "../models/workflow/WorkflowDeserializer";
import type { Workflow } from "../models/workflow/types";

export function useWorkflowIO(onImportSuccess: (wf: Workflow) => void) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const rawData = JSON.parse(text);

      if (!rawData.nodes || !rawData.edges) throw new Error("Formato JSON inválido.");

      const workflow = deserializeWorkflow(rawData);
      const report = validate(workflow.nodes, workflow.edges);

      if (!report.isValid) {
        const errors = report.issues.filter(i => i.severity === "error").map(i => i.message);
        throw new Error("Errores de validación:\n" + errors.slice(0, 3).join("\n"));
      }

      onImportSuccess(workflow);
    } catch (err: any) {
      console.error("[Import Error]:", err);
      throw new Error(err.message || "Error al importar el archivo.");
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImport(file);
    e.target.value = "";
  };

  const downloadJsonFile = useCallback((state: any, handlers: any) => {
    handlers.saveCurrent();
    const data = { id: state.currentId, name: state.name, description: state.description, nodes: state.nodes, edges: state.edges };
    const portable = serializeWorkflow(data as any);
    const blob = new Blob([JSON.stringify(portable, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${state.name || "workflow"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const copyToClipboard = useCallback((state: any, handlers: any) => {
    handlers.saveCurrent();
    const data = { id: state.currentId, name: state.name, description: state.description, nodes: state.nodes, edges: state.edges };
    const portable = serializeWorkflow(data as any);
    navigator.clipboard.writeText(JSON.stringify(portable, null, 2));
  }, []);

  return {
    fileInputRef,
    onFileChange,
    exportJson: WorkflowExporters.asJson,
    exportJava: WorkflowExporters.asJava,
    triggerImport: () => fileInputRef.current?.click(),
    downloadJsonFile,
    copyToClipboard
  };
}