const FX = 1;
const TICK_INTERVAL = 100;
const TICK_VALUE = TICK_INTERVAL / 1000;
const MAX_P_IN_MEMORY = 6;
const MAX_P_RUNNING = 1;
const BLOQUED_TIME = 10;

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

const getNewProcess = () => ({
  opA: getRandomInt(0, 25),
  op: getRandomOp(),
  opB: getRandomInt(1, 25),
  maxTime: getRandomInt(5,15),  // Max exec time
  elapsedTime: 0,               // Time running
  bloquedTime: 0,               // Time bloqued
  arrivalTime: 0,               // Arrival time
  finishTime: 0,                // Finish time
  entryTime: 0,                 // First arrival to processor
  waitingTime: 0,               // Waiting time
});

const isEqOrGr = (a, b) => Number(a.toFixed(FX)) >= Number(b.toFixed(FX));
