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
    
    <!-- 浮动编辑按钮组件 -->
    <floating-edit-button @edit-click="handleEditClick" />
  </div>
</template>

<script>
import lcView from "./components/materials/view.vue";
import FloatingEditButton from "./components/floating-edit-button.vue";

import lowCodePageMixin from "./mixins/lowcode-page-mixin";
import pageParamsMixin from "./mixins/page-params-mixin";

export default {
  name: "lowCodeView",
  components: {
    lcView,
    FloatingEditButton,
  },
  mixins: [lowCodePageMixin, pageParamsMixin],
  data() {
    return {};
  },
  methods: {
    handleEditClick() {
      // 编辑按钮点击事件处理
      location.href = location.href.replace('site','lowcode/editor')
    },
  },
};
</script>

<style lang="scss">
.animate__animated {
  animation-delay: var(--animate-delay);
  animation-iteration-count: var(--animate-repeat);
}
</style>
