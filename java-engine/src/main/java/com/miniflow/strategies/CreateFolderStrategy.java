package com.miniflow.strategies;

import com.miniflow.context.ExecutionContext;
import com.miniflow.model.Node;
import com.miniflow.utils.TemplateEngine;
import com.miniflow.utils.TypeConverter;
import java.io.File;
import java.nio.file.Paths;
import java.util.Map;

/**
 * REFACTOR: Ahora soporta plantillas {{variable}} en la ruta y el nombre.
 * Usa los Utils para evitar errores de casteo y redundancia.
 */
public class CreateFolderStrategy implements NodeExecutor {

    @Override
    public void execute(Node node, ExecutionContext context) throws Exception {
        // 1. Obtenemos configuración limpia desde el modelo
        Map<String, Object> config = node.getConfig();
        
        // 2. Resolvemos nombres y rutas (con soporte para variables del contexto)
        String rawName = TypeConverter.asString(config.get("folderName"));
        String rawPath = TypeConverter.asString(config.get("folderPath"));

        if (rawName == null || rawPath == null) {
            throw new Exception("Missing folderName or folderPath in node configuration");
        }

        String folderName = TemplateEngine.render(rawName, context);
        String folderPath = TemplateEngine.render(rawPath, context);

        // 3. Lógica de Negocio: Creación de directorio
        File dir = Paths.get(folderPath, folderName).toFile();
        boolean alreadyExists = dir.exists();
        
        if (!alreadyExists) {
            boolean created = dir.mkdirs();
            if (!created) {
                throw new Exception("System failed to create folder: " + dir.getAbsolutePath());
            }
        }

        // 4. Output para el motor y para el Modal de React
        String absolutePath = dir.getAbsolutePath();
        context.setVariable("lastCreatedFolder", absolutePath);
        
        context.setNodeOutput(node.id, Map.of(
            "folderName", folderName,
            "fullPath", absolutePath,
            "status", alreadyExists ? "EXISTED" : "CREATED",
            "success", true
        ));
    }
}