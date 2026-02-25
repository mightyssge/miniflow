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

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  // --- RUN HISTORY ---
  getRunsKey(workflowId: string): string {
    return `miniflow_runs_2_${workflowId}`;
  },

  loadRuns(workflowId: string): any[] {
    const raw = localStorage.getItem(this.getRunsKey(workflowId));
    if (!raw) return [];
    try {
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  saveRun(workflowId: string, run: any): void {
    const runs = this.loadRuns(workflowId);
    // Keep only the last 50 runs to avoid bloated storage
    const updated = [run, ...runs].slice(0, 50);
    try {
      localStorage.setItem(this.getRunsKey(workflowId), JSON.stringify(updated));
    } catch (error) {
      console.error("[Storage]: Failed to save run history", error);
    }
  }
};