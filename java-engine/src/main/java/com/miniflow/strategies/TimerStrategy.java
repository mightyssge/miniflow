package com.miniflow.strategies;

import com.miniflow.model.Node;
import com.miniflow.context.ExecutionContext;
import com.miniflow.utils.TypeConverter;
import java.util.Map;

public class TimerStrategy implements NodeExecutor {

    @Override
    public void execute(Node node, ExecutionContext context) throws Exception {
        Map<String, Object> cfg = node.getConfig();
        if (cfg == null) cfg = Map.of();
        
        int delay = TypeConverter.asInt(cfg.get("delay"), 3);
        String unit = TypeConverter.asString(cfg.getOrDefault("unit", "s"));
        
        long ms = 0;
        if ("ms".equalsIgnoreCase(unit)) {
            ms = delay;
        } else if ("min".equalsIgnoreCase(unit)) {
            ms = delay * 60000L;
        } else {
            ms = delay * 1000L;
        }
        
        System.out.println("[TIMER] Esperando " + delay + " " + unit + " (" + ms + "ms)");
        
        if (ms > 0) {
            Thread.sleep(ms);
        }
        
        // Output result
        context.setNodeOutput(node.getId(), Map.of("waited_ms", ms));
    }
}
