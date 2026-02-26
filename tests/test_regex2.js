const tryParse = (line, marker) => {
    try {
        const jsonStr = line.substring(line.indexOf(marker) + marker.length).trim();
        console.log("JSONSTR:", jsonStr);
        return jsonStr ? JSON.parse(jsonStr) : {};
    } catch (e) {
        console.error("ERROR PARSING:", e);
        return null;
    }
};

const line = `[JAVA-STDOUT]: [d7e48c1a]    NODE_EXEC_DETAILS -->: {"pid": 26972, "stdout": "Lento\\r\\n"}`;
tryParse(line, "NODE_EXEC_DETAILS -->:");
