// 简单的拖拽状态管理
const dragStore = {
  currentDragType: null,
  
  // 设置当前拖拽的组件类型
  setDragType(type) {
    this.currentDragType = type;
  },
  
  // 获取当前拖拽的组件类型
  getDragType() {
    return this.currentDragType;
  },
  
  // 清除当前拖拽的组件类型
  clearDragType() {
    this.currentDragType = null;
  }
};

export default dragStore;