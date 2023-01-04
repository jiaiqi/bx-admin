<template>
  <div
    :style="config.attribute && config.attribute.style"
    class="low-code-main-page"
  >
    <input v-model="asyncData.tt" />
    <LcMain :config="config.body"></LcMain>
    <!-- <recursionTree :config="config.body"></recursionTree> -->
  </div>
</template>

<script>
export default {
  props: {
    config: {
      type: Object,
    },
  },
  data() {
    return {
      asyncData: {
        table:[]
      },
    };
  },
  methods: {},
  created: function () {
    window.h = this.$createElement;
  },

  mounted: function () {
    setTimeout(() => {
      if (this.config.async) {
        this.$set(this.asyncData, "table", {
          data: [
            { name: "也许时间是一种毒药" },
            { name: "也许时间是我正服下的服药" },
          ],
        });
      }
    }, 3000);

    // this.getColumns();
  },
};
</script>

<style scoped>
</style>

<style lang="scss" scoped>
</style>
