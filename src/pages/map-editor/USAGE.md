# 地图编辑器使用指南

## 🚀 快速开始

### 1. 添加路由配置

在你的路由文件中添加以下配置：

```javascript
// src/router/index.js 或 src/router.js
import { mapEditorRoute } from '@/pages/map-editor/router-config.js'

const routes = [
  // ... 其他路由
  mapEditorRoute
]
```

### 2. 访问页面

启动项目后，在浏览器中访问：
```
http://localhost:8080/map-editor
```

### 3. 导入测试数据

1. 点击页面右上角的"导入数据"按钮
2. 选择项目中的 `src/pages/map-editor/demo-data.json` 文件
3. 点击"确定导入"

## 📋 功能说明

### 地图配置

- **底图URL**: 设置地图背景图片的URL地址
- **填充方式**: 
  - `contain`: 保持比例，完整显示图片
  - `cover`: 保持比例，填满容器
  - `100% 100%`: 拉伸填满容器
- **坐标字段**: 设置标记点的X、Y坐标字段名

### 标记点编辑

1. **可编辑标记点**: 只有包含 `_poi_info.marker_edit_cfg.update_request_no` 的标记点才能编辑
2. **拖拽操作**: 鼠标按住标记点拖拽到新位置
3. **触摸支持**: 移动端支持触摸拖拽
4. **边界限制**: 标记点位置会被限制在地图容器范围内

### 保存机制

- 系统会自动记录位置变更
- 按 `update_request_no` 分组保存，便于后端批量处理
- 支持取消所有更改，恢复到原始位置

## 🔧 自定义配置

### 修改默认配置

在 `src/pages/map-editor/index.vue` 中修改 `mapConfig` 对象：

```javascript
mapConfig: {
  base_image: '/path/to/your/map.jpg',  // 你的地图图片
  base_image_fill_method: 'contain',
  x_col: 'your_x_field',               // 你的X坐标字段
  y_col: 'your_y_field'                // 你的Y坐标字段
}
```

### 自定义标记点样式

在 `src/pages/map-editor/components/DraggableMarker.vue` 中修改样式：

```scss
.marker-icon {
  width: 40px;        // 修改标记点大小
  height: 40px;
  // ... 其他样式
}
```

### 集成后端API

在 `saveChangesToServer` 方法中替换模拟代码：

```javascript
async saveChangesToServer(changes) {
  // 替换为你的API调用
  const response = await this.$http.post('/api/markers/update', {
    changes: changes
  })
  return response.data
}
```

## 📊 数据格式

### 标记点数据结构

```javascript
{
  id: "唯一标识",
  name: "标记点名称",
  x_position: 100,           // X坐标（可自定义字段名）
  y_position: 150,           // Y坐标（可自定义字段名）
  icon_url: "图标URL",       // 可选
  // 其他业务字段...
  _poi_info: {
    marker_edit_cfg: {
      update_request_no: "更新请求号"  // 必需，用于标识可编辑
    }
  }
}
```

### API请求格式

保存时会按以下格式发送数据：

```javascript
[
  {
    update_request_no: "req_001",
    markers: [
      {
        id: "device_001",
        originalPosition: { x: 100, y: 150 },
        newPosition: { x: 120, y: 180 }
      }
    ]
  }
]
```

## 🎨 样式定制

### 主题色修改

在组件样式中搜索 `#409eff` 并替换为你的主题色：

```scss
// 例如替换为红色主题
.marker-icon {
  border-color: #f56c6c;  // 替换 #409eff
}
```

### 响应式断点

默认在 1200px 以下切换为移动端布局，可在样式中修改：

```scss
@media (max-width: 768px) {  // 修改断点
  // 移动端样式
}
```

## 🐛 常见问题

### Q: 标记点无法拖拽？
A: 检查标记点数据是否包含 `_poi_info.marker_edit_cfg.update_request_no` 字段

### Q: 保存失败？
A: 检查 `saveChangesToServer` 方法中的API调用是否正确

### Q: 地图图片不显示？
A: 检查 `base_image` URL是否正确，确保图片可访问

### Q: 移动端拖拽不流畅？
A: 确保容器没有设置 `touch-action: none`，并检查是否有其他触摸事件冲突

## 📞 技术支持

如有问题，请检查：
1. 浏览器控制台是否有错误信息
2. 网络请求是否正常
3. 数据格式是否符合要求
4. 路由配置是否正确