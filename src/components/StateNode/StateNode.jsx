import React, { useState } from "react";
import { STATE_COLORS } from "../../constants/colors";
import { STATES } from "../../constants/states";

export const StateNode = ({
  state,
  processes,
  onProcessClick,
  animatingTransition,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const isAnimating =
    animatingTransition &&
    (animatingTransition.fromState === state ||
      animatingTransition.toState === state);

  const handleMouseEnter = (e) => {
    setShowTooltip(true);
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div className="relative group flex justify-center">
      <div
        className={`w-32 h-32 rounded-full border-4 border-white flex flex-col items-center justify-center cursor-pointer transform transition-all duration-300 shadow-xl hover:shadow-2xl relative overflow-hidden group ${
          isAnimating ? "scale-110 animate-pulse" : "hover:scale-105"
        }`}
        style={{
          backgroundColor: STATE_COLORS[state],
          boxShadow: isAnimating ? `0 0 30px ${STATE_COLORS[state]}, 0 8px 25px rgba(0,0,0,0.15)` : "0 8px 25px rgba(0,0,0,0.15)",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent"></div>
        <div className="text-white font-bold text-base text-center drop-shadow-sm relative z-10">{state}</div>
        <div className="text-white text-3xl font-bold drop-shadow-sm relative z-10">{processes.length}</div>
        {state === STATES.WAITING && processes.length > 0 && (
          <div className="absolute inset-0 bg-red-500/30 animate-pulse rounded-full"></div>
        )}
      </div>

      {/* Lista de procesos */}
      {processes.length > 0 && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 min-w-[200px] shadow-xl border-2 border-gray-200/50">
          <div className="text-gray-600 text-sm font-semibold mb-3 text-center">Procesos Activos</div>
          {processes.map((p) => (
            <div
              key={p.pid}
              onClick={() => onProcessClick(p)}
              className="text-gray-600 text-sm py-2 px-3 hover:bg-blue-50 rounded-lg cursor-pointer flex items-center gap-2 transition-all duration-200 border border-transparent hover:border-blue-200"
            >
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span className="font-medium">PID {p.pid}</span>
              {state === STATES.WAITING && (
                <div className="w-1 h-1 bg-red-400 rounded-full animate-ping"></div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tooltip avanzado */}
      {showTooltip && (
        <div
          className="fixed z-50 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-2xl border border-gray-700 text-sm max-w-xs"
          style={{
            left: Math.min(tooltipPosition.x + 10, window.innerWidth - 250),
            top: Math.max(tooltipPosition.y - 10, 20),
            transform: tooltipPosition.y > window.innerHeight / 2 ? 'translateY(-100%)' : 'translateY(0)'
          }}
        >
          <div className="font-bold mb-2 text-blue-300">Estado: {state}</div>
          <div className="mb-1">
            <span className="text-gray-300">Procesos activos:</span>
            <span className="ml-2 font-semibold text-white">{processes.length}</span>
          </div>
          {processes.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-600">
              <div className="text-gray-300 text-xs mb-1">Procesos:</div>
              {processes.slice(0, 3).map((p) => (
                <div key={p.pid} className="text-xs text-blue-200">
                  PID {p.pid} - {p.getTimeInCurrentState()}ms
                </div>
              ))}
              {processes.length > 3 && (
                <div className="text-xs text-gray-400">+{processes.length - 3} más</div>
              )}
            </div>
          )}
          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default StateNode;
