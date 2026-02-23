// electron/preload.cts
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("electronAPI", {
  saveJson: (content: any) => ipcRenderer.invoke("save-json", content),
  openJson: () => ipcRenderer.invoke("open-json"),
  runJavaTest: (name: any) => ipcRenderer.invoke("run-java-test", name),
  runWorkflow: (workflowJson: any) => ipcRenderer.invoke("run-workflow", workflowJson),

  onWorkflowLog: (callback: (data: string) => void) => {
    const subscription = (_event: any, value: string) => callback(value);
    ipcRenderer.on("workflow-log-stdout", subscription);
    return () => ipcRenderer.removeListener("workflow-log-stdout", subscription);
  },

  onWorkflowError: (callback: (data: string) => void) => {
    const subscription = (_event: any, value: string) => callback(value);
    ipcRenderer.on("workflow-log-stderr", subscription);
    return () => ipcRenderer.removeListener("workflow-log-stderr", subscription);
  },
});