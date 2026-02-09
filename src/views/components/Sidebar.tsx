import { useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.css";

export function Sidebar({ handlers }: any) {
  const navigate = useNavigate();

  return (
    <div className={styles.sidebar}>
      <button className={styles.btn} onClick={() => navigate("/workflows")}>
        ← Volver a Workflows
      </button>

      <div className={styles.sectionTitle}>Nodos</div>

      <div style={{ display: "grid", gap: "8px" }}>
        <button className={styles.btn} onClick={() => handlers.addNode("start")}>+ START</button>
        <button className={styles.btn} onClick={() => handlers.addNode("http_request")}>+ HTTP_REQUEST</button>
        <button className={styles.btn} onClick={() => handlers.addNode("conditional")}>+ CONDITIONAL</button>
        <button className={styles.btn} onClick={() => handlers.addNode("command")}>+ COMMAND</button>
        <button className={styles.btn} onClick={() => handlers.addNode("end")}>+ END</button>
      </div>
    </div>
  );
}
