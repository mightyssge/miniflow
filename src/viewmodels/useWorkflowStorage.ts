import { useState } from "react";
import { loadAll, saveAll } from "../models/storage/LocalStorage";
import type { Workflow } from "../models/workflow/types";

/**
 * Hook para gestionar la persistencia de workflows.
 * Centraliza la carga y guardado en LocalStorage.
 */
export function useWorkflowStorage() {
  // 1. Inicializamos el estado cargando lo que hay en disco (o storage del navegador)
  const [workflows, setWorkflows] = useState<Workflow[]>(() => {
    // REFACTOR: Eliminamos filtros de prueba (como el de WORKFLOW_2) 
    // para que la persistencia sea real.
    const arr = loadAll();
    return arr;
  });

  // 2. Controlamos qué workflow está viendo el usuario actualmente
  const [currentId, setCurrentId] = useState<string | null>(() => workflows[0]?.id ?? null);

  /**
   * Guarda o actualiza un workflow.
   * Si ya existe lo reemplaza; si es nuevo, lo pone al principio.
   */
  const persist = (wf: Workflow) => {
    setWorkflows((prev) => {
      const next = [...prev];
      const idx = next.findIndex(w => w.id === wf.id);
      
      if (idx >= 0) {
        next[idx] = wf; // Actualizar existente
      } else {
        next.unshift(wf); // Insertar nuevo al inicio
      }
      
      saveAll(next);
      return next;
    });
    
    setCurrentId(wf.id);
  };

  /**
   * Elimina un workflow por ID.
   * Si el workflow eliminado era el actual, cambia la vista al primero disponible.
   */
  const remove = (id: string) => {
    setWorkflows((prev) => {
      const next = prev.filter(w => w.id !== id);
      saveAll(next);
      
      // Si borramos el actual, seleccionamos el siguiente disponible
      if (currentId === id) {
        setCurrentId(next[0]?.id || null);
      }
      
      return next;
    });
  };

  return { 
    workflows, 
    currentId, 
    setCurrentId, 
    persist, 
    remove 
  };
}