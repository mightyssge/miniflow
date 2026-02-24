import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import styles from "./ValidationPanel.module.css";
import { type ValidationSeverity } from "../../../models/workflow/types";

export const SEVERITY_MAP: Record<ValidationSeverity, { icon: any; cls: string; label: string }> = {
    error: { icon: AlertCircle, cls: styles.sevError, label: "Error" },
    warning: { icon: AlertTriangle, cls: styles.sevWarning, label: "Advertencia" },
    info: { icon: Info, cls: styles.sevInfo, label: "Información" }
};

export const getIssueCounts = (issues: any[]) => ({
    error: issues.filter(i => i.severity === "error").length,
    warning: issues.filter(i => i.severity === "warning").length,
    info: issues.filter(i => i.severity === "info").length,
});