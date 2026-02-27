# 🚀 MiniFlow: Advanced Visual Workflow Execution Engine

[![Project Status: Active](https://img.shields.io/badge/Project%20Status-Active-brightgreen.svg)](https://github.com/marcv00/miniflow)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tech: React 19](https://img.shields.io/badge/Frontend-React%2019-blue?logo=react)](https://react.dev/)
[![Tech: Java 17](https://img.shields.io/badge/Engine-Java%2017-orange?logo=openjdk)](https://openjdk.org/)
[![Tech: Electron](https://img.shields.io/badge/Desktop-Electron%2040-47848F?logo=electron)](https://www.electronjs.org/)




**MiniFlow** is a powerful, low-code visual workflow builder designed for high-performance automation. Built with a decoupled architecture, it leverages a React-based frontend for intuitive graph orchestration and a high-speed Java execution engine for real-time processing.

---

## 🏗️ Technical Architecture

MiniFlow is built on the principle of **Separation of Concerns**, ensuring scalability and maintainability.

### 1. Frontend: MVVM + ReactFlow
The UI uses the **Model-View-ViewModel (MVVM)** pattern to isolate business logic from presentation.
*   **View:** React 19 functional components (optimized with CSS Modules).
*   **ViewModel:** Custom React hooks that manage state, validation, and IPC triggers.
*   **Model:** Pure TypeScript logic for graph serialization, BFS/DFS traversal, and topological validation.

### 2. Execution Core: Java Strategy Pattern
The engine is a high-performance Java 17 application. It implements the **Strategy Pattern** to handle different node types (HTTP, Command, Parallel) dynamically, allowing for easy extensions without modifying the core runner.

### 3. Communication: IPC & JSON Streaming
The native bridge uses **Electron IPC** to communicate between the UI and the Node.js main process. The main process then orchestrates the Java JAR via **STDIN/STDOUT streams**, passing workflow configurations and receiving real-time execution logs in JSON format.

---

## 📂 Project Organization

Following industry best practices, the repository is structured as follows:

```text
miniflow/
├── 📂 docs/            # Manuals & Quality Reports (Antipatterns, Complexity)
├── 📂 examples/        # Production-ready demo workflows (JSON)
├── 📂 scripts/         # Utility tools (Complexity analysis metrics)
├── 📂 tests/           # Comprehensive test suite & manual test assets
├── 📂 src/             # Frontend UI (React + TypeScript)
├── 📂 electron/        # Desktop integration layer (Node.js)
└── 📂 java-engine/     # Highly decoupled Execution Engine (Java/Maven)
```

---

## ✨ Key Features

- **Visual Orchestration:** Drag-and-drop nodes to create complex automation logic.
- **Robust Validation:** Real-time graph analysis (Cycles detection, reachability, configuration integrity).
- **Parallel Execution:** Support for FORK/JOIN (Parallel branches) with synchronized barriers.
- **Observability:** Real-time terminal logs and step-by-step execution timeline.
- **Portable Workflows:** Full Import/Export support via JSON.

---

## 🎬 Featured: Visual Audit with Remotion

MiniFlow integrates **Remotion** capabilities to transform workflow executions into dynamic video audit trails.
*   **Visual Documentation:** Generate high-fidelity videos of your automation runs for compliance and documentation.
*   **Dynamic Playback:** Every node transition and variable change is rendered in code-driven video, allowing for programmatic "instant replays" of production runs.

**Watch the MiniFlow Cinematic Demo:**
 
https://github.com/user-attachments/assets/5f09a3da-9834-46de-a9bb-bf89778cd9e6


---

## 🛠️ Setup & Execution

### Prerequisites
*   **Node.js 18+**
*   **JDK 17+**
*   **Apache Maven**

### Installation
```bash
git clone https://github.com/marcv00/miniflow.git
cd miniflow
npm install
```

### Building the Engine
To prepare the execution core (Fat JAR):
```bash
# Windows
npm run build:engine
# Unix
npm run build:engine-linux
```

### Running the App
```bash
npm run dev:electron
```

---

## 🛡️ Quality Gate
- **Cyclomatic Complexity:** Continuous monitoring using `Lizard` (CCN threshold < 10).
- **Antipattern Detection:** Regular audits for data clumps, switch statement abuse, and large class smells.
- **CI/CD:** Automated builds for both Frontend and Java Engine.

---
*Developed as a showcase of modern Full-Stack Engineering and Architectural Design.*
