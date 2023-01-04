<template>
  <div class="low-code-test">
       test34534534534534奥术大师大所大所多
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
      
    };
  },

  methods: {},

  created: function () {
    window.h = this.$createElement;
  },

  mounted: function () {
      console.log(this,"-------我是低代码的test-----")
    // this.getColumns();
    
  },
};
</script>

<style scoped>
</style>

<style lang="scss" scoped>
</style>
