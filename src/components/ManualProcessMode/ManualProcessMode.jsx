import React, { useState, useRef, useEffect } from 'react';
import { X, Hand, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { STATES, VALID_TRANSITIONS } from '../../constants/states';
import { STATE_COLORS } from '../../constants/colors';
import { Process } from '../../models/Process';
import StateNode from '../StateNode';

const ManualProcessMode = ({ 
  isOpen, 
  onClose, 
  processes, 
  onProcessTransition,
  createProcess,
  nextPID 
}) => {
  const [manualProcesses, setManualProcesses] = useState([]);
  const [draggedProcess, setDraggedProcess] = useState(null);
  const [dragOverState, setDragOverState] = useState(null);
  const [invalidTransition, setInvalidTransition] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const containerRef = useRef(null);
  
  const [nextManualPID, setNextManualPID] = useState(1000);

  useEffect(() => {
    if (!isOpen) {
      // Resetear todo el estado al cerrar
      setManualProcesses([]);
      setDraggedProcess(null);
      setDragOverState(null);
      setInvalidTransition(null);
      setShowSuccess(false);
      setNextManualPID(1000);
    }
  }, [isOpen]);

  const createManualProcess = () => {
    const newProcess = new Process(nextManualPID, false);
    newProcess.isManual = true;
    newProcess.name = `M${nextManualPID}`;
    newProcess.id = `manual-${Date.now()}-${nextManualPID}`; // ID único
    
    setManualProcesses(prev => [...prev, newProcess]);
    setNextManualPID(prev => prev + 1);
  };

  // Manejar inicio del arrastre
  const handleDragStart = (e, process) => {
    setDraggedProcess(process);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', process.id);
    
    const ghost = document.createElement('div');
    ghost.className = 'fixed pointer-events-none z-50';
    ghost.innerHTML = `
      <div class="bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg border-2 border-blue-300">
        <div class="font-bold">${process.name}</div>
        <div class="text-xs opacity-80">${process.state}</div>
      </div>
    `;
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    
    requestAnimationFrame(() => {
      if (document.body.contains(ghost)) {
        document.body.removeChild(ghost);
      }
    });
  };

  // Manejar arrastre sobre estado
  const handleDragOver = (e, state) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverState(state);
  };

  // Manejar salida del arrastre
  const handleDragLeave = (e) => {
    setDragOverState(null);
  };

  // Manejar soltar proceso
  const handleDrop = (e, targetState) => {
    e.preventDefault();
    
    if (!draggedProcess) return;

    const originalState = draggedProcess.state;

    const isValidTransition = VALID_TRANSITIONS[originalState]?.includes(targetState);
    
    if (!isValidTransition) {
      // Mostrar error de transición inválida
      setInvalidTransition({
        from: originalState,
        to: targetState,
        process: draggedProcess
      });
      
      setTimeout(() => setInvalidTransition(null), 3000);
      setDraggedProcess(null);
      setDragOverState(null);
      return;
    }

    setManualProcesses(prev => 
      prev.map(p => {
        if (p.id === draggedProcess.id) {
          const updatedProcess = new Process(p.pid, p.canBeBlockedFlag);
          updatedProcess.isManual = true;
          updatedProcess.name = p.name;
          updatedProcess.id = p.id;
          updatedProcess.state = targetState;
          updatedProcess.stateHistory = [...p.stateHistory, {
            state: targetState,
            timestamp: new Date(),
            reason: 'Transición manual',
            timeInPreviousState: new Date() - p.stateStartTime
          }];
          updatedProcess.stateStartTime = new Date();
          updatedProcess.priority = p.priority;
          updatedProcess.pc = p.pc;
          updatedProcess.registers = { ...p.registers };
          updatedProcess.systemCalls = [...p.systemCalls];
          updatedProcess.remainingTime = p.remainingTime;
          
          return updatedProcess;
        }
        return p;
      })
    );

    setShowSuccess({
      process: draggedProcess,
      from: originalState,
      to: targetState
    });
    
    setTimeout(() => setShowSuccess(null), 2000);

    if (onProcessTransition) {
      onProcessTransition(draggedProcess.pid, targetState, 'Transición manual');
    }

    setDraggedProcess(null);
    setDragOverState(null);
  };

  // Limpiar procesos manuales
  const clearManualProcesses = () => {
    setManualProcesses([]);
    setNextManualPID(1000);
  };

  // Obtener procesos por estado
  const getProcessesByState = (state) => {
    return manualProcesses.filter(p => p.state === state);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div 
          ref={containerRef}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden border-2 border-blue-200"
        >
                  {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Hand className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Modo Manual de Procesos</h2>
                <p className="text-blue-100 text-xs">Arrastra y suelta procesos entre estados</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4 overflow-y-auto max-h-[calc(85vh-80px)]">
          {/* Controles */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={createManualProcess}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
            >
              <span>+</span>
              Crear Proceso
            </button>
            <button
              onClick={clearManualProcesses}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              Limpiar Todos
            </button>
            <div className="flex-1"></div>
            <div className="text-xs text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
              Procesos: {manualProcesses.length}
            </div>
          </div>

          {/* Layout de dos columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Columna izquierda - Transiciones válidas */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-3 border border-gray-200 h-fit">
                <h4 className="font-bold text-gray-800 mb-2 text-sm">📋 Transiciones Válidas</h4>
                <div className="space-y-2 text-xs">
                  {Object.entries(VALID_TRANSITIONS).map(([fromState, toStates]) => (
                    <div key={fromState} className="bg-gray-50 p-2 rounded-lg border">
                      <div className="font-semibold text-gray-700 mb-1 text-xs">{fromState}</div>
                      <div className="text-gray-600">
                        {toStates.length > 0 ? (
                          toStates.map(toState => (
                            <div key={toState} className="flex items-center gap-1">
                              <ArrowRight className="w-2 h-2 text-green-500" />
                              <span className="text-xs">{toState}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">Sin transiciones</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Columna derecha - Diagrama de estados */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-3 border-2 border-blue-200/30">
                <h3 className="text-sm font-bold text-gray-800 mb-3 text-center">
                  Diagrama de Estados
                </h3>

                {/* Grid de estados */}
                <div className="grid grid-cols-3 gap-3 h-[200px] items-center">
                  {/* Fila superior - NEW */}
                  <div className="col-span-3 flex justify-center">
                    <div
                      className={`relative transition-all duration-300 ${
                        dragOverState === STATES.NEW ? 'scale-105' : ''
                      }`}
                      onDragOver={(e) => handleDragOver(e, STATES.NEW)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, STATES.NEW)}
                    >
                      <StateNode
                        state={STATES.NEW}
                        processes={getProcessesByState(STATES.NEW)}
                        onProcessClick={() => {}}
                        isManualMode={true}
                        onDragStart={handleDragStart}
                      />
                      {dragOverState === STATES.NEW && (
                        <div className="absolute inset-0 bg-green-200/50 rounded-2xl border-2 border-green-500 animate-pulse"></div>
                      )}
                    </div>
                  </div>

                  {/* Fila media - READY, RUNNING, BLOCKED */}
                  <div className="flex justify-center">
                    <div
                      className={`relative transition-all duration-300 ${
                        dragOverState === STATES.READY ? 'scale-105' : ''
                      }`}
                      onDragOver={(e) => handleDragOver(e, STATES.READY)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, STATES.READY)}
                    >
                      <StateNode
                        state={STATES.READY}
                        processes={getProcessesByState(STATES.READY)}
                        onProcessClick={() => {}}
                        isManualMode={true}
                        onDragStart={handleDragStart}
                      />
                      {dragOverState === STATES.READY && (
                        <div className="absolute inset-0 bg-green-200/50 rounded-2xl border-2 border-green-500 animate-pulse"></div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div
                      className={`relative transition-all duration-300 ${
                        dragOverState === STATES.RUNNING ? 'scale-105' : ''
                      }`}
                      onDragOver={(e) => handleDragOver(e, STATES.RUNNING)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, STATES.RUNNING)}
                    >
                      <StateNode
                        state={STATES.RUNNING}
                        processes={getProcessesByState(STATES.RUNNING)}
                        onProcessClick={() => {}}
                        isManualMode={true}
                        onDragStart={handleDragStart}
                      />
                      {dragOverState === STATES.RUNNING && (
                        <div className="absolute inset-0 bg-green-200/50 rounded-2xl border-2 border-green-500 animate-pulse"></div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div
                      className={`relative transition-all duration-300 ${
                        dragOverState === STATES.BLOCKED ? 'scale-105' : ''
                      }`}
                      onDragOver={(e) => handleDragOver(e, STATES.BLOCKED)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, STATES.BLOCKED)}
                    >
                      <StateNode
                        state={STATES.BLOCKED}
                        processes={getProcessesByState(STATES.BLOCKED)}
                        onProcessClick={() => {}}
                        isManualMode={true}
                        onDragStart={handleDragStart}
                      />
                      {dragOverState === STATES.BLOCKED && (
                        <div className="absolute inset-0 bg-green-200/50 rounded-2xl border-2 border-green-500 animate-pulse"></div>
                      )}
                    </div>
                  </div>

                  {/* Fila inferior - TERMINATED */}
                  <div className="col-span-3 flex justify-center">
                    <div
                      className={`relative transition-all duration-300 ${
                        dragOverState === STATES.TERMINATED ? 'scale-105' : ''
                      }`}
                      onDragOver={(e) => handleDragOver(e, STATES.TERMINATED)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, STATES.TERMINATED)}
                    >
                      <StateNode
                        state={STATES.TERMINATED}
                        processes={getProcessesByState(STATES.TERMINATED)}
                        onProcessClick={() => {}}
                        isManualMode={true}
                        onDragStart={handleDragStart}
                      />
                      {dragOverState === STATES.TERMINATED && (
                        <div className="absolute inset-0 bg-green-200/50 rounded-2xl border-2 border-green-500 animate-pulse"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        {invalidTransition && (
          <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-bounce">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <div className="font-bold">Transición Inválida</div>
              <div className="text-sm">
                {invalidTransition.process.name}: {invalidTransition.from} → {invalidTransition.to}
              </div>
            </div>
          </div>
        )}

        {showSuccess && (
          <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-bounce">
            <CheckCircle className="w-5 h-5" />
            <div>
              <div className="font-bold">Transición Exitosa</div>
              <div className="text-sm">
                {showSuccess.process.name}: {showSuccess.from} → {showSuccess.to}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManualProcessMode;
