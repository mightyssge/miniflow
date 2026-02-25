package com.miniflow.core;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.miniflow.model.Node;
import com.miniflow.model.Workflow;

public class WorkflowRunnerTest {

    private WorkflowRunner workflowRunner;

    @BeforeEach
    void setUp() {
        workflowRunner = new WorkflowRunner();
    }

    @Test
    void testExecuteWorkflowCorrectamente() {
        // ARRANGE: Crear workflow con nodo "Start" que es lo mínimo necesario
        Workflow mockWorkflow = new Workflow();
        mockWorkflow.name = "TEST_FLUJO_VAlIDO";

        Node startNode = new Node();
        startNode.id = "start-1";
        startNode.type = "start";

        mockWorkflow.nodes.add(startNode);

        // ACT & ASSERT: Verificamos que el motor procesa el nodo start sin crashear
        assertDoesNotThrow(() -> {
            workflowRunner.run(mockWorkflow);
        }, "El WorkflowRunner no debe lanzar excepciones en un flujo básico");
    }

    @Test
    void testWorkflowVacio() {
        // ARRANGE: Workflow sin nodos
        Workflow emptyWorkflow = new Workflow();
        emptyWorkflow.name = "TEST_VACIO";

        // ACT & ASSERT: Si no hay start node, debe arrojar una RuntimeException
        Exception exception = assertThrows(RuntimeException.class, () -> {
            workflowRunner.run(emptyWorkflow);
        });

        assertTrue(exception.getMessage().contains("No START node found"));
    }
}
