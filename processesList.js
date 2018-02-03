const processesListTemplate = `
<div>
  <table>
    <thead>
      <tr>
        <th v-if="shouldShow('id')">Id</th>
        <th v-if="shouldShow('time')">MaxTime</th>
        <th v-if="shouldShow('remTime')">RemainingTime</th>
        <th v-if="shouldShow('opA')">OpA</th>
        <th v-if="shouldShow('op')">Op</th>
        <th v-if="shouldShow('opB')">OpB</th>
        <th v-if="shouldShow('delete')">Delete</th>
        <th v-if="shouldShow('result')">Result</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="process in processes">
        <td v-if="shouldShow('id')">{{ process.id }}</td>
        <td v-if="shouldShow('time')">{{ process.time }}</td>
        <td v-if="shouldShow('remTime')">{{ getRemainingTime(process) }}</td>
        <td v-if="shouldShow('opA')">{{ process.opA }}</td>
        <td v-if="shouldShow('op')">{{ process.op }}</td>
        <td v-if="shouldShow('opB')">{{ process.opB }}</td>
        <td v-if="shouldShow('delete')">
          <a href="#" v-on:click="deleteProcess(process.id)">x</a>
        </td>
        <td v-if="shouldShow('result')">{{ getResult(process) }}</td>
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
    getResult: function(process) {
      if (process.hasError) return 'ERROR';
      const { opA, op, opB } = process;
      return eval(`${opA} ${op} ${opB}`);
    },
    getRemainingTime: function(process) {
      const remainingTime = (process.time - process.eTime);
      return remainingTime < 0 ? 0 : remainingTime.toFixed(1);
    },
    shouldShow: function(attr) {
      return this.columns.includes(attr);
    },
  }
})