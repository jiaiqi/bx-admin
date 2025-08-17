<template>
  <div
    class="page-wrap"
    :style="[setStyle, { '--content-width': contentAreaWidth }]"
  >
    <lc-view
      v-for="item in components"
      :key="item.id"
      v-bind="item"
      :content-width="contentAreaWidth"
      :query-options="queryOptions"
      :page-params-model="pageParamsModel"
      :page-no="pageNo"
      :page-config="pageConfig"
      :isPreview="true"
      @executor-complete="$emit('executor-complete', $event)"
    ></lc-view>
  </div>
</template>

<script>
import lcView from "./components/materials/view.vue";

import lowCodePageMixin from "./mixins/lowcode-page-mixin";
import pageParamsMixin from "./mixins/page-params-mixin";

export default {
  name: "lowCodeView",
  components: {
    lcView,
  },
  mixins: [lowCodePageMixin, pageParamsMixin],
  data() {
    return {};
  },
  methods: {},
};
</script>

<style lang="scss">
.animate__animated {
  animation-delay: var(--animate-delay);
  animation-iteration-count: var(--animate-repeat);
}
</style>
