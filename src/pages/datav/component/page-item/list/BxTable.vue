<template>
  <div
    class="bx-table"
    :style="setTableStyle"
    :class="{
      'scroll-animation': isVerticalScroll,
    }"
  >
    <div class="table-head">
      <div
        class="table-column"
        v-for="col in tableColumn"
        :key="col.columns"
        :style="{
          color: setStyle && setStyle.color ? 'var(--tbl_head_color,' + setStyle.color + ')' : null,
          'font-size': setStyle && setStyle['font-size'],
        }"
        :title="col.label"
      >
        {{ col.label }}
      </div>
      <div
        class="table-column row-button-box"
        :style="rowButtonBoxStyle"
        v-if="showRowButtons"
      >
        操作
      </div>
    </div>
    <div
      class="table-body-wrap"
      :style="{
        height: isVerticalScroll ? `${displayRowLimit * 40}px` : 'auto',
      }"
    >
      <div class="table-body">
        <div
          class="table-row"
          v-for="(item, index) in displayTableData"
          :key="index"
          :class="{ stripe: striped && index % 2 === 1 }"
        >
          <div
            class="table-column"
            v-for="col in tableColumn"
            :title="formatValue(item, col)"
            :key="col.columns"
            :style="[
              {
                color: setStyle && setStyle.color,
                'font-size': setStyle && setStyle['font-size'],
              },
              getElementStyle
            ]"
          >
            <el-image
              class="td-img"
              :src="getImagePath(formatValue(item, col))"
              :preview-src-list="[getImagePath(formatValue(item, col))]"
              v-if="col.col_type === 'Image' && formatValue(item, col)"
            >
            </el-image>
            <span v-else>
              {{ formatValue(item, col) }}
            </span>
          </div>
          <div
            class="table-column row-button-box"
            :style="rowButtonBoxStyle"
            v-if="showRowButtons"
          >
            <el-button
              type="text"
              size="mini"
              class="row-button"
              v-for="btn in setRowButtons"
              :key="btn.button_type"
              @click="onRowButtonClick(btn, item)"
            >{{ btn.button_name }}</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatStyleData } from "@/pages/datav/common/index.js";

export default {
  name: 'BxTable',
  props: {
    // 表格列配置
    tableColumn: {
      type: Array,
      default: () => []
    },
    // 表格数据
    displayTableData: {
      type: Array,
      default: () => []
    },
    // 样式配置
    setStyle: {
      type: Object,
      default: () => ({})
    },
    // 表格样式
    setTableStyle: {
      type: Object,
      default: () => ({})
    },
    // 是否显示斑马纹
    striped: {
      type: Boolean,
      default: false
    },
    // 是否显示操作按钮
    showRowButtons: {
      type: Boolean,
      default: false
    },
    // 操作按钮列表
    setRowButtons: {
      type: Array,
      default: () => []
    },
    // 操作按钮样式
    rowButtonBoxStyle: {
      type: Object,
      default: () => ({})
    },
    // 是否垂直滚动
    isVerticalScroll: {
      type: Boolean,
      default: false
    },
    // 显示行数限制
    displayRowLimit: {
      type: Number,
      default: 5
    },
    // 列表配置
    listConfig: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      scrollTimer: null,
    };
  },
  computed: {
    getElementStyle() {
      const config = this.listConfig;
      let style = {};
      if (config["element_style_json"]) {
        style = config["element_style_json"];
      }
      style = formatStyleData(style);
      return style;
    },
    // 滚动方向
    scrollDirection() {
      return this.listConfig?.animation_direction === "由上至下" ? "down" : "up";
    },
  },
  methods: {
    // 格式化值
    formatValue(row, col) {
      return row?.[col.columns];
    },
    // 获取图片路径
    getImagePath(path) {
      if (!path) return '';
      // 如果是完整的URL，直接返回
      if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
      }
      // 如果是相对路径，需要根据项目配置处理
      // 这里假设有一个全局的图片基础路径配置
      const baseUrl = process.env.VUE_APP_IMAGE_BASE_URL || '';
      return baseUrl + path;
    },
    // 行按钮点击事件
    onRowButtonClick(btn, item) {
      this.$emit('row-button-click', btn, item);
    },
    // 开始纵向滚动 - 性能优化版本
    startVerticalScroll() {
      if (!this.isVerticalScroll) return;
      this.stopVerticalScroll();

      const interval = Math.max(
        (this.listConfig?.animation_interval || 3) * 1000,
        2000
      );

      this.scrollTimer = setInterval(() => {
        this.performScrollStep();
      }, interval);
    },

    // 执行单步滚动 - 使用transform优化性能
    performScrollStep() {
      const tableBody = this.$el?.querySelector(".table-body");
      if (!tableBody || !tableBody.children.length) return;

      const rows = Array.from(tableBody.children);
      const rowHeight = rows[0]?.offsetHeight || 0;

      if (rowHeight === 0) return;

      // 使用transform实现平滑滚动，避免DOM重排
      const translateY =
        this.scrollDirection === "down" ? rowHeight : -rowHeight;
      const ANIMATION_DURATION = this.listConfig?.animation_duration || 2000;

      // 添加过渡效果
      tableBody.style.transition = `transform ${ANIMATION_DURATION}ms cubic-bezier(0.55, -0.55, 0.5, 1.2)`;
      tableBody.style.transform = `translateY(${translateY}px)`;

      // 动画完成后重置位置并调整DOM结构
      setTimeout(() => {
        this.resetScrollPosition(tableBody, rows);
      }, ANIMATION_DURATION);
    },

    // 重置滚动位置并调整DOM结构
    resetScrollPosition(tableBody, rows) {
      // 移除过渡效果，立即重置transform
      tableBody.style.transition = "none";
      tableBody.style.transform = "translateY(0)";

      // 使用DocumentFragment批量操作DOM，减少重排
      const fragment = document.createDocumentFragment();

      if (this.scrollDirection === "down") {
        // 向下滚动：将最后一行移到第一行（显示新的内容）
        const lastRow = rows[rows.length - 1];
        fragment.appendChild(lastRow);
        rows.slice(0, -1).forEach((row) => fragment.appendChild(row));
      } else {
        // 向上滚动：将第一行移到最后（显示之前的内容）
        const firstRow = rows[0];
        rows.slice(1).forEach((row) => fragment.appendChild(row));
        fragment.appendChild(firstRow);
      }

      // 一次性更新DOM
      tableBody.innerHTML = "";
      tableBody.appendChild(fragment);
    },

    // 停止纵向滚动
    stopVerticalScroll() {
      if (this.scrollTimer) {
        clearInterval(this.scrollTimer);
        this.scrollTimer = null;
      }
      // 清理滚动相关样式
      this.cleanupScrollStyles();
    },

    // 清理滚动样式，防止内存泄漏
    cleanupScrollStyles() {
      const tableBody = this.$el?.querySelector(".table-body");
      if (tableBody) {
        tableBody.style.transition = "";
        tableBody.style.transform = "";
        tableBody.style.willChange = "auto";
      }
    },
  },
  mounted() {
    // 组件挂载后启动滚动
    if (this.isVerticalScroll) {
      this.$nextTick(() => {
        this.startVerticalScroll();
      });
    }
  },
  beforeDestroy() {
    // 组件销毁前清理所有资源
    this.stopVerticalScroll();
    this.cleanupScrollStyles();

    // 清理可能的事件监听器
    if (this.$el) {
      const tableBody = this.$el.querySelector(".table-body");
      if (tableBody) {
        tableBody.removeEventListener(
          "transitionend",
          this.handleTransitionEnd
        );
      }
    }
  },
  watch: {
    // 监听滚动配置变化
    isVerticalScroll: {
      handler(newVal) {
        if (newVal) {
          this.$nextTick(() => {
            this.startVerticalScroll();
          });
        } else {
          this.stopVerticalScroll();
        }
      },
    },
    displayTableData: {
      handler(newVal, oldVal) {
        if (this.isVerticalScroll) {
          this.$nextTick(() => {
            this.startVerticalScroll();
          });
        }
      },
    },
  }
};
</script>

