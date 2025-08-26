import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Download,
  Settings,
  Info,
  Cpu,
} from "lucide-react";
import { Process } from "./models/Process";
import { Processor } from "./models/Processor";
import { STATES, VALID_TRANSITIONS } from "./constants/states";
import { STATE_COLORS } from "./constants/colors";
import StateNode from "./components/StateNode";
import TransitionArrow, { StaticTransitionArrows } from "./components/TransitionArrow";
import ProcessInfo from "./components/ProcessInfo";
import Notification from "./components/Notification";

const ProcessLifecycleSimulator = () => {
  const [processes, setProcesses] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [nextPID, setNextPID] = useState(1);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [animationDurationMs, setAnimationDurationMs] = useState(1200);
  const [showDetails, setShowDetails] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [animatingTransition, setAnimatingTransition] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [logs, setLogs] = useState([]);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const intervalRef = useRef(null);
  const processorRef = useRef(new Processor());

  // Crear nuevo proceso
  const createProcess = () => {
    const newProcess = new Process(nextPID);
    // Conectar listener de transición para logging y animación centralizada
    newProcess.onTransition = ({ pid, from, to, reason, timestamp }) => {
      setAnimatingTransition({
        processId: pid,
        fromState: from,
        toState: to,
        timestamp,
        reason: reason || "Transición automática"
      });

      setTimeout(() => setAnimatingTransition(null), animationDurationMs);

      logTransition(pid, from, to, reason || "", "sistema");
      playSound("transition");
    };

    setProcesses((prev) => [...prev, newProcess]);
    setNextPID((prev) => prev + 1);
    addNotification(`Proceso ${nextPID} creado`, "success");
    setLogs((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        pid: nextPID,
        from: STATES.NEW,
        to: STATES.NEW,
        reason: "Creación de proceso",
        source: "usuario",
        timestamp: new Date(),
      },
    ]);
  };

  // Reproducir sonido
  const playSound = (type = "transition") => {
    if (!soundEnabled) return;

    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Diferentes sonidos según el tipo
      if (type === "transition") {
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          1200,
          audioContext.currentTime + 0.1
        );
      } else if (type === "error") {
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          100,
          audioContext.currentTime + 0.2
        );
      } else if (type === "success") {
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          1500,
          audioContext.currentTime + 0.1
        );
      }

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.2
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log("Audio no disponible:", error);
    }
  };

  const logTransition = (pid, from, to, reason = "", source = "sistema") => {
    setLogs((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        pid,
        from,
        to,
        reason,
        source,
        timestamp: new Date(),
      },
    ]);
  };

  const clearLogs = () => {
    setLogs([]);
    addNotification("Logs limpiados", "info");
  };

  // Realizar transición manual
  const performTransition = (processId, newState, reason = "") => {
    try {
      setProcesses((prev) =>
        prev.map((p) => {
          if (p.pid === processId) {
            const updatedProcess = Object.assign(
              Object.create(Object.getPrototypeOf(p)),
              p
            );

            // Validar transición antes de realizarla
            if (!VALID_TRANSITIONS[p.state].includes(newState)) {
              throw new Error(`Transición inválida: ${p.state} → ${newState}`);
            }

            setAnimatingTransition({
              processId: processId,
              fromState: p.state,
              toState: newState,
              timestamp: new Date(),
              reason: reason || "Transición manual"
            });

            // Realizar la transición
            updatedProcess.transition(newState, reason);

            // Actualizar las colas del procesador
            updateProcessorQueues(updatedProcess, p.state, newState);

            return updatedProcess;
          }
          return p;
        })
      );

      setTimeout(() => setAnimatingTransition(null), animationDurationMs);

      playSound("transition");
      addNotification(`PID ${processId}: ${reason}`, "success");
    } catch (error) {
      playSound("error");
      addNotification(error.message, "error");
    }
  };

  // Actualizar las colas del procesador según los cambios de estado
  const updateProcessorQueues = (process, oldState, newState) => {
    const processor = processorRef.current;

    // Remover de las colas anteriores si es necesario
    if (oldState === STATES.READY) {
      const readyIndex = processor.readyQueue.findIndex(
        (p) => p.pid === process.pid
      );
      if (readyIndex >= 0) {
        processor.readyQueue.splice(readyIndex, 1);
      }
    } else if (oldState === STATES.BLOCKED) {
      const blockedIndex = processor.blockedQueue.findIndex(
        (p) => p.pid === process.pid
      );
      if (blockedIndex >= 0) {
        processor.blockedQueue.splice(blockedIndex, 1);
      }
    } else if (oldState === STATES.RUNNING) {
      processor.currentProcess = null;
    }

    // Agregar a las nuevas colas según el nuevo estado
    if (
      newState === STATES.READY &&
      !processor.readyQueue.find((p) => p.pid === process.pid)
    ) {
      processor.readyQueue.push(process);
    } else if (
      newState === STATES.BLOCKED &&
      !processor.blockedQueue.find((p) => p.pid === process.pid)
    ) {
      processor.blockedQueue.push(process);
    } else if (newState === STATES.RUNNING) {
      processor.currentProcess = process;
    }
  };

  // Añadir notificación
  const addNotification = (message, type = "info", pid = null) => {
    const notification = {
      id: crypto.randomUUID(),
      pid,
      message,
      type,
      timestamp: new Date(),
    };
    setNotifications((prev) => [...prev, notification]);
    
    // Auto-remove notification con tiempo variable según el tipo
    const timeout = type === "error" ? 5000 : 3000;
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    }, timeout);
  };

  // Función de simulación automática
  const runAutomaticSimulation = () => {
    setProcesses((prevProcesses) => {
      const processor = processorRef.current;
      const updatedProcesses = [...prevProcesses];

      // Admitir procesos NEW a READY
      updatedProcesses.forEach((process) => {
        if (process.state === STATES.NEW && Math.random() < 0.3) {
          try {
            processor.admitProcess(process);
            // La animación se maneja en el listener onTransition del proceso
          } catch (error) {
            console.error("Error admitiendo proceso:", error);
          }
        }
      });

      // Planificar procesos (READY → RUNNING)
      processor.schedule();

      if (processor.currentProcess && Math.random() < 0.4) {
        const currentProcess = processor.currentProcess;
        const randomEvent = Math.random();

        if (randomEvent < 0.25) {
          // Proceso termina
          try {
            currentProcess.transition(STATES.TERMINATED, "Auto-finalización");
            processor.currentProcess = null;
            addNotification(`Proceso ${currentProcess.pid} terminado`, "success");
          } catch (error) {
            console.error("Error terminando proceso:", error);
          }
        } else if (randomEvent < 0.6) {
          // Proceso va a E/S (RUNNING → BLOCKED)
          try {
            currentProcess.transition(STATES.BLOCKED, "Auto-E/S");
            processor.blockedQueue.push(currentProcess);
            processor.currentProcess = null;

            // Simular que después de un tiempo vuelve a READY
            setTimeout(() => {
              setProcesses((processes) =>
                processes.map((p) => {
                  if (p.pid === currentProcess.pid && p.state === STATES.BLOCKED) {
                    try {
                      p.transition(STATES.READY, "Auto-E/S completada");
                      const blockedIndex = processor.blockedQueue.findIndex(
                        (bp) => bp.pid === p.pid
                      );
                      if (blockedIndex >= 0) {
                        processor.blockedQueue.splice(blockedIndex, 1);
                      }
                      processor.readyQueue.push(p);
                    } catch (error) {
                      console.error("Error completando E/S:", error);
                    }
                  }
                  return p;
                })
              );
            }, Math.random() * 3000 + 1500); // Tiempo más realista para E/S
          } catch (error) {
            console.error("Error enviando a E/S:", error);
          }
        } else {
          // Quantum expirado (RUNNING → READY)
          try {
            currentProcess.transition(STATES.READY, "Auto-quantum expirado");
            processor.readyQueue.push(currentProcess);
            processor.currentProcess = null;
          } catch (error) {
            console.error("Error con quantum:", error);
          }
        }
      }

      // Algunos procesos BLOCKED vuelven a READY aleatoriamente
      updatedProcesses.forEach((process) => {
        if (process.state === STATES.BLOCKED && Math.random() < 0.15) {
          try {
            process.transition(STATES.READY, "Auto-E/S completada");
            const blockedIndex = processor.blockedQueue.findIndex(
              (p) => p.pid === process.pid
            );
            if (blockedIndex >= 0) {
              processor.blockedQueue.splice(blockedIndex, 1);
            }
            processor.readyQueue.push(process);
          } catch (error) {
            console.error("Error completando E/S:", error);
          }
        }
      });

      return updatedProcesses;
    });
  };

  // Modo automático
  useEffect(() => {
    if (isAutoMode) {
      intervalRef.current = setInterval(() => {
        runAutomaticSimulation();
      }, speed);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isAutoMode, speed]);

  // Ajustar duración de animaciones según velocidad
  useEffect(() => {
    // Mapeo: más lento -> animación más larga y visible
    if (speed >= 3000) setAnimationDurationMs(2500);
    else if (speed >= 2000) setAnimationDurationMs(2000);
    else if (speed >= 1000) setAnimationDurationMs(1500);
    else if (speed >= 500) setAnimationDurationMs(1200);
    else setAnimationDurationMs(1000);
  }, [speed]);

  // Generar reporte CSV
  const generateReport = () => {
    const timestamp = new Date().toISOString();
    let csvContent = `Simulador de Estados de Procesos - Reporte Generado: ${timestamp}\n`;
    csvContent +=
      "PID,Estado Actual,Tiempo Restante (ms),Tiempo en Estado Actual (ms),Transiciones,Prioridad,PC,Registros,Llamadas Sistema,Historial Detallado\n";

    processes.forEach((p) => {
      const stats = p.getStats();
      const totalTransitions = p.stateHistory.length - 1;
      const historial = p.stateHistory
        .map((h) => `${h.state}(${h.reason})`)
        .join(";");
      const registros = `AX:0x${p.registers.AX.toString(16)
        .padStart(2, "0")
        .toUpperCase()},BX:0x${p.registers.BX.toString(16)
          .padStart(2, "0")
          .toUpperCase()},CX:0x${p.registers.CX.toString(16)
            .padStart(2, "0")
            .toUpperCase()}`;
      const systemCalls = p.systemCalls.join(";");

      csvContent += `${p.pid},${p.state},${p.remainingTime
        },${p.getTimeInCurrentState()},${totalTransitions},${p.priority},0x${p.pc
          .toString(16)
          .toUpperCase()},"${registros}","${systemCalls}","${historial}"\n`;
    });

    // Agregar estadísticas generales
    csvContent += `\nEstadísticas Generales\n`;
    csvContent += `Total Procesos,${generalStats.total}\n`;
    Object.entries(generalStats.byState).forEach(([state, count]) => {
      csvContent += `${state},${count}\n`;
    });

    // Agregar información del procesador
    const processor = processorRef.current;
    csvContent += `\nEstado del Procesador\n`;
    csvContent += `Proceso Actual,${processor.currentProcess?.pid || "Ninguno"
      }\n`;
    csvContent += `Cola Ready,${processor.readyQueue
      .map((p) => p.pid)
      .join(";")}\n`;
    csvContent += `Cola Bloqueados,${processor.blockedQueue
      .map((p) => p.pid)
      .join(";")}\n`;
    csvContent += `Quantum (ms),${processor.quantum}\n`;

    // Agregar métricas de tiempo promedio
    csvContent += `\nMétricas de Tiempo Promedio por Estado\n`;
    const stateTimes = {};
    processes.forEach((p) => {
      const stats = p.getStats();
      Object.entries(stats).forEach(([state, data]) => {
        if (!stateTimes[state]) stateTimes[state] = { total: 0, count: 0 };
        stateTimes[state].total += data.totalTime;
        stateTimes[state].count += data.count;
      });
    });

    Object.entries(stateTimes).forEach(([state, data]) => {
      const avgTime = data.count > 0 ? Math.round(data.total / data.count) : 0;
      csvContent += `${state},${avgTime}ms\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `process_report_${new Date().toISOString().split("T")[0]
      }_${new Date().toLocaleTimeString().replace(/:/g, "-")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    playSound("success");
    addNotification("Reporte CSV generado exitosamente", "success");
  };

  // Reiniciar simulación
  const resetSimulation = () => {
    setProcesses([]);
    setSelectedProcess(null);
    setNextPID(1);
    setIsAutoMode(false);
    processorRef.current = new Processor(); // Reiniciar el procesador
    addNotification("Simulación reiniciada", "info");
  };

  // Obtener estadísticas generales
  const getGeneralStats = () => {
    const stats = {
      total: processes.length,
      byState: {},
    };

    Object.values(STATES).forEach((state) => {
      stats.byState[state] = processes.filter((p) => p.state === state).length;
    });

    return stats;
  };

  const generalStats = getGeneralStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8 flex items-center justify-center">
      <div className="w-full max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 mb-12 border-2 border-blue-200/30 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
          <div className="relative z-10 ">
            <div className="flex items-center justify-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mr-4 shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <Cpu className="w-7 h-7 text-white drop-shadow-lg" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                Simulador de Estados de Procesos
              </h1>
            </div>
            <p className="text-gray-600 text-base font-medium mb-4">
              Máquina de estados finita con visualización animada y análisis en
              tiempo real
            </p>
            <div className="flex justify-center mt-4 space-x-4">
              <div className="flex items-center text-xs text-gray-600 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200/50 shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="font-medium">Sistema Operativo</span>
              </div>
              <div className="flex items-center text-xs text-gray-600 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200/50 shadow-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span className="font-medium">Tiempo Real</span>
              </div>
              <div className="flex items-center text-xs text-gray-600 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200/50 shadow-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                <span className="font-medium">Análisis Avanzado</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="fixed top-8 right-8 z-50 space-y-4">
          {notifications.map((notif) => (
            <Notification
              key={notif.id}
              message={notif.message}
              type={notif.type}
              timestamp={notif.timestamp}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Panel de Control */}
          <div className="lg:col-span-3 bg-white/95 backdrop-blur-xl rounded-3xl p-6 border-2 border-blue-200/40 shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            <div className="relative z-10">
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center justify-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  <Settings className="w-5 h-5 text-white drop-shadow-sm" />
                </div>
                <span className="text-gray-800">Control de Simulación</span>
              </h2>

              {/* Controles básicos */}
              <div className="space-y-4 mb-6">
                <button
                  onClick={createProcess}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-4 rounded-xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                    <Plus className="w-3 h-3" />
                  </div>
                  <span>Crear Proceso</span>
                </button>

                <div className="flex gap-4">
                  <button
                    onClick={() => setIsAutoMode(!isAutoMode)}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 ${isAutoMode
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                      }`}
                  >
                    <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                      {isAutoMode ? (
                        <Pause className="w-3 h-3" />
                      ) : (
                        <Play className="w-3 h-3" />
                      )}
                    </div>
                    <span>{isAutoMode ? "Pausar" : "Auto"}</span>
                  </button>

                  <button
                    onClick={resetSimulation}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                      <RotateCcw className="w-3 h-3" />
                    </div>
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Velocidad */}
              <div className="mb-6 text-center">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  ⚡ Velocidad de Simulación
                </label>
                <select
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full bg-white/80 text-gray-700 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                >
                  <option value={3000} className="text-gray-900">🐢 Muy Lenta</option>
                  <option value={2000} className="text-gray-900">
                    🐌 Lenta
                  </option>
                  <option value={1000} className="text-gray-900">
                    ⚡ Normal
                  </option>
                  <option value={500} className="text-gray-900">
                    🚀 Rápida
                  </option>
                </select>

                <div className="mt-3 grid grid-cols-2 gap-3 items-center">
                  <div className="text-left text-xs text-gray-600 font-medium">Intervalo (ms)</div>
                  <input
                    type="number"
                    min={100}
                    step={100}
                    value={speed}
                    onChange={(e) => setSpeed(Math.max(100, Number(e.target.value)))}
                    className="w-full bg-white/80 text-gray-700 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  />
                </div>
              </div>

              {/* Toggle detalles */}
              <div className="mb-6 text-center">
                <label className="flex items-center justify-center gap-3 cursor-pointer p-3 bg-white/60 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
                  <input
                    type="checkbox"
                    checked={showDetails}
                    onChange={(e) => setShowDetails(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 text-sm font-medium">
                    🔧 Mostrar Detalles Técnicos
                  </span>
                </label>
              </div>

              {/* Toggle sonido */}
              <div className="mb-6 text-center">
                <label className="flex items-center justify-center gap-3 cursor-pointer p-3 bg-white/60 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-gray-700 text-sm font-medium">
                    🔊 Sonidos de Eventos
                  </span>
                </label>
              </div>

              {/* Estadísticas generales */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 mb-6 text-center border border-blue-200/50 shadow-lg">
                <h3 className="text-gray-800 font-bold mb-4 flex items-center justify-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                    <Info className="w-4 h-4 text-white" />
                  </div>
                  📊 Estadísticas
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg border border-blue-200/30">
                    <span className="text-gray-700 font-medium">
                      Total Procesos:
                    </span>
                    <span className="font-bold text-blue-600 text-lg">
                      {generalStats.total}
                    </span>
                  </div>
                  {Object.entries(generalStats.byState).map(
                    ([state, count]) => (
                      <div
                        key={state}
                        className="flex justify-between items-center p-2 bg-white/40 rounded-lg border border-blue-200/20"
                      >
                        <span className="text-gray-600">{state}:</span>
                        <span className="font-semibold text-gray-800">
                          {count}
                        </span>
                      </div>
                    )
                  )}
                </div>

                {/* Información del procesador */}
                <div className="mt-4 pt-4 border-t border-blue-200/50">
                  <h4 className="text-gray-700 font-semibold mb-2 text-xs">
                    🖥️ Estado del Procesador
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center p-2 bg-white/40 rounded-lg">
                      <span className="text-gray-600">Ejecutando:</span>
                      <span className="font-semibold text-gray-800">
                        {processorRef.current.currentProcess?.pid || "Ninguno"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/40 rounded-lg">
                      <span className="text-gray-600">Cola Ready:</span>
                      <span className="font-semibold text-gray-800">
                        {processorRef.current.readyQueue.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/40 rounded-lg">
                      <span className="text-gray-600">Cola Blocked:</span>
                      <span className="font-semibold text-gray-800">
                        {processorRef.current.blockedQueue.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={generateReport}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-4 rounded-xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                <Download className="w-3 h-3" />
              </div>
              <span>📊 Exportar Reporte CSV</span>
            </button>
          </div>

          {/* Diagrama de Estados */}
          <div className="lg:col-span-9 bg-white/95 backdrop-blur-xl rounded-3xl p-8 border-2 border-green-200/40 shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-emerald-50/30"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"></div>
            <div className="relative z-10">
              <h2 className="text-xl font-bold text-gray-800 mb-4 text-center flex items-center justify-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  <div className="w-6 h-6 border-2 border-white rounded-full relative z-10"></div>
                </div>
                <span className="text-gray-800">Diagrama de Estados</span>
              </h2>

              {/* Contenedor del diagrama con posición relativa para las animaciones */}
              <div className="relative h-[700px] bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 overflow-visible border-2 border-green-200/30 shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-br from-green-100/20 to-emerald-100/20 rounded-2xl"></div>

                {/* Grid de estados */}
                <div className="relative z-20 h-full">
                  <div className="grid grid-cols-3 gap-16 h-full items-center">
                    {/* Fila superior */}
                    <div className="col-span-3 flex justify-center">
                      <StateNode
                        state={STATES.NEW}
                        processes={processes.filter((p) => p.state === STATES.NEW)}
                        onProcessClick={setSelectedProcess}
                        animatingTransition={animatingTransition}
                      />
                    </div>

                    {/* Fila media - READY, RUNNING, BLOCKED */}
                    <div className="flex justify-center">
                      <StateNode
                        state={STATES.READY}
                        processes={processes.filter((p) => p.state === STATES.READY)}
                        onProcessClick={setSelectedProcess}
                        animatingTransition={animatingTransition}
                      />
                    </div>

                    <div className="flex justify-center">
                      <StateNode
                        state={STATES.RUNNING}
                        processes={processes.filter((p) => p.state === STATES.RUNNING)}
                        onProcessClick={setSelectedProcess}
                        animatingTransition={animatingTransition}
                      />
                    </div>

                    <div className="flex justify-center">
                      <StateNode
                        state={STATES.BLOCKED}
                        processes={processes.filter((p) => p.state === STATES.BLOCKED)}
                        onProcessClick={setSelectedProcess}
                        animatingTransition={animatingTransition}
                      />
                    </div>

                    {/* Fila inferior - TERMINATED */}
                    <div className="col-span-3 flex justify-center">
                      <StateNode
                        state={STATES.TERMINATED}
                        processes={processes.filter((p) => p.state === STATES.TERMINATED)}
                        onProcessClick={setSelectedProcess}
                        animatingTransition={animatingTransition}
                      />
                    </div>
                  </div>
                </div>

                {/* Flechas de transición estáticas */}
                <StaticTransitionArrows />

                {/* Animaciones de transición */}
                {animatingTransition && (
                  <div className="absolute inset-0 z-40">
                    <TransitionArrow
                      from={animatingTransition.fromState}
                      to={animatingTransition.toState}
                      durationMs={animationDurationMs}
                    />
                  </div>
                )}

                {/* Indicador de proceso activo */}
                {animatingTransition && (
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full shadow-2xl border-2 border-white/20 flex items-center gap-3 animate-bounce">
                      <div className="w-3 h-3 bg-yellow-300 rounded-full animate-pulse"></div>
                      <span className="font-bold text-sm">
                        PID {animatingTransition.processId}: {animatingTransition.fromState} → {animatingTransition.toState}
                      </span>
                      <div className="w-3 h-3 bg-yellow-300 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Leyenda */}
              <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200/50 shadow-lg">
                <h4 className="text-gray-700 font-semibold mb-3 text-center text-sm">
                  🎨 Leyenda de Estados
                </h4>
                <div className="grid grid-cols-5 gap-3">
                  {Object.entries(STATE_COLORS).map(([state, color]) => (
                    <div
                      key={state}
                      className="flex items-center gap-2 p-2 bg-white/60 rounded-lg border border-gray-200/30 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div
                        className="w-4 h-4 rounded-full border-2 border-gray-300 shadow-sm"
                        style={{ backgroundColor: color }}
                      ></div>
                      <span className="text-gray-700 text-xs font-medium">
                        {state}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Indicadores de flujo */}
                <div className="mt-4 pt-3 border-t border-gray-200/50">
                  <div className="text-center text-xs text-gray-600 mb-2 font-medium">
                    🔄 Flujos de Transición Activos
                  </div>
                  <div className="flex justify-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-gray-600">Admisión</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-gray-600">Planificación</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                      <span className="text-gray-600">E/S</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-gray-600">Terminación</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer de Información del Proceso */}
        <div className="mt-8 w-full">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-5 border-2 border-purple-200/40 shadow-2xl transition-all duration-300 overflow-hidden max-w-[1400px] mx-auto">
            <div className="relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500"></div>
              <div className="pt-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                    <Info className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base md:text-lg font-bold text-gray-800">Información del Proceso</span>
                </div>
                {selectedProcess ? (
                  <ProcessInfo
                    process={selectedProcess}
                    showDetails={showDetails}
                    onTransition={(newState, reason) =>
                      performTransition(selectedProcess.pid, newState, reason)
                    }
                  />
                ) : (
                  <div className="text-center text-gray-500 py-2 flex flex-col items-center justify-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-2 shadow-sm">
                      <Info className="w-5 h-5 text-gray-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">
                      No hay proceso seleccionado
                    </h3>
                    <p className="text-gray-500 text-xs">
                      Haz clic en un proceso del diagrama para ver su información detallada
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Panel de Logs de Transiciones (FSM) */}
        {logs.length > 0 && (
          <div className="mt-6 w-full">
            <div className="bg-white/90 rounded-2xl p-4 border border-gray-200 shadow max-w-[1400px] mx-auto">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  📝 Registro de Transiciones ({logs.length} total)
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAllLogs(!showAllLogs)}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors"
                  >
                    {showAllLogs ? "Mostrar últimos 100" : "Mostrar todos"}
                  </button>
                  <button
                    onClick={clearLogs}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition-colors"
                  >
                    🗑️ Limpiar
                  </button>
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto text-xs space-y-1 font-mono">
                {(showAllLogs ? logs : logs.slice(-100)).map((l) => (
                  <div key={l.id} className="flex justify-between gap-2">
                    <span className="text-gray-600">PID {l.pid}</span>
                    <span className="text-gray-800 font-semibold">{l.from} → {l.to}</span>
                    <span className="text-gray-500">{l.reason}</span>
                    <span className="text-gray-400">{l.source}</span>
                    <span className="text-gray-400">{l.timestamp.toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessLifecycleSimulator;
