<template>
  <div class="materia-warp">
    <div class="left">

      <div
        v-for="item in list"
        :key="item.id"
        :id="item.id"
        draggable="true"
        :data-type="item.type"
        class="cursor-move h-50px bg-gray-500/5 rounded p-3"
        @dragstart="handleDragStart($event, item)"
      >
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "lowcode-materials",
  components: {
  },
  data() {
    return {
      //
      list: [
        {
          id: "1", // 组件ID，唯一标识
          type: "button", // 组件类型，用于区分组件
          component: "el-button", // 组件类型，用于区分组件
          name: "按钮", // 组件名称，用于显示在编辑器中
        },
      ],
    };
  },
  methods: {
    //
    onEnd(val) {
      console.log("end", val);
    },
    handleDragStart(e, item) {
      e.dataTransfer.setData("text/plain", JSON.stringify(item)); // 存储被拖拽元素的ID
    },
  },
};
</script>

<style scoped lang="scss">
.left {
  width: 40px;
  height: 100%;
  border: 1px solid #f0f0f0;
  border-top: none;
}
</style>
