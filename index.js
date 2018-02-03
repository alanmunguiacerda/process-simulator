const TICK_INTERVAL = 100;
const TICK_VALUE = TICK_INTERVAL / 1000;
const PROCESSES_PER_BATCH = 6;

const KEY_EVENTS = {
  p: 'pauseSimulation',
  c: 'startSimulation',
};

const bus = new Vue();

const app = new Vue({
  el: '#app',
  data: {
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
    handleAddProcess: function(process, array=this.batches) {
      if (this.time > 0) return;
      this.addToArray(process, this.batches);
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
          if (!this.runningBatch.length && !this.runningProcess.id) this.pauseSimulation();
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
    tickTime: function() {
      this.time += TICK_VALUE;
    },
    setRunningBatch: function() {
      if (!this.batches.length) return;
      this.runningBatch = this.batches.shift();
    },
    setRunningProcess: function() {
      if (!this.runningBatch.length) return;
      this.runningProcess = this.runningBatch.shift();
    },
    updateRunningProcess: function() {
      const eTime = this.runningProcess.eTime
        ? this.runningProcess.eTime + TICK_VALUE
        : TICK_VALUE;
      this.$set(this.runningProcess, 'eTime', eTime);
      if (eTime >= this.runningProcess.time) {
        this.addToArray(this.runningProcess, this.completedProcesses);
        this.runningProcess = {};
      }
    },
  },
  computed: {
    pendingBatches: function() {
      return this.batches.length;
    },
    toggleText: function() {
      return this.isRunning ? 'Pause' : 'Start';
    },
    fixedTime: function() {
      return this.time.toFixed(1);
    }
  },
  mounted() {
    Object.values(KEY_EVENTS).forEach(v => bus.$on(v, this[v]));
  }
});

const keyListener = new window.keypress.Listener();

Object.keys(KEY_EVENTS).forEach(k => keyListener.simple_combo(k, () => bus.$emit(KEY_EVENTS[k])));