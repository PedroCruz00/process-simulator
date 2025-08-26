import React, { useState, useEffect, useMemo } from "react";

// Posiciones más precisas de los nodos (en % del contenedor)
const NODE_POSITIONS = {
  New: { x: 50, y: 15 },
  Ready: { x: 16, y: 50 },
  Running: { x: 50, y: 50 },
  Blocked: { x: 84, y: 50 },
  Terminated: { x: 50, y: 85 },
};

// Colores vibrantes para cada transición
const TRANSITION_COLORS = {
  "New->Ready": {
    stroke: "#10b981",
    glow: "#10b981",
    shadow: "rgba(16, 185, 129, 0.6)",
    particle: "#34d399"
  },
  "Ready->Running": {
    stroke: "#3b82f6",
    glow: "#3b82f6",
    shadow: "rgba(59, 130, 246, 0.6)",
    particle: "#60a5fa"
  },
  "Running->Ready": {
    stroke: "#06b6d4",
    glow: "#06b6d4",
    shadow: "rgba(6, 182, 212, 0.6)",
    particle: "#22d3ee"
  },
  "Running->Blocked": {
    stroke: "#f59e0b",
    glow: "#f59e0b",
    shadow: "rgba(245, 158, 11, 0.6)",
    particle: "#fbbf24"
  },
  "Blocked->Ready": {
    stroke: "#10b981",
    glow: "#10b981",
    shadow: "rgba(16, 185, 129, 0.6)",
    particle: "#34d399"
  },
  "Running->Terminated": {
    stroke: "#ef4444",
    glow: "#ef4444",
    shadow: "rgba(239, 68, 68, 0.6)",
    particle: "#f87171"
  },
};

// Componente para mostrar todas las transiciones válidas de forma estática
export const StaticTransitionArrows = () => {
  const validTransitions = [
    { from: "New", to: "Ready" },
    { from: "Ready", to: "Running" },
    { from: "Running", to: "Ready" },
    { from: "Running", to: "Blocked" },
    { from: "Blocked", to: "Ready" },
    { from: "Running", to: "Terminated" },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Marcador de flecha estática */}
          <marker
            id="staticArrow"
            markerWidth="5"
            markerHeight="5"
            refX="4.5"
            refY="2.5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M0,0 L0,5 L5,2.5 z"
              fill="#6b7280"
              stroke="none"
            />
          </marker>
        </defs>

        {validTransitions.map(({ from, to }) => {
          const start = NODE_POSITIONS[from];
          const end = NODE_POSITIONS[to];
          const key = `${from}->${to}`;
          const colors = TRANSITION_COLORS[key] || {
            stroke: "#6b7280",
            glow: "#6b7280",
            shadow: "rgba(107, 114, 128, 0.6)",
            particle: "#9ca3af"
          };

          // Calcular puntos de control para una curva suave
          const dx = end.x - start.x;
          const dy = end.y - start.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          let cp1x, cp1y, cp2x, cp2y;

          if (Math.abs(dx) > Math.abs(dy)) {
            // Transición horizontal
            const offset = distance * 0.3;
            cp1x = start.x + dx * 0.3;
            cp1y = start.y - offset * Math.sign(dy || 1);
            cp2x = end.x - dx * 0.3;
            cp2y = end.y + offset * Math.sign(dy || 1);
          } else {
            // Transición vertical
            const offset = distance * 0.25;
            cp1x = start.x + offset * Math.sign(dx || 1);
            cp1y = start.y + dy * 0.3;
            cp2x = end.x - offset * Math.sign(dx || 1);
            cp2y = end.y - dy * 0.3;
          }

          const path = `M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`;

          return (
            <path
              key={key}
              d={path}
              stroke={colors.stroke}
              strokeWidth="1"
              fill="none"
              markerEnd="url(#staticArrow)"
              opacity="0.6"
              strokeDasharray="3,3"
            />
          );
        })}
      </svg>
    </div>
  );
};

