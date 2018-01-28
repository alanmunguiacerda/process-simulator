const runningBatchTemplate = `
<div v-if="processes.length">
  <table>
    <thead>
      <tr>
        <th>Id</th>
        <th>Name</th>
        <th>Time</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="process in processes">
        <td>{{ process.id }}</td>
        <td>{{ process.name }}</td>
        <td>{{ process.time }}</td>
      </tr>
    </tbody>
  </table>
</div>
`;

Vue.component('running-batch', {
  template: runningBatchTemplate,
  props: ['processes'],
})