const KEY_EVENTS = {
  i: 'interruptRunning',
  e: 'setErrorOnRunning',
  p: 'pauseSimulation',
  c: 'startSimulation',
  n: 'addNewProcess',
  t: 'showProcessTable',
  m: 'showMemoryTable',
  s: 'suspendInterruptedProcess',
  r: 'retrieveSuspendedProcess',
};

const bus = new Vue();

const app = new Vue({
  el: '#app',
  data: {
    showProcessModal: false,
    showMemoryModal: false,
    nextId: 1,
    initialNum: 1,
    numberError: '',
    quantumError: '',
    newP: [],       // Unlimited
    readyP: [],     // Limit to 6 the sum of this lengths
    runningP: [],   // Limit to 6 the sum of this lengths
    bloquedP: [],   // Limit to 6 the sum of this lengths
    finishedP: [],  // Unlimited
    restoredP: [],  // Unlimited
    totalSuspended: 0,
    time: 0,
    isRunning: false,
    timerInterval: null,
    quantum: 1,
    memory: [],
  },
  methods: {
    addNewProcess: function() {
      const newProcess = getNewProcess();
      newProcess.id = this.nextId;
      this.nextId += 1;
      this.newP.push(newProcess);
    },
    updateReadyProcesses: function() {
      this.readyP = this.readyP.map(this.updateReadyProcess);
      while (this.canAddToReady()) {
        const nextProcess = this.getNextReadyP();
        (nextProcess.arrivalT !== -1) || (nextProcess.arrivalT = this.time);
        this.readyP.push(nextProcess);
        this.addProcessToMemory(nextProcess);
      }
    },
    updateReadyProcess: function(p) {
      return { ...p, waitingT: p.waitingT + TICK_VALUE };
    },
    canAddToReady: function() {
      if (this.restoredP.length) {
        return this.procFitsInMemory(this.restoredP[0]);
      }
      return this.newP.length && this.procFitsInMemory(this.newP[0]);
    },
    getNextReadyP: function() {
      if (this.restoredP.length) {
        return { ...this.restoredP.shift(), bloquedT: 0 };
      }
      return this.newP.shift();
    },
    getProcessesInMemoryCount: function() {
      return this.runningP.length + this.readyP.length + this.bloquedP.length;
    },
    updateRunningProcesses: function() {
      this.runningP = this.runningP.map(this.updateRunningProcess).filter(p => !!p);
      while (this.canAddToRunning()) {
        const p = this.readyP.shift();
        (p.entryT !== -1) || (p.entryT = this.time);
        this.runningP.push(p);
      }
    },
    updateRunningProcess: function(p) {
      if (this.shouldProcessBeFinished(p)) {
        this.finishedP.push({ ...p, finishT: this.time - 0.1 });
        this.freeMemory(p);
        return null;
      }
      if (this.hasFinishedQuantumT(p)) {
        this.readyP.push({ ...p, quantumT: 0 });
        return null;
      }
      return { 
        ...p, 
        elapsedT: p.elapsedT + TICK_VALUE, 
        quantumT: p.quantumT + TICK_VALUE,
      };
    },
    canAddToRunning: function() {
      return this.readyP.length && this.runningP.length < MAX_P_RUNNING;
    },
    shouldProcessBeFinished: function(p) {
      return p.hasError || isEqOrGr(p.elapsedT, p.maxTime);
    },
    hasFinishedQuantumT: function(p) {
      return isEqOrGr(p.quantumT, this.quantum);
    },
    updateBloquedProcesses: function() {
      this.bloquedP = this.bloquedP.map(this.updateBloquedProcess).filter(p => !!p);
    },
    updateBloquedProcess: function(p) {
      if (this.shouldProcessBeReady(p)) {
        this.readyP.push({ ...p, bloquedT: 0 });
        return null;
      }
      return { ...p, bloquedT: p.bloquedT + TICK_VALUE };
    },
    shouldProcessBeReady: function(p) {
      return isEqOrGr(p.bloquedT, BLOQUED_TIME);
    },
    startSimulation: function() {
      this.isRunning = true;
      this.showProcessModal = false;
      this.showMemoryModal = false;
      if (!this.timerInterval) {
        this.timerInterval = setInterval(() => {
          this.updateReadyProcesses();
          this.updateRunningProcesses();
          this.updateBloquedProcesses();
          this.tickTime();
          if (!this.getProcessesInMemoryCount()) this.pauseSimulation();
        }, TICK_INTERVAL);
      }
    },
    pauseSimulation: function() {
      this.isRunning = false;
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    },
    toggleSimulation: function() {
      if (this.quantum < 1) {
        this.quantumError = 'Invalid quantum';
        return;
      }
      if (this.isRunning) {
        this.pauseSimulation();
        return;
      }
      this.quantumError = '';
      this.startSimulation();
    },
    addInitialProcesses: function() {
      if (this.initialNum < 1) {
        this.numberError = 'Invalid number';
        return;
      }
      this.numberError = '';
      for (let i = 0; i < this.initialNum; i++) this.addNewProcess();
    },
    restartSimulation: function() {
      this.pauseSimulation();
      this.nextId = 1;
      this.newP = [];
      this.readyP = [];
      this.runningP = [];
      this.bloquedP = [];
      this.finishedP = [];
      this.time = 0;
      this.initialNum = 1;
      this.quantum = 1;
      this.numberError = '';
      this.quantumError = '';
      this.setupMemory();
      localStorage.clear();
    },
    tickTime: function() {
      this.time += TICK_VALUE;
    },
    interruptRunning: function() {
      this.bloquedP.push(...this.runningP.map(p => ({ ...p, quantumT: 0 })));
      this.runningP = [];
    },
    setErrorOnRunning: function() {
      this.runningP = this.runningP.map(p => ({ ...p, hasError: true }));
    },
    showProcessTable: function() {
      this.pauseSimulation();
      this.showProcessModal = true;
    },
    showMemoryTable: function() {
      this.pauseSimulation();
      this.showMemoryModal = true;
    },

    // Memory stuff
    setupMemory: function() {
      this.memory = Array.from({ length: TOTAL_FRAMES }, (v, i) => ({}));
      this.addProcessToMemory({ size: OS_SIZE, id: -1 });
    },
    getFreeFrames: function() {
      return this.memory.filter(f => !f.processId);
    },
    procFitsInMemory: function(process) {
      return this.getFreeFrames().length >= Math.ceil(process.size / FRAME_SIZE);
    },
    getFreeFrameIdx: function() {
      const idx = this.memory.findIndex(f => !f.processId);
      return idx > -1 ? idx : null;
    },
    pushToMemory: function(process) {
      const idx = this.getFreeFrameIdx();
      if (idx === null) throw new Error('No memory available');

      this.$set(this.memory, idx, process);
    },
    freeMemory: function({ id }) {
      let idx = -1;
      do {
        idx = this.memory.findIndex(f => f.processId === id);
        this.$set(this.memory, idx, {});
      } while (idx > -1);
    },
    addProcessToMemory: function({ size, id }) {
      const frames = Math.floor(size / FRAME_SIZE);
      const blocks = size % FRAME_SIZE;
      for (let i = 0; i < frames; ++i) this.pushToMemory({ used: FRAME_SIZE, processId: id });
      if (blocks) this.pushToMemory({ used: blocks, processId: id });
    },
    
    // Suspend stuff
    getSuspendedProcesses: function() {
      return JSON.parse(localStorage.getItem(SUSPENDED_PROC_KEY) || '[]');
    },
    setSuspendedProcesses: function(processes) {
      this.totalSuspended = processes.length;
      localStorage.setItem(SUSPENDED_PROC_KEY, JSON.stringify(processes));
    },
    addToSuspendedProcesses: function(...processes) {
      const suspendedP = this.getSuspendedProcesses();
      suspendedP.push(...processes);
      this.setSuspendedProcesses(suspendedP);
    },
    getFirstSuspendedProcess: function() {
      const suspendedP = this.getSuspendedProcesses();
      if (!suspendedP.length) return null;

      const firstP = suspendedP.shift();
      this.setSuspendedProcesses(suspendedP);
      return firstP;
    },
    suspendInterruptedProcess: function() {
      if (!this.bloquedP.length) return;

      const bloqued = this.bloquedP.shift();
      this.freeMemory(bloqued);
      this.addToSuspendedProcesses(bloqued);
    },
    retrieveSuspendedProcess: function() {
      const process = this.getFirstSuspendedProcess();
      if (!process) return;

      this.restoredP.push(process);
    },
  },
  computed: {
    toggleText: function() {
      return this.time ? this.isRunning ? 'Pause' : 'Continue' : 'Start';
    },
    fixedTime: function() {
      return this.time.toFixed(FX);
    },
    canUseInput: function() {
      return !this.time || (
        !this.readyP.length &&
        !this.runningP.length &&
        !this.bloquedP.length &&
        !this.finishedP.length
      );
    },
    processesInMemory: function() {
      return [].concat(
        this.readyP.map(p => ({ ...p, status: 'ready' })), 
        this.bloquedP.map(p => ({ ...p, status: 'bloqued' })), 
        this.runningP.map(p => ({ ...p, status: 'running' }))
      );
    }
  },
  created() {
    this.setupMemory();
    localStorage.clear();
  },
  mounted() {
    Object.values(KEY_EVENTS).forEach(v => bus.$on(v, this[v]));
  }
});

const keyListener = new window.keypress.Listener();

Object.keys(KEY_EVENTS).forEach(k => keyListener.simple_combo(k, () => bus.$emit(KEY_EVENTS[k])));
