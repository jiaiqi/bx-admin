<template>
  <div class="work_main">
    <MineMap/>
  </div>
</template>
<script>
import MineMap from "@/pages/audit/workdistribution/map/mine-map.vue";
export default {
  name: "work-order",
  components: {
    MineMap
  },
  methods: {

    mounted() {

    }
  }
}
</script>
<style scoped lang="scss">
.work_main{
  width: 100%;
  height: 100%;
  background: #ace;
}
</style>