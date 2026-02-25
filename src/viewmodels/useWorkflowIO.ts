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
      console.log("[useWorkflowIO] Starting file read for:", file.name, file.type, file.size);
      const text = await file.text();
      console.log("[useWorkflowIO] File text read successfully (length):", text.length);
      const rawData = JSON.parse(text);
      console.log("[useWorkflowIO] JSON parsed successfully:", Object.keys(rawData));

      if (!rawData.nodes || !rawData.edges) throw new Error("Formato JSON inválido. Faltan nodes o edges.");

      console.log("[useWorkflowIO] Deserializing workflow...");
      const workflow = deserializeWorkflow(rawData);
      console.log("[useWorkflowIO] Validating workflow...");
      const report = validate(workflow.nodes, workflow.edges);

      if (!report.isValid) {
        console.warn("[useWorkflowIO] Workflow importado contiene errores de validación (incompleto), pero será cargado en el canvas.", report.issues);
      }

      console.log("[useWorkflowIO] Validation passed/bypassed. Firing onImportSuccess...");
      onImportSuccess(workflow);
    } catch (err: any) {
      console.error("[Import Error]:", err);
      if (typeof window !== "undefined") {
        alert("Error al importar el archivo: " + err.message);
      }
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("[useWorkflowIO] onFileChange triggered", e.target.files);
    const file = e.target.files?.[0];
    if (file) {
      console.log("[useWorkflowIO] File detected, calling handleImport");
      handleImport(file);
    } else {
      console.log("[useWorkflowIO] No file detected in event");
    }
    e.target.value = ""; // Permite re-seleccionar el mismo archivo
  };

  const downloadJsonFile = useCallback((state: any, handlers: any) => {
    handlers.saveCurrent();
    const data = { id: state.current?.id, name: state.current?.name, description: state.current?.description, nodes: state.nodes, edges: state.edges };
    const portable = serializeWorkflow(data as any);
    const blob = new Blob([JSON.stringify(portable, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${state.name || "workflow"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const copyToClipboard = useCallback(async (state: any, handlers: any) => {
    handlers.saveCurrent();
    const data = { id: state.current?.id, name: state.current?.name, description: state.current?.description, nodes: state.nodes, edges: state.edges };
    const portable = serializeWorkflow(data as any);
    await navigator.clipboard.writeText(JSON.stringify(portable, null, 2));
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