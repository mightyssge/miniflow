package com.miniflow.strategies;

import com.miniflow.context.ExecutionContext;
import com.miniflow.model.Node;
import com.miniflow.utils.*;
import java.nio.file.*;
import java.util.*;

public class CommandStrategy implements NodeExecutor {

    @Override
    public void execute(Node node, ExecutionContext context) throws Exception {
        Map<String, Object> cfg = node.getConfig();

        // 1. Renderizado de templates
        String command = TemplateEngine.render(TypeConverter.asString(cfg.get("command")), context);
        String args = TemplateEngine.render(TypeConverter.asString(cfg.get("args")), context);
        String scriptPath = TemplateEngine.render(TypeConverter.asString(cfg.get("scriptPath")), context);

        if (command == null || command.isBlank())
            throw new Exception("Command is required");

        // Parche de compatibilidad Windows para rubric requirements (bash nativo)
        if (OSUtils.isWindows() && command.trim().equalsIgnoreCase("bash")) {
            command = "\"C:\\Program Files\\Git\\bin\\bash.exe\"";
        }

        // 2. Preparar el comando final
        String finalArgs = prepareArguments(command, scriptPath, args, context);
        String fullCommand = finalArgs.isBlank() ? command : command + " " + finalArgs;

        // 3. Ejecutar
        executeProcess(fullCommand, cfg, context, node.getId());
    }

    private void executeProcess(String fullCmd, Map<String, Object> cfg, ExecutionContext ctx, String nodeId)
            throws Exception {
        List<String> wrapper = OSUtils.isWindows() ? List.of("cmd", "/c", fullCmd) : List.of("bash", "-lc", fullCmd);

        ProcessBuilder pb = new ProcessBuilder(wrapper);

        // 0. Soporte para CWD dinámico
        String cwdPath = TypeConverter.asString(cfg.get("cwd"));
        if (cwdPath != null && !cwdPath.isBlank()) {
            Path p = Paths.get(TemplateEngine.render(cwdPath, ctx));
            if (Files.exists(p)) {
                pb.directory(p.toFile());
            }
        }

        Process process = pb.start();

        // 0. Si hay inputKey, inyectarlo por STDIN (tubería) para evitar límites de arg
        // length en Windows
        String inputKey = TypeConverter.asString(cfg.get("inputKey"));
        if (inputKey != null && !inputKey.isBlank()) {
            Object inputData = ctx.getVariable(inputKey);
            if (inputData != null) {
                try (java.io.OutputStream os = process.getOutputStream()) {
                    os.write(String.valueOf(inputData).getBytes(java.nio.charset.StandardCharsets.UTF_8));
                }
            }
        }

        // Evitar deadlock por buffer OS lleno consumiendo la salida asincrónicamente
        java.util.concurrent.CompletableFuture<String> outFuture = java.util.concurrent.CompletableFuture
                .supplyAsync(() -> {
                    try {
                        return OSUtils.readStream(process.getInputStream());
                    } catch (Exception e) {
                        return "";
                    }
                });
        java.util.concurrent.CompletableFuture<String> errFuture = java.util.concurrent.CompletableFuture
                .supplyAsync(() -> {
                    try {
                        return OSUtils.readStream(process.getErrorStream());
                    } catch (Exception e) {
                        return "";
                    }
                });

        long timeoutMs = TypeConverter.asInt(cfg.get("timeoutMs"), 30000);
        boolean finished = process.waitFor(timeoutMs, java.util.concurrent.TimeUnit.MILLISECONDS);

        if (!finished) {
            process.destroyForcibly();
            throw new Exception("Command Execution Time Out Exceeded (" + timeoutMs + "ms)");
        }

        String stdout = outFuture.get();
        String stderr = errFuture.get();
        int exitCode = process.exitValue();

        // 1. Guardamos la salida técnica en NodeOutput (específico para el modal de la
        // UI y el Log)
        // Esto NO se pasa al siguiente nodo vía contexto global.
        Map<String, Object> nodeResults = new HashMap<>();
        nodeResults.put("stdout", stdout);
        nodeResults.put("stderr", stderr);
        nodeResults.put("exitCode", exitCode);
        nodeResults.put("fullCommandExecuted", fullCmd);

        ctx.setNodeOutput(nodeId, nodeResults);

        // 2. Solo afectamos el contexto GLOBAL si el usuario lo pidió explícitamente
        // Si 'outputKey' está vacío, este nodo no ensucia el mapa de variables.
        String outputKey = TypeConverter.asString(cfg.get("outputKey"));
        if (outputKey != null && !outputKey.isBlank()) {
            ctx.setVariable(outputKey, stdout);
        }

        if (exitCode != 0) {
            throw new Exception("Command failed with code " + exitCode + ": " + stderr);
        }
    }

    private String prepareArguments(String cmd, String path, String args, ExecutionContext ctx) throws Exception {
        boolean isPy = cmd.toLowerCase().contains("python");
        StringBuilder sb = new StringBuilder();

        if (isPy && path != null && !path.isBlank()) {
            Path p = Paths.get(path.replace("\"", ""));
            if (!Files.exists(p))
                throw new Exception("Script not found: " + path);
            sb.append(OSUtils.quote(path)).append(" ");
        }

        if (args != null && !args.isBlank()) {
            sb.append(args.trim()).append(" ");
        }

        Object payload = ctx.getVariable("payload");
        if (isPy && payload != null && (args == null || args.isBlank())) {
            sb.append(OSUtils.quote(String.valueOf(payload)));
        }

        return sb.toString().trim();
    }
}