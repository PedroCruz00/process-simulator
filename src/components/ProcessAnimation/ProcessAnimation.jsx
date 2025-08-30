import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Posiciones de los nodos (en % del contenedor)
const NODE_POSITIONS = {
  New: { x: 50, y: 15 },
  Ready: { x: 16, y: 50 },
  Running: { x: 50, y: 50 },
  Blocked: { x: 84, y: 50 },
  Terminated: { x: 50, y: 85 },
};

// Colores para cada transición
const TRANSITION_COLORS = {
  "New->Ready": "#10b981",
  "Ready->Running": "#3b82f6",
  "Running->Ready": "#06b6d4",
  "Running->Blocked": "#f59e0b",
  "Blocked->Ready": "#10b981",
  "Running->Terminated": "#ef4444",
};

// Componente para mostrar un proceso animado que se mueve entre estados
export const ProcessAnimation = ({ 
  id, // ID único para la animación
  processId, 
  fromState, 
  toState, 
  durationMs = 1200,
  onAnimationComplete 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Solo mostrar si no está completada
    if (!isCompleted) {
      setIsVisible(true);
      
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsCompleted(true);
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, durationMs);

      return () => clearTimeout(timer);
    }
  }, [id, processId, fromState, toState, durationMs, onAnimationComplete, isCompleted]);

  // No renderizar si está completada o no es visible
  if (isCompleted || !isVisible) return null;

  const startPosition = NODE_POSITIONS[fromState];
  const endPosition = NODE_POSITIONS[toState];
  const transitionKey = `${fromState}->${toState}`;
  const color = TRANSITION_COLORS[transitionKey] || "#6366f1";

  // Calcular puntos de control para una curva suave
  const dx = endPosition.x - startPosition.x;
  const dy = endPosition.y - startPosition.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  let controlPoint1, controlPoint2;

  if (Math.abs(dx) > Math.abs(dy)) {
    // Transición horizontal
    const offset = distance * 0.3;
    controlPoint1 = {
      x: startPosition.x + dx * 0.3,
      y: startPosition.y - offset * Math.sign(dy || 1)
    };
    controlPoint2 = {
      x: endPosition.x - dx * 0.3,
      y: endPosition.y + offset * Math.sign(dy || 1)
    };
  } else {
    // Transición vertical
    const offset = distance * 0.25;
    controlPoint1 = {
      x: startPosition.x + offset * Math.sign(dx || 1),
      y: startPosition.y + dy * 0.3
    };
    controlPoint2 = {
      x: endPosition.x - offset * Math.sign(dx || 1),
      y: endPosition.y - dy * 0.3
    };
  }

  // Crear una trayectoria curva usando SVG path
  const path = `M ${startPosition.x} ${startPosition.y} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${endPosition.x} ${endPosition.y}`;

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {/* SVG para definir la trayectoria */}
      <svg
        className="w-full h-full absolute inset-0"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <path
            id={`path-${id}`}
            d={path}
            fill="none"
            stroke="transparent"
          />
        </defs>
      </svg>

      {/* Nodo del proceso que se mueve */}
      <motion.div
        className="absolute w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-2xl border-2 border-white/30"
        style={{
          backgroundColor: color,
          left: `${startPosition.x}%`,
          top: `${startPosition.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          left: `${endPosition.x}%`,
          top: `${endPosition.y}%`,
        }}
        transition={{
          duration: durationMs / 1000,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        onAnimationComplete={() => {
          // Efecto de llegada
          console.log(`Proceso ${processId} llegó a ${toState}`);
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0.8 }}
          animate={{ 
            scale: [0.8, 1.2, 1], 
            opacity: [0.8, 1, 1] 
          }}
          transition={{
            duration: 0.3,
            ease: "easeOut"
          }}
        >
          P{processId}
        </motion.div>

        {/* Efecto de brillo durante el movimiento */}
        <motion.div
          className="absolute inset-0 rounded-full bg-white/30"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 1.5, 0], 
            opacity: [0, 0.6, 0] 
          }}
          transition={{
            duration: durationMs / 1000,
            ease: "easeInOut",
            repeat: 0
          }}
        />
      </motion.div>

      {/* Partículas que siguen la trayectoria */}
      <AnimatePresence>
        {Array.from({ length: 3 }, (_, i) => (
          <motion.div
            key={`particle-${id}-${i}`}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 8px ${color}`,
              left: `${startPosition.x}%`,
              top: `${startPosition.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ 
              scale: 0, 
              opacity: 0.8,
              left: `${startPosition.x}%`,
              top: `${startPosition.y}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0.8, 1, 0],
              left: `${endPosition.x}%`,
              top: `${endPosition.y}%`,
            }}
            transition={{
              duration: (durationMs / 1000) * 0.8,
              delay: (i * 0.1),
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            exit={{ scale: 0, opacity: 0 }}
          />
        ))}
      </AnimatePresence>

      {/* Etiqueta de transición */}
      <motion.div
        className="absolute transform -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg border-2 border-white/20"
        style={{
          backgroundColor: color,
          left: `${(startPosition.x + endPosition.x) / 2}%`,
          top: `${(startPosition.y + endPosition.y) / 2 - 5}%`,
        }}
        initial={{ 
          scale: 0, 
          opacity: 0,
          y: 10 
        }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          y: 0 
        }}
        exit={{ 
          scale: 0, 
          opacity: 0,
          y: -10 
        }}
        transition={{
          duration: 0.3,
          delay: 0.1,
          ease: "easeOut"
        }}
      >
        {fromState} → {toState}
      </motion.div>
    </div>
  );
};

// Componente para mostrar múltiples animaciones de procesos
export const ProcessAnimations = ({ 
  animations = [], 
  onAnimationComplete 
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      <AnimatePresence>
        {animations.map((animation) => (
          <ProcessAnimation
            key={animation.id} // Usar el ID único de la animación
            id={animation.id}
            processId={animation.processId}
            fromState={animation.fromState}
            toState={animation.toState}
            durationMs={animation.durationMs || 1200}
            onAnimationComplete={() => {
              if (onAnimationComplete) {
                onAnimationComplete(animation);
              }
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ProcessAnimation;
