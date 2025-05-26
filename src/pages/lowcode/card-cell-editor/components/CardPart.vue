<template>
  <div
    class="card-part"
    :class="{
      'card-part-row': part.parts_type === 'row',
      'card-part-selected': isSelected,
      'on-drag-over': isDraggingOver && !preview,
      'card-part-preview': preview,
    }"
    :style="[setPartStyle]"
    @dragover.prevent
    @drop="onDrop($event, part)"
    @dragover.stop="onDragOver($event)"
    @dragleave.stop="onDragLeave($event)"
    @mouseover.stop=""
    v-if="partsShow"
  >
    <div
      class="overlay"
      @click.stop="selectPart(part, $event)"
      @mouseenter="$emit('mouseenter')"
      v-if="!preview"
    >
      <div class="card-part-header" v-if="isSelected">
        <span class="part-label">{{ part.label }}</span>
        <i
          class="el-icon-delete"
          @click.stop="$emit('delete-part', part, index)"
        ></i>
      </div>
    </div>
    <!-- 根据不同类型渲染不同内容 -->
    <template v-if="part.parts_type === 'row'">
      <card-part
        v-for="(childPart, childIndex) in part.children || []"
        :key="childIndex"
        :part="childPart"
        :index="childIndex"
        :selected-part="selectedPart"
        :preview="preview"
        :hiddenPartsVisible="hiddenPartsVisible"
        @mouseenter="$emit('mouseenter')"
        @delete-part="deleteChildPart"
        @select-part="selectPart"
      />
    </template>

    <template v-else>
      <card-cell-part-without-card-group
        :cell-item="part"
        :page-item="{}"
        @on-click-cell="handleClickCell"
      />
    </template>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue2";
import CardCellPartWithoutCardGroup from "@/pages/datav/component/page-item/card-group-cell/card-cell-part-without-card-group.vue";
import { formatStyleData } from "@/pages/datav/common";
export default {
  name: "CardPart",
  components: {
    Icon,
    CardCellPartWithoutCardGroup,
  },
  data() {
    return {
      isDraggingOver: false,
    };
  },
  props: {
    part: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    selectedPart: [Object, null],
    preview: {
      type: Boolean,
      default: false,
    },
    hiddenPartsVisible: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    setPartStyle() {
      const styleJson = this.part?.style_json || {};
      return formatStyleData(styleJson);
    },
    partsShow() {
      const item = this.part;
      const itemData = {};
      const map =
        this.comColMap ||
        Object.keys(itemData).reduce((acc, key) => {
          acc[key] = key;
          return acc;
        }, {});
      let show = true;
      if (item.disp_flag == "隐藏" && !item.disp_variable) {
        return false;
      }
      // 根据显示条件判断是否显示 islogin代表是否登录
      if (item.disp_flag && item?.disp_variable?.toLowerCase() === "islogin") {
        if (item.disp_flag === "显示") {
          return item.disp_compare_value === "是"
            ? !!this.logined
            : !this.logined;
        } else if (item.disp_flag === "隐藏") {
          return item.disp_compare_value === "是"
            ? !this.logined
            : !!this.logined;
        }
      } else if (item && itemData) {
        if (
          item.disp_flag == "显示" &&
          item.disp_variable &&
          map.hasOwnProperty(item.disp_variable)
        ) {
          show = false;
          let val =
            itemData[map[item.disp_variable]] ||
            this.queryOptions[map[item.disp_variable]] ||
            null;
          let dispValue = item.disp_compare_value || null; // 显示值
          if (dispValue === "notnull") {
            show = !!val;
          } else if (dispValue && val) {
            dispValue = dispValue.split(",");
            // console.log('dispValue1',dispValue,val,itemData.target_name)
            if (dispValue.indexOf(val) !== -1) {
              show = true;
            }
          }
        } else if (
          item.disp_flag == "隐藏" &&
          item.disp_variable &&
          map.hasOwnProperty(item.disp_variable)
        ) {
          show = true;
          let val =
            itemData[map[item.disp_variable]] ||
            this.queryOptions[map[item.disp_variable]] ||
            null;
          let dispValue = item.disp_compare_value || null; // 隐藏值
          if (["null", "false"].includes(disp_compare_value)) {
            show = !!val;
          } else if (dispValue && val) {
            dispValue = dispValue.split(",");
            if (dispValue.indexOf(val) !== -1) {
              show = false;
            }
          }
        }
      }
      // console.log('dispValue2',itemData.rent_type,itemData.rent_status,show)
      if (!show) {
        console.log(
          "dispValue2",
          itemData.rent_type,
          itemData.rent_status,
          show
        );
      }
      return show;
    },
    isSelected() {
      // 判断当前部件是否被选中
      if (!this.selectedPart?.id && this.selectPart?._id) {
        return this.selectedPart._id === this.part?._id;
      } else if (this.part?.card_parts_no) {
        return this.selectedPart?.card_parts_no === this.part?.card_parts_no;
      } else if (this.selectedPart?.id) {
        return this.selectedPart.id === this.part?.id;
      }
    },
  },
  methods: {
    selectPart(part, event) {
      event?.stopPropagation?.();
      console.log("选中", part?._id || part?.id);
      this.$emit("select-part", part || this.part);
    },
    onDrop(event, part) {
      event.stopPropagation();
      const partData = JSON.parse(event.dataTransfer.getData("part"));

      // 如果是拖放到row类型的卡片部件中
      if (part && part.parts_type === "row") {
        if (!part.children) {
          this.$set(part, "children", []);
        }
        // 创建新的部件实例，避免引用原始对象
        const newPart = JSON.parse(JSON.stringify(partData));

        // 如果拖入的也是row类型，初始化children数组
        if (newPart.parts_type === "row") {
          newPart.children = [];
        }

        newPart._id = new Date().getTime();
        newPart._editType = "add";
        newPart.seq = (part.children.length + 1) * 100;
        newPart.card_parts_name =
          part?.label ||
          part?.parts_type ||
          `卡片部件${this.part.children.length + 1}`;
        if (this.part.card_parts_no) {
          newPart.parent_no = this.part.card_parts_no;
        }
        Object.keys(newPart).forEach((key) => {
          if (key.startsWith("_default_")) {
            newPart[key.replace("_default_", "")] = newPart[key];
            console.log("newPart", newPart);

            delete newPart[key];
          }
        });

        part.children.push(newPart);
      }

      // 清除拖拽状态
      this.isDraggingOver = false;
      event.currentTarget?.classList?.remove("on-drag-over");
    },

    onDragOver(event) {
      console.log("进入");
      if (this.part.parts_type === "row") {
        this.isDraggingOver = true;
        event.currentTarget?.classList?.add("on-drag-over");
      }
    },

    onDragLeave(event) {
      console.log("离开");
      if (this.part.parts_type === "row") {
        this.isDraggingOver = false;
        event?.currentTarget?.classList?.remove("on-drag-over");
      }
    },
    deleteChildPart(part, childIndex) {
      // 删除子部件
      if (part?.id || part?.card_parts_no) {
        console.log("删除子部件", part);
        // 从数据库删除
        return this.$emit("delete-part", part);
      }
      if (this.part.children) {
        this.part.children.splice(childIndex, 1);
      }
    },
    handleClickCell(cell) {
      // 处理卡片点击事件
      console.log("卡片点击事件", cell);
      // 可以在这里添加自定义的点击处理逻辑
      this.$emit("select-part", this.part);
    },
  },
};
</script>

