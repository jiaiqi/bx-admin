<template>
  <div class="lowcode-wrapper">
    <header-view></header-view>
    <div class="lowcode-content">
      <editor-next></editor-next>
      <!-- <materials-view class="materials-view"></materials-view>
      <editor-view class="editor-view"></editor-view>
      <property-view class="property-view"></property-view> -->
    </div>
  </div>
</template>

<script setup>
import HeaderView from "./components/header";
import MaterialsView from "./components/materials";
import EditorView from "./components/editor";
import PropertyView from "./components/property";
import editorNext from "../datav/grid-layout/editor-next.vue";
</script>

<style lang="scss" scoped>
.lowcode-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  .lowcode-content{
    flex: 1;
    ::v-deep .customhome-container{
      height: 100%;
    }
  }
}

</style>
