<template>
  <div :style="config.attribute&&config.attribute.style" class="low-code-main-div">
       
     <LcMain :config="config.body"></LcMain>
    <!-- <recursionTree :config="config.body"></recursionTree> -->
     {{parentData.data&&parentData.data.tt}}
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
      data:{

      },
      parentData:{

      }
    };
  },

  methods: {},

  created: function () {
    window.h = this.$createElement;
  },

  mounted: function () {

     this.$set(this.parentData,"data",this.$parent.$parent.$parent._data.asyncData)
     console.log(this.parentData,"==this.parentData==this.parentData==")
    // console.log(this.$parent.$parent.$parent._data.tt,"什么是this呀？？小伙子？？")
    
    // this.getColumns();
  },
};
</script>

<style scoped>
</style>

<style lang="scss" scoped>
</style>
