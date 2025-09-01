import React from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Settings,
  Info,
  Download,
  Hand,
} from "lucide-react";

const ControlPanel = ({
  createProcess,
  setIsAutoMode,
  isAutoMode,
  resetSimulation,
  speed,
  setSpeed,
  showDetails,
  setShowDetails,
  soundEnabled,
  setSoundEnabled,
  generalStats,
  processorRef,
  generateReport,
  isBlocked,
  setIsBlocked,
  onOpenManualControl,
}) => {
  return (
    <div className="lg:col-span-3 bg-white/95 backdrop-blur-xl rounded-3xl p-6 border-2 border-blue-200/40 shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

      <div className="relative z-10">
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center justify-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            <Settings className="w-5 h-5 text-white drop-shadow-sm" />
          </div>
          <span className="text-gray-800">Control de Simulación</span>
        </h2>

        {/* Controles básicos */}
        <div className="space-y-4 mb-6">
          <button
            onClick={() => createProcess(isBlocked)}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-4 rounded-xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
              <Plus className="w-3 h-3" />
            </div>
            <span>Crear Proceso</span>
          </button>

          {/* ✅ Checkbox para decidir si el proceso se bloquea o no */}
          <div className="flex items-center gap-3 bg-white/70 p-3 rounded-lg border border-blue-200 shadow-sm">
            <input
              type="checkbox"
              checked={isBlocked}
              onChange={(e) => setIsBlocked(e.target.checked)}
              className="w-4 h-4 text-orange-600 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
            />
            <span className="text-gray-700 text-sm font-medium">
              🚧 Crear como bloqueado
            </span>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setIsAutoMode(!isAutoMode)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 ${
                isAutoMode
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                {isAutoMode ? (
                  <Pause className="w-3 h-3" />
                ) : (
                  <Play className="w-3 h-3" />
                )}
              </div>
              <span>{isAutoMode ? "Pausar" : "Auto"}</span>
            </button>

            <button
              onClick={resetSimulation}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                <RotateCcw className="w-3 h-3" />
              </div>
              <span>Reset</span>
            </button>
          </div>

          {/* Botón de Control Manual */}
          <button
            onClick={onOpenManualControl}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3 px-4 rounded-xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
              <Hand className="w-3 h-3" />
            </div>
            <span>Control Manual</span>
          </button>
        </div>

        {/* Velocidad */}
        <div className="mb-6 text-center">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            ⚡ Velocidad de Simulación
          </label>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full bg-white/80 text-gray-700 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
          >
            <option value={3000}>🐢 Muy Lenta</option>
            <option value={2000}>🐌 Lenta</option>
            <option value={1000}>⚡ Normal</option>
            <option value={500}>🚀 Rápida</option>
          </select>
        </div>

        {/* Toggle detalles */}
        <div className="mb-6 text-center">
          <label className="flex items-center justify-center gap-3 cursor-pointer p-3 bg-white/60 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
            <input
              type="checkbox"
              checked={showDetails}
              onChange={(e) => setShowDetails(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-700 text-sm font-medium">
              🔧 Mostrar Detalles Técnicos
            </span>
          </label>
        </div>

        {/* Toggle sonido */}
        <div className="mb-6 text-center">
          <label className="flex items-center justify-center gap-3 cursor-pointer p-3 bg-white/60 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-4 h-4 text-purple-600 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
            />
            <span className="text-gray-700 text-sm font-medium">
              🔊 Sonidos de Eventos
            </span>
          </label>
        </div>

        {/* Estadísticas generales */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 mb-6 text-center border border-blue-200/50 shadow-lg">
          <h3 className="text-gray-800 font-bold mb-4 flex items-center justify-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <Info className="w-4 h-4 text-white" />
            </div>
            📊 Estadísticas
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg border border-blue-200/30">
              <span className="text-gray-700 font-medium">Total Procesos:</span>
              <span className="font-bold text-blue-600 text-lg">
                {generalStats.total}
              </span>
            </div>
            {Object.entries(generalStats.byState).map(([state, count]) => (
              <div
                key={state}
                className="flex justify-between items-center p-2 bg-white/40 rounded-lg border border-blue-200/20"
              >
                <span className="text-gray-600">{state}:</span>
                <span className="font-semibold text-gray-800">{count}</span>
              </div>
            ))}
          </div>

          {/* Información del procesador */}
          <div className="mt-4 pt-4 border-t border-blue-200/50">
            <h4 className="text-gray-700 font-semibold mb-2 text-xs">
              🖥️ Estado del Procesador
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 bg-white/40 rounded-lg">
                <span className="text-gray-600">Ejecutando:</span>
                <span className="font-semibold text-gray-800">
                  {processorRef.current.currentProcess?.pid || "Ninguno"}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/40 rounded-lg">
                <span className="text-gray-600">Cola Ready:</span>
                <span className="font-semibold text-gray-800">
                  {processorRef.current.readyQueue.length}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/40 rounded-lg">
                <span className="text-gray-600">Cola Blocked:</span>
                <span className="font-semibold text-gray-800">
                  {processorRef.current.blockedQueue.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={generateReport}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-4 rounded-xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-105 shadow-lg hover:shadow-xl"
      >
        <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
          <Download className="w-3 h-3" />
        </div>
        <span>📊 Exportar Reporte CSV</span>
      </button>
    </div>
  );
};

export default ControlPanel;
