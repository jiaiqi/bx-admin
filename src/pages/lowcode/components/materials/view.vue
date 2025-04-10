<template>
  <component
    :is="component"
    v-if="component"
    v-bind="props"
    :page-item="props.data"
    :content-width="contentWidth"
    @click="onTap"
    :currentId="currentId"
    :isPreview="isPreview"
    :isView="isView"
    @add="addComponent"
    @delete="deleteComponent"
    @resize="onResize"
    :class="{ 'preview-mode': isPreview, 'view-mode': isView }"
    style="position: relative; z-index: 1"
  >
    <template v-if="childComponents && childComponents.length">
      <lc-view
        v-for="item in childComponents"
        v-bind="item"
        :page-item="item.data"
        :key="item.id"
        :currentId="currentId"
        :isPreview="isPreview"
        :isView="isView"
        @click="onTap"
        @add="addComponent"
        @delete="deleteComponent"
        @resize="onResize"
      ></lc-view>
    </template>
    <slot v-else>
      <template v-if="type === 'content' && !isView && !isPreview">
        <span
          class=""
          style="color: #999; pointer-events: none"
        >
          {{ name || "可放置组件区域" }}
        </span>
      </template>
      <template v-else-if="type === 'component' && props.com_name">
        {{ props.com_name }}
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
import pageItem from "@/pages/datav/component/page-item/page-item.vue";
import { VueDraggable } from "vue-draggable-plus";

export default {
  name: "lc-view",
  components: {
    lcBlock,
    lcContainer,
    lcContent,
    VueDraggable,
    pageItem,
    lcView: () => import("./view.vue"),
  },
  props: {
    id: {
      type: [String, Number],
      default: "",
    },
    com_no: {
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
      default: false,
    },
    contentWidth: {
      type: String,
    },
  },
  computed: {
    props() {
      return { ...this.$props, ...(this.$attrs || {}) };
    },
    isView() {
      return this.$route.meta?.isView === true;
    },
  },
  data() {
    return {
      childComponents: [],
    };
  },
  watch: {
    children: {
      immediate: true,
      deep: true,
      handler(newValue) {
        if (Array.isArray(newValue)) {
          this.childComponents = newValue;
        } else {
          this.childComponents = [];
        }
      },
    },
  },
  methods: {
    openComponentSelector() {
      this.$emit("open", this.props);
    },
    onTap(val) {
      if (!this.isPreview) {
        this.$emit("click", val || this.props); // 触发父组件的click事件，并传递参数val
      }
    },
    addComponent(val) {
      if (!this.isPreview) {
        this.$emit("add", val);
      }
    },
    deleteComponent(val) {
      if (!this.isPreview) {
        this.$emit("delete", val);
      }
    },
    onResize(val) {
      if (!this.isPreview) {
        console.log("resize", val);
        this.$emit("resize", val);
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>