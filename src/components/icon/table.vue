<script setup>
const props = defineProps({
  size: {
    type: [String, Number],
    default: 20
  },
  colors: {
    type: Array,
    default: () => {
      return ['#333']
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
<script>
export  default  {
  name:"IconTable"
}
</script>

<template>
  <svg :width="props.size" :height="props.size" viewBox="0 0 48 48" fill="none" class="svg-icon">
    <path
        d="M42 6H6C4.89543 6 4 6.89543 4 8V40C4 41.1046 4.89543 42 6 42H42C43.1046 42 44 41.1046 44 40V8C44 6.89543 43.1046 6 42 6Z"
        fill="none" :stroke="props.colors[0]" :stroke-width="props.strokeWidth" :stroke-linejoin="props.strokeLinecap"/>
    <path d="M4 18H44" :stroke="props.colors[0]" :stroke-width="props.strokeWidth" :stroke-linecap="props.strokeLinecap"
          :stroke-linejoin="props.strokeLinejoin"/>
    <path d="M17.5 18V42" :stroke="props.colors[0]" :stroke-width="props.strokeWidth"
          :stroke-linecap="props.strokeLinecap" :stroke-linejoin="props.strokeLinejoin"/>
    <path d="M30.5 18V42" :stroke="props.colors[0]" :stroke-width="props.strokeWidth"
          :stroke-linecap="props.strokeLinecap" :stroke-linejoin="props.strokeLinejoin"/>
    <path d="M4 30H44" :stroke="props.colors[0]" :stroke-width="props.strokeWidth" :stroke-linecap="props.strokeLinecap"
          :stroke-linejoin="props.strokeLinejoin"/>
    <path d="M44 8V40C44 41.1046 43.1046 42 42 42H6C4.89543 42 4 41.1046 4 40V8" :stroke="props.colors[0]"
          :stroke-width="props.strokeWidth"
          :stroke-linecap="props.strokeLinecap" :stroke-linejoin="props.strokeLinejoin"/>
  </svg>
</template>

<style scoped>

</style>