import { useState, useEffect, useCallback } from "react";

export function useNodeConfig(
    node: any, 
    onSave: Function, 
    onClose: Function, 
    initialTab: string = "parameters" // Added this parameter
) {
    // Initialize with initialTab instead of a hardcoded string
    const [activeTab, setActiveTab] = useState<string>(initialTab);
    const [label, setLabel] = useState(node?.data?.label || "");
    const [config, setConfig] = useState<any>({ ...(node?.data?.config || {}) });
    const [testResult, setTestResult] = useState<string | null>(null);

    useEffect(() => {
        if (!node) return;
        setLabel(node.data?.label || "");
        setConfig({ ...(node.data?.config || {}) });
        setTestResult(null);
        // Sync tab if the node changes (optional, but keeps UI consistent)
        setActiveTab(initialTab);
    }, [node, initialTab]);

    const handleEscape = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
    }, [onClose]);

    useEffect(() => {
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [handleEscape]);

    const patchConfig = (key: string, value: any) => 
        setConfig((c: any) => ({ ...c, [key]: value }));

    const patchMap = (key: string, value: string) =>
        setConfig((c: any) => ({ ...c, map: { ...(c.map || {}), [key]: value } }));

    const handleSave = () => {
        onSave(node.id, { label, config });
        onClose();
    };

    return {
        state: { activeTab, label, config, testResult },
        actions: { setActiveTab, setLabel, setConfig, setTestResult, patchConfig, patchMap, handleSave }
    };
}