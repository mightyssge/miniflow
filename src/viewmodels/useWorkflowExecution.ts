import { useState } from "react";
import { parseJavaExecutionLogs } from "../models/workflow/WorkflowRunner";
import { LocalStorage } from "../models/storage/LocalStorage";

export function useWorkflowExecution() {
  const [runStatus, setRunStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [runResult, setRunResult] = useState<any>(null);

  const run = async (workflow: any) => {
    setRunStatus("running");
    setRunResult(null);
    const startTime = Date.now();

    try {
      const res = await window.electronAPI.runWorkflow(JSON.stringify(workflow));
      const duration = Date.now() - startTime;
      const steps = parseJavaExecutionLogs(res.stdout || "", workflow.nodes);
      const hasErrors = steps.some(s => s.status === "ERROR") || !res.ok;

      const finalRun = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        status: hasErrors ? "FAILED" : "SUCCESS",
        steps,
        rawStdout: res.stdout,
        exitCode: res.exitCode,
        duration
      };

      setRunResult(finalRun);
      LocalStorage.saveRun(workflow.id, finalRun);

      setRunStatus(hasErrors ? "error" : "success");
    } catch (e) {
      setRunStatus("error");
    }
  };

  const loadPastRun = (runObj: any) => {
    setRunResult(runObj);
    setRunStatus(runObj.status.toLowerCase() as "success" | "error");
  };

  return { runStatus, runResult, run, loadPastRun };
}