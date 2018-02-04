const KEY_EVENTS = {
  i: 'interruptRunning',
  e: 'setErrorOnRunning',
  p: 'pauseSimulation',
  c: 'startSimulation',
  n: 'addNewProcess',
  t: 'showProcessTable',
};

const bus = new Vue();

const app = new Vue({
  el: '#app',
  data: {
    showModal: false,
    nextId: 1,
    initialNum: 1,
    error: '',
    newP: [],       // Unlimited
    readyP: [],     // Limit to 6 the sum of this lengths
    runningP: [],   // Limit to 6 the sum of this lengths
    bloquedP: [],   // Limit to 6 the sum of this lengths
    finishedP: [],  // Unlimited
    time: 0,
    isRunning: false,
    timerInterval: null,
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
        const nextProcess = this.newP.shift();
        nextProcess.arrivalTime = this.time;
        this.readyP.push(nextProcess);
      }
    },
    updateReadyProcess: function(p) {
      return { ...p, waitingT: p.waitingT + TICK_VALUE };
    },
    canAddToReady: function() {
      return this.newP.length && this.getProcessesInMemoryCount() < MAX_P_IN_MEMORY;
    },
    getProcessesInMemoryCount: function() {
      return this.runningP.length + this.readyP.length + this.bloquedP.length;
    },
    updateRunningProcesses: function() {
      this.runningP = this.runningP.map(this.updateRunningProcess).filter(p => !!p);
      while (this.canAddToRunning()) {
        const p = this.readyP.shift();
        p.entryT = p.entryT || this.time;
        this.runningP.push(p);
      }
    },
    updateRunningProcess: function(p) {
      if (this.shouldProcessBeFinished(p)) {
        this.finishedP.push({ ...p, finishT: this.time });
        return null;
      }
      return { ...p, elapsedT: p.elapsedT + TICK_VALUE };
    },
    canAddToRunning: function() {
      return this.readyP.length && this.runningP.length < MAX_P_RUNNING;
    },
    shouldProcessBeFinished: function(p) {
      return p.hasError || isEqOrGr(p.elapsedT, p.maxTime);
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
      this.showModal = false;
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
      if (this.isRunning) {
        this.pauseSimulation();
        return;
      }
      this.startSimulation();
    },
    addInitialProcesses: function() {
      if (this.initialNum < 1) {
        this.error = 'Invalid number';
        return;
      }
      for (let i = 0; i < this.initialNum; i++) this.addNewProcess();
    },
    restartSimulation: function() {
      this.nextId = 1;
      this.newP = [];
      this.readyP = [];
      this.runningP = [];
      this.bloquedP = [];
      this.finishedP = [];
      this.time = 0;
      this.initialNum = 1;
      this.error = '';
      this.pauseSimulation();
    },
    tickTime: function() {
      this.time += TICK_VALUE;
    },
    interruptRunning: function() {
      this.bloquedP.push(...this.runningP);
      this.runningP = [];
    },
    setErrorOnRunning: function() {
      this.runningP = this.runningP.map(p => ({ ...p, hasError: true }));
    },
    showProcessTable: function() {
      this.pauseSimulation();
      this.showModal = true;
    }
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
    }
  },
  mounted() {
    Object.values(KEY_EVENTS).forEach(v => bus.$on(v, this[v]));
  }
});

const keyListener = new window.keypress.Listener();

Object.keys(KEY_EVENTS).forEach(k => keyListener.simple_combo(k, () => bus.$emit(KEY_EVENTS[k])));
