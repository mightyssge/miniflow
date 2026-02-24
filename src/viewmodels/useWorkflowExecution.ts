import { useState } from "react";
import { parseJavaExecutionLogs } from "../models/workflow/WorkflowRunner";

export function useWorkflowExecution() {
  const [runStatus, setRunStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [runResult, setRunResult] = useState<any>(null);

  const run = async (workflow: any) => {
    setRunStatus("running");
    try {
      const res = await window.electronAPI.runWorkflow(JSON.stringify(workflow));
      const steps = parseJavaExecutionLogs(res.stdout || "", workflow.nodes);
      const hasErrors = steps.some(s => s.status === "ERROR") || !res.ok;
      
      setRunResult({
        status: hasErrors ? "FAILED" : "SUCCESS",
        steps,
        rawStdout: res.stdout,
        exitCode: res.exitCode
      });
      setRunStatus(hasErrors ? "error" : "success");
    } catch (e) {
      setRunStatus("error");
    }
  };

  return { runStatus, runResult, run };
}