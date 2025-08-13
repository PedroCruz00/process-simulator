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
          className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm transition-all duration-200 flex items-center gap-1"
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
          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm transition-all duration-200 flex items-center gap-1"
        >
          <Cpu className="w-3 h-3" />
          Asignar CPU
        </button>
      );
    }

    if (canTransitionTo(STATES.WAITING)) {
      buttons.push(
        <button
          key="waiting"
          onClick={() => onTransition(STATES.WAITING, "Solicitud de E/S")}
          className="bg-orange-500 hover:bg-orange-600 text-white py-1 px-3 rounded text-sm transition-all duration-200 flex items-center gap-1"
        >
          <HardDrive className="w-3 h-3" />
          Solicitar E/S
        </button>
      );
    }

    if (canTransitionTo(STATES.TERMINATED)) {
      buttons.push(
        <button
          key="terminated"
          onClick={() => onTransition(STATES.TERMINATED, "Finalización manual")}
          className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm transition-all duration-200 flex items-center gap-1"
        >
          <X className="w-3 h-3" />
          Terminar
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="space-y-4">
      {/* Información básica */}
      <div className="bg-white/10 rounded-lg p-4">
        <h3 className="text-white font-bold mb-2 flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: STATE_COLORS[process.state] }}
          ></div>
          Proceso {process.pid}
        </h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-white">
            <span>Estado:</span>
            <span className="font-bold">{process.state}</span>
          </div>

          <div className="flex justify-between text-white">
            <span>Tiempo en estado:</span>
            <span className="font-mono">{Math.floor(timeInState / 1000)}s</span>
          </div>

          {/* Barra de progreso */}
          <div className="w-full bg-white/20 rounded-full h-2 mt-2">
            <div
              className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, (timeInState / 10000) * 100)}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Controles de transición */}
      <div className="space-y-2">
        <h4 className="text-white font-medium text-sm">
          Transiciones Disponibles:
        </h4>
        <div className="flex flex-wrap gap-2">{getTransitionButtons()}</div>
      </div>

      {/* Detalles técnicos */}
      {showDetails && (
        <div className="bg-white/5 rounded-lg p-4 space-y-3">
          <h4 className="text-white font-medium text-sm flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Detalles Técnicos
          </h4>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="text-white/80">
              <div>Prioridad: {process.priority}</div>
              <div>PC: 0x{process.pc.toString(16).toUpperCase()}</div>
            </div>
            <div className="text-white/80">
              <div>AX: 0x{process.registers.AX.toString(16)}</div>
              <div>BX: 0x{process.registers.BX.toString(16)}</div>
              <div>CX: 0x{process.registers.CX.toString(16)}</div>
            </div>
          </div>

          {/* Llamadas al sistema */}
          {process.systemCalls.length > 0 && (
            <div>
              <div className="text-white/80 text-xs mb-1">
                Llamadas al Sistema:
              </div>
              <div className="bg-black/40 rounded p-2 max-h-20 overflow-y-auto">
                {process.systemCalls.slice(-3).map((call, index) => (
                  <div key={index} className="text-green-400 font-mono text-xs">
                    {call}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Historial */}
      <div className="bg-white/5 rounded-lg p-4">
        <h4 className="text-white font-medium text-sm mb-2 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Historial ({process.stateHistory.length - 1} transiciones)
        </h4>

        <div className="max-h-32 overflow-y-auto space-y-1">
          {process.stateHistory.slice(-5).map((entry, index) => (
            <div
              key={index}
              className="text-xs text-white/70 flex justify-between"
            >
              <span>{entry.state}</span>
              <span>{entry.timestamp.toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProcessInfo;
