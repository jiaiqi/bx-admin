<script setup>
import CardGroupCell from "../../../pages/datav/component/page-item/card-group-cell/card-group-cell.vue";
import { computed } from "vue";

const emit = defineEmits(["onButtonClick"]);
const props = defineProps({
  readOnly: {
    type: Boolean,
    default: false,
  },
  gridData: {
    type: Array,
    default: () => {
      return [];
    },
  },
  rowButtons: {
    type: Array,
    default: () => {
      return [];
    },
  },
  pageItem: {
    type: Object,
    default: () => {
      return {};
    },
  },
  cellsLayoutJson: {
    type: Object,
    default: () => {
      return {};
    },
  },
  cardLayoutJson: {
    type: Object,
    default: () => {
      // return {
      //   "layout_type": "表格",
      //   "cols_num": "4",
      //   "rows_max": 2,
      //   "more_position": "标题后",
      //   "gap_style": "gap",
      //   "style_json": {
      //     "gap": "6px",
      //     "border_radius": "20rpx",
      //     "display": "grid"
      //   }
      // }
    },
  },
  comColMap: {
    type: Object,
    default: () => {
      return {};
    },
  },
});

const onClickCell = (item) => {
  console.log("onClickCell:::", item);
};

const onClickBlock = (item) => {
  console.log("onClickBlock:::", item);
};

const onDataUpdate = (item) => {
  console.log("onDataUpdate:::", item);
};
const onClickBtn = (btn, data) => {
  console.log("onClickBtn:::", btn, data);
  this.$emit("onButtonClick", btn, data);
};

const comColMapRun = computed(() => {
  return {};
});
</script>

<template>
  <div class="card-list">
    <cardGroupCell
      class="card-item"
      :key="index"
      ref="cardGroupCell"
      :pageItem="pageItem"
      :cellsLayout="[cellsLayoutJson]"
      :cellData="item"
      :comColMap="comColMapRun"
      :cardLayout="cardLayoutJson || null"
      @on-click-cell="onClickCell"
      @on-click-block="onClickBlock"
      @on-click-icon="onClickBlock"
      @data-updated="onDataUpdate"
      v-for="(item, index) in gridData"
      @click.native="onClickSubBlock(item)"
    >
      <template #footer>
        <slot name="footer" :data="item"></slot>
      </template>
    </cardGroupCell>
  </div>
</template>

<style lang="scss" scoped>
.card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  grid-gap: 10px;
  //padding: 10px 20px;
  padding: 6px;
  // align-items: flex-start;
  width: 100%;
  height: 100%;
  overflow: auto;
  ::v-deep .footer-btn {
    width: 100%;
    display: flex;
    flex: 1;
    align-items: flex-end;
    justify-content: flex-end;
    padding:10px;
    .footer-btn-item {
      margin-left: 10px;
    }
  }

  ::v-deep .card-item .bx-card-cell:hover {
    box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.08),
      0 3px 6px 0 rgba(0, 0, 0, 0.06), 0 5px 12px 4px rgba(0, 0, 0, 0.04);
  }
}
</style>
