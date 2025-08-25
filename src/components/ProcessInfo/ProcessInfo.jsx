import React, { useEffect, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Cpu,
  HardDrive,
  X,
  Download,
  Settings,
  Info,
  Clock,
  Zap,
} from "lucide-react";
import { STATES, VALID_TRANSITIONS } from "../../constants/states";
import { STATE_COLORS } from "../../constants/colors";

export const ProcessInfo = ({ process, showDetails, onTransition }) => {
  const [timeInState, setTimeInState] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeInState(process.getTimeInCurrentState());
    }, 100);

    return () => clearInterval(interval);
  }, [process]);

  const canTransitionTo = (state) => {
    return VALID_TRANSITIONS[process.state].includes(state);
  };

  const getTransitionButtons = () => {
    const buttons = [];

    if (canTransitionTo(STATES.READY)) {
      buttons.push(
        <button
          key="ready"
          onClick={() => onTransition(STATES.READY, "Transición manual")}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <Play className="w-3 h-3" />
          Ejecutar
        </button>
      );
    }

    if (canTransitionTo(STATES.RUNNING)) {
      buttons.push(
        <button
          key="running"
          onClick={() => onTransition(STATES.RUNNING, "Asignación de CPU")}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <Cpu className="w-3 h-3" />
          Asignar CPU
        </button>
      );
    }

    if (canTransitionTo(STATES.BLOCKED)) {
      buttons.push(
        <button
          key="blocked"
          onClick={() => onTransition(STATES.BLOCKED, "Solicitud de E/S")}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <HardDrive className="w-3 h-3" />
          Solicitar E/S
        </button>
      );
    }

    if (process.state === STATES.BLOCKED) {
      buttons.push(
        <button
          key="ready-from-blocked"
          onClick={() => onTransition(STATES.READY, "Liberar E/S")}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <Play className="w-3 h-3" />
          Liberar E/S
        </button>
      );
    }

    if (canTransitionTo(STATES.TERMINATED)) {
      buttons.push(
        <button
          key="terminated"
          onClick={() => onTransition(STATES.TERMINATED, "Finalización manual")}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <X className="w-3 h-3" />
          Terminar
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="space-y-4 text-center">
      {/* Información básica */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200/50 shadow-lg">
        <h3 className="text-gray-800 font-bold mb-3 flex items-center justify-center gap-3">
          <div
            className="w-4 h-4 rounded-full border-2 border-gray-300 shadow-sm"
            style={{ backgroundColor: STATE_COLORS[process.state] }}
          ></div>
          <span className="text-lg">Proceso {process.pid}</span>
        </h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg border border-blue-200/30">
            <span className="text-gray-700 font-medium">Estado:</span>
            <span className="font-bold text-gray-800">{process.state}</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg border border-blue-200/30">
            <span className="text-gray-700 font-medium">Tiempo en estado:</span>
            <span className="font-mono font-bold text-blue-600">
              {Math.floor(timeInState / 1000)}s
            </span>
          </div>

          {/* Barra de progreso */}
          <div className="space-y-2">
            <div className="text-gray-700 text-xs font-medium">
              Progreso del tiempo
            </div>
            <div className="w-full bg-white/60 rounded-full h-3 border border-blue-200/30">
              <div
                className="bg-gradient-to-r from-blue-400 to-purple-500 h-3 rounded-full transition-all duration-300 shadow-sm"
                style={{
                  width: `${Math.min(100, (timeInState / 10000) * 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de transición */}
      <div className="space-y-4">
        <h4 className="text-gray-700 font-semibold text-sm text-center">
          🚀 Transiciones Disponibles
        </h4>
        <div className="flex flex-wrap gap-3 justify-center">
          {getTransitionButtons()}
        </div>
      </div>

      {/* Detalles técnicos */}
      {showDetails && (
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 space-y-4 text-center border border-gray-300/50 shadow-lg">
          <h4 className="text-gray-700 font-semibold text-sm flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            ⚙️ Detalles Técnicos
          </h4>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-2">
              <div className="p-2 bg-white/60 rounded-lg border border-gray-200/30">
                <div className="text-gray-600 font-medium">
                  Prioridad:{" "}
                  <span className="text-gray-800 font-bold">
                    {process.priority}
                  </span>
                </div>
                <div className="text-gray-600 font-medium">
                  PC:{" "}
                  <span className="text-gray-800 font-mono">
                    0x{process.pc.toString(16).toUpperCase()}
                  </span>
                </div>
                <div className="text-gray-600 font-medium">
                  PID:{" "}
                  <span className="text-gray-800 font-bold">{process.pid}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="p-2 bg-white/60 rounded-lg border border-gray-200/30">
                <div className="text-gray-600 font-medium">
                  AX:{" "}
                  <span className="text-gray-800 font-mono">
                    0x
                    {process.registers.AX.toString(16)
                      .padStart(2, "0")
                      .toUpperCase()}
                  </span>
                </div>
                <div className="text-gray-600 font-medium">
                  BX:{" "}
                  <span className="text-gray-800 font-mono">
                    0x
                    {process.registers.BX.toString(16)
                      .padStart(2, "0")
                      .toUpperCase()}
                  </span>
                </div>
                <div className="text-gray-600 font-medium">
                  CX:{" "}
                  <span className="text-gray-800 font-mono">
                    0x
                    {process.registers.CX.toString(16)
                      .padStart(2, "0")
                      .toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas de tiempo por estado */}
          <div className="space-y-2">
            <h5 className="text-gray-700 font-medium text-xs">
              ⏱️ Tiempo por Estado
            </h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(process.getStats()).map(([state, stats]) => (
                <div
                  key={state}
                  className="p-2 bg-white/40 rounded-lg border border-gray-200/20"
                >
                  <div className="text-gray-600 font-medium">{state}:</div>
                  <div className="text-gray-800 font-mono">
                    {Math.round(stats.totalTime)}ms
                  </div>
                  <div className="text-gray-500 text-xs">
                    ({stats.count} veces)
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Llamadas al sistema */}
          {process.systemCalls.length > 0 && (
            <div>
              <div className="text-gray-600 text-xs font-medium mb-2">
                🔧 Llamadas al Sistema:
              </div>
              <div className="bg-gray-800/90 rounded-lg p-3 max-h-20 overflow-y-auto border border-gray-700/50">
                {process.systemCalls.slice(-3).map((call, index) => (
                  <div
                    key={index}
                    className="text-green-400 font-mono text-xs p-1 bg-gray-900/50 rounded border border-gray-700/30 mb-1"
                  >
                    {call}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Historial */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 text-center border-2 border-gray-300/50 shadow-xl">
        <h4 className="text-gray-700 font-semibold text-sm mb-4 flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" />
          📋 Historial ({process.stateHistory.length - 1} transiciones)
        </h4>

        <div className="max-h-32 overflow-y-auto space-y-2">
          {process.stateHistory.slice(-5).map((entry, index) => (
            <div
              key={index}
              className="text-xs text-gray-600 flex justify-between items-center p-2 bg-white/60 rounded-lg border border-gray-200/30"
            >
              <span className="font-medium">{entry.state}</span>
              <span className="text-gray-500 font-mono">
                {entry.timestamp.toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProcessInfo;
