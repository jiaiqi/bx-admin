<template>
  <component
    :is="component"
    v-if="component"
    v-bind="props"
    @click="onTap"
    :currentId="currentId"
    :isPreview="isPreview"
    @add="addComponent"
    :class="{'preview-mode':isPreview}"
    style="position: relative;z-index: 1;"
  >
    <template v-if="children && children.length">
      <lc-view
        v-for="item in children"
        v-bind="item"
        :key="item.id"
        :currentId="currentId"
        :isPreview="isPreview"
        @click="onTap"
        @add="addComponent"
      ></lc-view>
    </template>
    <slot v-else>
      <template v-if="type === 'content'">
        <!-- <el-button type="primary" size="mini" @click="openComponentSelector"
          >添加组件</el-button
        > -->
        <span class="" style="color: #999;pointer-events: none;">
        可放置组件区域

        </span>
      </template>
      <template v-else>
        {{ name }}
      </template>
    </slot>
  </component>
</template>

<script>
import lcBlock from "./block.vue";
import lcContainer from "./container.vue";
import lcContent from "./content-item.vue";
import { VueDraggable } from "vue-draggable-plus";

export default {
  name: "lc-view",
  components: {
    lcBlock,
    lcContainer,
    lcContent,
    VueDraggable,
    lcView: () => import("./view.vue"),
  },
  props: {
    id: {
      type: [String, Number],
      default: "",
    },
    currentId: {
      type: [String, Number],
      default: "",
    },
    component: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      default: "",
    },
    children: {
      type: Array,
      default: () => [],
    },
    type: {
      type: String,
      default: "",
    },
    isPreview: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    props() {
      return { ...this.$props, ...(this.$attrs || {}) };
    },
  },
  methods: {
    openComponentSelector() {
      this.$emit("open", this.props);
    },
    onTap(val) {
      if (!this.isPreview) {
        this.$emit("click", val); // 触发父组件的click事件，并传递参数val
      }
    },
    addComponent(val) {
      if (!this.isPreview) {
        this.$emit("add", val);
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
