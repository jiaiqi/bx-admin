<template>
  <div class="transfer-panel">
    <p class="transfer-panel__header">
      <el-checkbox
        v-model="allChecked"
        @change="handleAllCheckedChange"
        :indeterminate="isIndeterminate"
      >
        <span class="transfer-panel__title">
          {{ title || "" }}
        </span>
        <span>{{ checkedSummary }}</span>
      </el-checkbox>
    </p>

    <div :class="['transfer-panel__body', hasFooter ? 'is-with-footer' : '']">
      <el-input
        class="transfer-panel__filter"
        v-model="query"
        size="small"
        :placeholder="placeholder"
        @mouseenter.native="inputHover = true"
        @mouseleave.native="inputHover = false"
        v-if="filterable"
      >
        <i
          slot="prefix"
          style="cursor: pointer"
          title="清空"
          :class="['el-input__icon', 'el-icon-' + inputIcon]"
          @click="clearQuery"
        ></i>
      </el-input>
      <div class="pane-content">
        <div class="pane-content__data">
          <el-tree
            ref="tree"
            :data="filteredData"
            :props="props"
            :node-key="keyProp"
            show-checkbox
            :lazy="false"
            :check-strictly="checkStrictly"
            :load="loadNode"
            @check="handleCheckChange"
            :default-expand-all="defaultExpandedAll"
            v-if="isTree"
          />
          <template v-else>
            <el-checkbox-group
              v-model="checked"
              v-show="!hasNoMatch && data.length > 0"
              :class="{ 'is-filterable': filterable }"
              class="transfer-panel__list"
            >
              <el-checkbox
                class="transfer-panel__item"
                :label="item[keyProp]"
                :disabled="item[disabledProp]"
                :key="item[keyProp]"
                v-for="item in filteredData"
              >
                <option-content :option="item"></option-content>
              </el-checkbox>
            </el-checkbox-group>
            <p class="transfer-panel__empty" v-show="hasNoMatch">
              {{ t("el.transfer.noMatch") }}
            </p>
            <p
              class="transfer-panel__empty"
              v-show="data.length === 0 && !hasNoMatch"
            >
              {{ t("el.transfer.noData") }}
            </p>
          </template>
        </div>
        <div class="transfer-panel__footer" v-if="hasFooter">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ElCheckboxGroup from "element-ui/packages/checkbox-group";
import ElCheckbox from "element-ui/packages/checkbox";
import ElInput from "element-ui/packages/input";
import Locale from "element-ui/src/mixins/locale";

