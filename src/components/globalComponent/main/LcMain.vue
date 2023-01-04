<template>
  <fragment>
    <LcCompile
      :key="item.key"
      v-for="item in dataConfig"
      :config="item"
    ></LcCompile>
  </fragment>
</template>

<script>
export default {
  props: {
    config: {
      type: Array,
    },
  },

  data() {
    return {
      dataConfig: [],
      //   config: [{
      //     type: "page",
      //     data: {
      //       user: "no one",
      //       items: ["A", "B", "C"],
      //     },
      //     body: [
      //       {
      //         type: "tpl",
      //         tpl: "User: <%= data.user %>",
      //       },
      //       {
      //         type: "divider",
      //       },
      //       {
      //         type: "tpl",
      //         tpl: "<% if (data.items && data.items.length) { %>Array: <% data.items.forEach(function(item) { %> <span class='label label-default'><%= item %></span> <% });} %>",
      //       },
      //     ],
      //   }]
    };
  },

  methods: {},

  created: function () {
    window.h = this.$createElement;
  },

  mounted: function () {
    if (!this.config) {
      this.dataConfig = [];
    } else {
      this.dataConfig = this.config;
    }

    // this.getColumns();
  },
};
</script>

<style scoped>
</style>

<style lang="scss" scoped>
</style>
