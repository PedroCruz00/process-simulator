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
    if (this.currentProcess || this.readyQueue.length === 0) return;

    this.currentProcess = this.readyQueue.shift();
    this.currentProcess.transition(STATES.RUNNING, "Planificador asigna CPU");

    if (this.autoScheduling) {
      setTimeout(() => this.dispatch(), this.quantum);
    }
  }

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
      // Bloqueo solo si puede bloquearse
      if (p.canBeBlocked() && Math.random() < 0.3) {
        p.transition(STATES.BLOCKED, "Llamada a E/S");
        this.blockedQueue.push(p);

        // Simular E/S completada
        setTimeout(() => {
          const idx = this.blockedQueue.indexOf(p);
          if (idx >= 0) this.blockedQueue.splice(idx, 1);
          p.transition(STATES.READY, "E/S completada");
          this.readyQueue.push(p);
        }, Math.random() * 3000 + 1000);
      } else {
        // Quantum expirado
        p.transition(STATES.READY, "Quantum expirado");
        this.readyQueue.push(p);
      }
    }

    this.currentProcess = null;
    if (this.autoScheduling) this.schedule();
  }

  manualTransition(process, newState, reason) {
    const oldState = process.state;

    // Remover de colas anteriores
    if (oldState === STATES.READY) {
      this.readyQueue = this.readyQueue.filter((p) => p.pid !== process.pid);
    } else if (oldState === STATES.BLOCKED) {
      this.blockedQueue = this.blockedQueue.filter(
        (p) => p.pid !== process.pid
      );
    } else if (
      oldState === STATES.RUNNING &&
      this.currentProcess?.pid === process.pid
    ) {
      this.currentProcess = null;
    }

    // Ejecutar la transición
    process.transition(newState, reason);

    // Agregar a nuevas colas
    if (newState === STATES.READY) {
      if (!this.readyQueue.find((p) => p.pid === process.pid)) {
        this.readyQueue.push(process);
      }
    } else if (newState === STATES.BLOCKED) {
      if (!this.blockedQueue.find((p) => p.pid === process.pid)) {
        this.blockedQueue.push(process);
      }
    } else if (newState === STATES.RUNNING) {
      this.currentProcess = process;
    }
  }
}
