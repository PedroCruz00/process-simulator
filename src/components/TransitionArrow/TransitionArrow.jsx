import React, { useState, useEffect } from "react";

export const TransitionArrow = ({ from, to }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    setIsVisible(true);
    
    // Crear partículas animadas
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      delay: i * 0.1,
      position: Math.random() * 100
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [from, to]);

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Flecha principal */}
      <div
        className="w-20 h-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 animate-pulse rounded-full shadow-2xl mx-auto relative overflow-hidden"
        style={{ 
          boxShadow: "0 0 30px #fbbf24, 0 12px 35px rgba(251, 191, 36, 0.5)",
          animation: "pulse 0.6s infinite"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-white/30 animate-pulse"></div>
        
        {/* Partículas animadas */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-white rounded-full animate-ping"
            style={{
              left: `${particle.position}%`,
              top: '50%',
              transform: 'translateY(-50%)',
              animationDelay: `${particle.delay}s`,
              animationDuration: '0.8s'
            }}
          />
        ))}

        {/* Flecha derecha */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1">
          <div className="w-0 h-0 border-l-10 border-l-red-400 border-t-5 border-b-5 border-t-transparent border-b-transparent drop-shadow-lg"></div>
        </div>
        
        {/* Flecha izquierda */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1">
          <div className="w-0 h-0 border-r-10 border-r-yellow-400 border-t-5 border-b-5 border-t-transparent border-b-transparent drop-shadow-lg"></div>
        </div>
      </div>

      {/* Efecto de destello */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 animate-pulse rounded-full"></div>
    </div>
  );
};

export default TransitionArrow;
