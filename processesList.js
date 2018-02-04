const processesListTemplate = `
<div>
  <table>
    <thead>
      <tr>
        <th v-if="shouldShow('id')">Id</th>
        <th v-if="shouldShow('arrivalT')">ArrivalT</th>
        <th v-if="shouldShow('finishT')">FinishT</th>
        <th v-if="shouldShow('returnT')">ReturnT</th>
        <th v-if="shouldShow('entryT')">ResponseT</th>
        <th v-if="shouldShow('waitingT')">WaitingT</th>
        <th v-if="shouldShow('maxTime')">MaxT</th>
        <th v-if="shouldShow('elapsedT')">ElapsedT</th>
        <th v-if="shouldShow('remainingT')">RemainingT</th>
        <th v-if="shouldShow('bloquedT')">BloquedT</th>
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
        <td v-if="shouldShow('arrivalT')">{{ p.arrivalT | toFixed }}</td>
        <td v-if="shouldShow('finishT')">{{ p.finishT | toFixed }}</td>
        <td v-if="shouldShow('returnT')">{{ getReturnTime(p) | toFixed }}</td>
        <td v-if="shouldShow('entryT')">{{ getResponseTime(p) | toFixed }}</td>
        <td v-if="shouldShow('waitingT')">{{ p.waitingT | toFixed }}</td>
        <td v-if="shouldShow('maxTime')">{{ p.maxTime | toFixed }}</td>
        <td v-if="shouldShow('elapsedT')">{{ p.elapsedT | toFixed }}</td>
        <td v-if="shouldShow('remainingT')">{{ getRemainingTime(p) | toFixed }}</td>
        <td v-if="shouldShow('bloquedT')">{{ p.bloquedT | toFixed }}</td>
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
      const remainingT = (p.maxTime - p.elapsedT);
      return remainingT < 0 ? 0 : remainingT;
    },
    getReturnTime: function(p) {
      return p.finishT - p.arrivalT;
    },
    getResponseTime: function(p) {
      return p.entryT - p.arrivalT;
    },
    shouldShow: function(attr) {
      return this.columns.includes(attr);
    },
  },
  filters: {
    toFixed: function(v, n=FX) {
      if (isNaN(v)) return v;
      return Number(v).toFixed(n);
    },
  }
})