import { X, FlaskConical } from "lucide-react";
import styles from "../NodeConfigModal.module.css";

export function ModalHeader({ meta, activeTab, onTabChange, onTest, showTest, onClose, tabs }: any) {
    const Icon = meta.icon;
    return (
        <div className={styles.header}>
            <div className={styles.headerTitleRow}>
                <div className={styles.headerLeft}>
                    <Icon size={18} color={meta.color} strokeWidth={2.2} />
                    <span className={styles.headerType} style={{ color: meta.color }}>{meta.label}</span>
                </div>
                <div className={styles.headerRight}>
                    {showTest && (
                        <button className={styles.testBtn} onClick={onTest}>
                            <FlaskConical size={14} /> Probar
                        </button>
                    )}
                    <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
                </div>
            </div>
            <div className={styles.tabsRow}>
                {tabs.map((t: any) => (
                    <button 
                        key={t.id} 
                        className={`${styles.tabBtn} ${activeTab === t.id ? styles.tabActive : ''}`} 
                        onClick={() => onTabChange(t.id)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
        </div>
    );
}