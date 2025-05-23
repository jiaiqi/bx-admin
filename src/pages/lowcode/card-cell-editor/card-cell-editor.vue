<template>
  <div class="card-cell-editor">
    <header class="header">
      <div class="header-left">
        <h1 class="title">卡片单元编辑</h1>
      </div>
      <div class="header-center">
        <button
          class=""
          size="small"
          @click="hiddenPartsVisible = !hiddenPartsVisible"
        >
          {{ hiddenPartsVisible ? "隐藏" : "显示" }}已隐藏部件
        </button>
      </div>
      <div class="header-right">
        <button class="preview-btn" size="small" @click="previewCard">
          预览
        </button>
        <button
          class="save-btn"
          size="small"
          @click="saveCard"
          :loading="onSaving"
        >
          保存
        </button>
      </div>
    </header>
    <main class="main">
      <aside class="materials-panel">
        <div class="panel-header">
          <h2 class="panel-title">组件</h2>
        </div>
        <div class="panel-content">
          <div class="materials-list">
            <div
              v-for="(item, index) in cardParts"
              :key="index"
              class="material-item"
              draggable="true"
              @dragstart="onDragStart($event, item)"
            >
              <div class="material-icon">
                <Icon :icon="item.icon"></Icon>
              </div>
              <div class="material-name">{{ item.label }}</div>
            </div>
          </div>
        </div>
      </aside>
      <section class="editor-area">
        <div class="editor-container">
          <div
            class="editor-content"
            :style="[setStyle]"
            @dragover.prevent
            @drop="onDrop($event, null)"
            @dragenter="onDragEnter($event, 'editor')"
            @dragleave="onDragLeave($event, 'editor')"
            @mouseleave="onDragLeave($event, 'editor')"
          >
            <div class="overlay" @click.stop="selectPart()"></div>
            <card-part
              v-for="(part, index) in partsList"
              :key="index"
              :part="part"
              :index="index"
              :selected-part="selectedPart"
              :hiddenPartsVisible="hiddenPartsVisible"
              @delete-part="deletePart"
              @select-part="selectPart"
              @mouseenter="onDragLeave($event, 'editor')"
            />
          </div>
        </div>
      </section>
      <aside class="property-panel">
        <div class="panel-header">
          <h2 class="panel-title">
            {{ selectedPart ? "卡片部件" : "卡片单元" }}属性
          </h2>
        </div>
        <div class="panel-content">
          <property-editor
            :card-unit="cardInfo"
            :current-cell="selectedPart"
            :list="partsList"
            ref="propertyEditor"
            @saved="saved"
          ></property-editor>
        </div>
      </aside>
    </main>
    <el-dialog
      title="预览"
      :visible.sync="isPreview"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :destroy-on-close="true"
      fullscreen
      :before-close="
        () => {
          this.isPreview = false;
        }
      "
    >
      <div class="preview-mode" v-if="isPreview">
        <div class="preview-content">
          <card-cell :card-cell="cardInfo"></card-cell>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue2";
import { materialsTree } from "../components/materials/materials";
const cardParts = materialsTree.find((item) => item.value === "cardPart");
import { $http, $selectOne, $selectList, $delete } from "@/common/http";
import { formatStyleData } from "@/pages/datav/common";

import CardPart from "./components/CardPart.vue";
import propertyEditor from "./components/propertyEditor.vue";
import cloneDeep from "lodash/cloneDeep";
import CardCell from "./components/CardCell.vue";

