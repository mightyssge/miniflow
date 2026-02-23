package com.miniflow;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.miniflow.model.Workflow;
import com.miniflow.core.WorkflowRunner;
import java.util.Scanner;
import java.util.Map;

/**
 * REFACTOR: Se implementa try-with-resources para evitar fugas de memoria (Resource Leaks).
 */
public class Main {
    public static void main(String[] args) {
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

        // Al declarar el scanner aquí, Java lo cierra automáticamente al salir del try
        try (Scanner scanner = new Scanner(System.in)) {
            StringBuilder sb = new StringBuilder();
            
            // Leemos el JSON enviado por el proceso padre (Electron)
            while (scanner.hasNextLine()) {
                sb.append(scanner.nextLine());
            }
            
            String jsonInput = sb.toString();
            if (jsonInput.isBlank()) return;

            // Procesamiento del Workflow
            Workflow workflow = mapper.readValue(jsonInput, Workflow.class);
            new WorkflowRunner().run(workflow);

        } catch (Exception e) {
            handleCriticalError(e, mapper);
            System.exit(1);
        }
    }

    /**
     * Centraliza el reporte de errores hacia el Frontend en formato JSON.
     */
    private static void handleCriticalError(Exception e, ObjectMapper mapper) {
        try {
            String errorJson = mapper.writeValueAsString(Map.of(
                "status", "CRITICAL_ERROR",
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
            System.out.println(errorJson);
        } catch (Exception fatal) {
            // Si el motor JSON falla, caemos en stderr como último recurso
            System.err.println("FATAL_ERROR: " + e.getMessage());
        }
    }
}