export default {
  mixins: [Locale],
  name: "BxTransferPanel",
  componentName: "BxTransferPanel",
  components: {
    ElCheckboxGroup,
    ElCheckbox,
    ElInput,
    OptionContent: {
      props: {
        option: Object,
      },
      render(h) {
        const getParent = (vm) => {
          if (vm.$options.componentName === "BxTransferPanel") {
            return vm;
          } else if (vm.$parent) {
            return getParent(vm.$parent);
          } else {
            return vm;
          }
        };
        const panel = getParent(this);
        const transfer = panel.$parent || panel;
        return panel.renderContent ? (
          panel.renderContent(h, this.option)
        ) : transfer.$scopedSlots.default ? (
          transfer.$scopedSlots.default({ option: this.option })
        ) : (
          <span>
            {this.option[panel.labelProp] || this.option[panel.keyProp]}
          </span>
        );
      },
    },
  },

  props: {
    data: {
      type: Array,
      default() {
        return [];
      },
    },
    renderContent: Function,
    placeholder: String,
    title: String,
    filterable: Boolean,
    filterMethod: Function,
    defaultChecked: {
      type: Array,
      default() {
        return [];
      },
    },
    props: Object,
    isTree: Boolean,
    loadNode: Function,
    checkedKeys: {
      type: Array,
      default() {
        return [];
      },
    },
    loading: {
      type: Boolean,
      default: false,
    },
    defaultExpandedAll: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      checked: [],
      allChecked: false,
      query: "",
      inputHover: false,
      checkChangeByUser: true,
    };
  },

  watch: {
    // query(val) {
    //   this.$refs.tree.filter(val);
    // },
    checked(val, oldVal) {
      this.updateAllChecked();
      if (this.checkChangeByUser) {
        const movedKeys = val
          .concat(oldVal)
          .filter((v) => val.indexOf(v) === -1 || oldVal.indexOf(v) === -1);
        this.$emit("checked-change", val, movedKeys);
      } else {
        this.$emit("checked-change", val);
        this.checkChangeByUser = true;
      }
    },

    data() {
      const checked = [];
      const filteredDataKeys = this.filteredData.map(
        (item) => item[this.keyProp]
      );
      if (this.checked.length > 0) {
        this.checked.forEach((item) => {
          if (filteredDataKeys.indexOf(item) > -1) {
            checked.push(item);
          }
        });
      }
      this.checkChangeByUser = false;
      this.checked = checked;
    },

    checkableData() {
      this.updateAllChecked();
    },

    defaultChecked: {
      immediate: true,
      handler(val, oldVal) {
        if (
          oldVal &&
          val.length === oldVal.length &&
          val.every((item) => oldVal.indexOf(item) > -1)
        )
          return;
        const checked = [];
        const checkableDataKeys = this.checkableData.map(
          (item) => item[this.keyProp]
        );
        if (val.length > 0) {
          val.forEach((item) => {
            if (checkableDataKeys.indexOf(item) > -1) {
              checked.push(item);
            }
          });
        }
        this.checkChangeByUser = false;
        this.checked = checked;
      },
    },
  },

  computed: {
    filteredData() {
      return this.data.filter((item) => {
        if (typeof this.filterMethod === "function") {
          return this.filterMethod(this.query, item);
        } else {
          const label = item[this.labelProp] || item[this.keyProp].toString();
          return label.toLowerCase().indexOf(this.query.toLowerCase()) > -1;
        }
      });
    },

    checkableData() {
      return this.filteredData.filter((item) => !item[this.disabledProp]);
    },

    checkedSummary() {
      const checkedLength = this.checked.length;
      const dataLength = this.data.length;
      return `${checkedLength}/${dataLength}`;
    },

    isIndeterminate() {
      const checkedLength = this.checked.length;
      return checkedLength > 0 && checkedLength < this.checkableData.length;
    },

    hasNoMatch() {
      return this.query.length > 0 && this.filteredData.length === 0;
    },

    inputIcon() {
      return this.query.length > 0 && this.inputHover
        ? "circle-close"
        : "search";
    },

    labelProp() {
      return this.props.label || "label";
    },

    keyProp() {
      return this.props.key || "key";
    },

    disabledProp() {
      return this.props.disabled || "disabled";
    },
    checkStrictly() {
      return false;
      return this.props.checkStrictly || false;
    },
    hasFooter() {
      return !!this.$slots.default;
    },
  },

  methods: {
    handleCheckChange(data, val2, val3) {
      console.log(data, val2, val3);
      const tree = this.$refs.tree;
      // 检查节点是否有子节点
      // if (data.isLeaf === false) {
      //   // 如果有子节点，取消该节点的选中状态
      //   tree.setChecked(data[this.keyProp], false);
      // }
      // console.log(this.$refs.tree.getCheckedNodes());
      // console.log(this.$refs.tree.getCheckedKeys());
      this.checked = this.$refs.tree.getCheckedKeys();
      // this.$emit("check-change", val2, this.$refs.tree.getCheckedKeys());
    },
    setCheckedKeys(keys) {
      if (this.isTree) {
        this.$refs.tree.setCheckedKeys(keys);
      } else {
        this.checked = keys;
      }
    },
    getCheckedKeys() {
      if (this.isTree) {
        return this.$refs.tree.getCheckedKeys();
      } else {
        return this.checked;
      }
    },
    updateAllChecked() {
      const checkableDataKeys = this.checkableData.map(
        (item) => item[this.keyProp]
      );
      this.allChecked =
        checkableDataKeys.length > 0 &&
        checkableDataKeys.every((item) => this.checked.indexOf(item) > -1);
    },

    handleAllCheckedChange(value) {
      this.checked = value
        ? this.checkableData.map((item) => item[this.keyProp])
        : [];
      if (this.isTree) {
        this.$refs.tree.setCheckedKeys(this.checked);
      }
    },

    clearQuery() {
      if (this.inputIcon === "circle-close") {
        this.query = "";
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.transfer-panel {
  min-width: 200px;
  min-height: 400px;
  border: 1px solid #dcdfe6;
  border-top: none;
  border-bottom: none;
  flex: 1;
  display: flex;
  flex-direction: column;
  ::v-deep .el-checkbox__input.is-disabled {
    opacity: 0;
    display: none;
  }
  // ::v-deep .is-leaf.el-tree-node__expand-icon.el-icon-caret-right {
  //   // display: none;
  //   width: 0;
  // }
  &:first-child {
    border-left: none;
  }
  &:last-child {
    border-right: none;
  }
  .transfer-panel__header {
    height: 40px;
    line-height: 40px;
    background: #f5f7fa;
    padding: 0 15px;
    border-bottom: 1px solid #dcdfe6;
    margin-bottom: 0;
  }
  .transfer-panel__body {
    padding: 10px;
    display: flex;
    height: 400px;
    flex-direction: column;
    .pane-content {
      flex: 1;
      height: 100%;
      flex-direction: column;
      display: flex;
      overflow-y: auto;
      width: 100%;
      .pane-content__data {
        flex: 1;
        overflow-y: auto;
      }
      .el-checkbox-group.transfer-panel__list {
        display: flex;
        flex-direction: column;
        .transfer-panel__item {
          margin: 5px 0;
          display: flex;
        }
      }
      .transfer-panel__footer {
        ::v-deep .el-pagination.el-pagination--small {
          display: flex;
          .el-pager {
            display: flex;
          }
        }
      }
      .transfer-panel__empty {
        text-align: center;
        color: #909399;
      }
    }
  }
}
</style>
