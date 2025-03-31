<template>
  <div class="lowcode-wrapper">
    <header-view></header-view>
    <div class="lowcode-content">
      <!-- <editor-next></editor-next> -->
      <materials-view class="materials-view"></materials-view>
      <editor-view :components="components" class="editor-view" @select="selectComponent" @change="componentsChange"></editor-view>
      <property-view 
        class="property-view" 
        :current-id="currentId" 
        :components="components"
        @change="componentsChange"
      ></property-view>
    </div>
  </div>
</template>

<script>
import HeaderView from "./components/header";
import MaterialsView from "./components/materials";
import EditorView from "./components/editor";
import PropertyView from "./components/property";
import editorNext from "../datav/grid-layout/editor-next.vue";
export default {
  name: "lowcode-main",
  components: {
    HeaderView,
    MaterialsView,
    EditorView,
    PropertyView,
    editorNext,
  },
  data() {
    return {
      //
      currentId:null,
      // 组件数据
      components: [
        {
          id: "1", // 组件ID，唯一标识
          type: "container", 
          component: "lc-container", // 组件类型，用于区分组件
          name: "Container", // 组件名称，用于显示在编辑器中
          props: {
            // 组件属性
            width: "100%", // 组件宽度
            height: "100%", // 组件高度
            backgroundColor: "#f0f0f0", // 组件背景颜色
          },
          children: [
            // 子组件
            {
              id: "2", // 组件ID，唯一标识
              type: "lc-block",
              component: "lc-block", // 组件类型，用于区分组件
              name: "Layout-1", // 组件名称，用于显示在编辑器中
              subType: "layout-1-2", // 组件子类型，用于区分组件
              props: {
                // 组件属性
                width: "100%", // 组件宽度
                height: "100%", // 组件高度
              },
              children: [
                // 子组件
                {
                  id: "3", // 组件ID，唯一标识
                  type: "content", // 组件类型，用于区分组件
                  component: "lc-content", // 组件类型，用于区分组件
                  name: "NormalButton", // 组件名称，用于显示在编辑器中
                  props: {
                    // 组件属性
                  },
                  children: [
                    // 子组件
                    {
                      id: "4", // 组件ID，唯一标识
                      type: "button", // 组件类型，用于区分组件
                      component: "el-button", // 组件类型，用于区分组件
                      name: "按钮一", // 组件名称，用于显示在编辑器中
                    }, 
                  ]
                },
                {
                  id: "5", // 组件ID，唯一标识
                  type: "button", // 组件类型，用于区分组件
                  component: "lc-content", // 组件类型，用于区分组件
                  name: "NormalButton", // 组件名称，用于显示在编辑器中
                  children: [
                    // 子组件
                    {
                      id: "6", // 组件ID，唯一标识
                      type: "button", // 组件类型，用于区分组件
                      component: "el-button", // 组件类型，用于区分组件
                      name: "按钮二", // 组件名称，用于显示在编辑器中
                    }, 
                  ]
                },
              ],
            },
            {
              id: "7", // 组件ID，唯一标识
              type: "block", // 组件类型，用于区分组件
              component: "lc-block", // 组件类型，用于区分组件
              name: "区块二", // 组件名称，用于显示在编辑器中
              subType: "layout-1-3", // 组件子类型，用于区分组件
              children: [
                // 子组件
                {
                  id: "8", // 组件ID，唯一标识
                  type: "content", // 组件类型，用于区分组件
                  component: "lc-content", // 组件类型，用于区分组件
                  name: "内容一", // 组件名称，用于显示在编辑器中
                },
                {
                  id: "9", // 组件ID，唯一标识
                  type: "content", // 组件类型，用于区分组件
                  component: "lc-content", // 组件类型，用于区分组件
                  name: "内容二", // 组件名称，用于显示在编辑器中
                },
                {
                  id: "10", // 组件ID，唯一标识
                  type: "content", // 组件类型，用于区分组件
                  component: "lc-content", // 组件类型，用于区分组件
                  name: "内容三", // 组件名称，用于显示在编辑器中
                },
              ],
            },
          ],
        },
        
        {
          id: "11", // 组件ID，唯一标识
          type: "container", 
          component: "lc-container", // 组件类型，用于区分组件
          name: "Container", // 组件名称，用于显示在编辑器中
          props: {
            // 组件属性
            width: "100%", // 组件宽度
            height: "100%", // 组件高度
            backgroundColor: "#f0f0f0", // 组件背景颜色
          },
          children: [
            // 子组件
            {
              id: "12", // 组件ID，唯一标识
              type: "lc-block",
              component: "lc-block", // 组件类型，用于区分组件
              name: "Layout-1", // 组件名称，用于显示在编辑器中
              subType: "layout-1-2", // 组件子类型，用于区分组件
              props: {
                // 组件属性
                width: "100%", // 组件宽度
                height: "100%", // 组件高度
              },
              children: [
                // 子组件
                {
                  id: "13", // 组件ID，唯一标识
                  type: "content", // 组件类型，用于区分组件
                  component: "lc-content", // 组件类型，用于区分组件
                  name: "NormalButton", // 组件名称，用于显示在编辑器中
                  props: {
                    // 组件属性
                  },
                  children: [
                    // 子组件
                    {
                      id: "14", // 组件ID，唯一标识
                      type: "button", // 组件类型，用于区分组件
                      component: "el-button", // 组件类型，用于区分组件
                      name: "按钮三", // 组件名称，用于显示在编辑器中
                    }, 
                  ]
                },
                {
                  id: "15", // 组件ID，唯一标识
                  type: "button", // 组件类型，用于区分组件
                  component: "lc-content", // 组件类型，用于区分组件
                  name: "NormalButton", // 组件名称，用于显示在编辑器中
                  children: [
                    // 子组件
                    {
                      id: "16", // 组件ID，唯一标识
                      type: "button", // 组件类型，用于区分组件
                      component: "el-button", // 组件类型，用于区分组件
                      name: "按钮四", // 组件名称，用于显示在编辑器中
                    }, 
                  ]
                },
              ],
            },
            {
              id: "17", // 组件ID，唯一标识
              type: "block", // 组件类型，用于区分组件
              component: "lc-block", // 组件类型，用于区分组件
              name: "区块二", // 组件名称，用于显示在编辑器中
              subType: "layout-1-3", // 组件子类型，用于区分组件
              children: [
                // 子组件
                {
                  id: "18", // 组件ID，唯一标识
                  type: "content", // 组件类型，用于区分组件
                  component: "lc-content", // 组件类型，用于区分组件
                  name: "内容一", // 组件名称，用于显示在编辑器中
                },
                {
                  id: "19", // 组件ID，唯一标识
                  type: "content", // 组件类型，用于区分组件
                  component: "lc-content", // 组件类型，用于区分组件
                  name: "内容二", // 组件名称，用于显示在编辑器中
                },
                {
                  id: "20", // 组件ID，唯一标识
                  type: "content", // 组件类型，用于区分组件
                  component: "lc-content", // 组件类型，用于区分组件
                  name: "内容三", // 组件名称，用于显示在编辑器中
                },
              ],
            },
          ],
        },
      ],
    };
  },
  methods: {
    //
    selectComponent(id) {
      this.currentId = id;
    },
    componentsChange(val) {
      console.log('componentsChange',val); // 
      this.components = val; 
    }
  },
};
</script>

<style lang="scss" scoped>
.lowcode-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  .lowcode-content {
    flex: 1;
    display: flex;
    height: 100%;
    ::v-deep .customhome-container {
      height: 100%;
    }
  }
}
</style>
