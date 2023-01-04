<template>
  <fragment >

      <component  v-if="(config instanceof Object)" :config="config" :type="config.type" :is="config.type"></component>
       <fragment v-else >{{config}}</fragment>
  </fragment>
</template>

<script>
export default {
  props: {
    config: {
      type: Object | String,
    },
  
    type:{
        type:String
    }
  },

  data() {
    return {
      dataConfig: []
    };
  },

  methods: {},

  created: function () {
   
  },

  mounted: function () {
      
  },
};
</script>

<style scoped>
</style>

<style lang="scss" scoped>
</style>
