import { HashRouter, Routes, Route } from "react-router-dom";
import { Landing } from "./views/pages/Landing";
import { Dashboard } from "./views/pages/Dashboard";
import WorkflowEditor from "./views/pages/WorkflowEditor";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/workflows" element={<Dashboard />} />
        <Route path="/editor/:id" element={<WorkflowEditor />} />
      </Routes>
    </HashRouter>
  );
}
