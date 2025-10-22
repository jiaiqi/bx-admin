<template>
  <ui-scaler
    :design-size="{ width: 1920, height: 1080 }" 
    :keep-original-size-classes="[
      `div[com_name*='环图'] canvas`,
      `div[com_name*='饼图'] canvas`,
      `div[com_name*='仪表盘'] canvas`,
      `div[com_name*='水球图'] canvas`
    ]"
  >
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
      <floating-edit-button />
    </div>
  </ui-scaler>
</template>

<script>
import lcView from "./components/materials/view.vue";
import FloatingEditButton from "./components/floating-edit-button.vue";
import UiScaler from "./components/ui-scaler.vue";

import lowCodePageMixin from "./mixins/lowcode-page-mixin";
import pageParamsMixin from "./mixins/page-params-mixin";

export default {
  name: "lowCodeView",
  components: {
    lcView,
    FloatingEditButton,
    UiScaler,
  },
  mixins: [lowCodePageMixin, pageParamsMixin],
  data() {
    return {};
  }
};
</script>

<style lang="scss">
.animate__animated {
  animation-delay: var(--animate-delay);
  animation-iteration-count: var(--animate-repeat);
}
</style>
