<template>
  <div class="low-code-title">
        title
        <LcMain :config="config.body"></LcMain>
  </div>
</template>

<script>
export default {
   props: {
    config:{
        type:Object
    }
  },

  data() {
      return {

      }
  },

  methods: {},

  created: function () {
    window.h = this.$createElement;
  },

  mounted: function () {
    // this.getColumns();
  },
};
</script>

<style scoped>
</style>

<style lang="scss" scoped>
</style>
