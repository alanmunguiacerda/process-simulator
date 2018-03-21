const memoryTemplate = `
<div>
  <div class="flex-container col wrap">
    <div class="flex-item" v-for="(value, idx) in memory">
      <div class="flex-container wrap">
        <div class="frame-number">{{ idx }}</div>
        <div class="frame-number">{{ value.processId }}</div>
        <div
          class="frame-block"
          v-for="i in FRAME_SIZE"
          :style="{
            'background-color': getBlocksColor(value, i),
          }"
        ></div>
      </div>
    </div>
  </div>
</div>
`;

Vue.component('memory', {
  template: memoryTemplate,
  props: ['memory', 'processes'],
  methods: {
    getBlocksColor: function(frame, idx) {
      if (frame.processId === -1 && idx <= frame.used) return FRAME_COLORS['os'];

      const process = this.findProcess(frame);
      if (process) {
        if (idx <= frame.used) return FRAME_COLORS[process.status];
      }

      return '#fff';
    },
    getFontColor: function(frame) {
      if (frame.processId === -1) return 'inherit';
      const process = this.findProcess(frame);
      if (process)
        return process.status === 'bloqued' ? '#fff' : 'inherit';

      return 'inherit'
    },
    findProcess: function({ processId }) {
      return this.processes.find(p => p.id === processId);
    },
  },
});
