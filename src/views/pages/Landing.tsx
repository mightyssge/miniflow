import { useNavigate } from "react-router-dom";
import styles from "./Landing.module.css";

export function Landing() {
    const navigate = useNavigate();

    return (
        <div className={styles.landing}>
            {/* Floating gradient orbs */}
            <div className={styles.orb1} />
            <div className={styles.orb2} />
            <div className={styles.orb3} />

            <section className={styles.hero}>
                <h1 className={styles.logo}>MINIFLOW</h1>
                <p className={styles.subtitle}>
                    Diseña, conecta y ejecuta flujos de trabajo poderosos — visualmente.
                    Construye lógica de automatización con una interfaz de arrastrar y soltar impulsada por Java.
                </p>
                <button className={styles.cta} onClick={() => navigate("/workflows")}>
                    ¡Crea un flujo YA!
                </button>
            </section>

            <div className={styles.stats}>
                <div className={styles.statItem}>
                    <div className={styles.statValue}>5+</div>
                    <div className={styles.statLabel}>Tipos de Nodo</div>
                </div>
                <div className={styles.statItem}>
                    <div className={styles.statValue}>∞</div>
                    <div className={styles.statLabel}>Arrastrar y Soltar</div>
                </div>
                <div className={styles.statItem}>
                    <div className={styles.statValue}>Java</div>
                    <div className={styles.statLabel}>Motor de Ejecución</div>
                </div>
            </div>

            <div className={styles.features}>
                <div className={styles.featureCard}>
                    <div className={styles.featureIcon}>⚡</div>
                    <div className={styles.featureTitle}>Constructor Visual</div>
                    <div className={styles.featureDesc}>
                        Arrastra nodos al canvas y conéctalos para construir flujos de automatización complejos.
                    </div>
                </div>
                <div className={styles.featureCard}>
                    <div className={styles.featureIcon}>🔗</div>
                    <div className={styles.featureTitle}>Conexiones Inteligentes</div>
                    <div className={styles.featureDesc}>
                        Ramificación condicional, peticiones HTTP y comandos shell — todo conectado visualmente.
                    </div>
                </div>
                <div className={styles.featureCard}>
                    <div className={styles.featureIcon}>🚀</div>
                    <div className={styles.featureTitle}>Motor Java</div>
                    <div className={styles.featureDesc}>
                        Ejecuta flujos de trabajo con un motor backend robusto construido en Java 17+.
                    </div>
                </div>
            </div>

            <div className={styles.footer}>MINIFLOW v1.0 — Proyecto Académico</div>
        </div>
    );
}
