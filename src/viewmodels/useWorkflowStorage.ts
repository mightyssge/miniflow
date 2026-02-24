import { useState, useCallback } from "react";
import { LocalStorage } from "../models/storage/LocalStorage";
import type { Workflow } from "../models/workflow/types";

export function useWorkflowStorage() {
  // Inicializamos el estado desde LocalStorage una sola vez
  const [workflows, setWorkflows] = useState<Workflow[]>(() => LocalStorage.loadAll());
  const [currentId, setCurrentId] = useState<string | null>(() => workflows[0]?.id ?? null);

  // PERSIST: Guarda o actualiza un workflow
  const persist = useCallback((wf: Workflow) => {
    setWorkflows((prev) => {
      const exists = prev.some(w => w.id === wf.id);
      const next = exists 
        ? prev.map(w => w.id === wf.id ? wf : w)
        : [wf, ...prev];
      
      LocalStorage.saveAll(next);
      return next;
    });
    setCurrentId(wf.id);
  }, []);

  // REMOVE: Elimina un workflow y gestiona el ID actual
  const remove = useCallback((id: string) => {
    setWorkflows((prev) => {
      const next = prev.filter(w => w.id !== id);
      LocalStorage.saveAll(next);
      return next;
    });

    // Si borramos el que estamos viendo, saltamos al primero disponible
    setCurrentId((prevId) => {
        if (prevId !== id) return prevId;
        const remaining = LocalStorage.loadAll(); // Leemos el estado actualizado
        return remaining[0]?.id || null;
    });
  }, []);

  return { 
    workflows, 
    currentId, 
    setCurrentId, 
    persist, 
    remove 
  };
}