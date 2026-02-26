const parseJavaExecutionLogs = (stdout, nodes) => {
    const steps = [];
    const lines = stdout.split('\n');

    lines.forEach((line) => {
        // Thread-safe isolation: Buscamos el ID inyectado explícitamente [JAVA-STDOUT]: [node-id]
        const idMatch = line.match(/\[JAVA-STDOUT\]:\s*\[([^\]]+)\]/);
        if (!idMatch) return; // Si no tiene un ID explícito, es un log global, lo ignoramos

        const nodeId = idMatch[1].trim();
        let step = steps.find(s => s.nodeId === nodeId);

        // Si es la primera vez que leemos algo de este nodo, revisamos si es la línea de inicialización "Nodo: ID [TIPO]"
        if (!step) {
            const typeMatch = line.match(/Nodo:\s+[^\s]+\s+\[([^\]]+)\]/);
            if (typeMatch) {
                step = {
                    nodeId: nodeId,
                    nodeType: typeMatch[1].trim(),
                    status: "SUCCESS",
                    nodeLabel: nodes.find(n => n.id === nodeId)?.data?.label || "Nodo",
                    durationMs: 0, inputData: null, outputData: null, configData: null, details: null
                };
                steps.push(step);
            }
        }

        if (step) {
            const tryParse = (line, marker) => {
                try {
                    const jsonStr = line.substring(line.indexOf(marker) + marker.length).trim();
                    return jsonStr ? JSON.parse(jsonStr) : {};
                } catch { return null; }
            };

            if (line.includes("-> INPUT DATA:")) step.inputData = tryParse(line, "INPUT DATA:");
            if (line.includes("-> CONFIG:")) step.configData = tryParse(line, "CONFIG:");
            if (line.includes("OUTPUT DATA -->:")) step.outputData = tryParse(line, "OUTPUT DATA -->:");
            if (line.includes("NODE_EXEC_DETAILS -->:")) step.details = tryParse(line, "NODE_EXEC_DETAILS -->:");
            if (line.includes("Resultado: ERROR -->")) {
                step.status = "ERROR";
                step.error = line.split("Resultado: ERROR -->")[1]?.trim() || "Error en ejecución";
            }
            if (line.includes("DURATION -->:")) {
                const match = line.match(/DURATION -->:\s+(\d+)ms/);
                if (match) step.durationMs = parseInt(match[1], 10);
            }
        }
    });
    return steps;
};

const stdout = `
[JAVA-STDOUT]: [d7e48c1a-2cc6-455b-9b43-85bbf083e9b5] ======================
[JAVA-STDOUT]: [d7e48c1a-2cc6-455b-9b43-85bbf083e9b5] Nodo: d7e48c1a-2cc6-455b-9b43-85bbf083e9b5 [COMMAND]
[JAVA-STDOUT]: [d7e48c1a-2cc6-455b-9b43-85bbf083e9b5]    -> INPUT DATA: {}
[JAVA-STDOUT]: [d7e48c1a-2cc6-455b-9b43-85bbf083e9b5]    -> CONFIG: {"captureOutput":"stdout","script":"echo Lento && timeout /t 3","command":"cmd","timeoutMs":5000}
[JAVA-STDOUT]: [d7e48c1a-2cc6-455b-9b43-85bbf083e9b5] 
[JAVA-STDOUT]: [d7e48c1a-2cc6-455b-9b43-85bbf083e9b5]    OUTPUT DATA -->: {"status":"success"}
[JAVA-STDOUT]: [d7e48c1a-2cc6-455b-9b43-85bbf083e9b5]    NODE_EXEC_DETAILS -->: {"pid": 26972, "stdout": "Lento\r\n"}
[JAVA-STDOUT]: [d7e48c1a-2cc6-455b-9b43-85bbf083e9b5] 
[JAVA-STDOUT]: [d7e48c1a-2cc6-455b-9b43-85bbf083e9b5] Resultado --> OK
[JAVA-STDOUT]: [d7e48c1a-2cc6-455b-9b43-85bbf083e9b5]    DURATION -->: 3042ms
[JAVA-STDOUT]: [d7e48c1a-2cc6-455b-9b43-85bbf083e9b5] ======================
`;

const nodes = [{ id: "d7e48c1a-2cc6-455b-9b43-85bbf083e9b5", data: { label: "TestNode" } }];

console.log(JSON.stringify(parseJavaExecutionLogs(stdout, nodes), null, 2));
