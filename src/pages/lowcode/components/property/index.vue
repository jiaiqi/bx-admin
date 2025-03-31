<template>
  <div class="property-panel" v-if="currentComponent">
    <h3>{{ currentComponent.name }} 属性</h3>
    <el-form label-position="top">
      <!-- 通用属性 -->
      <el-form-item label="组件ID">
        <el-input v-model="currentComponent.id" disabled></el-input>
      </el-form-item>
      <el-form-item label="组件名称">
        <el-input v-model="currentComponent.name"></el-input>
      </el-form-item>
      
      <!-- 样式属性 -->
      <template v-if="currentComponent.props">
        <el-form-item label="宽度" v-if="currentComponent.props.width !== undefined">
          <el-input v-model="currentComponent.props.width"></el-input>
        </el-form-item>
        <el-form-item label="高度" v-if="currentComponent.props.height !== undefined">
          <el-input v-model="currentComponent.props.height"></el-input>
        </el-form-item>
        <el-form-item label="背景颜色" v-if="currentComponent.props.backgroundColor !== undefined">
          <el-color-picker v-model="currentComponent.props.backgroundColor"></el-color-picker>
        </el-form-item>
      </template>
      
      <!-- 特定组件属性 -->
      <template v-if="currentComponent.type === 'button'">
        <el-form-item label="按钮类型">
          <el-select v-model="buttonType" @change="updateButtonProps">
            <el-option label="默认" value="default"></el-option>
            <el-option label="主要" value="primary"></el-option>
            <el-option label="成功" value="success"></el-option>
            <el-option label="警告" value="warning"></el-option>
            <el-option label="危险" value="danger"></el-option>
          </el-select>
        </el-form-item>
      </template>
    </el-form>
  </div>
  <div class="empty-tip" v-else>
    <p>请选择一个组件进行编辑</p>
  </div>
</template>

<script>
export default {
  name: "property-panel",
  props: {
    currentId: {
      type: [String, Number],
      default: "",
    },
    components: {
      type: Array,
      default: () => [],
    }
  },
  data() {
    return {
      buttonType: "default",
    }
  },
  computed: {
    currentComponent() {
      if (!this.currentId || !this.components.length) return null;
      return this.findComponentById(this.currentId, this.components);
    }
  },
  methods: {
    findComponentById(id, list = []) {
      for (const item of list) {
        if (item.id === id) {
          return item;
        }
        if (item.children && item.children.length) {
          const found = this.findComponentById(id, item.children);
          if (found) return found;
        }
      }
      return null;
    },
    updateButtonProps() {
      if (!this.currentComponent) return;
      if (!this.currentComponent.props) {
        this.$set(this.currentComponent, 'props', {});
      }
      this.$set(this.currentComponent.props, 'type', this.buttonType);
      this.$emit('change', this.components);
    }
  },
  watch: {
    currentComponent: {
      immediate: true,
      handler(val) {
        if (val && val.type === 'button' && val.props && val.props.type) {
          this.buttonType = val.props.type;
        } else {
          this.buttonType = 'default';
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
.property-panel {
  padding: 15px;
  height: 100%;
  overflow-y: auto;
  
  h3 {
    margin-top: 0;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
  }
}

.empty-tip {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #999;
}
</style>