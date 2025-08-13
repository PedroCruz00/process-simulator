import React from "react";
import { STATE_COLORS } from "../../constants/colors";

export const StateNode = ({
  state,
  processes,
  onProcessClick,
  animatingTransition,
}) => {
  const isAnimating =
    animatingTransition &&
    (animatingTransition.fromState === state ||
      animatingTransition.toState === state);

  return (
    <div className="relative group">
      <div
        className={`w-24 h-24 rounded-full border-4 border-white flex flex-col items-center justify-center cursor-pointer transform transition-all duration-300 ${
          isAnimating ? "scale-110 animate-pulse" : "hover:scale-105"
        }`}
        style={{
          backgroundColor: STATE_COLORS[state],
          boxShadow: isAnimating ? `0 0 20px ${STATE_COLORS[state]}` : "none",
        }}
      >
        <div className="text-white font-bold text-xs text-center">{state}</div>
        <div className="text-white text-lg font-bold">{processes.length}</div>
      </div>

      {/* Lista de procesos */}
      {processes.length > 0 && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-black/80 rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 min-w-max">
          {processes.map((p) => (
            <div
              key={p.pid}
              onClick={() => onProcessClick(p)}
              className="text-white text-xs py-1 px-2 hover:bg-white/20 rounded cursor-pointer flex items-center gap-2"
            >
              <div className="w-2 h-2 bg-white rounded-full"></div>
              PID {p.pid}
              {state === STATES.WAITING && (
                <div className="w-1 h-1 bg-red-400 rounded-full animate-ping"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StateNode;