export default {
  components: {
    Icon,
    CardPart,
    propertyEditor,
    CardCell,
  },
  data() {
    return {
      // cardParts: Object.freeze(cardParts?.comList || []),
      cardNo: "",
      cardInfo: null,
      type: "add",
      partsList: [],
      selectedPart: null,
      draggedPart: null,
      onSaving: false,
      isPreview: false,
      hiddenPartsVisible: false,
    };
  },
  computed: {
    setStyle() {
      return formatStyleData(this.cardInfo?.style_json);
    },
    cardParts() {
      let arr = cloneDeep(cardParts?.comList || []);
      arr.unshift({
        label: "row",
        icon: "ri-rectangle-line",
        parts_type: "row",
      });
      return arr;
    },
  },
  methods: {
    init() {
      if (this.$route.params.cardNo) {
        this.type = "edit";
        this.cardNo = this.$route.params.cardNo;
        this.getCardInfo();
      }
    },
    async getCardInfo() {
      const url = `/config/select/srvpage_cfg_card_unit_select`;
      const req = {
        serviceName: "srvpage_cfg_card_unit_select",
        colNames: ["*"],
        condition: [
          {
            colName: "card_no",
            ruleType: "eq",
            value: this.cardNo,
          },
        ],
        page: { pageNo: 1, rownumber: 1 },
      };
      const { ok, data, msg } = await $selectOne(url, req);
      if (ok) {
        this.cardInfo = data;
        // 如果有卡片数据，解析parts_json字段
        function buildPartsTree(list) {
          if (Array.isArray(list) && list.length) {
            return list.map((item) => {
              if (item?.sub_card_parts_json?.length) {
                item.children = buildPartsTree(item.sub_card_parts_json);
              }
              return item;
            });
          }
          return list;
        }
        if (data.parts_json) {
          try {
            this.partsList = buildPartsTree(JSON.parse(data.parts_json));
          } catch (e) {
            console.error("解析卡片部件数据失败", e);
          }
        }
        this.getCardParts();
      } else if (msg) {
        this.$message.error(msg);
      }
    },
    async getCardParts() {
      const url = `/config/select/srvpage_cfg_card_parts_select`;
      const req = {
        serviceName: "srvpage_cfg_card_parts_select",
        colNames: ["*"],
        treeData: true,
        condition: [
          {
            colName: "card_no",
            ruleType: "eq",
            value: this.cardNo,
          },
        ],
      };
      const { ok, data, msg } = await $selectList(url, req);
      if (ok) {
        this.partsList = data;
      } else if (msg) {
        this.$message.error(msg);
      }
    },
    buildCardParsTree(partsList) {},
    // 拖拽开始时触发
    onDragStart(event, item) {
      // 将拖拽的部件数据存储到dataTransfer中
      event.dataTransfer.setData("part", JSON.stringify(item));
      this.draggedPart = item;
    },
    // 拖拽放置时触发
    onDrop(event, targetPart) {
      const partData = JSON.parse(event.dataTransfer.getData("part"));

      // 如果目标是null，表示放置到编辑区域的根级
      if (!targetPart) {
        // 创建一个新的部件实例，避免引用原始对象
        const newPart = JSON.parse(JSON.stringify(partData));

        // 如果是row类型，初始化children数组
        if (newPart.parts_type === "row") {
          newPart.children = [];
        }

        newPart._id = new Date().getTime();
        newPart._editType = "add";
        Object.keys(newPart).forEach((key) => {
          if (key.startsWith("_default_")) {
            newPart[key.replace("_default_", "")] = newPart[key];
            console.log("newPart", newPart);

            delete newPart[key];
          }
        });

        this.partsList.push(newPart);
      }

      // 清除拖拽状态
      this.draggedPart = null;

      // 移除拖拽悬停效果
      event?.currentTarget?.classList?.remove("drag-over-editor");
    },

    // 拖拽进入时触发
    onDragEnter(event, type) {
      if (type === "editor") {
        event?.currentTarget?.classList.add("drag-over-editor");
      }
    },

    // 拖拽离开时触发
    onDragLeave(event, type) {
      if (type === "editor") {
        event?.currentTarget?.classList.remove("drag-over-editor");
      }
    },
    // 删除部件
    deletePart(part, index) {
      // 删除部件
      if (part?.id || part?.card_parts_no) {
        // 从数据库删除
        return this.$confirm("确定要删除吗？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }).then(() => {
          const params = {
            service: "srvpage_cfg_card_parts_delete",
            app: "config",
            key: part.id ? "id" : "card_parts_no",
            value: part.id || part.card_parts_no,
          };
          $delete(params)
            .then(({ ok, msg }) => {
              if (ok) {
                this.$message.success("删除成功");
                // this.getCardParts();
                this.getCardInfo();
              } else {
                this.$message.error(msg || "删除失败");
              }
            })
            .catch((err) => {
              this.$message.error("删除失败");
            });
        });
      }
      this.partsList.splice(index, 1);
      if (this.selectedPart) {
        this.selectedPart = null;
      }
    },
    // 选择部件
    selectPart(part) {
      console.log("selectPart", part?._id);
      this.selectedPart = part;
    },
    saved() {
      // 保存成功 刷新数据
      this.$message.success("保存成功");
      // this.getCardParts();
      this.onSaving = false;
      this.getCardInfo();
    },
    // 保存卡片
    async saveCard() {
      if (!this.partsList.length) {
        this.$message.warning("请先添加卡片部件");
        return;
      }
      this.onSaving = true;
      this.$refs?.propertyEditor?.onSave();
      // const parts_json = JSON.stringify(this.partsList);

      // if (this.type === "edit") {
      //   // 更新卡片
      //   const url = `/config/update/srvpage_cfg_card_unit_update`;
      //   const req = {
      //     serviceName: "srvpage_cfg_card_unit_update",
      //     data: {
      //       card_no: this.cardNo,
      //       parts_json,
      //     },
      //   };

      //   const { ok, msg } = await $http.post(url, req);
      //   if (ok) {
      //     this.$message.success("保存成功");
      //   } else if (msg) {
      //     this.$message.error(msg);
      //   }
      // } else {
      //   // 新增卡片
      //   const url = `/config/insert/srvpage_cfg_card_unit_add`;
      //   const req = {
      //     serviceName: "srvpage_cfg_card_unit_add",
      //     data: {
      //       card_name: "新建卡片", // 可以添加一个输入框让用户输入名称
      //       parts_json,
      //     },
      //   };

      //   const { ok, data, msg } = await $http.post(url, req);
      //   if (ok) {
      //     this.$message.success("保存成功");
      //     // 跳转到编辑模式
      //     this.type = "edit";
      //     this.cardNo = data.card_no;
      //     this.$router.replace({ query: { card_no: data.card_no } });
      //   } else if (msg) {
      //     this.$message.error(msg);
      //   }
      // }
    },
    // 预览卡片
    previewCard() {
      if (!this.partsList.length) {
        this.$message.warning("请先添加卡片部件");
        return;
      }
      this.isPreview = !this.isPreview;
      if (this.isPreview) {
        this.$message.success("进入预览模式");
      } else {
        this.$message.info("退出预览模式");
      }
    },
  },
  created() {
    this.init();
  },
};
</script>

