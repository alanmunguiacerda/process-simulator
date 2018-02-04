const processesListTemplate = `
<div>
  <table>
    <thead>
      <tr>
        <th v-if="shouldShow('id')">Id</th>
        <th v-if="shouldShow('arrivalTime')">ArrivalT</th>
        <th v-if="shouldShow('finishTime')">FinishT</th>
        <th v-if="shouldShow('returnTime')">ReturnT</th>
        <th v-if="shouldShow('entryTime')">ResponseT</th>
        <th v-if="shouldShow('waitingTime')">WaitingT</th>
        <th v-if="shouldShow('maxTime')">MaxT</th>
        <th v-if="shouldShow('elapsedTime')">ElapsedT</th>
        <th v-if="shouldShow('remainingTime')">RemainingT</th>
        <th v-if="shouldShow('bloquedTime')">BloquedT</th>
        <th v-if="shouldShow('opA')">OpA</th>
        <th v-if="shouldShow('op')">Op</th>
        <th v-if="shouldShow('opB')">OpB</th>
        <th v-if="shouldShow('delete')">Delete</th>
        <th v-if="shouldShow('result')">Result</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="p in processes">
        <td v-if="shouldShow('id')">{{ p.id }}</td>
        <td v-if="shouldShow('arrivalTime')">{{ p.arrivalTime | toFixed }}</td>
        <td v-if="shouldShow('finishTime')">{{ p.finishTime | toFixed }}</td>
        <td v-if="shouldShow('returnTime')">{{ getReturnTime(p) | toFixed }}</td>
        <td v-if="shouldShow('entryTime')">{{ getResponseTime(p) | toFixed }}</td>
        <td v-if="shouldShow('waitingTime')">{{ p.waitingTime | toFixed }}</td>
        <td v-if="shouldShow('maxTime')">{{ p.maxTime | toFixed }}</td>
        <td v-if="shouldShow('elapsedTime')">{{ p.elapsedTime | toFixed }}</td>
        <td v-if="shouldShow('remainingTime')">{{ getRemainingTime(p) | toFixed }}</td>
        <td v-if="shouldShow('bloquedTime')">{{ p.bloquedTime | toFixed }}</td>
        <td v-if="shouldShow('opA')">{{ p.opA }}</td>
        <td v-if="shouldShow('op')">{{ p.op }}</td>
        <td v-if="shouldShow('opB')">{{ p.opB }}</td>
        <td v-if="shouldShow('delete')">
          <a href="#" v-on:click="deleteProcess(p.id)">x</a>
        </td>
        <td v-if="shouldShow('result')">{{ getResult(p) | toFixed(3) }}</td>
      </tr>
    </tbody>
  </table>
</div>
`;

Vue.component('processes-list', {
  template: processesListTemplate,
  props: ['processes', 'columns'],
  methods: {
    deleteProcess: function(processId) {
      this.$emit('delete-process', processId);
    },
    getResult: function(p) {
      if (p.hasError) return 'ERROR';
      const { opA, op, opB } = p;
      return eval(`${opA} ${op} ${opB}`);
    },
    getRemainingTime: function(p) {
      const remainingTime = (p.maxTime - p.elapsedTime);
      return remainingTime < 0 ? 0 : remainingTime;
    },
    getReturnTime: function(p) {
      return p.finishTime - p.arrivalTime;
    },
    getResponseTime: function(p) {
      return p.entryTime - p.arrivalTime;
    },
    shouldShow: function(attr) {
      return this.columns.includes(attr);
    },
  },
  filters: {
    toFixed: function(v, n=FX) {
      return Number(v).toFixed(n);
    },
  }
})