import { STATES } from "../constants/states";

export class Processor {
  constructor(quantum = 2000) {
    this.quantum = quantum;
    this.readyQueue = [];
    this.blockedQueue = [];
    this.currentProcess = null;
    this.autoScheduling = false;
  }

  admitProcess(process) {
    process.transition(STATES.READY, "Admitido al sistema");
    this.readyQueue.push(process);
  }

  schedule() {
    if (this.currentProcess) return;
    if (this.readyQueue.length === 0) return;

    // Tomar el primer proceso de la cola
    this.currentProcess = this.readyQueue.shift();
    this.currentProcess.transition(STATES.RUNNING, "Planificador asigna CPU");

    // Usar scheduling automático solo si está habilitado
    if (this.autoScheduling) {
      setTimeout(() => this.dispatch(), this.quantum);
    }
  }

  // Habilitar/deshabilitar scheduling automático
  setAutoScheduling(enabled) {
    this.autoScheduling = enabled;
  }

  dispatch() {
    const p = this.currentProcess;
    if (!p) return;

    p.remainingTime -= this.quantum;

    if (p.remainingTime <= 0) {
      p.transition(STATES.TERMINATED, "Proceso finalizado");
    } else {
      if (Math.random() < 0.3) {
        // E/S → bloqueado
        p.transition(STATES.BLOCKED, "Llamada a E/S");
        this.blockedQueue.push(p);
        // Simular que después de un tiempo vuelve a ready
        setTimeout(() => {
          const idx = this.blockedQueue.indexOf(p);
          if (idx >= 0) this.blockedQueue.splice(idx, 1);
          p.transition(STATES.READY, "E/S completada");
          this.readyQueue.push(p);
        }, Math.random() * 3000 + 1000);
      } else {
        // Quantum expirado → vuelve a ready
        p.transition(STATES.READY, "Quantum expirado");
        this.readyQueue.push(p);
      }
    }

    this.currentProcess = null;
    if (this.autoScheduling) {
      this.schedule();
    }
  }

  // Transiciones manuales controladas
  manualTransition(process, newState, reason) {
    if (newState === STATES.RUNNING) {
      // Si va a RUNNING, debe estar en READY
      const readyIndex = this.readyQueue.findIndex(p => p.pid === process.pid);
      if (readyIndex >= 0) {
        this.readyQueue.splice(readyIndex, 1);
        this.currentProcess = process;
      }
    } else if (newState === STATES.READY) {
      // Si va a READY, puede venir de RUNNING o BLOCKED
      if (this.currentProcess && this.currentProcess.pid === process.pid) {
        this.currentProcess = null;
      }
      const blockedIndex = this.blockedQueue.findIndex(p => p.pid === process.pid);
      if (blockedIndex >= 0) {
        this.blockedQueue.splice(blockedIndex, 1);
      }
      if (!this.readyQueue.find(p => p.pid === process.pid)) {
        this.readyQueue.push(process);
      }
    } else if (newState === STATES.BLOCKED) {
      // Si va a BLOCKED, puede venir de RUNNING
      if (this.currentProcess && this.currentProcess.pid === process.pid) {
        this.currentProcess = null;
      }
      if (!this.blockedQueue.find(p => p.pid === process.pid)) {
        this.blockedQueue.push(process);
      }
    } else if (newState === STATES.TERMINATED) {
      // Si termina, remover de todas las colas
      if (this.currentProcess && this.currentProcess.pid === process.pid) {
        this.currentProcess = null;
      }
      const readyIndex = this.readyQueue.findIndex(p => p.pid === process.pid);
      if (readyIndex >= 0) {
        this.readyQueue.splice(readyIndex, 1);
      }
      const blockedIndex = this.blockedQueue.findIndex(p => p.pid === process.pid);
      if (blockedIndex >= 0) {
        this.blockedQueue.splice(blockedIndex, 1);
      }
    }
  }
}
