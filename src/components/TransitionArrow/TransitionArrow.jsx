import React, { useState, useEffect, useMemo } from "react";

// Posiciones relativas (en %) de los nodos dentro del contenedor del diagrama
const NODE_POSITIONS = {
  New: { x: 50, y: 12 },
  Ready: { x: 18, y: 50 },
  Running: { x: 50, y: 50 },
  Blocked: { x: 82, y: 50 },
  Terminated: { x: 50, y: 88 },
};

// Colores por tipo de transición
const TRANSITION_COLORS = {
  "New->Ready": { stroke: "#22c55e", glow: "rgba(34,197,94,0.35)" },
  "Ready->Running": { stroke: "#3b82f6", glow: "rgba(59,130,246,0.35)" },
  "Running->Ready": { stroke: "#06b6d4", glow: "rgba(6,182,212,0.35)" },
  "Running->Blocked": { stroke: "#f59e0b", glow: "rgba(245,158,11,0.35)" },
  "Blocked->Ready": { stroke: "#10b981", glow: "rgba(16,185,129,0.35)" },
  "Running->Terminated": { stroke: "#ef4444", glow: "rgba(239,68,68,0.35)" },
};

export const TransitionArrow = ({ from, to, durationMs = 1200 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => setIsVisible(false), durationMs);
    return () => clearTimeout(timer);
  }, [from, to, durationMs]);

  const { x1, y1, x2, y2, midX, midY, cx, cy } = useMemo(() => {
    const start = NODE_POSITIONS[from] || { x: 50, y: 50 };
    const end = NODE_POSITIONS[to] || { x: 50, y: 50 };
    const sx = start.x;
    const sy = start.y;
    const ex = end.x;
    const ey = end.y;
    // Control point para curva: punto medio desplazado perpendicularmente
    const dx = ex - sx;
    const dy = ey - sy;
    const length = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / length; // normalizada
    const ny = dx / length;
    const offset = 12; // controla la curvatura
    const mx = (sx + ex) / 2;
    const my = (sy + ey) / 2;
    return {
      x1: sx,
      y1: sy,
      x2: ex,
      y2: ey,
      midX: mx,
      midY: my,
      cx: mx + nx * offset,
      cy: my + ny * offset,
    };
  }, [from, to]);

  const key = `${from}->${to}`;
  const colors = TRANSITION_COLORS[key] || {
    stroke: "#6366f1",
    glow: "rgba(99,102,241,0.35)",
  };

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="10" refY="5" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L10,5 L0,10 z" fill={colors.stroke} />
          </marker>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Halo en origen */}
        <circle cx={x1} cy={y1} r="2.5" fill={colors.stroke} opacity="0.9" />

        {/* Trayectoria curva */}
        <path
          d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
          stroke={colors.stroke}
          strokeWidth="2.5"
          fill="none"
          markerEnd="url(#arrow)"
          filter="url(#glow)"
          style={{
            strokeDasharray: 300,
            strokeDashoffset: 300,
            animation: `dash ${durationMs / 1000}s ease forwards`,
          }}
        />

        {/* Etiqueta de transición */}
        <g>
          <rect x={midX - 10} y={midY - 8} rx="4" ry="4" width="20" height="6" fill={colors.glow} opacity="0.25" />
          <text x={midX - 6} y={midY + 1} fill="#1f2937" fontSize="3" fontWeight="700">
            {from} → {to}
          </text>
        </g>
      </svg>

      <style>{`
        @keyframes dash { to { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  );
};

export default TransitionArrow;
