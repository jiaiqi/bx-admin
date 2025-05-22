<template>
  <div 
    class="card-part" 
    :class="{
      'card-part-row': part.parts_type === 'row',
      'card-part-selected': isSelected
    }"
    @dragover.prevent
    @drop="onDrop($event, part)"
    @click.stop="$emit('select-part', part)"
  >
    <!-- 根据不同类型渲染不同内容 -->
    <template v-if="part.parts_type === 'row'">
      <div class="card-part-header">
        <span class="part-label">{{ part.label }}</span>
        <i class="el-icon-delete" @click.stop="$emit('delete-part', index)"></i>
      </div>
      <div class="card-part-content">
        <card-part 
          v-for="(childPart, childIndex) in part.children" 
          :key="childIndex" 
          :part="childPart" 
          :index="childIndex"
          @delete-part="deleteChildPart(childIndex)"
          @select-part="$emit('select-part', $event)"
        />
      </div>
    </template>
    
    <template v-else>
      <div class="card-part-wrapper">
        <card-cell-part-without-card-group
          :cell-item="part"
          :page-item="{}"
          @on-click-cell="handleClickCell"
        />
        <i class="el-icon-delete" @click.stop="$emit('delete-part', index)"></i>
      </div>
    </template>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue2";
import CardCellPartWithoutCardGroup from "@/pages/datav/component/page-item/card-group-cell/card-cell-part-without-card-group.vue";

export default {
  name: "CardPart",
  components: {
    Icon,
    CardCellPartWithoutCardGroup
  },
  props: {
    part: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },
  computed: {
    isSelected() {
      // 获取根组件实例
      let root = this;
      while (root.$parent && root.$parent.$parent) {
        root = root.$parent;
      }
      // 判断当前部件是否被选中
      return root.selectedPart === this.part;
    }
  },
  methods: {
    onDrop(event, part) {
      event.stopPropagation();
      const partData = JSON.parse(event.dataTransfer.getData("part"));
      
      // 如果是拖放到row类型的卡片部件中
      if (part && part.parts_type === 'row') {
        if (!part.children) {
          this.$set(part, 'children', []);
        }
        // 创建新的部件实例，避免引用原始对象
        const newPart = JSON.parse(JSON.stringify(partData));
        
        // 如果拖入的也是row类型，初始化children数组
        if (newPart.parts_type === 'row') {
          newPart.children = [];
        }
        Object.keys(newPart).forEach((key) => {
          if (key.startsWith("_default_")) {
            newPart[key.replace('_default_','')] = newPart[key];
            console.log('newPart',newPart);
            
            delete newPart[key];
          }
        });
        
        part.children.push(newPart);
      }
    },
    deleteChildPart(childIndex) {
      if (this.part.children) {
        this.part.children.splice(childIndex, 1);
      }
    },
    handleClickCell(cell) {
      // 处理卡片点击事件
      console.log('卡片点击事件', cell);
      // 可以在这里添加自定义的点击处理逻辑
      this.$emit('select-part', this.part);
    }
  }
};
</script>

<style lang="scss" scoped>
.card-part {
  position: relative;
  margin: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  min-height: 30px;
  transition: all 0.3s;
  display: inline-block;
  &:hover {
    border-color: #409eff;
    box-shadow: 0 0 5px rgba(64, 158, 255, 0.3);
  }
  
  &:active {
    transform: scale(0.99);
  }
  
  &.card-part-selected {
    border: 2px solid #409eff;
    box-shadow: 0 0 8px rgba(64, 158, 255, 0.5);
  }
  
  .el-icon-delete {
    position: absolute;
    top: 5px;
    right: 5px;
    font-size: 16px;
    color: #f56c6c;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.3s;
    z-index: 10;
  }
  
  &:hover .el-icon-delete {
    opacity: 1;
  }
}

.card-part-row {
  padding: 10px;
  border: 1px dashed #409eff;
  background-color: rgba(64, 158, 255, 0.1);
  min-height: 50px;
  display: block;
  // width: 100%;
  .card-part-header {
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 1px solid #eee;
    font-weight: bold;
  }
  
  .card-part-content {
    display: flex;
    flex-wrap: wrap;
    // flex-direction: column;
  }
}

.card-part-text,
.card-part-icon,
.card-part-image,
.card-part-rate,
.card-part-progress,
.card-part-rich-text,
.card-part-default,
.card-part-wrapper {
  padding: 10px;
  min-height: 20px;
  position: relative;
}

.card-part-image {
  .image-placeholder {
    width: 100px;
    height: 100px;
    background-color: #f5f5f5;
    border: 1px dashed #d9d9d9;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;

    &:before {
      content: "+";
      font-size: 40px;
      color: #d9d9d9;
    }
  }
  
  img {
    max-width: 100%;
    max-height: 200px;
  }
}

.card-part-icon {
  font-size: 24px;
}
</style>