import { HttpRequestForm } from "./NodeConfigForms/HttpRequestForm";
import { CommandForm } from "./NodeConfigForms/CommandForm";
import { ConditionalForm } from "./NodeConfigForms/ConditionalForm";
import { TimerForm } from "./NodeConfigForms/TimerForm";
import styles from "./NodeConfigPanel.module.css";

export function NodeConfigPanel({ selectedNode, updateSelectedNode }: any) {
  if (!selectedNode) {
    return (
      <div className={styles.panel}>
        <div className={styles.sectionTitle}>Config de Nodo</div>
        <div className={styles.card}>
          <div className={styles.small}>
            Haz click en un nodo para editar su configuración.
          </div>
        </div>
      </div>
    );
  }

  const { type, id, data } = selectedNode;
  const config = data?.config || {};

  // Adaptadores para reutilizar los formularios modulares
  const patchConfig = (key: string, value: any) => {
    updateSelectedNode({
      config: { ...config, [key]: value },
    });
  };

  const patchMap = (key: string, value: string) => {
    updateSelectedNode({
      config: {
        ...config,
        map: { ...(config.map || {}), [key]: value },
      },
    });
  };

  const renderForm = () => {
    // En el Panel lateral usualmente siempre queremos editar, 
    // por lo que isReadOnly es false.
    const isReadOnly = false; 

    switch (type) {
      case "http_request":
        return (
          <HttpRequestForm 
            config={config} 
            patchConfig={patchConfig} 
            patchMap={patchMap} 
            isReadOnly={isReadOnly} 
          />
        );
      case "command":
        return (
          <CommandForm 
            config={config} 
            patchConfig={patchConfig} 
            isReadOnly={isReadOnly} 
          />
        );
      case "conditional":
        return (
          <ConditionalForm 
            config={config} 
            patchConfig={patchConfig} 
            isReadOnly={isReadOnly} 
          />
        );
      case "timer":
        return (
          <TimerForm 
            config={config} 
            patchConfig={patchConfig} 
            // Si TimerForm también pide isReadOnly, añádelo aquí
          />
        );
      case "start":
        return <div className={styles.small}>Nodo de entrada del workflow.</div>;
      case "end":
        return <div className={styles.small}>Nodo de salida del workflow.</div>;
      default:
        return <div className={styles.small}>Este nodo no requiere configuración extra.</div>;
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.sectionTitle}>Config de Nodo</div>

      <div className={styles.card}>
        <div className={styles.badge}>
          <span style={{ fontWeight: 900 }}>{String(type).toUpperCase()}</span>
          <span className={styles.small}> {id.slice(0, 6)}</span>
        </div>

        {/* Campo Etiqueta (Común a todos) */}
        <div className={styles.field} style={{ marginTop: 12 }}>
          <label>Etiqueta</label>
          <input
            value={data?.label || ""}
            onChange={(e) => updateSelectedNode({ label: e.target.value })}
            placeholder="Nombre del nodo"
          />
        </div>

        <hr className={styles.separator} />

        {/* Formularios Dinámicos */}
        {renderForm()}
      </div>
    </div>
  );
}