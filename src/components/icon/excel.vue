<script setup>
const props = defineProps({
  size: {
    type: [String, Number],
    default: 20
  },
  colors: {
    type: Array,
    default: () => {
      return ['#4CAF50', '#2E7D32']
    }
  },
  strokeWidth: {
    type: Number,
    default: 4
  },
  strokeLinecap: {
    type: String,
    default: 'round'
  },
  strokeLinejoin: {
    type: String,
    default: 'round'
  }
})
</script>

<template>
  <svg :width="props.size" :height="props.size" viewBox="0 0 1024 1024" fill="none" class="svg-icon">
    <path
        d="M877.81 211.7H533.74v602.11h344.07c12.29 0 21.3-9.83 21.3-21.3v-558.7c-0.01-12.27-9.02-22.11-21.3-22.11z m0 0"
        :fill="props.colors[0]"></path>
    <path
        d="M684.47 319.84H835.2v64.71H684.47v-64.71z m0 214.63H835.2v64.71H684.47v-64.71z m0 107.32H835.2v64.72H684.47v-64.72z m0-214.64H835.2v64.72H684.47v-64.72zM533.74 319.84h107.32v64.71H533.74v-64.71z m0 214.63h107.32v64.71H533.74v-64.71z m0 107.32h107.32v64.72H533.74v-64.72z m0-214.64h107.32v64.72H533.74v-64.72z m0 0"
        fill="#FFFFFF"></path>
    <path d="M577.16 900.65l-451.38-86.02V211.7l451.38-86.02v774.97z m0 0" :fill="props.colors[1]"></path>
    <path
        d="M406.76 660.63l-50.79-95.85c-1.64-3.28-4.1-9.83-5.73-19.66h-1.64c-0.82 4.91-3.28 11.47-6.55 20.48l-50.79 95.03H211.8L306 513.17l-86.02-147.45h81.1l42.6 88.47c3.28 7.37 6.55 15.56 9.01 24.57h0.82c1.64-5.73 4.91-13.93 9.01-25.39l45.87-87.65h73.73l-87.65 145.82 90.93 149.09h-78.64z m0 0"
        fill="#FFFFFF"></path>
  </svg>
</template>

<style scoped>

</style>