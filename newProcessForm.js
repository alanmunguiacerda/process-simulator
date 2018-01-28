const newProcessTemplate = `
<fieldset>
  <h3>Create new process</h3>
  <p v-if="errors.length">
    <b>Errors here:</b>
    <ul>
      <li v-for="error in errors">{{ error }}</li>
    </ul>
  </p>
  <input v-model="name" type="text" placeholder="John Doe">
  <div class="row">
    <div class="column column-40">
      <input v-model="opA" type="number" placeholder="First operator">
    </div>
    <div class="column column-20">
      <select v-model="op">
        <option value="+">+</option>
        <option value="-">-</option>
        <option value="*">*</option>
        <option value="/">/</option>
        <option value="%">%</option>
      </select>
    </div>
    <div class="column column-40">
      <input v-model="opB" type="number" placeholder="Second operator">
    </div>
  </div>
  <div class="row">
    <div class="column">
      <input v-model="time" type="number" min="0">
    </div>
    <div class="column">
      <input v-model="id" type="number" min="0">
    </div>
  </div>
  <button class="button" v-on:click="addProcess">Add</button>
</fieldset>
`;

Vue.component('new-process-form', {
  template: newProcessTemplate,
  props: ['batches'],
  data: function() {
    return {
      name: '',
      opA: 0,
      op: '+',
      opB: 0,
      time: 1,
      id: 1,
      errors: [],
    };
  },
  methods: {
    addProcess: function() {
      if (!this.isValidProcess()) return;
      
      this.$emit('add-process', this.makeProcess());
      this.id = Number(this.id) + 1;
    },
    isValidProcess: function() {
      this.errors = [];
      this.batches.forEach(b => {
        if (b.find(e => e.id === this.id)) this.errors.push('Id already exists');
      });
      if ((this.op === '/' || this.op === '%') && this.opB === 0) 
        this.errors.push('OpB cannot be 0');
      if (this.time < 1) this.errors.push('Time cannot be lower than 1');
      return this.errors.length === 0;
    },
    makeProcess: function() {
      return {
        name: this.name,
        opA: Number(this.opA),
        op: this.op,
        opB: Number(this.opB),
        time: Number(this.time),
        id: Number(this.id),
      };
    },
  },
})