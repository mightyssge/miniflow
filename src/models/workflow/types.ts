import type { Node, Edge } from "reactflow"

export type NodeType = "start" | "http_request" | "conditional" | "command" | "end" | "timer" | "parallel" | "parallel_join"
export type ErrorPolicy = "STOP_ON_FAIL" | "CONTINUE_ON_FAIL"

/* ── 1. Eliminando Data Clumps: Encapsulamos la expresión condicional ── */
export interface ComparisonExpression {
  leftOperand: string
  operator: string
  rightOperand: string
}

/* ── 2. Configuraciones Específicas ── */
export interface CommandConfig {
  command: string
  scriptPath?: string
  args: string
  outputKey?: string
  envVars?: string
  cwd?: string
  timeoutMs?: number
  captureOutput?: string
  errorPolicy: ErrorPolicy // Obligatorio para evitar ambigüedad
}

export interface HttpRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  url: string
  timeoutMs: number
  retries: number
  errorPolicy: ErrorPolicy
  headers?: string
  body?: string
  map?: {
    status?: string
    payload?: string
  }
}

export interface ConditionalConfig {
  condition: string
  expression?: ComparisonExpression // Grupo de datos extraído
  errorPolicy: ErrorPolicy
}

export interface TimerConfig {
  delay: number
  unit: "ms" | "s" | "min"
}

/* ── 3. Eliminando Switch Statements (Discriminated Union) ── */
// Ahora el compilador SABRÁ que si el tipo es 'command', la config es CommandConfig
export type FlowNode =
  | Node<{ label: string; config: CommandConfig }, 'command'>
  | Node<{ label: string; config: HttpRequestConfig }, 'http_request'>
  | Node<{ label: string; config: ConditionalConfig }, 'conditional'>
  | Node<{ label: string; config: TimerConfig }, 'timer'>
  | Node<{ label: string; config: Record<string, never> }, 'parallel'>
  | Node<{ label: string; config: Record<string, never> }, 'parallel_join'>
  | Node<{ label: string; config: Record<string, never> }, 'start' | 'end'>

export type FlowEdge = Edge

/* ── Workflow e interfaces de soporte ── */
export interface Workflow {
  id: string
  name: string
  description: string
  nodes: FlowNode[]
  edges: FlowEdge[]
  lastRunAt?: string
  validationStatus: 'valid' | 'invalid' | 'pending' // Quitamos el opcional
}

export type ValidationSeverity = "error" | "warning" | "info"

export interface ValidationIssue {
  severity: ValidationSeverity
  nodeId?: string
  message: string
  action: "focus" | "none"
}

export interface ValidationReport {
  isValid: boolean
  issues: ValidationIssue[]
}