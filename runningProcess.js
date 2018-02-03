const runningProcessTemplate = `
<table v-if="process.id">
  <tbody>
    <tr>
      <th>Id</th>
      <td>{{ process.id }}</td>
    </tr>
    <tr>
      <th>Op</th>
      <td>{{ process.op }}</td>
    </tr>
    <tr>
      <th>Estimated time</th>
      <td>{{ time }}</td>
    </tr>
    <tr>
      <th>Elapsed time</th>
      <td>{{ elapsedTime }}</td>
    </tr>
    <tr>
      <th>Remaining time</th>
      <td>{{ remainingTime }}</td>
    </tr>
  </tbody>
</table>
`;

Vue.component('running-process', {
  template: runningProcessTemplate,
  props: ['process'],
  computed: {
    time: function() {
      return this.process.time.toFixed(1);
    },
    elapsedTime: function() {
      return this.process.eTime.toFixed(1);
    },
    remainingTime: function() {
      return (this.process.time - this.process.eTime).toFixed(1);
    },
  }
})