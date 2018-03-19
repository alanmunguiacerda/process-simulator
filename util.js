const FX = 1;
const TICK_INTERVAL = 100;
const TICK_VALUE = TICK_INTERVAL / 1000;
const MAX_P_IN_MEMORY = 6;
const MAX_P_RUNNING = 1;
const BLOQUED_TIME = 10;
const TOTAL_FRAMES = 28;
const FRAME_SIZE = 5;
const OS_SIZE = 10;

const SUSPENDED_PROC_KEY = 'suspended_processes';

const OPERATIONS = ['+', '-', '*', '/', '%'];

const FRAME_COLORS = {
  'os': '#606c76',
  'ready': '#add8e6',
  'bloqued': '#9b4dca',
  'running': '#42b983',
};

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

const getNewProcess = () => ({
  opA: getRandomInt(0, 25),
  op: getRandomOp(),
  opB: getRandomInt(1, 25),
  maxTime: getRandomInt(5,15),  // Max exec time
  elapsedT: 0,               // Time running
  bloquedT: 0,               // Time bloqued
  arrivalT: -1,               // Arrival time
  finishT: 0,                // Finish time
  entryT: -1,                 // First arrival to processor
  waitingT: 0,               // Waiting time
  quantumT: 0,               // Quantum time
  size: getRandomInt(6, 20),
});

const isEqOrGr = (a, b) => Number(a.toFixed(FX)) >= Number(b.toFixed(FX));
