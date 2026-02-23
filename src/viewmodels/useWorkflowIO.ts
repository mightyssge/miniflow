import { useRef } from "react";
import { exportWorkflowJava } from "../models/workflow/WorkflowExporters";
import { validate } from "../models/workflow/WorkflowValidator";
import type { Workflow } from "../models/workflow/types";

/**
 * Hook para manejar la entrada y salida (I/O) de archivos.
 * Ahora utiliza la API nativa de Electron para una experiencia profesional.
 */
export function useWorkflowIO(persist: (wf: Workflow) => void) {
  // Mantenemos la ref por si algún componente aún la necesita para el input oculto,
  // aunque ahora usaremos diálogos nativos.
  const fileInputRef = useRef<HTMLInputElement>(null);

  // =============================
  // Exportar a JSON (Nativo)
  // =============================
  const exportJson = async (wf: Workflow) => {
    try {
      // Llamamos al proceso principal de Electron para abrir el "Guardar como..."
      const savedPath = await window.electronAPI.saveJson(wf);
      
      if (savedPath) {
        console.log(`Workflow guardado exitosamente en: ${savedPath}`);
      }
    } catch (err) {
      console.error("Error exportando JSON:", err);
      alert("No se pudo guardar el archivo.");
    }
  };

  // =============================
  // Importar desde JSON (Nativo)
  // =============================
  const openImport = async () => {
    try {
      // Abre el buscador de archivos nativo de Windows/macOS
      const obj = await window.electronAPI.openJson();
      
      // Si el usuario cierra la ventana sin elegir nada, 'obj' será null
      if (!obj) return;

      // Validamos que el JSON tenga la estructura mínima de React Flow
      if (obj.nodes && obj.edges) {
        const errs = validate(obj.nodes, obj.edges);
        
        if (errs.length) {
          const msg = [
            "El archivo seleccionado no es un Workflow válido:",
            "",
            ...errs.slice(0, 5)
          ].join("\n");
          alert(msg);
          return;
        }

        // Si es válido, lo guardamos en nuestro almacenamiento (localStorage/DB)
        persist({
          ...obj,
          id: obj.id || crypto.randomUUID()
        });
      } else {
        alert("El archivo no parece ser un Workflow de MiniFlow.");
      }
    } catch (err) {
      console.error("Error importando JSON:", err);
      alert("Error al leer el archivo JSON.");
    }
  };

  // =============================
  // Exportar a .java
  // =============================
  // Este sigue usando la lógica anterior (probablemente genera un string de texto)
  const exportJava = (wf: Workflow) => exportWorkflowJava(wf);

  // Este método queda como respaldo por si arrastras archivos al input
  const onImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const obj = JSON.parse(text);
      if (obj.nodes && obj.edges) {
        persist({ ...obj, id: obj.id || crypto.randomUUID() });
      }
    } catch {
      alert("Error al importar.");
    }
    e.target.value = "";
  };

  return { 
    fileInputRef, 
    exportJson, 
    exportJava, 
    onImportFile, 
    openImport 
  };
}