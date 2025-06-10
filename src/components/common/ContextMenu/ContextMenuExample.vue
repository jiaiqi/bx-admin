<template>
  <div class="context-menu-example">
    <h2>右键菜单使用示例</h2>
    
    <!-- 示例1: 使用自定义指令 -->
    <div 
      class="example-box"
      v-context-menu="menuConfig1"
    >
      <p>右键点击这里 - 使用自定义指令</p>
    </div>
    
    <!-- 示例2: 动态菜单项 -->
    <div 
      class="example-box"
      v-context-menu="menuConfig2"
    >
      <p>右键点击这里 - 动态菜单项</p>
    </div>
    
    <!-- 示例3: 编程式调用 -->
    <div 
      class="example-box"
      @contextmenu="showProgrammaticMenu"
    >
      <p>右键点击这里 - 编程式调用</p>
    </div>
    
    <div class="result">
      <h3>操作结果:</h3>
      <p>{{ lastAction }}</p>
    </div>
  </div>
</template>

<script>
import { showContextMenu } from '@/components/common/ContextMenu/context-menu';

export default {
  name: 'ContextMenuExample',
  data() {
    return {
      lastAction: '暂无操作',
      dynamicItems: [
        { label: '选项A', action: 'optionA', icon: 'ri:star-line' },
        { label: '选项B', action: 'optionB', icon: 'ri:heart-line' },
      ]
    };
  },
  computed: {
    menuConfig1() {
      return {
        menuItems: [
          {
            label: '复制',
            icon: 'ri:file-copy-2-fill',
            action: 'copy',
            shortcut: 'Ctrl+C'
          },
          {
            label: '粘贴',
            icon: 'ri:file-copy-2-line',
            action: 'paste',
            shortcut: 'Ctrl+V'
          },
          { divider: true },
          {
            label: '删除',
            icon: 'ri:delete-bin-line',
            action: 'delete',
            shortcut: 'Delete'
          }
        ],
        onItemClick: this.handleMenuClick,
        context: { type: 'example1', data: 'some data' }
      };
    },
    menuConfig2() {
      return {
        menuItems: [
          ...this.dynamicItems,
          { divider: true },
          {
            label: '添加选项',
            icon: 'ri:add-line',
            action: 'addOption'
          }
        ],
        onItemClick: this.handleMenuClick,
        context: { type: 'example2' },
        beforeShow: (event, context) => {
          console.log('菜单即将显示', context);
          return true; // 返回false可以阻止菜单显示
        }
      };
    }
  },
  methods: {
    handleMenuClick(item, context, event, el) {
      this.lastAction = `点击了 "${item.label}" (${item.action}) - 上下文: ${JSON.stringify(context)}`;
      
      if (item.action === 'addOption') {
        this.dynamicItems.push({
          label: `选项${String.fromCharCode(65 + this.dynamicItems.length)}`,
          action: `option${String.fromCharCode(65 + this.dynamicItems.length)}`,
          icon: 'ri:star-line'
        });
      }
    },
    
    showProgrammaticMenu(event) {
      event.preventDefault();
      
      showContextMenu({
        x: event.clientX,
        y: event.clientY,
        menuItems: [
          {
            label: '编程式菜单',
            icon: 'ri:code-line',
            action: 'programmatic'
          },
          {
            label: '当前时间',
            icon: 'ri:time-line',
            action: 'showTime'
          }
        ],
        onItemClick: (item, context) => {
          if (item.action === 'showTime') {
            this.lastAction = `当前时间: ${new Date().toLocaleString()}`;
          } else {
            this.lastAction = `编程式调用: ${item.label}`;
          }
        },
        context: { type: 'programmatic' }
      });
    }
  }
};
</script>

<style scoped>
.context-menu-example {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.example-box {
  border: 2px dashed #ccc;
  padding: 40px;
  margin: 20px 0;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.example-box:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.result {
  margin-top: 30px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.result h3 {
  margin-top: 0;
  color: #333;
}

.result p {
  margin: 10px 0 0 0;
  color: #666;
  font-family: monospace;
  background-color: #fff;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ddd;
}
</style>