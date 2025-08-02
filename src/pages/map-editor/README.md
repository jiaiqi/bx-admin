# 地图标记点编辑器

## 功能介绍

这是一个独立的地图标记点编辑器页面，从原有的地图组件中提取了拖拽编辑功能，支持以下特性：

### ✨ 主要功能

- **🖱️ 拖拽编辑**: 支持鼠标和触摸拖拽移动标记点位置
- **💾 批量保存**: 支持批量保存位置更改，按 `update_request_no` 分组处理
- **🔄 撤销恢复**: 支持取消更改，恢复到原始位置
- **📊 实时统计**: 显示总标记点数、可编辑数量、已修改数量
- **📱 响应式设计**: 适配桌面端和移动端
- **📁 数据导入**: 支持JSON格式数据导入

### 🏗️ 组件结构

```
src/pages/map-editor/
├── index.vue                    # 主页面入口
├── components/
│   ├── MapEditorView.vue        # 地图编辑视图组件
│   └── DraggableMarker.vue      # 可拖拽标记点组件
└── README.md                    # 说明文档
```

### 📋 数据格式

标记点数据格式示例：

```json
[
  {
    "id": "1",
    "name": "设备A",
    "x_position": 100,
    "y_position": 150,
    "icon_url": "",
    "_poi_info": {
      "marker_edit_cfg": {
        "update_request_no": "req_001"
      }
    }
  }
]
```

### 🔧 配置说明

- `x_col`: X坐标字段名，默认为 `x_position`
- `y_col`: Y坐标字段名，默认为 `y_position`
- `base_image`: 地图底图URL
- `base_image_fill_method`: 底图填充方式（contain/cover/100% 100%）

### 🚀 使用方法

1. **路由配置**：在路由中添加页面路径
2. **访问页面**：通过浏览器访问 `/map-editor`
3. **导入数据**：点击"导入数据"按钮上传JSON格式的标记点数据
4. **编辑位置**：拖拽标记点到新位置
5. **保存更改**：点击"保存更改"按钮提交修改

### 🎯 技术特点

- **Vue 2.7** + **Element UI** 技术栈
- **组合式API风格**，代码结构清晰
- **响应式数据管理**，实时更新UI状态
- **事件驱动架构**，组件间解耦
- **移动端适配**，支持触摸操作

### 🔗 路由配置示例

```javascript
// 在路由文件中添加
{
  path: '/map-editor',
  name: 'MapEditor',
  component: () => import('@/pages/map-editor/index.vue'),
  meta: {
    title: '地图编辑器'
  }
}
```

### 📝 注意事项

1. 只有配置了 `_poi_info.marker_edit_cfg.update_request_no` 的标记点才可编辑
2. 标记点位置会被限制在地图容器范围内
3. 保存时会按 `update_request_no` 分组处理，便于后端批量更新
4. 建议在实际使用时替换演示数据和API接口

### 🛠️ 扩展建议

- 添加标记点类型筛选功能
- 支持批量选择和移动
- 添加网格对齐功能
- 支持标记点属性编辑
- 添加操作历史记录