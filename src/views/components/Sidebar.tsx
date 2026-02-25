import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import styles from "./Sidebar.module.css";
import { NODE_PALETTE } from "./nodeConstants";
import { SectionHeader, NodePaletteCard } from "./SidebarParts";
import { useSidebar } from "../../hooks/useSidebar";

import wf1_1 from "../../../workflows_a_probar/workflow_1.1.json";
import wf1_2 from "../../../workflows_a_probar/workflow_1.2.json";
import wf2 from "../../../workflows_a_probar/workflow_2.json";
import wf3 from "../../../workflows_a_probar/workflow_3.json";

export function Sidebar({ state, handlers }: any) {
  const navigate = useNavigate();
  const { ui, actions } = useSidebar(state.validationReport);
  const [testWfOpen, setTestWfOpen] = useState(true);

  return (
    <div className={`${styles.sidebar} ${ui.collapsed ? styles.collapsed : ""}`}>
      <div className={styles.topRow}>
        {!ui.collapsed && (
          <div className={styles.brand} onClick={() => navigate("/workflows")}>
            <span className={styles.brandLogo}>MINIFLOW</span>
          </div>
        )}
        <button className={styles.toggleBtn} onClick={() => actions.setCollapsed(!ui.collapsed)}>
          {ui.collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {!ui.collapsed && <div className={styles.brandSub}>{state.name || "Sin título"}</div>}
      <div className={styles.divider} />

      <div className={styles.scrollArea}>
        <SectionHeader title="Nodos Disponibles" open={ui.nodesOpen} collapsed={ui.collapsed} onToggle={() => actions.setNodesOpen(!ui.nodesOpen)} />

        <div className={`${styles.sectionBody} ${(ui.collapsed || ui.nodesOpen) ? styles.sectionOpen : ""}`}>
          <div className={styles.nodeGrid}>
            {NODE_PALETTE.map(node => (
              <NodePaletteCard key={node.type} nodeDef={node} collapsed={ui.collapsed} stateNodes={state.nodes} onAdd={handlers.addNode} />
            ))}
          </div>
        </div>

        {!ui.collapsed && (
          <>
            <div className={styles.divider} />
            <SectionHeader title="Workflows de Prueba" open={testWfOpen} collapsed={ui.collapsed} onToggle={() => setTestWfOpen(!testWfOpen)} />
            <div className={`${styles.sectionBody} ${testWfOpen ? styles.sectionOpen : ""}`}>
              <div className={styles.actionGrid}>
                <button className={styles.actionBtn} onClick={() => { handlers.setNodes(wf1_1.nodes); handlers.setEdges(wf1_1.edges); }}>
                  <span style={{ fontSize: '16px' }}>✔️</span> Workflow 1.1 (Éxito)
                </button>
                <button className={styles.actionBtn} onClick={() => { handlers.setNodes(wf1_2.nodes); handlers.setEdges(wf1_2.edges); }}>
                  <span style={{ fontSize: '16px' }}>❌</span> Workflow 1.2 (Error)
                </button>
                <button className={styles.actionBtn} onClick={() => { handlers.setNodes(wf2.nodes); handlers.setEdges(wf2.edges); }}>
                  <span style={{ fontSize: '16px' }}>⚙️</span> Workflow 2 (ETL)
                </button>
                <button className={styles.actionBtn} onClick={() => { handlers.setNodes(wf3.nodes); handlers.setEdges(wf3.edges); }}>
                  <span style={{ fontSize: '16px' }}>🌐</span> Workflow 3 (HTTP)
                </button>
              </div>
            </div>

            <div className={styles.divider} />
            <SectionHeader title="Resumen" open={ui.summaryOpen} collapsed={ui.collapsed} onToggle={() => actions.setSummaryOpen(!ui.summaryOpen)} />
            <div className={`${styles.sectionBody} ${ui.summaryOpen ? styles.sectionOpen : ""}`}>
              <div className={styles.summaryCard}>
                <div className={styles.summaryRow}>
                  <span>{state.nodes.length} nodos · {state.edges.length} conexiones</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={`${styles.statusDot} ${styles[`status_${ui.validationStatus}`]}`} />
                  <span>{ui.statusLabel}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className={styles.footer}>
        <button className={`${styles.backBtn} ${ui.collapsed ? styles.backBtnCollapsed : ""}`} onClick={() => navigate("/workflows")}>
          <ArrowLeft size={14} />
          {!ui.collapsed && <span>Volver al Dashboard</span>}
        </button>
      </div>
    </div>
  );
}