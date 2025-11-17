<template>
  <div
    class="bx-table"
    :style="[
      setTableStyle,
      {
        '--tbl-border-color': listConfig.tbl_border_color || '',
      },
    ]"
    :class="{
      'scroll-animation': isVerticalScroll,
    }"
  >
    <div class="table-head">
      <div
        class="table-column"
        v-for="(col, tbh) in tableColumn"
        :key="col.columns"
        :style="{
          color:
            setStyle && setStyle.color
              ? 'var(--tbl_head_color,' + setStyle.color + ')'
              : null,
          'font-size': setStyle && setStyle['font-size'],
          width: col.width || '',
          flex: col.width ? undefined : 1,
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
              getElementStyle,
              {
                color: setStyle && setStyle.color,
                'font-size': setStyle && setStyle['font-size'],
                width: col.width || '',
                flex: col.width ? undefined : 1,
                '--first-col-bg':
                  (index === 0 && listConfig.tbl_first_col_bg) || '',
                '--first-col-color':
                  (index === 0 && listConfig.tbl_first_col_color) || '',
                '--tbl-border-color': listConfig.tbl_border_color || '',
              },
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
              >{{ btn.button_name }}</el-button
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatStyleData } from "@/pages/datav/common/index.js";
import verticalScrollMixin from "@/components/mixin/vertical-scroll-mixin.js";

export default {
  name: "BxTable",
  mixins: [verticalScrollMixin],
  props: {
    // 表格列配置
    tableColumn: {
      type: Array,
      default: () => [],
    },
    // 表格数据
    displayTableData: {
      type: Array,
      default: () => [],
    },
    // 样式配置
    setStyle: {
      type: Object,
      default: () => ({}),
    },
    // 表格样式
    setTableStyle: {
      type: Object,
      default: () => ({}),
    },
    // 是否显示斑马纹
    striped: {
      type: Boolean,
      default: false,
    },
    // 是否显示操作按钮
    showRowButtons: {
      type: Boolean,
      default: false,
    },
    // 操作按钮列表
    setRowButtons: {
      type: Array,
      default: () => [],
    },
    // 操作按钮样式
    rowButtonBoxStyle: {
      type: Object,
      default: () => ({}),
    },
    // 是否垂直滚动
    isVerticalScroll: {
      type: Boolean,
      default: false,
    },
    // 显示行数限制
    displayRowLimit: {
      type: Number,
      default: 5,
    },
    // 列表配置
    listConfig: {
      type: Object,
      default: () => ({}),
    },
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
      return this.listConfig?.animation_direction === "由上至下"
        ? "down"
        : "up";
    },
  },
  methods: {
    // 格式化值
    formatValue(row, col) {
      return row?.[col.columns];
    },
    // 获取图片路径
    getImagePath(path) {
      if (!path) return "";
      // 如果是完整的URL，直接返回
      if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
      }
      // 如果是相对路径，需要根据项目配置处理
      // 这里假设有一个全局的图片基础路径配置
      const baseUrl = process.env.VUE_APP_IMAGE_BASE_URL || "";
      return baseUrl + path;
    },
    // 行按钮点击事件
    onRowButtonClick(btn, item) {
      this.$emit("row-button-click", btn, item);
    },
    // 开始纵向滚动 - 使用通用混入
    startTableVerticalScroll() {
      if (!this.isVerticalScroll) return;

      const config = {
        interval: Math.max(
          (this.listConfig?.animation_interval || 3) * 1000,
          2000
        ),
        direction: this.scrollDirection,
        duration: this.listConfig?.animation_duration || 2000,
      };

      const options = {
        containerSelector: ".table-body",
        containerType: "selector",
        rowSelector: ".table-row",
      };

      this.startVerticalScroll(config, options);
    },

    // 停止纵向滚动 - 使用通用混入
    stopTableVerticalScroll() {
      this.stopVerticalScroll();
    },
  },
  mounted() {
    // 组件挂载后启动滚动
    if (this.isVerticalScroll) {
      this.$nextTick(() => {
        this.startTableVerticalScroll();
      });
    }
  },
  watch: {
    // 监听滚动配置变化
    isVerticalScroll: {
      handler(newVal) {
        if (newVal) {
          this.$nextTick(() => {
            this.startTableVerticalScroll();
          });
        } else {
          this.stopTableVerticalScroll();
        }
      },
    },
    displayTableData: {
      handler(newVal, oldVal) {
        if (this.isVerticalScroll) {
          this.$nextTick(() => {
            this.startTableVerticalScroll();
          });
        }
      },
    },
  },
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
          background: linear-gradient(
            151.99deg,
            rgba(0, 122, 255, 1) 29.59%,
            rgba(4, 71, 171, 1) 294.82%
          );
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
    background-color: var(--tbl_head_bg, rgba($color: #f0f3f9, $alpha: 0.1));

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
