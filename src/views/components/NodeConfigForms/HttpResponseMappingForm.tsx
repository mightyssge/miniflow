import styles from "../NodeConfigModal.module.css";

interface Props {
    configMap?: Record<string, string>;
    isReadOnly: boolean;
    patchMap: (key: string, value: string) => void;
}

export function HttpResponseMappingForm({ configMap, isReadOnly, patchMap }: Props) {
    return (
        <>
            <div className={styles.sectionLabel}>Mapeo de Respuesta</div>

            <div className={styles.row2}>
                <div className={styles.field} style={{ flex: 1 }}>
                    <label>Nombre de la Variable (Output)</label>
                    <input
                        id="newMapKey"
                        placeholder="ej: pokeData"
                        disabled={isReadOnly}
                    />
                </div>
                <div className={styles.field} style={{ flex: 1 }}>
                    <label>Ruta JSONPath (Propiedad)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            id="newMapValue"
                            placeholder="ej: $.name"
                            disabled={isReadOnly}
                            style={{ flex: 1 }}
                        />
                        <button
                            disabled={isReadOnly}
                            onClick={(e) => {
                                e.preventDefault();
                                const kInput = document.getElementById("newMapKey") as HTMLInputElement;
                                const vInput = document.getElementById("newMapValue") as HTMLInputElement;
                                if (kInput.value && vInput.value) {
                                    patchMap(kInput.value, vInput.value);
                                    kInput.value = "";
                                    vInput.value = "";
                                }
                            }}
                            style={{
                                padding: '0 12px',
                                background: 'rgba(120, 180, 255, 0.1)',
                                border: '1px solid rgba(120, 180, 255, 0.3)',
                                color: '#a5ceff',
                                borderRadius: '6px',
                                cursor: isReadOnly ? 'not-allowed' : 'pointer'
                            }}
                        >
                            + Add
                        </button>
                    </div>
                </div>
            </div>

            {configMap && Object.keys(configMap).length > 0 && (
                <div style={{
                    marginTop: '12px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    padding: '8px'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                            <tr style={{ color: '#8b949e', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <th style={{ textAlign: 'left', padding: '4px 8px', width: '40%' }}>Variable</th>
                                <th style={{ textAlign: 'left', padding: '4px 8px' }}>Ruta (JSONPath)</th>
                                <th style={{ width: '40px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(configMap).map(([key, val]) => (
                                <tr key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                    <td style={{ padding: '6px 8px', color: '#e6edf3', fontFamily: 'monospace' }}>{key}</td>
                                    <td style={{ padding: '6px 8px', color: '#a5ceff', fontFamily: 'monospace' }}>{String(val)}</td>
                                    <td style={{ textAlign: 'right', padding: '6px 8px' }}>
                                        <button
                                            disabled={isReadOnly}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                patchMap(key, ""); // Borrar
                                            }}
                                            style={{
                                                background: 'transparent', border: 'none',
                                                color: '#ef4444', cursor: isReadOnly ? 'not-allowed' : 'pointer',
                                                opacity: 0.7
                                            }}
                                            title="Eliminar mapeo"
                                        >
                                            ×
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
