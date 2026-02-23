package com.miniflow.strategies;

import com.miniflow.context.ExecutionContext;
import com.miniflow.model.Node;
import com.miniflow.utils.ExpressionEvaluator;
import com.miniflow.utils.TypeConverter;
import java.util.Map;

public class ConditionalStrategy implements NodeExecutor {

    @Override
    public void execute(Node node, ExecutionContext context) throws Exception {
        Map<String, Object> config = node.getConfig();

        // 1. Obtener la condición
        String condition = TypeConverter.asString(
            config.getOrDefault("condition", config.get("expression"))
        );

        if (condition == null || condition.isBlank()) {
            throw new Exception("Conditional node requires a 'condition' config");
        }

        // 2. Evaluar usando el Utility
        boolean result = ExpressionEvaluator.evaluate(condition, context);
        String branch = result ? "TRUE" : "FALSE";

        
        // 3. NO usamos context.setVariable("__branch", branch) porque eso ensucia el global.
        // En su lugar, el WorkflowRunner debería consultar context.getNodeOutput(node.getId())
        // para saber qué rama tomar, o podrías tener un método específico context.setLastBranch(branch).
        
        // De momento, para mantener compatibilidad con tu Runner pero limpiar el LOG,
        // guardamos todo el resultado técnico en NodeOutput:
        context.setNodeOutput(node.getId(), Map.of(
            "evaluatedCondition", condition,
            "result", result,
            "selectedBranch", branch
        ));
    
    }
}