<style lang="scss" scoped>
.card-cell-editor {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
  padding: 0 20px;
  background-color: #fff;
  border-bottom: 1px solid #e8e8e8;

  .header-left {
    .title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }
  }

  .header-right {
    display: flex;
    gap: 10px;

    button {
      padding: 4px 15px;
      border-radius: 4px;
      border: 1px solid #dcdfe6;
      background-color: #fff;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      min-width: 80px;
      &:active {
        transform: scale(0.98);
      }
      &.save-btn {
        background-color: var(--primary-color, #409eff);
        color: #fff;
        border-color: var(--primary-color, #409eff);
      }
    }
  }
}

.main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.materials-panel,
.property-panel {
  width: 200px;
  padding: 0 10px;
  background-color: #f5f7fa;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
}

.property-panel {
  padding: 0;
  width: 360px;
  border-right: none;
  border-left: 1px solid #e8e8e8;
}

.panel-header {
  padding: 10px 15px;
  border-bottom: 1px solid #e8e8e8;

  .panel-title {
    font-size: 14px;
    font-weight: bold;
    color: #333;
  }
}

.panel-content {
  flex: 1;
  overflow-y: auto;
}

.materials-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.material-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background-color: #fff;
  cursor: move;

  .material-icon {
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    // background-color: #e0e0e0;
    margin-right: 8px;
    font-size: 20px;
  }

  .material-name {
    font-size: 12px;
    color: #333;
  }
}

.editor-area {
  flex: 1;
  background-color: #f0f2f5;
  padding: 20px;
  overflow: auto;
  scrollbar-color: rgba(144, 146, 152, 0.3) transparent;
  scrollbar-width: thin;
}

.editor-container {
  height: 100%;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: auto;
  padding: 60px;
  scrollbar-color: rgba(144, 146, 152, 0.3) transparent;
  scrollbar-width: thin;
  background-color: #f5f5f9;
  background-size: 20px 20px, 20px 20px;
  background-image: linear-gradient(#f5f5f9 19px, transparent 0),
    linear-gradient(90deg, transparent 19px, #000 0);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  width: fit-content;
  min-width: 100%;
}
.preview-mode {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
  overflow: auto;
  background-color: #f5f5f9;
  background-size: 20px 20px, 20px 20px;
  background-image: linear-gradient(#f5f5f9 19px, transparent 0),
    linear-gradient(90deg, transparent 19px, #000 0);
  .preview-content {
  }
}
.editor-content {
  display: inline-block;
  padding: 10px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;
  background-color: #fff;
  position: relative;
  transition: all 0.2s ease;
  min-width: 300px;
  min-height: 100px;
  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
  }
}

.editor-content.drag-over-editor {
  > .overlay {
    background-color: rgba(103, 194, 58, 0.1);
    border: 2px dashed #67c23a;
  }
}

.editor-content:empty {
  display: flex;
  justify-content: center;
  align-items: center;
  &:after {
    content: "拖拽组件到此处";
    color: #909399;
    font-size: 14px;
  }
}

.placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.image-placeholder {
  width: 200px;
  height: 200px;
  background-color: #f5f5f5;
  border: 1px dashed #d9d9d9;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;

  &:before {
    content: "+";
    font-size: 40px;
    color: #d9d9d9;
  }
}

.property-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-label {
  font-size: 12px;
  color: #606266;
}

.form-control {
  display: flex;
  align-items: center;
}

.no-selection {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  color: #909399;
  font-size: 14px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin: 10px 0;
}

.upload-btn {
  padding: 5px 10px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  background-color: #fafafa;
  color: #606266;
  font-size: 12px;
  cursor: pointer;
  text-align: center;
}

.switch-control {
  width: 40px;
  height: 20px;
  background-color: #dcdfe6;
  border-radius: 10px;
  position: relative;
  cursor: pointer;

  &:before {
    content: "";
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: #fff;
    top: 2px;
    left: 2px;
    transition: all 0.3s;
  }
}
</style>
