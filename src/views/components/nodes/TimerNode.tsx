import { useMemo } from "react";
import { type NodeProps } from "reactflow";
import { Clock, CheckCircle2 } from "lucide-react";
import { useWorkflowViewModel } from "../../../viewmodels/useWorkflowViewModel";
import { useTimerAnimation } from "../../../hooks/useTimerAnimation";
import type { TimerConfig } from "../../../models/workflow/types";
import RoundNodeWrapper from "./RoundNodeWrapper"; // Importamos el cascarón
import styles from "./TimerNode.module.css";

interface TimerNodeData {
  label: string;
  config: TimerConfig;
}

export default function TimerNode({ id, data, selected }: NodeProps<TimerNodeData>) {
  const { state: { runResult } } = useWorkflowViewModel();
  
  // 1. Extraemos config con valores por defecto
  const { delay = 3, unit = "s" } = data.config || {};
  
  const totalMs = useMemo(() => {
    let ms = delay;
    if (unit === "s") ms *= 1000;
    if (unit === "min") ms *= 60000;
    return ms;
  }, [delay, unit]);

  // 2. Estado de ejecución y animación
  const stepStatus = runResult?.steps?.find((s: any) => s.nodeId === id)?.status || "idle";
  const isRunning = stepStatus === "running";
  const isSuccess = stepStatus === "success";

  // Obtenemos el progreso desde nuestro custom hook
  const { progress, timeLeftStr } = useTimerAnimation(isRunning, isSuccess, totalMs);

  return (
    <RoundNodeWrapper 
      id={id} 
      selected={selected} 
      progress={progress} 
      isSuccess={isSuccess}
    >
      {/* Este es el 'children' que recibe el RoundNodeWrapper */}
      {isSuccess ? (
        <CheckCircle2 size={24} className={styles.successIcon} />
      ) : isRunning ? (
        <span className={styles.countdown}>{timeLeftStr}</span>
      ) : (
        <>
          <Clock size={20} className={styles.idleIcon} />
          <span className={styles.timeDesc}>{delay}{unit}</span>
        </>
      )}
    </RoundNodeWrapper>
  );
}