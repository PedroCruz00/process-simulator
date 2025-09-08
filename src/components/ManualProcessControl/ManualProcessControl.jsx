import React, { useState, useEffect } from "react";
import { X, Plus, ArrowRight, Info, AlertCircle } from "lucide-react";
import { STATES, VALID_TRANSITIONS } from "../../constants/states";
import { STATE_COLORS } from "../../constants/colors";

const ManualProcessControl = ({
  isOpen,
  onClose,
  processes,
  onManualTransition,
  onManualCreateProcess,
  logs,
}) => {
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [draggedProcess, setDraggedProcess] = useState(null);
  const [dragOverState, setDragOverState] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Agregar notificación al sistema de toasts del modo manual
  const addManualNotification = (message, type = "info") => {
    const notif = {
      id: Date.now() + Math.random(),
      message,
      type,
      timestamp: new Date(),
    };
    setNotifications((prev) => [...prev, notif]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    }, 3000);
  };

  // Crear proceso manual
  const handleCreateProcess = () => {
    onManualCreateProcess();
    addManualNotification("✅ Proceso creado exitosamente", "success");
  };

  // Manejar inicio de arrastre
  const handleDragStart = (e, process) => {
    setDraggedProcess(process);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", process.pid.toString());
  };

  // Manejar arrastre sobre estado
  const handleDragOver = (e, state) => {
    e.preventDefault();
    setDragOverState(state);
  };

  // Manejar fin de arrastre
  const handleDragLeave = () => {
    setDragOverState(null);
  };

  // Manejar fin de arrastre global
  const handleDragEnd = () => {
    setDraggedProcess(null);
    setDragOverState(null);
  };

  // Manejar soltar proceso
  const handleDrop = (e, targetState) => {
    e.preventDefault();
    setDragOverState(null);

    if (draggedProcess && targetState !== draggedProcess.state) {
      // Validar transición
      if (VALID_TRANSITIONS[draggedProcess.state].includes(targetState)) {
        onManualTransition(
          draggedProcess.pid,
          targetState,
          "Transición manual por arrastre"
        );
        addManualNotification(
          `✅ Proceso P${draggedProcess.pid} movido a ${targetState}`,
          "success"
        );
      } else {
        // Mostrar error de transición inválida
        addManualNotification(
          `❌ Transición inválida: ${draggedProcess.state} → ${targetState}`,
          "error"
        );
        console.error(
          `Transición inválida: ${draggedProcess.state} → ${targetState}`
        );
      }
    }

    setDraggedProcess(null);
  };

  // Obtener procesos por estado
  const getProcessesByState = (state) => {
    return processes.filter((p) => p.state === state);
  };

  // Verificar si un proceso está siendo arrastrado
  const isProcessBeingDragged = (process) => {
    return draggedProcess && draggedProcess.pid === process.pid;
  };

  // Verificar si una transición es válida
  const isValidTransition = (fromState, toState) => {
    return VALID_TRANSITIONS[fromState]?.includes(toState) || false;
  };

  // Obtener logs recientes
  const recentLogs = logs.slice(-10).reverse();

  // Mostrar notificación de bienvenida cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      addManualNotification("🎮 Modo manual activado ", "info");
    }
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          {/* Sistema de notificaciones toast para modo manual */}
          <div className="fixed top-4 right-4 sm:top-8 sm:right-8 z-[60] space-y-2 sm:space-y-4 max-w-xs sm:max-w-sm">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3 sm:p-4 rounded-lg shadow-lg border-l-4 text-white font-medium text-xs sm:text-sm max-w-sm transform transition-all duration-300 ${
                  notif.type === "success"
                    ? "bg-green-500 border-green-600"
                    : notif.type === "error"
                    ? "bg-red-500 border-red-600"
                    : "bg-blue-500 border-blue-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{notif.message}</span>
                  <button
                    onClick={() =>
                      setNotifications((prev) =>
                        prev.filter((n) => n.id !== notif.id)
                      )
                    }
                    className="ml-2 text-white/80 hover:text-white flex-shrink-0"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold">
                      Control Manual de Procesos
                    </h2>
                    <p className="text-blue-100 text-xs sm:text-sm">
                      Arrastra y suelta procesos entre estados
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row h-[calc(95vh-120px)] sm:h-[calc(90vh-120px)]">
              {/* Panel izquierdo - Diagrama de estados */}
              <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
                <div className="mb-4 sm:mb-6">
                  <button
                    onClick={handleCreateProcess}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 transform hover:scale-105 shadow-lg text-sm sm:text-base"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    Crear Nuevo Proceso
                  </button>
                </div>

                {/* Diagrama de estados */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl sm:rounded-2xl p-3 sm:p-6 border-2 border-gray-200">
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 text-center">
                    Estados del Sistema
                  </h3>

                  {/* Layout móvil: Vertical stack */}
                  <div className="block lg:hidden space-y-4">
                    {/* Fila superior - NEW */}
                    <div className="flex justify-center">
                      <div
                        className={`w-32 sm:w-40 h-20 sm:h-24 rounded-xl sm:rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-300 ${
                          dragOverState === STATES.NEW
                            ? "scale-105 shadow-2xl"
                            : ""
                        }`}
                        style={{
                          backgroundColor:
                            dragOverState === STATES.NEW
                              ? `${STATE_COLORS[STATES.NEW]}20`
                              : STATE_COLORS[STATES.NEW],
                          borderColor:
                            dragOverState === STATES.NEW
                              ? STATE_COLORS[STATES.NEW]
                              : "transparent",
                        }}
                        onDragOver={(e) => handleDragOver(e, STATES.NEW)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, STATES.NEW)}
                      >
                        <h4 className="font-bold text-white mb-1 sm:mb-2 text-sm sm:text-base">
                          {STATES.NEW}
                        </h4>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {getProcessesByState(STATES.NEW).map((process) => (
                            <div
                              key={process.pid}
                              draggable
                              onDragStart={(e) => handleDragStart(e, process)}
                              onDragEnd={handleDragEnd}
                              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs cursor-move transition-all duration-200 ${
                                isProcessBeingDragged(process)
                                  ? "bg-white/40 scale-110 shadow-lg"
                                  : "bg-white/20 hover:bg-white/30"
                              }`}
                            >
                              P{process.pid}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Fila media - READY, RUNNING, BLOCKED en línea horizontal */}
                    <div className="flex justify-between items-center gap-2">
                      <div
                        className={`w-20 sm:w-24 h-16 sm:h-20 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-300 ${
                          dragOverState === STATES.READY
                            ? "scale-105 shadow-2xl"
                            : ""
                        }`}
                        style={{
                          backgroundColor:
                            dragOverState === STATES.READY
                              ? `${STATE_COLORS[STATES.READY]}20`
                              : STATE_COLORS[STATES.READY],
                          borderColor:
                            dragOverState === STATES.READY
                              ? STATE_COLORS[STATES.READY]
                              : "transparent",
                        }}
                        onDragOver={(e) => handleDragOver(e, STATES.READY)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, STATES.READY)}
                      >
                        <h4 className="font-bold text-white mb-1 text-xs sm:text-sm">
                          {STATES.READY}
                        </h4>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {getProcessesByState(STATES.READY).map((process) => (
                            <div
                              key={process.pid}
                              draggable
                              onDragStart={(e) => handleDragStart(e, process)}
                              onDragEnd={handleDragEnd}
                              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-white font-bold text-xs cursor-move transition-all duration-200 ${
                                isProcessBeingDragged(process)
                                  ? "bg-white/40 scale-110 shadow-lg"
                                  : "bg-white/20 hover:bg-white/30"
                              }`}
                            >
                              P{process.pid}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div
                        className={`w-20 sm:w-24 h-16 sm:h-20 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-300 ${
                          dragOverState === STATES.RUNNING
                            ? "scale-105 shadow-2xl"
                            : ""
                        }`}
                        style={{
                          backgroundColor:
                            dragOverState === STATES.RUNNING
                              ? `${STATE_COLORS[STATES.RUNNING]}20`
                              : STATE_COLORS[STATES.RUNNING],
                          borderColor:
                            dragOverState === STATES.RUNNING
                              ? STATE_COLORS[STATES.RUNNING]
                              : "transparent",
                        }}
                        onDragOver={(e) => handleDragOver(e, STATES.RUNNING)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, STATES.RUNNING)}
                      >
                        <h4 className="font-bold text-white mb-1 text-xs sm:text-sm">
                          {STATES.RUNNING}
                        </h4>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {getProcessesByState(STATES.RUNNING).map(
                            (process) => (
                              <div
                                key={process.pid}
                                draggable
                                onDragStart={(e) => handleDragStart(e, process)}
                                onDragEnd={handleDragEnd}
                                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-white font-bold text-xs cursor-move transition-all duration-200 ${
                                  isProcessBeingDragged(process)
                                    ? "bg-white/40 scale-110 shadow-lg"
                                    : "bg-white/20 hover:bg-white/30"
                                }`}
                              >
                                P{process.pid}
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      <div
                        className={`w-20 sm:w-24 h-16 sm:h-20 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-300 ${
                          dragOverState === STATES.BLOCKED
                            ? "scale-105 shadow-2xl"
                            : ""
                        }`}
                        style={{
                          backgroundColor:
                            dragOverState === STATES.BLOCKED
                              ? `${STATE_COLORS[STATES.BLOCKED]}20`
                              : STATE_COLORS[STATES.BLOCKED],
                          borderColor:
                            dragOverState === STATES.BLOCKED
                              ? STATE_COLORS[STATES.BLOCKED]
                              : "transparent",
                        }}
                        onDragOver={(e) => handleDragOver(e, STATES.BLOCKED)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, STATES.BLOCKED)}
                      >
                        <h4 className="font-bold text-white mb-1 text-xs sm:text-sm">
                          {STATES.BLOCKED}
                        </h4>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {getProcessesByState(STATES.BLOCKED).map(
                            (process) => (
                              <div
                                key={process.pid}
                                draggable
                                onDragStart={(e) => handleDragStart(e, process)}
                                onDragEnd={handleDragEnd}
                                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-white font-bold text-xs cursor-move transition-all duration-200 ${
                                  isProcessBeingDragged(process)
                                    ? "bg-white/40 scale-110 shadow-lg"
                                    : "bg-white/20 hover:bg-white/30"
                                }`}
                              >
                                P{process.pid}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Fila inferior - TERMINATED */}
                    <div className="flex justify-center">
                      <div
                        className={`w-32 sm:w-40 h-20 sm:h-24 rounded-xl sm:rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-300 ${
                          dragOverState === STATES.TERMINATED
                            ? "scale-105 shadow-2xl"
                            : ""
                        }`}
                        style={{
                          backgroundColor:
                            dragOverState === STATES.TERMINATED
                              ? `${STATE_COLORS[STATES.TERMINATED]}20`
                              : STATE_COLORS[STATES.TERMINATED],
                          borderColor:
                            dragOverState === STATES.TERMINATED
                              ? STATE_COLORS[STATES.TERMINATED]
                              : "transparent",
                        }}
                        onDragOver={(e) => handleDragOver(e, STATES.TERMINATED)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, STATES.TERMINATED)}
                      >
                        <h4 className="font-bold text-white mb-1 sm:mb-2 text-sm sm:text-base">
                          {STATES.TERMINATED}
                        </h4>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {getProcessesByState(STATES.TERMINATED).map(
                            (process) => (
                              <div
                                key={process.pid}
                                draggable
                                onDragStart={(e) => handleDragStart(e, process)}
                                onDragEnd={handleDragEnd}
                                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs cursor-move transition-all duration-200 ${
                                  isProcessBeingDragged(process)
                                    ? "bg-white/40 scale-110 shadow-lg"
                                    : "bg-white/20 hover:bg-white/30"
                                }`}
                              >
                                P{process.pid}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Layout desktop: Grid original */}
                  <div className="hidden lg:grid grid-cols-3 gap-6">
                    {/* Fila superior - NEW */}
                    <div className="col-span-3 flex justify-center">
                      <div
                        className={`w-48 h-32 rounded-2xl border-3 flex flex-col items-center justify-center transition-all duration-300 ${
                          dragOverState === STATES.NEW
                            ? "scale-110 shadow-2xl"
                            : ""
                        }`}
                        style={{
                          backgroundColor:
                            dragOverState === STATES.NEW
                              ? `${STATE_COLORS[STATES.NEW]}20`
                              : STATE_COLORS[STATES.NEW],
                          borderColor:
                            dragOverState === STATES.NEW
                              ? STATE_COLORS[STATES.NEW]
                              : "transparent",
                        }}
                        onDragOver={(e) => handleDragOver(e, STATES.NEW)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, STATES.NEW)}
                      >
                        <h4 className="font-bold text-white mb-2">
                          {STATES.NEW}
                        </h4>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {getProcessesByState(STATES.NEW).map((process) => (
                            <div
                              key={process.pid}
                              draggable
                              onDragStart={(e) => handleDragStart(e, process)}
                              onDragEnd={handleDragEnd}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs cursor-move transition-all duration-200 ${
                                isProcessBeingDragged(process)
                                  ? "bg-white/40 scale-110 shadow-lg"
                                  : "bg-white/20 hover:bg-white/30"
                              }`}
                            >
                              P{process.pid}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Fila media - READY, RUNNING, BLOCKED */}
                    <div
                      className={`w-48 h-32 rounded-2xl border-3 flex flex-col items-center justify-center transition-all duration-300 ${
                        dragOverState === STATES.READY
                          ? "scale-110 shadow-2xl"
                          : ""
                      }`}
                      style={{
                        backgroundColor:
                          dragOverState === STATES.READY
                            ? `${STATE_COLORS[STATES.READY]}20`
                            : STATE_COLORS[STATES.READY],
                        borderColor:
                          dragOverState === STATES.READY
                            ? STATE_COLORS[STATES.READY]
                            : "transparent",
                      }}
                      onDragOver={(e) => handleDragOver(e, STATES.READY)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, STATES.READY)}
                    >
                      <h4 className="font-bold text-white mb-2">
                        {STATES.READY}
                      </h4>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {getProcessesByState(STATES.READY).map((process) => (
                          <div
                            key={process.pid}
                            draggable
                            onDragStart={(e) => handleDragStart(e, process)}
                            onDragEnd={handleDragEnd}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs cursor-move transition-all duration-200 ${
                              isProcessBeingDragged(process)
                                ? "bg-white/40 scale-110 shadow-lg"
                                : "bg-white/20 hover:bg-white/30"
                            }`}
                          >
                            P{process.pid}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div
                      className={`w-48 h-32 rounded-2xl border-3 flex flex-col items-center justify-center transition-all duration-300 ${
                        dragOverState === STATES.RUNNING
                          ? "scale-110 shadow-2xl"
                          : ""
                      }`}
                      style={{
                        backgroundColor:
                          dragOverState === STATES.RUNNING
                            ? `${STATE_COLORS[STATES.RUNNING]}20`
                            : STATE_COLORS[STATES.RUNNING],
                        borderColor:
                          dragOverState === STATES.RUNNING
                            ? STATE_COLORS[STATES.RUNNING]
                            : "transparent",
                      }}
                      onDragOver={(e) => handleDragOver(e, STATES.RUNNING)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, STATES.RUNNING)}
                    >
                      <h4 className="font-bold text-white mb-2">
                        {STATES.RUNNING}
                      </h4>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {getProcessesByState(STATES.RUNNING).map((process) => (
                          <div
                            key={process.pid}
                            draggable
                            onDragStart={(e) => handleDragStart(e, process)}
                            onDragEnd={handleDragEnd}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs cursor-move transition-all duration-200 ${
                              isProcessBeingDragged(process)
                                ? "bg-white/40 scale-110 shadow-lg"
                                : "bg-white/20 hover:bg-white/30"
                            }`}
                          >
                            P{process.pid}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div
                      className={`w-48 h-32 rounded-2xl border-3 flex flex-col items-center justify-center transition-all duration-300 ${
                        dragOverState === STATES.BLOCKED
                          ? "scale-110 shadow-2xl"
                          : ""
                      }`}
                      style={{
                        backgroundColor:
                          dragOverState === STATES.BLOCKED
                            ? `${STATE_COLORS[STATES.BLOCKED]}20`
                            : STATE_COLORS[STATES.BLOCKED],
                        borderColor:
                          dragOverState === STATES.BLOCKED
                            ? STATE_COLORS[STATES.BLOCKED]
                            : "transparent",
                      }}
                      onDragOver={(e) => handleDragOver(e, STATES.BLOCKED)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, STATES.BLOCKED)}
                    >
                      <h4 className="font-bold text-white mb-2">
                        {STATES.BLOCKED}
                      </h4>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {getProcessesByState(STATES.BLOCKED).map((process) => (
                          <div
                            key={process.pid}
                            draggable
                            onDragStart={(e) => handleDragStart(e, process)}
                            onDragEnd={handleDragEnd}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs cursor-move transition-all duration-200 ${
                              isProcessBeingDragged(process)
                                ? "bg-white/40 scale-110 shadow-lg"
                                : "bg-white/20 hover:bg-white/30"
                            }`}
                          >
                            P{process.pid}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Fila inferior - TERMINATED */}
                    <div className="col-span-3 flex justify-center">
                      <div
                        className={`w-48 h-32 rounded-2xl border-3 flex flex-col items-center justify-center transition-all duration-300 ${
                          dragOverState === STATES.TERMINATED
                            ? "scale-110 shadow-2xl"
                            : ""
                        }`}
                        style={{
                          backgroundColor:
                            dragOverState === STATES.TERMINATED
                              ? `${STATE_COLORS[STATES.TERMINATED]}20`
                              : STATE_COLORS[STATES.TERMINATED],
                          borderColor:
                            dragOverState === STATES.TERMINATED
                              ? STATE_COLORS[STATES.TERMINATED]
                              : "transparent",
                        }}
                        onDragOver={(e) => handleDragOver(e, STATES.TERMINATED)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, STATES.TERMINATED)}
                      >
                        <h4 className="font-bold text-white mb-2">
                          {STATES.TERMINATED}
                        </h4>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {getProcessesByState(STATES.TERMINATED).map(
                            (process) => (
                              <div
                                key={process.pid}
                                draggable
                                onDragStart={(e) => handleDragStart(e, process)}
                                onDragEnd={handleDragEnd}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs cursor-move transition-all duration-200 ${
                                  isProcessBeingDragged(process)
                                    ? "bg-white/40 scale-110 shadow-lg"
                                    : "bg-white/20 hover:bg-white/30"
                                }`}
                              >
                                P{process.pid}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel derecho - Leyenda y logs */}
              <div className="w-full lg:w-80 bg-gray-50 p-3 sm:p-6 overflow-y-auto border-t lg:border-t-0 lg:border-l border-gray-200">
                {/* Leyenda de transiciones */}
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    Transiciones Válidas
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    {Object.entries(VALID_TRANSITIONS).map(
                      ([fromState, toStates]) => (
                        <div
                          key={fromState}
                          className="bg-white rounded-lg p-2 sm:p-3 border border-gray-200"
                        >
                          <div className="font-semibold text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
                            {fromState}
                          </div>
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            {toStates.length > 0 ? (
                              toStates.map((toState) => (
                                <div
                                  key={toState}
                                  className="flex items-center gap-1"
                                >
                                  <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600" />
                                  <span className="text-xs sm:text-sm text-gray-600">
                                    {toState}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <span className="text-xs sm:text-sm text-gray-500 italic">
                                Sin transiciones
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Logs recientes */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <Info className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    Logs Recientes
                  </h3>
                  <div className="space-y-1 sm:space-y-2 max-h-40 sm:max-h-60 overflow-y-auto">
                    {recentLogs.length > 0 ? (
                      recentLogs.map((log) => (
                        <div
                          key={log.id}
                          className="bg-white rounded-lg p-2 sm:p-3 border border-gray-200 text-xs"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-gray-700">
                              PID {log.pid}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {log.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-gray-600">
                            <span className="font-medium">{log.from}</span>
                            <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400 inline mx-1" />
                            <span className="font-medium">{log.to}</span>
                          </div>
                          {log.reason && (
                            <div className="text-gray-500 mt-1 italic text-xs">
                              "{log.reason}"
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-3 sm:py-4">
                        <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-xs sm:text-sm">
                          No hay logs disponibles
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ManualProcessControl;
