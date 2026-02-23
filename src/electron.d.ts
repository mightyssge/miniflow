export {}

declare global {
  interface Window {
    electronAPI: {
      // Operaciones de Archivos
      saveJson: (content: any) => Promise<string | null>
      openJson: () => Promise<any>
      
      // Ejecución de Motor Java
      runJavaTest: (folderName: string) => Promise<boolean>
      
      /**
       * Ejecuta el workflow. 
       * Nota: La promesa resuelve al final, pero los logs llegan vía eventos.
       */
      runWorkflow: (workflowJson: any) => Promise<{ 
        success: boolean; 
        exitCode: number; 
        stdout: string; 
        stderr: string 
      }>

      // NUEVO: Handlers para recibir el streaming de logs
      // Retornan una función de limpieza para remover el listener
      onWorkflowLog: (callback: (data: string) => void) => () => void
      onWorkflowError: (callback: (data: string) => void) => () => void
    }
  }
}