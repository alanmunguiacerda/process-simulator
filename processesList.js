const processesListTemplate = `
<div>
  <table>
    <thead>
      <tr>
        <th>Id</th>
        <th v-if="!isFinished">Name</th>
        <th>OpA</th>
        <th>Op</th>
        <th>OpB</th>
        <th v-if="!isFinished">Time</th>
        <th v-if="!isFinished">Delete</th>
        <th v-if="isFinished">Result</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="process in processes">
        <td>{{ process.id }}</td>
        <td v-if="!isFinished">{{ process.name }}</td>
        <td>{{ process.opA }}</td>
        <td>{{ process.op }}</td>
        <td>{{ process.opB }}</td>
        <td v-if="!isFinished">{{ process.time }}</td>
        <td v-if="!isFinished"><a href="#" v-on:click="deleteProcess(process.id)">x</a></td>
        <td v-if="isFinished">{{ getResult(process) }}</td>
      </tr>
    </tbody>
  </table>
</div>
`;

Vue.component('processes-list', {
  template: processesListTemplate,
  props: ['processes', 'isFinished'],
  methods: {
    deleteProcess: function(processId) {
      this.$emit('delete-process', processId);
    },
    getResult: function(process) {
      const { opA, op, opB } = process;
      return eval(`${opA} ${op} ${opB}`);
    }
  }
})