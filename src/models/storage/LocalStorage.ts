import type { Workflow } from "../workflow/types";

const STORAGE_KEY = "miniflow_builder_workflow2";

/**
 * Persistencia en LocalStorage con manejo de errores y validación básica.
 */
export const LocalStorage = {
  
  loadAll(): Workflow[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    try {
      const data = JSON.parse(raw);
      
      // Verificamos que sea un array para evitar errores de mapeo en la UI
      if (!Array.isArray(data)) {
        console.warn("[Storage]: Data is not an array, returning empty.");
        return [];
      }

      return data as Workflow[];
    } catch (error) {
      console.error("[Storage]: Failed to parse workflows from LocalStorage", error);
      return [];
    }
  },

  saveAll(workflows: Workflow[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
    } catch (error) {
      console.error("[Storage]: Failed to save workflows", error);
    }
  },

  // Añadimos un método de utilidad que seguramente necesitarás
  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
};