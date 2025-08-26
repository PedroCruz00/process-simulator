import { STATES } from "../constants/states";

export class Processor {
  constructor(quantum = 2000) {
    this.quantum = quantum;
    this.readyQueue = [];
    this.blockedQueue = [];
    this.currentProcess = null;
  }

  admitProcess(process) {
    process.transition(STATES.READY, "Admitido al sistema");
    this.readyQueue.push(process);
  }

  schedule() {
    if (this.currentProcess) return; // ya hay uno corriendo
    if (this.readyQueue.length === 0) return; // nada que ejecutar

    // Sacar el primero de la cola
    this.currentProcess = this.readyQueue.shift();
    this.currentProcess.transition(STATES.RUNNING, "Planificador asigna CPU");

    // Simular ejecución por quantum
    setTimeout(() => this.dispatch(), this.quantum);
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
        // simular que después de un tiempo vuelve a ready
        setTimeout(() => {
          const idx = this.blockedQueue.indexOf(p);
          if (idx >= 0) this.blockedQueue.splice(idx, 1);
          p.transition(STATES.READY, "E/S completada");
          this.readyQueue.push(p);
        }, Math.random() * 3000 + 1000);
      } else {
        // quantum expirado → vuelve a ready
        p.transition(STATES.READY, "Quantum expirado");
        this.readyQueue.push(p);
      }
    }

    this.currentProcess = null;
    this.schedule(); // planificar el siguiente
  }
}
