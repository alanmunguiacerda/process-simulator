const TICK_INTERVAL = 100;
const TICK_VALUE = TICK_INTERVAL / 1000;
const PROCESSES_PER_BATCH = 6;

const KEY_EVENTS = {
  i: 'interruptRunning',
  e: 'setErrorOnRunning',
  p: 'pauseSimulation',
  c: 'startSimulation',
  n: 'addNewProcess',
};

const OPERATIONS = ['+', '-', '*', '/', '%'];
const getRandomInt = (min, max) => {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return Math.floor(Math.random() * Math.floor(max - min) + min);
};
const getRandomOp = () => {
  return OPERATIONS[getRandomInt(5)];
}

const bus = new Vue();

const app = new Vue({
  el: '#app',
  data: {
    nextId: 1,
    initialNum: 1,
    error: '',
    batches: [], // Array of batches
    runningBatch: [], // Array of processes
    runningProcess: {}, // process
    completedProcesses: [], // array of batches
    time: 0,
    isRunning: false,
    timerInterval: null,
  },
  methods: {
    addToArray: function(data, array) {
      if (!array.length) {
        array.push([]);
      }

      const batch = array.find(b => b.length < PROCESSES_PER_BATCH);

      if (batch) {
        batch.push(data);
        return;
      }

      array.push([data]);
    },
    handleAddProcess: function(process) {
      if (this.time > 0) return;
      this.addToArray(process, this.batches);
    },
    addNewProcess: function() {
      const newProcess = {
        opA: getRandomInt(0, 25),
        op: getRandomOp(),
        opB: getRandomInt(1, 25),
        time: getRandomInt(5, 15),
        eTime: 0,
        id: this.nextId,
      };
      this.nextId += 1;
      this.addToArray(newProcess, this.batches);
    },
    handleDeleteProcess: function(processId) {
      this.batches.forEach((b, i) => {
        if (b.find(p => p.id === processId)) {
          const filtered = b.filter(p => p.id !== processId);
          if (filtered.length) {
            this.batches.splice(i, 1, filtered);
          } else {
            this.batches.splice(i, 1);
          }
        }
      });
    },
    startSimulation: function() {
      this.isRunning = true;
      if (!this.timerInterval) {
        this.timerInterval = setInterval(() => {
          this.tickTime();
          if (!this.runningBatch.length) this.setRunningBatch();
          if (!this.runningProcess.id) this.setRunningProcess();
          if (this.runningProcess.id) this.updateRunningProcess();
          if (
            !this.batches.length &&
            !this.runningBatch.length &&
            !this.runningProcess.id
          ) this.pauseSimulation();
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
      this.batches = [];
      this.runningBatch = [];
      this.runningProcess = {};
      this.completedProcesses = [];
      this.time = 0;
      this.pauseSimulation();
    },
    tickTime: function() {
      this.time += TICK_VALUE;
    },
    setRunningBatch: function() {
      if (!this.batches.length || this.runningProcess.id) return;
      this.runningBatch = this.batches.shift();
    },
    setRunningProcess: function() {
      if (!this.runningBatch.length) return;
      this.runningProcess = this.runningBatch.shift();
    },
    updateRunningProcess: function() {
      const eTime = this.runningProcess.eTime + TICK_VALUE;
      this.$set(this.runningProcess, 'eTime', eTime);
      if (this.shouldProcessBeCompleted(this.runningProcess)) {
        this.addToArray(this.runningProcess, this.completedProcesses);
        this.runningProcess = {};
      }
    },
    interruptRunning: function () {
      if (!this.runningProcess.id) return;
      this.runningBatch.push(this.runningProcess);
      this.runningProcess = {};
    },
    setErrorOnRunning: function () {
      this.runningProcess.hasError = true;
    },
    shouldProcessBeCompleted: function(process) {
      return process.hasError || (process.eTime >= process.time);
    },
  },
  computed: {
    pendingBatches: function() {
      return this.batches.length;
    },
    toggleText: function() {
      return this.time ? this.isRunning ? 'Pause' : 'Continue' : 'Start';
    },
    fixedTime: function() {
      return this.time.toFixed(1);
    },
    canUseInput: function() {
      return !this.time || (
        !this.batches.length &&
        !this.runningBatch.length &&
        !this.runningProcess.id &&
        !this.completedProcesses.length
      )
    }
  },
  mounted() {
    Object.values(KEY_EVENTS).forEach(v => bus.$on(v, this[v]));
  }
});

const keyListener = new window.keypress.Listener();

Object.keys(KEY_EVENTS).forEach(k => keyListener.simple_combo(k, () => bus.$emit(KEY_EVENTS[k])));
