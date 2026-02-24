import type { Workflow } from "./types"
import { serializeWorkflow } from "./WorkflowSerializer"

/**
 * UTILS: Extraemos la lógica de nombrado para evitar Duplicate Code e inconsistencias.
 */
const slugify = (text: string) => text.replace(/\W+/g, "_");

/**
 * 1. REFACTOR (Encapsulate Implementation): 
 * Separamos la descarga del navegador de la generación de archivos.
 */
const downloadFile = (content: string, filename: string, mime = "text/plain") => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * 2. REFACTOR (Extract Method): 
 * Lógica pura para generar el String de Java, separada del IO.
 */
const generateJavaTemplate = (className: string, jsonContent: string): string => {
  const escapedJson = jsonContent
    .replace(/\\/g, "\\\\")
    .replace(/"/g, "\\\"")
    .replace(/\n/g, "\\n");

  return `public class ${className} {\n  public static final String WORKFLOW_JSON = "${escapedJson}";\n}`;
};

/**
 * EXPORTADORES PÚBLICOS
 */
export const WorkflowExporters = {
  
  asJson(wf: Workflow) {
    const data = serializeWorkflow(wf);
    const filename = `${slugify(wf.name)}.json`;
    downloadFile(JSON.stringify(data, null, 2), filename, "application/json");
  },

  asJava(wf: Workflow) {
    const className = `Workflow_${slugify(wf.name)}`;
    const jsonData = JSON.stringify(serializeWorkflow(wf), null, 2);
    
    const content = generateJavaTemplate(className, jsonData);
    downloadFile(content, `${className}.java`);
  }
};