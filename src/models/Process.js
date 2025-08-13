import { STATES, VALID_TRANSITIONS } from "../constants/states";

export class Process {
  constructor(pid) {
    this.pid = pid;
    this.state = STATES.NEW;
    this.priority = Math.floor(Math.random() * 10) + 1;
    this.pc = Math.floor(Math.random() * 1000);
    this.registers = {
      AX: Math.floor(Math.random() * 255),
      BX: Math.floor(Math.random() * 255),
      CX: Math.floor(Math.random() * 255),
    };
    this.systemCalls = [];
    this.stateHistory = [
      {
        state: STATES.NEW,
        timestamp: new Date(),
        reason: "Proceso creado",
      },
    ];
    this.stateStartTime = new Date();
  }

  transition(newState, reason = "") {
    const currentState = this.state;

    if (!VALID_TRANSITIONS[currentState].includes(newState)) {
      throw new Error(`Transición inválida: ${currentState} → ${newState}`);
    }

    const now = new Date();
    const timeInCurrentState = now - this.stateStartTime;

    this.state = newState;
    this.stateStartTime = now;
    this.stateHistory.push({
      state: newState,
      timestamp: now,
      reason: reason || `Cambio automático`,
      timeInPreviousState: timeInCurrentState,
    });

    // Simular llamadas al sistema
    if (newState === STATES.RUNNING) {
      this.systemCalls.push(`exec() - ${now.toLocaleTimeString()}`);
    } else if (newState === STATES.WAITING) {
      this.systemCalls.push(`read() - ${now.toLocaleTimeString()}`);
    }
  }

  getTimeInCurrentState() {
    return new Date() - this.stateStartTime;
  }

  getStats() {
    const stateStats = {};
    Object.values(STATES).forEach((state) => {
      stateStats[state] = {
        totalTime: 0,
        count: 0,
      };
    });

    this.stateHistory.forEach((entry, index) => {
      stateStats[entry.state].count++;
      if (entry.timeInPreviousState) {
        const prevState = this.stateHistory[index - 1]?.state;
        if (prevState) {
          stateStats[prevState].totalTime += entry.timeInPreviousState;
        }
      }
    });

    return stateStats;
  }
}
