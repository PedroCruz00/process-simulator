# 🖥️ Simulador de Estados de Procesos

Un simulador interactivo de máquina de estados finita para visualizar y comprender los estados de procesos en sistemas operativos, desarrollado con React y Vite.

## 📋 Descripción

Este simulador educativo permite visualizar de forma interactiva los cinco estados principales de un proceso en un sistema operativo:

- **New (Nuevo)**: Proceso recién creado
- **Ready (Listo)**: Proceso listo para ejecutarse
- **Running (Ejecutándose)**: Proceso actualmente en ejecución
- **Blocked (Bloqueado)**: Proceso esperando por E/S
- **Terminated (Terminado)**: Proceso finalizado

### ✨ Características Principales

- 🎨 **Visualización Animada**: Transiciones fluidas con efectos visuales y partículas
- 🎮 **Modo Interactivo**: Control manual de transiciones de procesos
- 🤖 **Simulación Automática**: Ejecución automática con diferentes velocidades
- 📊 **Análisis en Tiempo Real**: Estadísticas detalladas y métricas de rendimiento
- 🔊 **Retroalimentación Sonora**: Efectos de sonido para eventos del sistema
- 📈 **Exportación de Datos**: Reportes detallados en formato CSV
- 📱 **Diseño Responsivo**: Interfaz adaptable a diferentes dispositivos

## 👥 Desarrolladores

Creado por estudiantes de **Ingeniería de Sistemas y Computación** de la **UPTC**:

- **Jhon Castro**
- **Pedro Cruz**
- **Luis Hernández**

## 🚀 Instalación y Uso

### Prerrequisitos

- Node.js (versión 16 o superior)
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/simulador-procesos-so.git

# Navegar al directorio del proyecto
cd simulador-procesos-so

# Instalar dependencias
npm install
```

### Ejecutar en Desarrollo

```bash
# Iniciar el servidor de desarrollo
npm run dev

# El simulador estará disponible en http://localhost:5173
```

## 🎯 Funcionalidades

### 🎮 Controles de Simulación

- **Crear Proceso**: Genera nuevos procesos con PID únicos
- **Modo Automático**: Simulación continua con transiciones aleatorias
- **Control de Velocidad**: Ajuste de velocidad desde muy lenta hasta rápida
- **Reiniciar**: Limpia todos los procesos y estadísticas

### 🔄 Transiciones de Estados

El simulador implementa las siguientes transiciones válidas:

```
New → Ready        (Admisión al sistema)
Ready → Running    (Asignación de CPU)
Running → Ready    (Quantum expirado)
Running → Blocked  (Solicitud de E/S)
Blocked → Ready    (E/S completada)
Running → Terminated (Proceso finalizado)
```

### 📊 Información Detallada

- **Estadísticas por Proceso**: Tiempo en cada estado, prioridad, registros
- **Estado del Procesador**: Cola de listos, proceso en ejecución, cola de bloqueados
- **Métricas del Sistema**: Tiempos promedio, número de transiciones
- **Historial Completo**: Log de todas las transiciones realizadas

### 📈 Exportación de Reportes

Genera reportes detallados en formato CSV que incluyen:

- Información completa de cada proceso
- Estadísticas de tiempo por estado
- Estado actual del procesador
- Métricas de rendimiento del sistema
- Historial completo de transiciones

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 19.1.1**: Framework principal para la interfaz de usuario
- **Vite 7.1.0**: Herramienta de build y desarrollo
- **TailwindCSS 3.4.17**: Framework de estilos utilitarios
- **Lucide React**: Iconografía moderna y escalable

### Características Técnicas
- **ESLint**: Análisis estático de código
- **PostCSS & Autoprefixer**: Procesamiento de CSS
- **Arquitectura de Componentes**: Componentes reutilizables y modulares
- **Programación Orientada a Objetos**: Clases Process y Processor

## 📁 Estructura del Proyecto

```
simulador-procesos-so/
├── src/
│   ├── components/           # Componentes React reutilizables
│   │   ├── StateNode/       # Nodo visual de estado
│   │   ├── TransitionArrow/ # Animaciones de transición
│   │   ├── ProcessInfo/     # Información detallada del proceso
│   │   └── Notification/    # Sistema de notificaciones
│   ├── models/              # Modelos de datos
│   │   ├── Process.js       # Clase Process con FSM
│   │   └── Processor.js     # Clase Processor (planificador)
│   ├── constants/           # Constantes del sistema
│   │   ├── states.js        # Estados y transiciones válidas
│   │   └── colors.js        # Esquema de colores por estado
│   ├── App.jsx              # Componente principal
│   ├── main.jsx             # Punto de entrada
│   └── index.css            # Estilos globales y animaciones
├── public/
├── package.json
└── README.md
```

## 🎨 Diseño Visual

### Esquema de Colores por Estado

- **New**: Gris claro (`#94a3b8`) - Proceso en espera
- **Ready**: Verde (`#22c55e`) - Listo para ejecutar
- **Running**: Azul (`#3b82f6`) - Ejecutándose activamente
- **Blocked**: Naranja (`#f59e0b`) - Esperando recursos
- **Terminated**: Rojo (`#ef4444`) - Proceso finalizado

### Animaciones y Efectos

- Transiciones fluidas entre estados
- Partículas animadas durante las transiciones
- Efectos de pulsación en estados activos
- Notificaciones con fade-in/fade-out
- Tooltips informativos con datos en tiempo real

## 🔧 Configuración Avanzada

### Variables de Entorno

El simulador puede configurarse mediante las siguientes opciones:

```javascript
// Configuración de timing (en ms)
const QUANTUM_TIME = 2000;           // Tiempo de quantum
const IO_WAIT_TIME = 1000-4000;      // Tiempo de E/S aleatorio
const ANIMATION_DURATION = 1200;     // Duración de animaciones
```

### Personalización de Estados

Los estados y transiciones pueden modificarse en `src/constants/states.js`:

```javascript
export const STATES = {
  NEW: "New",
  READY: "Ready", 
  RUNNING: "Running",
  BLOCKED: "Blocked",
  TERMINATED: "Terminated"
};

export const VALID_TRANSITIONS = {
  [STATES.NEW]: [STATES.READY],
  // ... más transiciones
};
```

## 📊 Métricas y Análisis

El simulador proporciona métricas detalladas:

- **Tiempo promedio por estado**: Análisis estadístico
- **Número de transiciones**: Contadores por tipo
- **Utilización de CPU**: Porcentaje de tiempo activo
- **Tiempo de espera**: Tiempo en cola de listos
- **Throughput**: Procesos completados por unidad de tiempo

## 🐛 Depuración y Desarrollo

### Herramientas de Debug

- Console logs detallados de transiciones
- Validación de estados en tiempo real
- Manejo de errores con notificaciones visuales
- Historial completo de eventos del sistema

### Changelog

#### v1.0.0 (Actual)
- Implementación completa de FSM para procesos
- Simulación automática e interactiva
- Exportación de reportes CSV
- Interfaz responsive con animaciones
- Sistema de notificaciones en tiempo real
