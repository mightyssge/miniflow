import type { HttpRequestConfig, CommandConfig, ConditionalConfig, TimerConfig } from "./types";

// Las llaves deben ser idénticas a NodeType: "http_request", "command", etc.
export const NODE_DEFAULTS = {
  http_request: (): HttpRequestConfig => ({
    method: "GET", url: "https://api.example.com/data",
    timeoutMs: 5000, retries: 3, errorPolicy: "STOP_ON_FAIL",
    map: { status: "$.status", payload: "$.data" }
  }),
  command: (): CommandConfig => ({ command: "", args: "", errorPolicy: "STOP_ON_FAIL" }),
  conditional: (): ConditionalConfig => ({ condition: "context.status == 200", errorPolicy: "STOP_ON_FAIL" }),
  timer: (): TimerConfig => ({ delay: 3, unit: "s" })
};