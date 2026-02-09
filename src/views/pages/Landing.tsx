import { useNavigate } from "react-router-dom";
import styles from "./Landing.module.css";

export function Landing() {
    const navigate = useNavigate();

    return (
        <div className={styles.landing}>
            <section className={styles.hero}>
                <h1 className={styles.logo}>MINIFLOW</h1>
                <p className={styles.subtitle}>
                    Visual Workflow Automation Engine.<br />
                    Design, connect, and execute powerful workflows — visually.
                </p>
                <button className={styles.cta} onClick={() => navigate("/workflows")}>
                    Launch Console →
                </button>
            </section>

            <div className={styles.features}>
                <div className={styles.featureCard}>
                    <div className={styles.featureIcon}>⚡</div>
                    <div className={styles.featureLabel}>Visual Builder</div>
                </div>
                <div className={styles.featureCard}>
                    <div className={styles.featureIcon}>🔗</div>
                    <div className={styles.featureLabel}>Node Connections</div>
                </div>
                <div className={styles.featureCard}>
                    <div className={styles.featureIcon}>🚀</div>
                    <div className={styles.featureLabel}>Java Runtime</div>
                </div>
            </div>

            <div className={styles.footer}>MINIFLOW v1.0 — Academic Project</div>
        </div>
    );
}
