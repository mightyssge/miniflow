import styles from "../NodeConfigModal.module.css";

export function JsonTabViewer({ activeTab, execStep }: any) {
    const dataMap: any = {
        input: { data: execStep?.inputData, label: "datos de entrada previos" },
        config: { data: execStep?.configData, label: "metadata de configuración dinámica" },
        output: { data: execStep?.outputData, label: "variables de salida" },
        details: { data: execStep?.details, label: "detalles de ejecución" },
    };

    const current = dataMap[activeTab];

    return (
        <div className={styles.jsonViewer}>
            {current?.data ? (
                <pre>{JSON.stringify(current.data, null, 2)}</pre>
            ) : (
                <div className={styles.emptyState}>
                    No hay {current?.label} para mostrar.
                </div>
            )}
        </div>
    );
}