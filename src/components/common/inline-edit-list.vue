<template>
  <div>
     
  </div>
</template>

<script>
//  行内编辑列表
export default {
  name: "inline-edit-list",
  props: {
    service: {
      type: String,
      default: "",
    },
    appName: {
      type: String,
      default: "",
    },
  },
  computed: {
    serviceName() {
      return this.service || this.$route?.params?.serviceName;
    },
    srvApp() {
      return this.appName || this.$route?.query?.menuapp;
    },
  },
  data() {
    return {
        v2Data:null,
        loadState:'more'
    };
  },
};
</script>

<style lang="scss" scoped></style>
