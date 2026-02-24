import { type ReactNode } from "react";
import { Handle, Position } from "reactflow";
import NodeMenu from "./NodeMenu"; 
import styles from "./TimerNode.module.css";

interface RoundProps {
  id: string;
  selected?: boolean;
  progress: number;
  isSuccess: boolean;
  children: ReactNode;
}

export default function RoundNodeWrapper({ id, selected, progress, isSuccess, children }: RoundProps) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((isSuccess ? 1 : progress) * circumference);

  return (
    <div className={`${styles.circleNode} ${selected ? styles.selected : ""}`}>
      <svg className={styles.svgRing} viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} className={styles.track} />
        <circle
          cx="40" cy="40" r={radius}
          className={`${styles.progress} ${isSuccess ? styles.progressSuccess : ""}`}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className={styles.innerContent}>{children}</div>

      <NodeMenu id={id} className={styles.kebabWrap} />

      <Handle type="target" position={Position.Left} className={styles.handleLeft} />
      <Handle type="source" position={Position.Right} className={styles.handleRight} />
    </div>
  );
}