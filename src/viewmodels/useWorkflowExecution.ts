import { useState } from "react";
import { parseJavaExecutionLogs } from "../models/workflow/WorkflowRunner";
import { LocalStorage } from "../models/storage/LocalStorage";
import type { SystemWorkflow, WorkflowExecutionResult } from "../models/workflow/coreTypes";

export function useWorkflowExecution() {
  const [runStatus, setRunStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [runResult, setRunResult] = useState<WorkflowExecutionResult | null>(null);

  const run = async (workflow: SystemWorkflow) => {
    setRunStatus("running");
    setRunResult(null);
    const startTime = Date.now();

    try {
      const res = await window.electronAPI.runWorkflow(JSON.stringify(workflow));
      const duration = Date.now() - startTime;
      const steps = parseJavaExecutionLogs(res.stdout || "", workflow.nodes);
      const hasErrors = steps.some(s => s.status === "ERROR") || !res.ok;

      const finalRun: WorkflowExecutionResult = {
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

  const loadPastRun = (runObj: WorkflowExecutionResult) => {
    setRunResult(runObj);
    setRunStatus(runObj.status.toLowerCase() as "success" | "error");
  };

  return { runStatus, runResult, run, loadPastRun };
}