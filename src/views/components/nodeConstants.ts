import { Zap, Globe, GitBranch, Terminal, Flag, Clock, Navigation, Merge } from "lucide-react";
import type { NodeType } from "../../models/workflow/types";

export const TYPE_META: Record<string, { icon: any; color: string; label: string }> = {
  start: { icon: Zap, color: "#28b478", label: "START" },
  http_request: { icon: Globe, color: "#78b4ff", label: "HTTP_REQUEST" },
  conditional: { icon: GitBranch, color: "#f5a623", label: "CONDITIONAL" },
  command: { icon: Terminal, color: "#a78bfa", label: "COMMAND" },
  timer: { icon: Clock, color: "#60a5fa", label: "TIMER" },
  parallel: { icon: Navigation, color: "#a5ceff", label: "PARALLEL" },
  parallel_join: { icon: Merge, color: "#a78bfa", label: "BARRIER" },
  end: { icon: Flag, color: "#d23750", label: "END" },
};

export const NODE_PALETTE = [
  { type: "start" as NodeType, label: "Start", icon: Zap, color: "#28b478" },
  { type: "http_request" as NodeType, label: "HTTP Request", icon: Globe, color: "#78b4ff" },
  { type: "conditional" as NodeType, label: "Condicional", icon: GitBranch, color: "#f5a623" },
  { type: "command" as NodeType, label: "Comando", icon: Terminal, color: "#a78bfa" },
  { type: "timer" as NodeType, label: "Timer", icon: Clock, color: "#60a5fa" },
  { type: "parallel" as NodeType, label: "Paralelo", icon: Navigation, color: "#a5ceff" },
  { type: "parallel_join" as NodeType, label: "Barrera", icon: Merge, color: "#a78bfa" },
  { type: "end" as NodeType, label: "Fin", icon: Flag, color: "#d23750" },
];