<style lang="scss" scoped>
.card-part {
  position: relative;
  // margin: 5px;
  border: 1px dashed #eee;
  border-radius: 4px;
  // background-color: #fff;
  min-height: 20px;
  transition: all 0.3s ease;
  // display: inline-block;
  --primary-color: #006cff;
  $primary-color: var(--primary-color);
  &.card-part-preview {
    border: none;
    background-color: transparent;
    box-shadow: none;
    border-radius: 0;
    min-height: auto;
    margin: 0;
    padding: 0;
  }
  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: opacity 0.3s;
    z-index: 10;
    border: 1px dashed transparent;
    &:active {
      transform: scale(0.99);
    }
    &:hover {
      opacity: 1;
      border-color: var(--primary-color);
      > .card-part-header {
        opacity: 1;
      }
    }
    .card-part-header {
      position: absolute;
      bottom: 0;
      left: 0;
      // transform: translateY(100%);

      padding: 2px 5px;
      border-radius: 2px;
      font-size: 12px;
      white-space: nowrap;
      transition: opacity 0.3s;
      z-index: 10;
      display: flex;
      align-items: center;
      background-color: rgba(0, 0, 0, 0.4);
      color: #fff;
      opacity: 0;
      &.selected {
        opacity: 1;
        background-color: var(--primary-color);
      }
      .el-icon-delete {
        font-size: 16px;
        cursor: pointer;
      }
    }
    .part-label {
      border-right: 1px solid #fff;
      padding-right: 10px;
      margin-right: 10px;
    }
  }

  &.card-part-selected {
    > .overlay {
      border-style: solid;
      border-width: 2px;
      border-color: var(--primary-color);
    }
  }

  &:hover .el-icon-delete {
    opacity: 1;
  }
}

.card-part-row {
  padding: 10px;
  min-height: 20px;
  display: block;
  position: relative;
  &.on-drag-over {
    > .overlay {
      border: 2px dashed var(--primary-color);
      background-color: rgba(64, 158, 255, 0.1);
    }
  }
  // width: 100%;
}
</style>
