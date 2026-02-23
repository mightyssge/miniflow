package com.miniflow.model;

import java.util.ArrayList;
import java.util.List;

public class Workflow {
    public String name;
    public List<Node> nodes = new ArrayList<>();
    public List<Connection> edges = new ArrayList<>();

    public Node findNodeById(String id) {
        return nodes.stream()
                .filter(n -> n.id.equals(id))
                .findFirst()
                .orElse(null);
    }
}