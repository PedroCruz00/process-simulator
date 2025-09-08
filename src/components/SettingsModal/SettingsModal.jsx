import React, { useState } from "react";
import { 
  X, 
  Settings, 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff, 
  Zap, 
  Palette, 
  BarChart3,
  Info,
  Save,
  RotateCcw
} from "lucide-react";

const SettingsModal = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSettings
}) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [activeTab, setActiveTab] = useState("audio");

  // Actualizar configuraciones locales cuando cambian las del padre
  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSettingChange = (category, key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    onUpdateSettings(localSettings);
    onClose();
  };

  const handleReset = () => {
    onResetSettings();
    setLocalSettings(settings);
  };

  const tabs = [
    { id: "audio", label: "🔊 Audio", icon: Volume2 },
    { id: "display", label: "👁️ Visualización", icon: Eye },
    { id: "simulation", label: "⚡ Simulación", icon: Zap },
    { id: "reports", label: "📊 Reportes", icon: BarChart3 }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold">Configuraciones del Simulador</h2>
                <p className="text-blue-100 text-xs sm:text-sm">
                  Personaliza tu experiencia de simulación
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(95vh-180px)] sm:h-[calc(90vh-180px)]">
          {/* Sidebar de pestañas */}
          <div className="w-full lg:w-64 bg-gray-50 p-4 border-b lg:border-b-0 lg:border-r border-gray-200">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Contenido de configuraciones */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            {activeTab === "audio" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-blue-600" />
                    Configuraciones de Audio
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div>
                        <h4 className="font-semibold text-gray-700">Habilitar Sonidos</h4>
                        <p className="text-sm text-gray-500">Reproducer efectos de sonido durante la simulación</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localSettings.audio?.enabled || false}
                          onChange={(e) => handleSettingChange("audio", "enabled", e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <h4 className="font-semibold text-gray-700 mb-3">Volumen General</h4>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={localSettings.audio?.volume || 50}
                        onChange={(e) => handleSettingChange("audio", "volume", parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Silencio</span>
                        <span>{localSettings.audio?.volume || 50}%</span>
                        <span>Máximo</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-700">Tipos de Sonidos</h4>
                      
                      {[
                        { key: "transitions", label: "Transiciones de Estado", desc: "Sonidos cuando los procesos cambian de estado" },
                        { key: "creation", label: "Creación de Procesos", desc: "Sonido al crear nuevos procesos" },
                        { key: "termination", label: "Terminación de Procesos", desc: "Sonido cuando un proceso termina" },
                        { key: "errors", label: "Errores", desc: "Sonidos de advertencia y error" }
                      ].map((soundType) => (
                        <div key={soundType.key} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <div>
                            <div className="font-medium text-gray-700">{soundType.label}</div>
                            <div className="text-xs text-gray-500">{soundType.desc}</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={localSettings.audio?.types?.[soundType.key] !== false}
                            onChange={(e) => handleSettingChange("audio", `types.${soundType.key}`, e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "display" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-green-600" />
                    Configuraciones de Visualización
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div>
                        <h4 className="font-semibold text-gray-700">Mostrar Detalles Técnicos</h4>
                        <p className="text-sm text-gray-500">Información detallada de procesos y sistema</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localSettings.display?.showTechnicalDetails || false}
                          onChange={(e) => handleSettingChange("display", "showTechnicalDetails", e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div>
                        <h4 className="font-semibold text-gray-700">Animaciones Suaves</h4>
                        <p className="text-sm text-gray-500">Transiciones animadas entre estados</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localSettings.display?.smoothAnimations !== false}
                          onChange={(e) => handleSettingChange("display", "smoothAnimations", e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div>
                        <h4 className="font-semibold text-gray-700">Mostrar Partículas</h4>
                        <p className="text-sm text-gray-500">Efectos visuales en las transiciones</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localSettings.display?.showParticles !== false}
                          onChange={(e) => handleSettingChange("display", "showParticles", e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <h4 className="font-semibold text-gray-700 mb-3">Tema de Colores</h4>
                      <select
                        value={localSettings.display?.theme || "default"}
                        onChange={(e) => handleSettingChange("display", "theme", e.target.value)}
                        className="w-full bg-white text-gray-700 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="default">🎨 Por Defecto</option>
                        <option value="dark">🌙 Oscuro</option>
                        <option value="light">☀️ Claro</option>
                        <option value="colorful">🌈 Colorido</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "simulation" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    Configuraciones de Simulación
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <h4 className="font-semibold text-gray-700 mb-3">Velocidad por Defecto</h4>
                      <select
                        value={localSettings.simulation?.defaultSpeed || 1000}
                        onChange={(e) => handleSettingChange("simulation", "defaultSpeed", parseInt(e.target.value))}
                        className="w-full bg-white text-gray-700 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        <option value={3000}>🐢 Muy Lenta (3s)</option>
                        <option value={2000}>🐌 Lenta (2s)</option>
                        <option value={1000}>⚡ Normal (1s)</option>
                        <option value={500}>🚀 Rápida (0.5s)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div>
                        <h4 className="font-semibold text-gray-700">Auto-inicio de Simulación</h4>
                        <p className="text-sm text-gray-500">Iniciar automáticamente al crear procesos</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localSettings.simulation?.autoStart || false}
                          onChange={(e) => handleSettingChange("simulation", "autoStart", e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                      </label>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <h4 className="font-semibold text-gray-700 mb-3">Máximo de Procesos Concurrentes</h4>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={localSettings.simulation?.maxConcurrentProcesses || 10}
                        onChange={(e) => handleSettingChange("simulation", "maxConcurrentProcesses", parseInt(e.target.value))}
                        className="w-full bg-white text-gray-700 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Número máximo de procesos que pueden existir simultáneamente</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reports" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    Configuraciones de Reportes
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div>
                        <h4 className="font-semibold text-gray-700">Auto-generación de Reportes</h4>
                        <p className="text-sm text-gray-500">Generar reportes automáticamente cada hora</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localSettings.reports?.autoGenerate || false}
                          onChange={(e) => handleSettingChange("reports", "autoGenerate", e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <h4 className="font-semibold text-gray-700 mb-3">Formato de Exportación</h4>
                      <select
                        value={localSettings.reports?.format || "csv"}
                        onChange={(e) => handleSettingChange("reports", "format", e.target.value)}
                        className="w-full bg-white text-gray-700 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="csv">📊 CSV (Comma Separated Values)</option>
                        <option value="json">📄 JSON</option>
                        <option value="excel">📈 Excel (XLSX)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div>
                        <h4 className="font-semibold text-gray-700">Incluir Datos Detallados</h4>
                        <p className="text-sm text-gray-500">Registros completos de transiciones y tiempos</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localSettings.reports?.includeDetailed !== false}
                          onChange={(e) => handleSettingChange("reports", "includeDetailed", e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer con botones */}
        <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-2 sm:gap-4 sm:justify-end">
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Restablecer
          </button>
          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;