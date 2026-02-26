#  Manual de Usuario — MiniFlow Builder

Bienvenido a **MiniFlow**, el editor visual de flujos de trabajo. Este manual te guía paso a paso para crear, configurar y ejecutar tus primeros workflows.

---

##  Contenido

1. [¿Qué es MiniFlow?](#1-qué-es-miniflow)
2. [Pantalla de inicio y Dashboard](#2-pantalla-de-inicio-y-dashboard)
3. [Crear un nuevo workflow](#3-crear-un-nuevo-workflow)
4. [El Editor de Workflow](#4-el-editor-de-workflow)
5. [Agregar nodos al canvas](#5-agregar-nodos-al-canvas)
6. [Conectar nodos](#6-conectar-nodos)
7. [Configurar un nodo](#7-configurar-un-nodo)
8. [Tipos de nodos y su configuración](#8-tipos-de-nodos-y-su-configuración)
9. [Validar el workflow](#9-validar-el-workflow)
10. [Ejecutar el workflow](#10-ejecutar-el-workflow)
11. [Ver el historial de ejecuciones](#11-ver-el-historial-de-ejecuciones)
12. [Importar y exportar](#12-importar-y-exportar)
13. [Atajos y consejos útiles](#13-atajos-y-consejos-útiles)

---

## 1. ¿Qué es MiniFlow?

MiniFlow es una herramienta de escritorio que te permite **diseñar y automatizar flujos de trabajo** de forma visual. En lugar de escribir scripts o código, arrastras bloques (nodos) y los conectas para definir qué debe pasar y en qué orden.

Por ejemplo, puedes crear un workflow que:
1. Consulte una API externa para obtener datos.
2. Evalúe una condición sobre esos datos.
3. Si se cumple, ejecute un script en tu computadora.
4. Si no se cumple, espere un tiempo y reintente.

---

## 2. Pantalla de inicio y Dashboard

Al abrir MiniFlow verás la **Landing Page** con el botón "Ir al Dashboard". Al hacer clic, accedes al **Dashboard**, que muestra todos tus workflows guardados.

### Tarjetas del Dashboard

Cada workflow aparece como una tarjeta con:
- **Punto de color** → estado de validación (verde = válido, naranja = pendiente, rojo = inválido).
- **Nombre** del workflow.
- **Descripción** breve.
- **Cantidad de nodos y conexiones**.
- **Fecha de la última ejecución**.
- **Menú ···** (tres puntos) → opciones para editar nombre/descripción o eliminar.

### Acciones del Dashboard

- **Clic en la tarjeta** → abre el editor de ese workflow.
- **Botón "Crear Nuevo"** → abre el formulario de creación.

---

## 3. Crear un nuevo workflow

1. En el Dashboard, haz clic en **"+ Crear Nuevo"**.
2. Ingresa un **nombre** (obligatorio) y una **descripción** opcional.
3. Haz clic en **"Crear"**.

MiniFlow abrirá automáticamente el editor con el canvas vacío listo para empezar.

---

## 4. El Editor de Workflow

El editor tiene tres zonas principales:

```
┌──────────────────────────────────────────────────────────────────┐
│  TOPBAR: Nombre | Guardar | Validar | Ejecutar | Historial | ...  │
├────────────┬─────────────────────────────────────────────────────┤
│            │                                                      │
│  SIDEBAR   │                    CANVAS                           │
│            │         (área de diseño visual)                     │
│  Paleta    │                                                      │
│  de nodos  │                                                      │
│            │                                                      │
│  Resumen   ├─────────────────────────────────────────────────────┤
│            │         ENGINE STATUS PILL (abajo)                  │
└────────────┴─────────────────────────────────────────────────────┘
```

### Topbar (barra superior)
- **Nombre del workflow** y fecha del último guardado.
- **Guardar** → guarda el estado actual.
- **Validar** → revisa si el flujo tiene errores lógicos.
- **Ejecutar** → valida y ejecuta el workflow en el motor Java.
- **Historial** → abre el historial de ejecuciones pasadas.
- **Herramientas** (menú desplegable) → importar/exportar JSON.
- **Botón rojo 🗑** → elimina el workflow permanentemente.

### Sidebar (panel izquierdo)
- **Nodos Disponibles** → paleta de nodos que puedes arrastrar al canvas.
- **Workflows de Prueba** → carga ejemplos predefinidos para explorar.
- **Resumen** → muestra cantidad de nodos, conexiones y estado de validación.
- **Botón ◀/▶** → colapsa/expande el sidebar para ganar espacio.
- **Volver al Dashboard** → botón en la parte inferior.

### Canvas
Área de trabajo central donde diseñas el flujo. Puedes:
- **Hacer zoom** con la rueda del mouse.
- **Desplazarte** haciendo clic y arrastrando en el fondo.
- **Seleccionar un nodo** haciendo clic sobre él.
- **Mover nodos** arrastrándolos.
- **Acceder al menú de un nodo** haciendo clic derecho o usando el botón que aparece al pasar el cursor.

---

## 5. Agregar nodos al canvas

Hay dos formas de agregar nodos:

### Método 1: Arrastrar desde la paleta
1. En el sidebar, ubica el nodo que quieres agregar.
2. Haz clic y arrastra el nodo hacia el canvas.
3. Suéltalo en el lugar deseado.

### Método 2: Clic directo
1. En el sidebar, haz clic sobre el nodo deseado.
2. El nodo aparecerá automáticamente en el canvas, en la posición central.

---

## 6. Conectar nodos

Los nodos se conectan mediante **aristas** (líneas de conexión).

1. Pasa el cursor sobre un nodo. Aparecerán **puntos de conexión** (handles) en sus bordes.
2. Haz clic sobre un punto de salida (generalmente en el lado derecho o inferior del nodo).
3. Arrastra hacia el punto de entrada del nodo destino.
4. Suelta para crear la conexión.

> **Nodo CONDITIONAL:** tiene dos salidas etiquetadas como `true` y `false`. La rama que se ejecuta depende del resultado de la condición evaluada en tiempo real.

> **Nodo PARALLEL:** puede tener múltiples salidas, una por cada rama paralela.

---

## 7. Configurar un nodo

La mayoría de los nodos requieren configuración antes de poder ejecutarse.

1. Haz **doble clic** sobre un nodo, o
2. Haz clic derecho y selecciona **"Configurar"**, o
3. En el menú del nodo (ícono ··· que aparece al hacer hover), selecciona **"Editar"**.

Se abrirá el **panel de configuración** con las opciones específicas del nodo.

4. Completa los campos requeridos.
5. Haz clic en **"Guardar"** para aplicar los cambios.

---

## 8. Tipos de nodos y su configuración

### ⚡ START (Inicio)
El nodo de inicio del flujo. No requiere configuración. Solo puede haber **uno** por workflow y es el punto de entrada obligatorio.

---

### 🏁 END (Fin)
El nodo final del flujo. No requiere configuración. Solo puede haber **uno** por workflow.

---

### 🌐 HTTP REQUEST (Petición HTTP)
Realiza una petición a una URL externa.

| Campo | Descripción | Requerido |
|-------|-------------|-----------|
| Método | GET, POST, PUT o DELETE | Sí |
| URL | Dirección de la API o servidor | Sí |
| Timeout (ms) | Tiempo máximo de espera | Sí |
| Reintentos | Cantidad de reintentos en caso de fallo | Sí |
| Headers | Cabeceras HTTP en formato `Clave: Valor` | No |
| Body | Cuerpo de la petición (para POST/PUT) | No |
| Mapeo de respuesta | Extrae campos específicos de la respuesta JSON | No |
| Error Policy | STOP_ON_FAIL: detiene el workflow; CONTINUE_ON_FAIL: continúa | Sí |

**Ejemplo de URL:** `https://api.example.com/users`

**Ejemplo de Headers:**
```
Authorization: Bearer mi-token
Content-Type: application/json
```

---

### 💻 COMMAND (Comando)
Ejecuta un comando o script en el sistema operativo donde corre el motor.

| Campo | Descripción | Requerido |
|-------|-------------|-----------|
| Comando | El ejecutable a invocar (ej: `python`, `node`, `bash`) | Sí |
| Argumentos | Argumentos del comando | No |
| Directorio de trabajo | Ruta desde donde ejecutar el comando | No |
| Timeout (ms) | Tiempo máximo de ejecución | No |
| Variables de entorno | Variables en formato `CLAVE=valor` | No |
| Capturar Output | Guarda la salida del comando en una variable del contexto | No |
| Error Policy | STOP_ON_FAIL o CONTINUE_ON_FAIL | Sí |

**Ejemplo:**
- Comando: `python`
- Argumentos: `scripts/procesar.py --input data.json`

---

### 🔀 CONDITIONAL (Condicional)
Evalúa una condición y bifurca el flujo.

| Campo | Descripción |
|-------|-------------|
| Condición | Expresión booleana usando variables del contexto (ej: `{{status}} == 200`) |
| Operando izquierdo | Variable o valor a comparar |
| Operador | `==`, `!=`, `>`, `<`, `>=`, `<=`, `contains` |
| Operando derecho | Valor de referencia |

El nodo tiene **dos salidas**:
- `true` → se ejecuta si la condición se cumple.
- `false` → se ejecuta si la condición no se cumple.

**Asegúrate de conectar ambas salidas** para que el flujo sea completo.

---

### ⏱ TIMER (Temporizador)
Introduce una pausa en el flujo.

| Campo | Descripción |
|-------|-------------|
| Duración | Número entero (tiempo de espera) |
| Unidad | ms (milisegundos), s (segundos) o min (minutos) |

**Ejemplo:** Duración `5`, Unidad `s` → espera 5 segundos.

---

### ➡️ PARALLEL (Paralelo — Fork)
Divide el flujo en múltiples ramas que se ejecutan **al mismo tiempo**.

No requiere configuración de parámetros, pero debes:
1. Conectar su **salida** a los nodos de cada rama.
2. Terminar todas las ramas en un nodo **BARRIER (PARALLEL_JOIN)**.

---

### 🔁 BARRIER / PARALLEL JOIN (Barrera)
Espera a que **todas las ramas paralelas** terminen antes de continuar.

No requiere configuración. Solo asegúrate de:
1. Conectar **todas** las ramas del PARALLEL hacia este nodo.
2. Conectar la salida de este nodo al siguiente paso del flujo.

---

## 9. Validar el workflow

Antes de ejecutar, es buena práctica validar el flujo.

1. Haz clic en **"Validar"** en la topbar.
2. Se abrirá el **Panel de Validación** en la parte inferior del canvas.

### Estados posibles

| Ícono | Significado |
|-------|-------------|
| 🔴 Error | El workflow no puede ejecutarse. Debes corregirlo. |
| 🟡 Advertencia | El workflow puede ejecutarse pero tiene situaciones dudosas. |
| 🟢 Válido | Todo está correcto, listo para ejecutar. |

### Errores comunes

- **"Debe existir exactamente 1 nodo START"** → Agrega o elimina nodos START.
- **"Debe existir exactamente 1 nodo END"** → Agrega o elimina nodos END.
- **"No se permiten ciclos"** → Hay una conexión que crea un bucle infinito.
- **"Nodo inalcanzable"** → Hay nodos que no están conectados al flujo principal.
- **"URL requerida"** → Un nodo HTTP_REQUEST no tiene URL configurada.

### Navegar a un nodo con error

Haz clic en el mensaje de error en el panel → el canvas hará zoom automáticamente al nodo problemático.

---

## 10. Ejecutar el workflow

> **Requisito:** La app debe estar corriendo en modo Electron (no web). El motor Java debe estar compilado.

1. Haz clic en **"Ejecutar"** en la topbar.
2. MiniFlow valida el flujo automáticamente. Si hay errores, se muestra el panel de validación.
3. Si el flujo es válido, el **Engine Status Pill** en la parte inferior del canvas cambia a estado "ejecutando".

### Engine Status Pill

El indicador circular en la esquina inferior muestra:

| Color/Estado | Significado |
|--------------|-------------|
| ⚪ Gris (idle) | Listo para ejecutar. Haz clic para iniciar. |
| 🔵 Azul (running) | Ejecutando. Aparece un ticker con el último log. |
| 🟢 Verde (success) | Ejecución completada con éxito. |
| 🔴 Rojo (error) | La ejecución tuvo errores. |

### Ver el resultado

Haz clic en el pill después de una ejecución para ver los detalles:

- **Tab "Pasos"** → línea de tiempo con cada nodo ejecutado, su estado (SUCCESS/ERROR) y duración en ms.
  - Haz clic en un paso para ver su configuración e input/output en el modal de configuración del nodo.
- **Tab "Terminal"** → stdout completo del motor Java.

---

## 11. Ver el historial de ejecuciones

MiniFlow guarda hasta las últimas 50 ejecuciones de cada workflow.

1. Haz clic en **"Historial"** en la topbar.
2. Se abre el modal de historial con una tabla de ejecuciones pasadas.

Cada fila muestra:
- **Fecha y hora** de la ejecución.
- **Estado** → Exitoso (verde) o Fallido (rojo).
- **Duración** en milisegundos.
- **Botón "Ver Detalles"** → carga esa ejecución en el Engine Status Pill para revisar el detalle de cada paso.

---

## 12. Importar y exportar

### Exportar como JSON

1. En la topbar, abre el menú **"Herramientas"**.
2. Selecciona **"Guardar JSON"** para descargar el archivo.
3. O selecciona **"Copiar JSON"** para copiarlo al portapapeles.

El JSON exportado es **portable**: puedes compartirlo con otros usuarios de MiniFlow y ellos podrán importarlo.

### Importar desde archivo

1. Abre **"Herramientas"** → **"Importar Archivo"**.
2. Selecciona un archivo `.json` válido de MiniFlow.
3. El flujo se cargará en el canvas actual.

### Importar desde texto (pegar JSON)

1. Abre **"Herramientas"** → **"Importar Texto"**.
2. Pega el contenido JSON directamente en el campo de texto.
3. Haz clic en **"Importar"**.

---

## 13. Atajos y consejos útiles

### Menú contextual de un nodo

Al hacer hover sobre un nodo, aparece un ícono con opciones:
- **Editar** → abre el panel de configuración.
- **Duplicar** → crea una copia del nodo al lado con los mismos parámetros.
- **Eliminar** → borra el nodo y todas sus conexiones.

### Workflows de prueba

En el sidebar hay workflows de ejemplo pre-cargados para explorar las capacidades de MiniFlow:
- **Workflow 1 (Éxito/Error)** → Ejemplos básicos de flujo exitoso y fallido.
- **Workflow 2 (ETL)** → Flujo que simula extracción, transformación y carga de datos.
- **Workflow 3 (HTTP)** → Prueba de peticiones HTTP con lógica condicional.

También puedes encontrar estos y otros archivos JSON listos para importar en la carpeta `examples/` del proyecto.

### Guardar frecuentemente

MiniFlow no guarda automáticamente. Recuerda hacer clic en **"Guardar"** periódicamente para no perder cambios.

### Flujo mínimo válido

El flujo más simple válido tiene 3 nodos conectados en línea:

```
[START] → [cualquier nodo] → [END]
```

Sin esto, la validación fallará.
