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

        // 2. Preparar el comando final
        String finalArgs = prepareArguments(command, scriptPath, args, context);
        String fullCommand = finalArgs.isBlank() ? command : command + " " + finalArgs;

        // 3. Ejecutar
        executeProcess(fullCommand, cfg, context, node.getId());
    }

    private void executeProcess(String fullCmd, Map<String, Object> cfg, ExecutionContext ctx, String nodeId)
            throws Exception {
        List<String> wrapper = OSUtils.isWindows() ? List.of("cmd", "/c", fullCmd) : List.of("bash", "-lc", fullCmd);

        Process process = new ProcessBuilder(wrapper).start();

        long timeoutMs = TypeConverter.asInt(cfg.get("timeoutMs"), 30000);
        boolean finished = process.waitFor(timeoutMs, java.util.concurrent.TimeUnit.MILLISECONDS);

        if (!finished) {
            process.destroyForcibly();
            throw new Exception("Command Execution Time Out Exceeded (" + timeoutMs + "ms)");
        }

        String stdout = OSUtils.readStream(process.getInputStream());
        String stderr = OSUtils.readStream(process.getErrorStream());
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