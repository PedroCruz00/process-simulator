import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Download,
  Settings,
  Info,
} from "lucide-react";
import { Process } from "./models/Process";
import { STATES, VALID_TRANSITIONS } from "./constants/states";
import { STATE_COLORS } from "./constants/colors";
import StateNode from "./components/StateNode";
import TransitionArrow from "./components/TransitionArrow";
import ProcessInfo from "./components/ProcessInfo";
import Notification from "./components/Notification";

const ProcessLifecycleSimulator = () => {
  const [processes, setProcesses] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [nextPID, setNextPID] = useState(1);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [showDetails, setShowDetails] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [animatingTransition, setAnimatingTransition] = useState(null);
  const intervalRef = useRef(null);

  // Crear nuevo proceso
  const createProcess = () => {
    const newProcess = new Process(nextPID);
    setProcesses((prev) => [...prev, newProcess]);
    setNextPID((prev) => prev + 1);
    addNotification(`Proceso ${nextPID} creado`, "success");
  };

  // Realizar transición
  const performTransition = (processId, newState, reason = "") => {
    try {
      setProcesses((prev) =>
        prev.map((p) => {
          if (p.pid === processId) {
            const updatedProcess = Object.assign(
              Object.create(Object.getPrototypeOf(p)),
              p
            );
            updatedProcess.transition(newState, reason);

            setAnimatingTransition({
              processId: processId,
              fromState: p.state,
              toState: newState,
              timestamp: new Date(),
            });

            setTimeout(() => setAnimatingTransition(null), 1000);

            return updatedProcess;
          }
          return p;
        })
      );

      addNotification(`Proceso ${processId}: ${newState}`, "success");
    } catch (error) {
      addNotification(error.message, "error");
    }
  };

  // Añadir notificación
  const addNotification = (message, type = "info") => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date(),
    };
    setNotifications((prev) => [...prev, notification]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    }, 3000);
  };

  // Modo automático
  useEffect(() => {
    if (isAutoMode) {
      intervalRef.current = setInterval(() => {
        setProcesses((prev) => {
          return prev.map((p) => {
            if (p.state === STATES.NEW && Math.random() < 0.3) {
              const updatedProcess = Object.assign(
                Object.create(Object.getPrototypeOf(p)),
                p
              );
              updatedProcess.transition(STATES.READY, "Auto-admisión");
              return updatedProcess;
            }
            if (p.state === STATES.READY && Math.random() < 0.4) {
              const updatedProcess = Object.assign(
                Object.create(Object.getPrototypeOf(p)),
                p
              );
              updatedProcess.transition(STATES.RUNNING, "Auto-planificación");
              return updatedProcess;
            }
            if (p.state === STATES.RUNNING && Math.random() < 0.2) {
              const updatedProcess = Object.assign(
                Object.create(Object.getPrototypeOf(p)),
                p
              );
              if (Math.random() < 0.5) {
                updatedProcess.transition(STATES.WAITING, "Auto-E/S");
              } else if (Math.random() < 0.3) {
                updatedProcess.transition(
                  STATES.TERMINATED,
                  "Auto-finalización"
                );
              } else {
                updatedProcess.transition(STATES.READY, "Auto-quantum");
              }
              return updatedProcess;
            }
            if (p.state === STATES.WAITING && Math.random() < 0.4) {
              const updatedProcess = Object.assign(
                Object.create(Object.getPrototypeOf(p)),
                p
              );
              updatedProcess.transition(STATES.READY, "Auto-E/S completada");
              return updatedProcess;
            }
            return p;
          });
        });
      }, speed);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isAutoMode, speed]);

  // Generar reporte CSV
  const generateReport = () => {
    let csvContent = "PID,Estado Actual,Tiempo Total,Transiciones,Historial\n";

    processes.forEach((p) => {
      const stats = p.getStats();
      const totalTransitions = p.stateHistory.length - 1;
      const historial = p.stateHistory
        .map((h) => `${h.state}(${h.reason})`)
        .join(";");

      csvContent += `${p.pid},${
        p.state
      },${p.getTimeInCurrentState()}ms,${totalTransitions},"${historial}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `process_report_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Reiniciar simulación
  const resetSimulation = () => {
    setProcesses([]);
    setSelectedProcess(null);
    setNextPID(1);
    setIsAutoMode(false);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-6 border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-2">
            Simulador de Estados de Procesos de SO
          </h1>
          <p className="text-blue-200">
            Máquina de estados finita con visualización animada
          </p>
        </div>

        {/* Notificaciones */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notif) => (
            <Notification
              key={notif.id}
              message={notif.message}
              type={notif.type}
              timestamp={notif.timestamp}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de Control */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Control de Simulación
            </h2>

            {/* Controles básicos */}
            <div className="space-y-3 mb-6">
              <button
                onClick={createProcess}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                Crear Proceso
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsAutoMode(!isAutoMode)}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    isAutoMode
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  {isAutoMode ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  {isAutoMode ? "Pausar" : "Auto"}
                </button>

                <button
                  onClick={resetSimulation}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>

            {/* Velocidad */}
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-2">
                Velocidad de Simulación
              </label>
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={2000} className="text-gray-900">
                  Lenta
                </option>
                <option value={1000} className="text-gray-900">
                  Normal
                </option>
                <option value={500} className="text-gray-900">
                  Rápida
                </option>
              </select>
            </div>

            {/* Toggle detalles */}
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDetails}
                  onChange={(e) => setShowDetails(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-white/20 border-white/30 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-white text-sm font-medium">
                  Mostrar Detalles Técnicos
                </span>
              </label>
            </div>

            {/* Estadísticas generales */}
            <div className="bg-white/10 rounded-lg p-4 mb-4">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Estadísticas
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-white">
                  <span>Total Procesos:</span>
                  <span className="font-bold">{generalStats.total}</span>
                </div>
                {Object.entries(generalStats.byState).map(([state, count]) => (
                  <div
                    key={state}
                    className="flex justify-between text-white/80"
                  >
                    <span>{state}:</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={generateReport}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-105"
            >
              <Download className="w-4 h-4" />
              Exportar Reporte CSV
            </button>
          </div>

          {/* Diagrama de Estados */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">
              Diagrama de Estados
            </h2>

            <div className="relative h-96 bg-white/5 rounded-lg p-4 overflow-hidden">
              {/* Estados */}
              <div className="grid grid-cols-3 gap-4 h-full">
                {/* Fila superior */}
                <div className="col-span-3 flex justify-center">
                  <StateNode
                    state={STATES.NEW}
                    processes={processes.filter((p) => p.state === STATES.NEW)}
                    onProcessClick={setSelectedProcess}
                    animatingTransition={animatingTransition}
                  />
                </div>

                {/* Fila media */}
                <div className="flex justify-center">
                  <StateNode
                    state={STATES.READY}
                    processes={processes.filter(
                      (p) => p.state === STATES.READY
                    )}
                    onProcessClick={setSelectedProcess}
                    animatingTransition={animatingTransition}
                  />
                </div>

                <div className="flex justify-center">
                  <StateNode
                    state={STATES.RUNNING}
                    processes={processes.filter(
                      (p) => p.state === STATES.RUNNING
                    )}
                    onProcessClick={setSelectedProcess}
                    animatingTransition={animatingTransition}
                  />
                </div>

                <div className="flex justify-center">
                  <StateNode
                    state={STATES.WAITING}
                    processes={processes.filter(
                      (p) => p.state === STATES.WAITING
                    )}
                    onProcessClick={setSelectedProcess}
                    animatingTransition={animatingTransition}
                  />
                </div>

                {/* Fila inferior */}
                <div className="col-span-3 flex justify-center">
                  <StateNode
                    state={STATES.TERMINATED}
                    processes={processes.filter(
                      (p) => p.state === STATES.TERMINATED
                    )}
                    onProcessClick={setSelectedProcess}
                    animatingTransition={animatingTransition}
                  />
                </div>
              </div>

              {/* Flechas animadas */}
              {animatingTransition && (
                <div className="absolute inset-0 pointer-events-none">
                  <TransitionArrow
                    from={animatingTransition.fromState}
                    to={animatingTransition.toState}
                  />
                </div>
              )}
            </div>

            {/* Leyenda */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {Object.entries(STATE_COLORS).map(([state, color]) => (
                <div key={state} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white"
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className="text-white text-sm">{state}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Panel de Información */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">
              Información del Proceso
            </h2>

            {selectedProcess ? (
              <ProcessInfo
                process={selectedProcess}
                showDetails={showDetails}
                onTransition={(newState, reason) =>
                  performTransition(selectedProcess.pid, newState, reason)
                }
              />
            ) : (
              <div className="text-center text-white/60 py-8">
                <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>
                  Selecciona un proceso del diagrama para ver su información
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessLifecycleSimulator;
