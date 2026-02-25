# 🚀 MiniFlow Builder

MiniFlow es un editor visual de flujos de trabajo (workflows) construido con **ReactFlow** y ejecutado como app de escritorio con **Electron**. El motor de ejecución está implementado en **Java** y se comunica con la interfaz mediante STDIN/STDOUT.

---

## 📋 Índice

- [Descripción General](#-descripción-general)
- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitectura del Proyecto (MVVM)](#-arquitectura-del-proyecto-mvvm)
- [Estructura de Directorios](#-estructura-de-directorios)
- [Tipos de Nodos](#-tipos-de-nodos)
- [Setup y Ejecución](#-setup-y-ejecución)
- [Motor Java (Engine)](#-motor-java-engine)
- [Scripts Disponibles](#-scripts-disponibles)
- [Sistema de Estilos](#-sistema-de-estilos)
- [Decisiones de Arquitectura](#-decisiones-de-arquitectura)

---

## 📌 Descripción General

MiniFlow permite al usuario:
- Diseñar visualmente flujos de automatización arrastrando nodos al canvas.
- Configurar cada nodo con parámetros específicos (URL, comandos, condiciones, etc.).
- Validar la coherencia del flujo antes de ejecutarlo.
- Ejecutar el flujo en tiempo real a través del motor Java integrado.
- Ver el resultado de cada paso en una línea de tiempo interactiva.
- Guardar, importar y exportar workflows en formato JSON portable.

---

## 🛠 Stack Tecnológico

| Capa | Tecnología | Uso |
|------|-----------|-----|
| UI Framework | React 19 + TypeScript | Interfaz visual |
| Build Tool | Vite | Dev server y bundling |
| Editor de Grafos | ReactFlow 11 | Canvas de nodos y aristas |
| Desktop | Electron 40 | Empaquetado como app nativa |
| Motor de Ejecución | Java 17 + Maven | Ejecución real del workflow |
| Routing | React Router DOM 7 | Navegación entre páginas |
| Iconos | Lucide React | Iconografía consistente |
| Efectos | canvas-confetti | Feedback visual al completar |
| Linting | ESLint + typescript-eslint | Calidad de código |

---

## 🏗 Arquitectura del Proyecto (MVVM)

El proyecto sigue el patrón **Model-View-ViewModel** para separar la lógica de negocio de la presentación.

```
┌─────────────┐     expone estado      ┌──────────────────┐     llama funciones    ┌───────────────┐
│   Models    │ ──────────────────────▶│   ViewModels     │ ──────────────────────▶│    Views      │
│  (lógica)   │ ◀──────────────────────│  (hooks React)   │ ◀──────────────────────│  (componentes)│
└─────────────┘     persiste datos     └──────────────────┘      notifica cambios  └───────────────┘
```

### Capa Model (`src/models/`)
Lógica pura de negocio. **No depende de React** ni de la interfaz.

- `workflow/types.ts` — Tipos TypeScript para nodos, edges, configs y validaciones.
- `workflow/WorkflowFactory.ts` — Fábrica para crear nodos y workflows vacíos.
- `workflow/WorkflowValidator.ts` — Validación de topología (ciclos, nodos inalcanzables, configuraciones incompletas).
- `workflow/WorkflowSerializer.ts` — Convierte el estado interno de React en JSON portable.
- `workflow/WorkflowDeserializer.ts` — Reconstruye el estado interno desde un JSON importado.
- `workflow/WorkflowExporters.ts` — Descarga el workflow como `.json` o `.java`.
- `workflow/WorkflowRunner.ts` — Parsea la salida del motor Java en pasos de ejecución.
- `workflow/defaults.ts` — Configuraciones por defecto para cada tipo de nodo.
- `workflow/validation/` — Utilidades de grafo (BFS/DFS, ciclos) y reglas por nodo.
- `storage/LocalStorage.ts` — Persistencia en `localStorage` del navegador (workflows y runs).

### Capa ViewModel (`src/viewmodels/`)
Puente entre modelos y vista. Maneja el estado con hooks de React.

- `useWorkflowViewModel.ts` — ViewModel principal: nodos, edges, selección, validación.
- `useWorkflowStorage.ts` — Sincroniza el estado con `LocalStorage`.
- `useWorkflowIO.ts` — Import/export de archivos y clipboard.
- `useWorkflowExecution.ts` — Orquesta la comunicación con el motor Java via Electron IPC.
- `useWorkflowEditorController.ts` — Coordina UI state (modales abiertos, tabs) y delega a los demás viewmodels.
- `useCanvasDnD.ts` — Drag & drop desde la paleta al canvas.

### Capa View (`src/views/`)
Presentación pura. Solo renderiza, no contiene lógica de negocio.

- `pages/Landing.tsx` — Pantalla de bienvenida.
- `pages/Dashboard.tsx` — Listado de workflows guardados.
- `pages/WorkflowEditor.tsx` — Editor principal con canvas, sidebar y topbar.
- `components/Sidebar.tsx` — Panel lateral con paleta de nodos y resumen.
- `components/editor/WorkflowHeader.tsx` — Barra superior con acciones (guardar, validar, ejecutar, historial, herramientas).
- `components/editor/EngineStatusPill.tsx` — Indicador de estado del motor con timeline de pasos.
- `components/nodes/` — Componentes visuales de cada tipo de nodo.
- `components/NodeConfigModal.tsx` — Modal de configuración del nodo seleccionado.
- `components/ValidationPanel.tsx` — Panel de resultados de validación con navegación a nodos.
- `components/modals/` — Modales de creación, edición, importación, eliminación e historial.

---

## 📂 Estructura de Directorios

```
miniflow/
├── electron/                          # Proceso principal de Electron (IPC, child_process)
├── java-engine/
│   └── src/
│       ├── main/java/com/miniflow/
│       │   ├── Main.java              # Punto de entrada del motor
│       │   ├── context/               # ExecutionContext
│       │   ├── core/                  # NodeResolver, WorkflowRunner
│       │   ├── factory/               # ExecutorFactory
│       │   ├── model/                 # Connection, Node, Workflow
│       │   ├── strategies/            # Un NodeExecutor por tipo de nodo (Strategy Pattern)
│       │   └── utils/                 # ExpressionEvaluator, HttpHelper, JsonUtils, etc.
│       └── test/                      # Tests unitarios e integración
├── public/
├── src/
│   ├── App.tsx                        # Raíz de la app con RouterProvider
│   ├── electron.d.ts                  # Tipos de window.electronAPI
│   ├── index.css                      # Resets globales + sobrescrituras ReactFlow
│   ├── contexts/                      # ToastContext
│   ├── hooks/                         # useClickOutside, useNodeConfig, useSidebar, useTimerAnimation
│   ├── models/
│   │   ├── storage/
│   │   │   └── LocalStorage.ts        # CRUD workflows + runs + versiones
│   │   └── workflow/
│   │       ├── types.ts               # FlowNode, FlowEdge, Workflow (tipos principales)
│   │       ├── coreTypes.ts           # SystemWorkflow, ExecutionStep, WorkflowExecutionResult
│   │       ├── WorkflowValidator.ts   # Validación de topología del grafo
│   │       ├── WorkflowFactory.ts     # Fábrica de nodos y workflows vacíos
│   │       ├── WorkflowSerializer.ts  # Estado interno → JSON portable
│   │       ├── WorkflowDeserializer.ts# JSON importado → estado interno
│   │       ├── WorkflowExporters.ts   # Descarga como .json o .java
│   │       ├── WorkflowRunner.ts      # Parsea logs del motor Java
│   │       ├── defaults.ts            # Config por defecto de cada nodo
│   │       └── validation/            # GraphUtils (BFS/ciclos), NodeRules
│   ├── viewmodels/
│   │   ├── useWorkflowViewModel.ts    # ViewModel principal: nodos, edges, selección
│   │   ├── useWorkflowStorage.ts      # Sincroniza estado con LocalStorage
│   │   ├── useWorkflowExecution.ts    # Comunicación con el motor Java vía IPC
│   │   ├── useWorkflowIO.ts           # Import/export de archivos y clipboard
│   │   ├── useWorkflowEditorController.ts # Coordina UI state (modales, tabs)
│   │   └── useCanvasDnD.ts            # Drag & drop de nodos al canvas
│   └── views/
│       ├── components/
│       │   ├── FlowCanvas.tsx         # Canvas ReactFlow principal
│       │   ├── Sidebar.tsx            # Panel lateral con paleta de nodos
│       │   ├── NodeConfigModal.tsx    # Modal de configuración del nodo
│       │   ├── ValidationPanel.tsx    # Panel de errores de validación
│       │   ├── NodeConfigForms/       # Formulario de config por cada tipo de nodo
│       │   ├── NodeConfigParts/       # Partes reutilizables del modal (Header, Body, Footer, Viewers)
│       │   ├── ValidationPanelParts/  # ValidationIssueRow, ValidationUtils
│       │   ├── common/                # KebabMenu
│       │   ├── editor/                # WorkflowHeader, EngineStatusPill, EngineStatusViews
│       │   ├── modals/                # CreateModal, DeleteModal, EditModal, ImportWorkflowModal,
│       │   │                          # RunHistoryModal, WorkflowVersionsModal
│       │   └── nodes/                 # Componente visual + CSS Module por cada tipo de nodo
│       └── pages/
│           ├── Landing.tsx
│           ├── Dashboard.tsx          # Lista de workflows guardados
│           └── WorkflowEditor.tsx     # Editor principal (canvas + sidebar + topbar)
├── workflows_a_probar/                # JSONs de ejemplo para pruebas
├── package.json
├── vite.config.ts
└── tsconfig*.json                     # tsconfig.app, tsconfig.electron, tsconfig.node
```

---

## 🧩 Tipos de Nodos

| Tipo | Color | Descripción |
|------|-------|-------------|
| `start` | Verde `#28b478` | Nodo de inicio del flujo. Exactamente uno por workflow. |
| `end` | Rojo `#d23750` | Nodo de fin. Exactamente uno por workflow. |
| `http_request` | Azul `#78b4ff` | Realiza peticiones HTTP (GET/POST/PUT/DELETE) con headers, body y mapeo de respuesta. |
| `command` | Violeta `#a78bfa` | Ejecuta comandos del sistema operativo o scripts con captura de output. |
| `conditional` | Naranja `#f5a623` | Bifurca el flujo según una condición booleana. Salidas: `true` / `false`. |
| `timer` | Azul claro `#60a5fa` | Introduce un retraso configurable en ms, segundos o minutos. |
| `parallel` | Azul pálido `#a5ceff` | Bifurca el flujo en múltiples ramas paralelas (Fork). |
| `parallel_join` | Violeta `#a78bfa` | Espera a que todas las ramas paralelas terminen (Join/Barrier). |

### Reglas de validación

- El workflow debe tener **exactamente 1 nodo START y 1 nodo END**.
- **No se permiten ciclos** en el grafo.
- Todo nodo debe ser **alcanzable desde START**.
- Todo nodo `parallel` debe conectarse a un `parallel_join` en todas sus ramas.
- Los nodos `http_request` y `command` requieren campos obligatorios configurados.

---

## ⚙️ Setup y Ejecución

### Requisitos previos

- **Node.js 18+**
- **Java Development Kit (JDK) 17+**
- **Apache Maven** (para compilar el motor Java)

### Instalación

```bash
git clone <repo-url>
cd miniflow
npm install
```

### Ejecutar en modo web (sin Electron)

```bash
npm run dev
# Abre http://localhost:5173
```

> **Nota:** En modo web, el botón "Ejecutar" no funcionará porque requiere Electron para comunicarse con el motor Java.

### Ejecutar como app de escritorio (Electron)

1. Compilar el motor Java primero (ver sección Motor Java).
2. Iniciar la app:

```bash
npm run dev:electron
```

Esto lanza el dev server de Vite y Electron en paralelo con hot-reload.

---

## ☕ Motor Java (Engine)

El motor está en `java-engine/`. Se compila a un Fat JAR que Electron invoca como proceso hijo, comunicándose mediante STDIN/STDOUT en formato JSON.

### Compilar el motor

```bash
# Windows
npm run build:engine

# macOS / Linux
npm run build:engine-mac
```

Esto limpia, compila y mueve el JAR a `dist-java-engine/engine.jar`.

### Ciclo de desarrollo del motor

1. Modificar código en `java-engine/src/main/java/`
2. Compilar: `npm run build:engine` (o `build:engine-mac`)
3. Lanzar: `npm run dev:electron`
4. Probar desde la UI presionando "Ejecutar"

> **Importante:** El motor usa Jackson para JSON. Si añades dependencias al `pom.xml`, asegúrate de incluirlas en el Fat JAR con el plugin `maven-shade-plugin` para evitar `ClassNotFoundException` en runtime.

### Comunicación Electron ↔ Java

El proceso Electron lanza el JAR con `child_process.spawn`, envía el JSON del workflow por STDIN, y lee la respuesta por STDOUT. El frontend accede a esta funcionalidad a través de `window.electronAPI.runWorkflow(jsonString)` (definido en `src/electron.d.ts`).

---

## 📦 Scripts Disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| Dev web | `npm run dev` | Inicia Vite en modo desarrollo |
| Dev desktop | `npm run dev:electron` | Vite + Electron con hot-reload |
| Build web | `npm run build` | Compilación de producción |
| Build Electron | `npm run build:electron` | Compila solo el proceso Electron |
| Build engine (Win) | `npm run build:engine` | Compila el motor Java (Windows) |
| Build engine (Mac/Linux) | `npm run build:engine-mac` | Compila el motor Java (Unix) |
| Lint | `npm run lint` | ESLint sobre todo el proyecto |
| Preview | `npm run preview` | Preview del build de producción |

---

## 🎨 Sistema de Estilos

El proyecto usa **CSS Modules** para encapsulamiento y evitar colisiones de clases.

### Principios

- **Co-location:** Cada componente `.tsx` tiene su `.module.css` en la misma carpeta.
- **Encapsulamiento:** Las clases son locales al componente. Un `.btn` en Sidebar no afecta al de WorkflowHeader.
- **Globalidad mínima:** Solo `src/index.css` contiene resets y sobrescrituras de ReactFlow (`.react-flow__handle`).
- **Variables de color:** Los colores se definen como constantes en `nodeConstants.ts` y se pasan como props para mantener consistencia entre el nodo visual y sus formularios.

### Paleta principal

| Token | Valor | Uso |
|-------|-------|-----|
| Brand blue | `#78b4ff` | Acento principal, nodos HTTP |
| Success green | `#28b478` | Nodo START, estado válido |
| Danger red | `#d23750` | Nodo END, errores |
| Warning orange | `#f5a623` | Nodo CONDITIONAL, advertencias |
| Purple | `#a78bfa` | Nodo COMMAND, PARALLEL_JOIN |
| Background dark | `#0b1020` | Fondo principal |
| Canvas dark | `#070b14` | Fondo del canvas |

---

## 🧠 Decisiones de Arquitectura

### ¿Por qué MVVM con hooks?

Los hooks de React (como `useWorkflowViewModel`) actúan como ViewModels: exponen estado derivado y funciones de acción, sin saber nada de cómo se renderiza. Esto facilita el testing de la lógica de negocio de forma independiente a la UI.

### ¿Por qué Discriminated Union en `FlowNode`?

```typescript
export type FlowNode =
  | Node<{ label: string; config: CommandConfig }, 'command'>
  | Node<{ label: string; config: HttpRequestConfig }, 'http_request'>
  // ...
```

TypeScript puede hacer *type narrowing* automático al chequear `node.type`. Esto elimina la necesidad de usar `any` o castear, y permite que el compilador detecte configuraciones incompletas en tiempo de compilación.

### ¿Por qué separar Serializer y Deserializer?

- **Serializer:** Transforma el estado interno de ReactFlow (con posiciones, metadata de UI) en un JSON limpio y portable para guardar o compartir.
- **Deserializer:** Reconstruye el estado interno con IDs frescos y fallbacks seguros al importar un JSON externo.

Esta separación permite cambiar el formato de serialización sin afectar la lógica del editor.

### ¿Por qué Fat JAR?

El motor Java se empaqueta con todas sus dependencias en un único `.jar` para que Electron pueda lanzarlo sin necesitar Maven ni ningún otro runtime instalado en la máquina del usuario final.

### ¿Por qué LocalStorage para persistencia?

Para un MVP de escritorio con Electron, `localStorage` es suficiente: no requiere una base de datos ni un servidor, los datos persisten entre sesiones, y se puede migrar a SQLite o un archivo `.json` en el sistema de archivos nativo si el proyecto escala.
