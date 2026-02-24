import { HttpRequestForm } from "./NodeConfigForms/HttpRequestForm";
import { CommandForm } from "./NodeConfigForms/CommandForm";
import { ConditionalForm } from "./NodeConfigForms/ConditionalForm";
import { TimerForm } from "./NodeConfigForms/TimerForm";
import styles from "./NodeConfigPanel.module.css";
import React from 'react';

// Form Registry for Open/Closed Principle
const FormRegistry: Record<string, React.FC<any>> = {
  "http_request": HttpRequestForm,
  "command": CommandForm,
  "conditional": ConditionalForm,
  "timer": TimerForm,
  "start": () => <div className={styles.small}>Nodo de entrada del workflow.</div>,
  "end": () => <div className={styles.small}>Nodo de salida del workflow.</div>,
};

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

  // Form Adapters
  const patchConfig = (key: string, value: any) => {
    updateSelectedNode({ config: { ...config, [key]: value } });
  };

  const patchMap = (key: string, value: string) => {
    updateSelectedNode({ config: { ...config, map: { ...(config.map || {}), [key]: value } } });
  };

  const isReadOnly = false;
  const ActiveForm = FormRegistry[type];

  return (
    <div className={styles.panel}>
      <div className={styles.sectionTitle}>Config de Nodo</div>

      <div className={styles.card}>
        <div className={styles.badge}>
          <span style={{ fontWeight: 900 }}>{String(type).toUpperCase()}</span>
          <span className={styles.small}> {id.slice(0, 6)}</span>
        </div>

        <div className={styles.field} style={{ marginTop: 12 }}>
          <label>Etiqueta</label>
          <input
            value={data?.label || ""}
            onChange={(e) => updateSelectedNode({ label: e.target.value })}
            placeholder="Nombre del nodo"
          />
        </div>

        <hr className={styles.separator} />

        {ActiveForm ? (
          <ActiveForm
            config={config}
            patchConfig={patchConfig}
            patchMap={patchMap}
            isReadOnly={isReadOnly}
          />
        ) : (
          <div className={styles.small}>Este nodo no requiere configuración extra.</div>
        )}
      </div>
    </div>
  );
}