<style lang="scss" scoped>
.bx-table {
  color: var(--cell_color, #fff);

  .table-head,
  .table-row {
    display: flex;
    background-color: var(--cell_bg);

    &.stripe {
      background-color: var(--cell_bg2, rgba($color: #fff, $alpha: 0.1));
      color: var(--cell_color2);
    }

    .table-column {
      flex: 1;
      padding: 8px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      cursor: pointer;
      display: flex;
      align-items: center;

      span {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }

      .td-img {
        width: 100%;
        height: 100%;
        min-height: 50px;
        object-fit: cover;
        width: 120px;
        border-radius: 8px;
      }

      &.row-button-box {
        flex: 1.5;

        .el-button {
          min-width: 50px;
        }

        .row-button {
          min-width: 85px;
          padding: 0 12px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          background: linear-gradient(151.99deg, rgba(0, 122, 255, 1) 29.59%, rgba(4, 71, 171, 1) 294.82%);
          color: rgba(255, 255, 255, 1);
          font-size: 14px;
        }
      }
    }
  }

  .table-row {
    .table-column {
      // min-height: 86px;
    }
  }

  .table-head {
    color: var(--tbl_head_color);
    background-color: var(--tbl_head_bg, rgba($color: #F0F3F9, $alpha: 0.1));

    .table-column {
      color: var(--tbl_head_color);
    }
  }
}

// 滚动动画样式 - 性能优化版本
.scroll-animation {
  .table-body-wrap {
    overflow: hidden;
  }

  .table-body {
    position: relative;
    // 启用硬件加速
    transform: translateZ(0);
    will-change: transform;

    .table-row {
      transition: opacity 0.3s ease-out;
      opacity: 1;
      // 启用硬件加速
      transform: translateZ(0);

      // 顶部即将滚出视口的元素渐隐效果
      &:first-child {
        opacity: 0.8;
      }

      &:nth-child(2) {
        opacity: 0.9;
      }

      // 底部即将滚出视口的元素渐隐效果
      &:last-child {
        opacity: 0.8;
      }

      &:nth-last-child(2) {
        opacity: 0.9;
      }

      // 中间完全可见区域保持完全不透明
      &:nth-child(n + 3):nth-last-child(n + 3) {
        opacity: 1;
      }
    }
  }
}
</style>