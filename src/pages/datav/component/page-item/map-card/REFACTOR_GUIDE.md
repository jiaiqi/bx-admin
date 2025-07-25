# CustomMapView 组件重构方案

## 重构目标
将原本1500+行的单一组件拆分为多个可复用的组合式函数和子组件，提高代码的可维护性、可读性和可测试性。

## 重构前的问题分析

### 1. 组件过于庞大
- 原组件超过1500行代码
- 包含多种不同的功能逻辑
- 难以理解和维护

### 2. 职责不清晰
- 地图配置、弹窗逻辑、树形数据、标记点管理等多种职责混合
- 函数之间耦合度高
- 状态管理复杂

### 3. 代码重复
- 多处相似的位置计算逻辑
- 重复的事件处理代码
- 相似的样式计算

### 4. 难以测试
- 逻辑与UI紧密耦合
- 难以进行单元测试
- 调试困难

## 重构方案

### 1. 组合式函数拆分

#### `useMapConfig.js` - 地图配置管理
**职责：**
- 管理地图配置数据
- 处理底图URL计算
- 提供配置相关的计算属性

**主要功能：**
```javascript
- mapJson: 地图配置数据
- cardUnitJson: 卡片单元配置
- createBaseImageComputed: 创建底图计算属性
```

#### `usePopover.js` - 弹窗逻辑管理
**职责：**
- 管理弹窗的显示/隐藏状态
- 处理弹窗位置计算
- 管理弹窗相关的事件监听

**主要功能：**
```javascript
- activeMarker: 当前激活的标记点
- popoverPosition: 弹窗位置信息
- showPopover/hidePopover: 显示/隐藏弹窗
- calculatePopoverPosition: 位置计算
- 事件监听器管理
```

#### `useTreeData.js` - 树形数据管理
**职责：**
- 管理树形数据的状态
- 处理节点的展开/折叠
- 管理数据的选择状态

**主要功能：**
```javascript
- treeData: 树形数据
- selectedTreeData: 选中的数据
- expandedNodes: 展开的节点
- 数据获取和处理方法
```

#### `useMarkers.js` - 标记点管理
**职责：**
- 管理标记点数据
- 处理标记点的位置计算
- 管理标记点的样式和图标

**主要功能：**
```javascript
- markerList: 标记点列表
- 位置计算方法
- 样式计算方法
- 图标处理方法
```

#### `useBuildingView.js` - 建筑物视图管理
**职责：**
- 管理建筑物视图的状态
- 处理视图切换逻辑
- 管理建筑物相关数据

**主要功能：**
```javascript
- isBuildingView: 是否为建筑物视图
- buildingInfo: 建筑物信息
- 视图切换方法
```

#### `useSidebar.js` - 侧边栏管理
**职责：**
- 管理侧边栏的折叠状态
- 处理侧边栏位置计算

**主要功能：**
```javascript
- isCollapsed: 折叠状态
- left: 位置计算
- toggleCollapsed: 切换折叠状态
```

### 2. 子组件拆分

#### `BuildingTreeView.vue` - 建筑物树形视图
- 专门处理建筑物视图的树形数据展示
- 独立的事件处理逻辑

#### `NormalTreeView.vue` - 普通树形视图
- 处理普通视图的侧边栏树形数据
- 包含折叠/展开功能

#### `LabelMarkers.vue` - 标签类型标记点
- 专门渲染标签类型的标记点
- 独立的样式和事件处理

#### `IconMarkers.vue` - 图标类型标记点
- 专门渲染图标类型的标记点
- 独立的图标处理逻辑

#### `PopoverComponent.vue` - 弹窗组件
- 独立的弹窗渲染逻辑
- 可复用的弹窗组件

### 3. 主组件简化

重构后的主组件 `CustomMapViewRefactored.vue` 主要职责：
- 组合各个组合式函数
- 协调子组件之间的交互
- 处理生命周期钩子
- 统一的事件处理

## 重构优势

### 1. 代码可维护性提升
- 每个文件职责单一，易于理解
- 修改某个功能时影响范围小
- 代码结构清晰，便于新人理解

### 2. 可复用性增强
- 组合式函数可以在其他组件中复用
- 子组件可以独立使用
- 逻辑与UI分离，便于复用

### 3. 可测试性改善
- 组合式函数可以独立测试
- 逻辑与UI分离，便于单元测试
- 每个函数职责明确，测试用例清晰

### 4. 开发效率提升
- 多人协作时可以并行开发不同模块
- 调试时可以快速定位问题
- 新功能开发时可以复用现有逻辑

## 迁移建议

### 1. 渐进式迁移
- 可以先创建组合式函数，在原组件中使用
- 逐步将逻辑迁移到组合式函数中
- 最后完成子组件的拆分

### 2. 测试验证
- 每个阶段都要进行充分测试
- 确保功能完整性不受影响
- 性能测试确保没有性能退化

### 3. 文档更新
- 更新组件使用文档
- 添加组合式函数的使用说明
- 提供迁移指南

## 文件结构

```
map-card/
├── CustomMapView.vue                 # 原组件（保留）
├── CustomMapViewRefactored.vue       # 重构后的主组件
├── composables/                      # 组合式函数目录
│   ├── useMapConfig.js              # 地图配置管理
│   ├── usePopover.js                # 弹窗逻辑管理
│   ├── useTreeData.js               # 树形数据管理
│   ├── useMarkers.js                # 标记点管理
│   ├── useBuildingView.js           # 建筑物视图管理
│   └── useSidebar.js                # 侧边栏管理
├── components/                       # 子组件目录
│   ├── BuildingTreeView.vue         # 建筑物树形视图
│   ├── NormalTreeView.vue           # 普通树形视图
│   ├── LabelMarkers.vue             # 标签类型标记点
│   ├── IconMarkers.vue              # 图标类型标记点
│   └── PopoverComponent.vue         # 弹窗组件
└── MultiSourceMarkers.vue           # 多来源标记物组件（保留）
```

这种重构方案将大大提升代码的质量和可维护性，使团队能够更高效地开发和维护地图相关功能。