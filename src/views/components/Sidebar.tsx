import { useNavigate } from "react-router-dom";
import { ArrowLeft, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import styles from "./Sidebar.module.css";
import { NODE_PALETTE } from "./nodeConstants";
import { SectionHeader, NodePaletteCard } from "./SidebarParts";
import { useSidebar } from "../../hooks/useSidebar";

export function Sidebar({ state, handlers }: any) {
  const navigate = useNavigate();
  const { ui, actions } = useSidebar(state.validationReport);

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