export const TransitionArrow = ({ from, to, durationMs = 1200 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    setIsVisible(true);

    // Crear partículas animadas
    const newParticles = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      delay: i * (durationMs / 6),
      opacity: 1 - (i * 0.15)
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setParticles([]);
    }, durationMs);

    return () => clearTimeout(timer);
  }, [from, to, durationMs]);

  const pathData = useMemo(() => {
    const start = NODE_POSITIONS[from] || { x: 50, y: 50 };
    const end = NODE_POSITIONS[to] || { x: 50, y: 50 };

    // Calcular puntos de control para una curva suave
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Control points para diferentes tipos de transiciones
    let cp1x, cp1y, cp2x, cp2y;

    if (Math.abs(dx) > Math.abs(dy)) {
      // Transición horizontal
      const offset = distance * 0.3;
      cp1x = start.x + dx * 0.3;
      cp1y = start.y - offset * Math.sign(dy || 1);
      cp2x = end.x - dx * 0.3;
      cp2y = end.y + offset * Math.sign(dy || 1);
    } else {
      // Transición vertical
      const offset = distance * 0.25;
      cp1x = start.x + offset * Math.sign(dx || 1);
      cp1y = start.y + dy * 0.3;
      cp2x = end.x - offset * Math.sign(dx || 1);
      cp2y = end.y - dy * 0.3;
    }

    return {
      start,
      end,
      cp1: { x: cp1x, y: cp1y },
      cp2: { x: cp2x, y: cp2y },
      path: `M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`,
      distance
    };
  }, [from, to]);

  const key = `${from}->${to}`;
  const colors = TRANSITION_COLORS[key] || {
    stroke: "#6366f1",
    glow: "#6366f1",
    shadow: "rgba(99, 102, 241, 0.6)",
    particle: "#818cf8"
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Contenedor principal de la flecha */}
      <div className="absolute inset-0 pointer-events-none z-30">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.3))' }}
        >
          <defs>
            {/* Marcador de flecha más pequeño y elegante */}
            <marker
              id={`arrow-${key}`}
              markerWidth="6"
              markerHeight="6"
              refX="5.5"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path
                d="M0,0 L0,6 L6,3 z"
                fill={colors.stroke}
                stroke="none"
              />
            </marker>

            {/* Filtro de brillo más sutil */}
            <filter id={`glow-${key}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Gradiente para la línea */}
            <linearGradient id={`gradient-${key}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors.stroke} stopOpacity="0.8" />
              <stop offset="50%" stopColor={colors.glow} stopOpacity="1" />
              <stop offset="100%" stopColor={colors.stroke} stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Línea de fondo con sombra más sutil */}
          <path
            d={pathData.path}
            stroke={colors.shadow}
            strokeWidth="2"
            fill="none"
            opacity="0.3"
            transform="translate(0.5, 0.5)"
          />

          {/* Línea principal animada más fina */}
          <path
            d={pathData.path}
            stroke={`url(#gradient-${key})`}
            strokeWidth="1.5"
            fill="none"
            markerEnd={`url(#arrow-${key})`}
            filter={`url(#glow-${key})`}
            style={{
              strokeDasharray: pathData.distance * 2,
              strokeDashoffset: pathData.distance * 2,
              animation: `drawPath-${key} ${durationMs}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`
            }}
          />
        </svg>
      </div>

      {/* Partículas flotantes */}
      <div className="absolute inset-0 pointer-events-none z-32">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: colors.particle,
              boxShadow: `0 0 8px ${colors.glow}`,
              left: `${pathData.start.x}%`,
              top: `${pathData.start.y}%`,
              opacity: particle.opacity,
              animation: `moveParticle-${key} ${durationMs}ms ${particle.delay}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`
            }}
          />
        ))}
      </div>

      {/* Etiqueta de transición flotante */}
      <div className="absolute inset-0 pointer-events-none z-33 flex items-center justify-center">
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg border-2 border-white/20"
          style={{
            left: `${(pathData.start.x + pathData.end.x) / 2}%`,
            top: `${(pathData.start.y + pathData.end.y) / 2 - 5}%`,
            backgroundColor: colors.stroke,
            boxShadow: `0 0 15px ${colors.shadow}`,
            animation: `fadeInScale ${durationMs * 0.3}ms ease-out forwards, fadeOutScale ${durationMs * 0.2}ms ease-in ${durationMs * 0.8}ms forwards`
          }}
        >
          {from} → {to}
        </div>
      </div>

      {/* Estilos CSS dinámicos */}
      <style>{`
        @keyframes drawPath-${key} {
          to { stroke-dashoffset: 0; }
        }
        
        @keyframes moveParticle-${key} {
          0% {
            left: ${pathData.start.x}%;
            top: ${pathData.start.y}%;
            transform: scale(0);
          }
          10% {
            transform: scale(1);
          }
          90% {
            transform: scale(1);
          }
          100% {
            left: ${pathData.end.x}%;
            top: ${pathData.end.y}%;
            transform: scale(0);
          }
        }
        
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        
        @keyframes fadeOutScale {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
          }
        }
      `}</style>
    </>
  );
};

export default TransitionArrow;