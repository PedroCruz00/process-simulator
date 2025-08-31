import React, { useState } from "react";
import { STATE_COLORS } from "../../constants/colors";
import { STATES } from "../../constants/states";

export const StateNode = ({
  state,
  processes,
  onProcessClick,
  animatingTransition,
  isManualMode = false,
  onDragStart,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const isAnimatingFrom = animatingTransition && animatingTransition.fromState === state;
  const isAnimatingTo = animatingTransition && animatingTransition.toState === state;
  const isAnimating = isAnimatingFrom || isAnimatingTo;

  const handleMouseEnter = (e) => {
    setShowTooltip(true);
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  // Efectos visuales según el tipo de animación
  const getAnimationStyle = () => {
    if (isAnimatingFrom) {
      return {
        transform: 'scale(1.1)',
        boxShadow: `0 0 30px ${STATE_COLORS[state]}, 0 0 60px ${STATE_COLORS[state]}, 0 8px 25px rgba(0,0,0,0.3)`,
        animation: 'pulseOut 1.2s ease-out'
      };
    } else if (isAnimatingTo) {
      return {
        transform: 'scale(1.05)',
        boxShadow: `0 0 20px ${STATE_COLORS[state]}, 0 8px 25px rgba(0,0,0,0.2)`,
        animation: 'pulseIn 1.2s ease-out'
      };
    }
    return {};
  };

  return (
    <>
      <div className="relative group flex justify-center">
        <div
          className={`w-40 h-40 rounded-full border-4 border-white flex flex-col items-center justify-center cursor-pointer transition-all duration-300 shadow-xl hover:shadow-2xl relative overflow-hidden group ${!isAnimating ? "hover:scale-105" : ""
            }`}
          style={{
            backgroundColor: STATE_COLORS[state],
            ...getAnimationStyle()
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Gradiente de fondo */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent"></div>

          {/* Anillo de actividad para estados activos */}
          {isAnimating && (
            <div
              className="absolute inset-0 rounded-full border-4 animate-spin"
              style={{
                borderColor: `transparent transparent ${STATE_COLORS[state]} transparent`,
                borderWidth: '6px',
                animation: 'spin 1s linear infinite'
              }}
            />
          )}

          {/* Contenido del nodo */}
          <div className="text-white font-bold text-lg text-center drop-shadow-lg relative z-10 mb-2">
            {state}
          </div>
          <div className="text-white text-4xl font-bold drop-shadow-lg relative z-10">
            {processes.length}
          </div>

          {/* Indicador especial para procesos bloqueados */}
          {state === STATES.BLOCKED && processes.length > 0 && (
            <div className="absolute inset-0 bg-red-500/30 animate-pulse rounded-full"></div>
          )}

          {/* Indicador de proceso ejecutándose */}
          {state === STATES.RUNNING && processes.length > 0 && (
            <div className="absolute top-2 right-2 w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg border-2 border-white"></div>
          )}

          {/* Contador animado cuando hay cambios */}
          {isAnimating && (
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black text-sm font-bold border-3 border-white shadow-lg animate-bounce">
              {processes.length}
            </div>
          )}
        </div>

        {/* Lista de procesos */}
        {processes.length > 0 && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 min-w-[240px] shadow-xl border-2 border-gray-200/50">
            <div className="text-gray-600 text-sm font-semibold mb-3 text-center flex items-center justify-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: STATE_COLORS[state] }}
              ></div>
              <span>Procesos en {state}</span>
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {processes.map((p) => (
                <div
                  key={p.pid || p.id}
                  onClick={() => onProcessClick(p)}
                  draggable={isManualMode}
                  onDragStart={(e) => isManualMode && onDragStart && onDragStart(e, p)}
                  className={`text-gray-600 text-sm py-2 px-3 hover:bg-blue-50 rounded-lg cursor-pointer flex items-center justify-between gap-2 transition-all duration-200 border border-transparent hover:border-blue-200 hover:shadow-sm ${
                    isManualMode ? 'cursor-grab active:cursor-grabbing' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">
                      {isManualMode ? p.name : `PID ${p.pid}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {state === STATES.BLOCKED && (
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-ping"></div>
                    )}
                    {state === STATES.RUNNING && (
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    )}
                                         {isManualMode ? (
                       <div className="w-4 h-4 text-gray-400">
                         <svg fill="currentColor" viewBox="0 0 20 20">
                           <path d="M7 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 2zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 8zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 14z"/>
                         </svg>
                       </div>
                     ) : (
                       <span className="text-xs text-gray-400 font-mono">
                         {p.getTimeInCurrentState ? Math.floor(p.getTimeInCurrentState() / 1000) : 0}s
                       </span>
                     )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tooltip */}
        {showTooltip && (
          <div
            className="fixed z-50 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-2xl border border-gray-700 text-sm max-w-xs"
            style={{
              left: Math.min(tooltipPosition.x + 10, window.innerWidth - 250),
              top: Math.max(tooltipPosition.y - 10, 20),
              transform:
                tooltipPosition.y > window.innerHeight / 2
                  ? "translateY(-100%)"
                  : "translateY(0)",
            }}
          >
            <div className="font-bold mb-2 text-blue-300">Estado: {state}</div>
            <div className="mb-1">
              <span className="text-gray-300">Procesos activos:</span>
              <span className="ml-2 font-semibold text-white">
                {processes.length}
              </span>
            </div>
            {processes.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-600">
                <div className="text-gray-300 text-xs mb-1">Procesos:</div>
                                 {processes.slice(0, 3).map((p) => (
                   <div key={p.pid || p.id} className="text-xs text-blue-200 flex justify-between">
                     <span>{isManualMode ? p.name : `PID ${p.pid}`}</span>
                     <span>{p.getTimeInCurrentState ? Math.floor(p.getTimeInCurrentState() / 1000) : 0}s</span>
                   </div>
                 ))}
                {processes.length > 3 && (
                  <div className="text-xs text-gray-400">
                    +{processes.length - 3} más
                  </div>
                )}
              </div>
            )}
            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </div>

      {/* Estilos CSS para las animaciones */}
      <style>{`
        @keyframes pulseOut {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1.1); }
        }
        
        @keyframes pulseIn {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1.05); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default StateNode;