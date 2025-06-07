<template>
  <div class="card-cell-editor" ref="cardCellEditor">
    <header class="header">
      <div class="header-left">
        <h1 class="title">卡片单元设计器</h1>
      </div>
      <div class="header-center">
        <!-- <button class="" @click="hiddenPartsVisible = !hiddenPartsVisible">
          {{ hiddenPartsVisible ? "隐藏" : "显示" }}已隐藏部件
        </button> -->
        <!-- 新增深色模式切换按钮 -->
        <template v-if="cardInfo && cardInfo.card_name">
          {{ cardInfo.card_name || "" }}
        </template>
        <!-- <button
          class="theme-toggle-btn"
          @click="changeTheme"
          title="切换主题模式"
        >
          <Icon
            :icon="isDarkMode ? 'ri:sun-line' : 'ri:moon-line'"
            class="theme-icon"
          />
        </button> -->
      </div>
      <div class="header-right">
        <div class="theme-toggle-btn" @click="changeTheme" title="切换主题模式">
          <Icon
            :icon="isDarkMode ? 'ri:sun-line' : 'ri:moon-line'"
            class="theme-icon"
          />
        </div>
        <el-button class="preview-btn" @click="previewCard">预览</el-button>
        <el-button class="" @click="refresh" :loading="onSaving"
          >刷新</el-button
        >
        <el-button class="save-btn" @click="saveCard" :loading="onSaving">
          保存
        </el-button>
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
            ref="editorContent"
            @dragover.prevent
            @drop="onDrop($event, null)"
            @dragenter="onDragEnter($event, 'editor')"
            @dragleave="onDragLeave($event, 'editor')"
            @mouseleave="onDragLeave($event, 'editor')"
          >
            <div
              class="card-part-header"
              :style="partHeaderStyle"
              v-if="selectedPart && !isPreview"
            >
              <span class="part-label">{{
                selectedPart.label ||
                selectedPart.card_parts_name ||
                selectedPart.parts_type ||
                ""
              }}</span>
              <div class="part-delete">
                <i title="复制">
                  <Icon
                    icon="ri:file-copy-2-fill"
                    @click.native="duplicatePart(selectedPart)"
                  ></Icon>
                </i>

                <i title="删除">
                  <Icon
                    icon="ri:delete-bin-line"
                    @click.native="deletePart(selectedPart)"
                  ></Icon>
                </i>
              </div>
            </div>
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
            @unit-update="onUnitUpdate"
            @parts-update="onPartsUpdate"
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
      isDarkMode: false, // 新增深色模式状态
      partHeaderStyle: {},
      clipboardData: null, // 新增：用于存储复制的数据
    };
  },
  computed: {
    setStyle() {
      let style = {};
      if (this.cardInfo?.style_json) {
        style = formatStyleData(this.cardInfo?.style_json);
      }
      let backgroundImage = this.cardInfo?.background_image;
      if (backgroundImage) {
        style["background-image"] = backgroundImage;
      }
      return formatStyleData(style);
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
    changeTheme(e) {
      this.isDarkMode = !this.isDarkMode;
      const ele = this.$refs.cardCellEditor;
      // document.body.classList.toggle("dark-mode", this.isDarkMode);
      const transition = document.startViewTransition(() => {
        // 动画过渡切换主题色
        ele.classList.toggle("dark-mode");
      });

      // document.startViewTransition 的 ready 返回一个 Promise
      transition.ready.then(() => {
        // 获取鼠标的坐标
        const { clientX, clientY } = e;

        // 计算最大半径
        const radius = Math.hypot(
          Math.max(clientX, innerWidth - clientX),
          Math.max(clientY, innerHeight - clientY)
        );

        // 圆形动画扩散开始
        ele.animate(
          {
            clipPath: [
              `circle(0% at ${clientX}px ${clientY}px)`,
              `circle(${radius}px at ${clientX}px ${clientY}px)`,
            ],
          },
          // 设置时间，已经目标伪元素
          {
            duration: 500,
            pseudoElement: "::view-transition-new(.card-cell-editor)",
          }
        );
      });
    },
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
        newPart.seq = (this.partsList.length + 1) * 100;
        newPart.card_parts_name =
          newPart?.label ||
          newPart?.parts_type ||
          `卡片部件${this.partsList.length + 1}`;
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
    duplicatePart(part) {
      // 深拷贝当前选中的部件
      const duplicatedPart = JSON.parse(JSON.stringify(part));
      duplicatedPart.id = null;
      duplicatedPart.card_parts_no = null;
      // 生成新的唯一ID
      duplicatedPart._id = new Date().getTime();
      duplicatedPart._editType = "add";
      if (part.id) {
        duplicatedPart._duplicate_id = part.id;
      }
      // 如果部件有子部件，递归处理子部件
      if (duplicatedPart.children && duplicatedPart.children.length) {
        const duplicateChildren = (children) => {
          return children.map((child) => {
            const newChild = JSON.parse(JSON.stringify(child));
            newChild.id = null;
            newChild.card_parts_no = null;
            newChild._id = new Date().getTime() + Math.random() * 100;
            newChild._editType = "add";
            if (child.id) {
              newChild._duplicate_id = child.id;
            }
            if (newChild.children && newChild.children.length) {
              newChild.children = duplicateChildren(newChild.children);
            }
            return newChild;
          });
        };
        duplicatedPart.children = duplicateChildren(duplicatedPart.children);
      }

      // 查找父节点
      const findParentNode = (list, targetPart) => {
        for (let i = 0; i < list.length; i++) {
          const item = list[i];
          if (item.children && item.children.length) {
            // 检查当前节点的子节点
            const childIndex = item.children.findIndex(
              (child) =>
                (child._id && child._id === targetPart._id) ||
                (child.id && child.id === targetPart.id)
            );
            if (childIndex !== -1) {
              return {
                parent: item,
                isRoot: false,
              };
            }
            // 递归检查子节点的子节点
            const result = findParentNode(item.children, targetPart);
            if (result) {
              return result;
            }
          }
        }
        // 如果在子节点中没找到，检查根节点
        const rootIndex = list.findIndex(
          (item) =>
            (item._id && item._id === targetPart._id) ||
            (item.id && item.id === targetPart.id)
        );
        if (rootIndex !== -1) {
          return {
            parent: list,
            isRoot: true,
          };
        }
        return null;
      };

      const parentInfo = findParentNode(this.partsList, part);
      if (parentInfo) {
        if (parentInfo.isRoot) {
          // 如果是根节点，直接添加到partsList末尾
          this.partsList.push(duplicatedPart);
        } else {
          // 如果是子节点，添加到父节点的children数组末尾
          parentInfo.parent.children.push(duplicatedPart);
        }
      } else {
        // 如果找不到父节点，添加到根节点
        this.partsList.push(duplicatedPart);
      }

      // 选中新复制的部件
      this.$nextTick(() => {
        this.selectPart(duplicatedPart);
      });
    },
    // 删除部件
    deletePart(part, index) {
      // 删除部件
      if (this.selectedPart) {
        this.selectedPart = null;
      }
      if (!index && index !== 0 && part._id) {
        this.$set(part, "_is_delete", true);
        return;
      }

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
          if (part?.children && part?.children?.length) {
            const flatChildren = (list) => {
              let res = [];
              if (Array.isArray(list) && list.length) {
                list.forEach((item) => {
                  res.push(item);
                  if (Array.isArray(item?.children) && item?.children.length) {
                    res = res.concat(flatChildren(item?.children));
                  }
                });
              }
              return res;
            };
            const children = flatChildren(part?.children);
            if (children.length) {
              params.value =
                `${part.id || part.card_parts_no},` +
                children.map((item) => item.id || item.card_parts_no).join(",");
            }
          }
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
    },
    // 选择部件
    selectPart(part) {
      console.log("selectPart", part?._id);
      this.selectedPart = part;
      this.partHeaderStyle = this.calcPartHeaderPosition(part);
    },
    calcPartHeaderPosition(part) {
      if (part) {
        const partElement = document.querySelector(
          `.card-part[data-part-id="${part._id || part.id}"]`
        );

        if (partElement) {
          const parentElement = this.$refs.editorContent;
          const { top, left, width, height } =
            partElement.getBoundingClientRect();
          const { top: parentTop, left: parentLeft } =
            parentElement.getBoundingClientRect();
          return {
            top: top - parentTop - 2 + "px",
            left: left - parentLeft + "px",
            minWidth: width - 2 + "px",
            _height: height,
          };
        }
      }
      return null;
    },
    onUnitUpdate() {
      this.getCardInfo();
    },
    onPartsUpdate() {
      this.getCardInfo();
      // this.getCardParts();
    },
    saved() {
      // 保存成功 刷新数据
      this.$message.success("保存成功");
      // this.getCardParts();
      this.onSaving = false;
      this.getCardInfo();
      this.selectPart();
    },
    refresh() {
      this.getCardInfo();
    },
    // 保存卡片
    async saveCard() {
      if (!this.partsList.length) {
        this.$message.warning("请先添加 片部件");
        return;
      }
      this.onSaving = true;
      this.$refs?.propertyEditor?.onSave().then((_) => {
        this.onSaving = false;
      });
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
      // if (this.isPreview) {
      //   this.$message.success("进入预览模式");
      // } else {
      //   this.$message.info("退出预览模式");
      // }
    },
    // 新增：处理键盘事件
    handleKeyDown(event) {
      // 处理 Ctrl+C
      if (event.ctrlKey && event.key === 'c') {
        if (this.selectedPart) {
          this.clipboardData = JSON.parse(JSON.stringify(this.selectedPart));
          this.$message.success('已复制到剪贴板');
        }
      }
      
      // 处理 Ctrl+V
      if (event.ctrlKey && event.key === 'v') {
        if (this.clipboardData) {
          this.pastePart();
        }
      }
    },

    // 新增：粘贴部件
    pastePart() {
      if (!this.clipboardData) return;

      // 创建新的部件实例
      const newPart = JSON.parse(JSON.stringify(this.clipboardData));
      newPart._id = new Date().getTime();
      newPart._editType = "add";
      
      // 如果部件有子部件，递归处理子部件
      if (newPart.children && newPart.children.length) {
        const duplicateChildren = (children) => {
          return children.map((child) => {
            const newChild = JSON.parse(JSON.stringify(child));
            newChild._id = new Date().getTime() + Math.random() * 100;
            newChild._editType = "add";
            if (newChild.children && newChild.children.length) {
              newChild.children = duplicateChildren(newChild.children);
            }
            return newChild;
          });
        };
        newPart.children = duplicateChildren(newPart.children);
      }

      // 查找父节点
      const findParentNode = (list, targetPart) => {
        for (let i = 0; i < list.length; i++) {
          const item = list[i];
          if (item.children && item.children.length) {
            const childIndex = item.children.findIndex(
              (child) =>
                (child._id && child._id === targetPart._id) ||
                (child.id && child.id === targetPart.id)
            );
            if (childIndex !== -1) {
              return {
                parent: item,
                isRoot: false,
              };
            }
            const result = findParentNode(item.children, targetPart);
            if (result) {
              return result;
            }
          }
        }
        const rootIndex = list.findIndex(
          (item) =>
            (item._id && item._id === targetPart._id) ||
            (item.id && item.id === targetPart.id)
        );
        if (rootIndex !== -1) {
          return {
            parent: list,
            isRoot: true,
          };
        }
        return null;
      };

      if (this.selectedPart) {
        const parentInfo = findParentNode(this.partsList, this.selectedPart);
        if (parentInfo) {
          if (parentInfo.isRoot) {
            this.partsList.push(newPart);
          } else {
            parentInfo.parent.children.push(newPart);
          }
        } else {
          this.partsList.push(newPart);
        }
      } else {
        this.partsList.push(newPart);
      }

      // 选中新粘贴的部件
      this.$nextTick(() => {
        this.selectPart(newPart);
      });
    },
  },
  created() {
    this.init();
  },
  mounted() {
    // 添加键盘事件监听
    window.addEventListener('keydown', this.handleKeyDown);
  },
  beforeDestroy() {
    // 移除键盘事件监听
    window.removeEventListener('keydown', this.handleKeyDown);
  },
};
</script>

<style lang="scss" scoped>
::view-transition-new(root),
::view-transition-old(root) {
  /* 关闭默认动画 */
  animation: none;
}
.card-cell-editor {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  --bg-color: #fff;
  background-color: var(--bg-color);
  &.dark-mode {
    --bg-color: #1a1a1a;
    --primary-color: #4a90e2;
    --menu-bg-color: var(--primary-color);
    .header {
      background-color: #2d2d2d;
      border-bottom-color: #444;
      .title {
        color: #ffffff;
      }
      .header-right,
      .header-center {
        button {
          color: #ffffff;
          border-color: #444;
          background-color: #333;
          &.save-btn {
            background-color: #4a90e2;
            border-color: #4a90e2;
          }
        }

        .theme-toggle-btn {
          background-color: #333;
          border-color: #444;

          &:hover {
            background-color: #444;
          }

          .theme-icon {
            color: #ffffff;
          }
        }
      }
    }

    .main {
      .materials-panel,
      .property-panel {
        background-color: #252525;
        border-right-color: #444;
        .panel-header {
          border-bottom-color: #444;
          .panel-title {
            color: #ffffff;
          }
        }
        .panel-content {
          color: #dddddd;
          :deep(.property-pane) {
            background-color: #252525;
          }
        }
        .material-item {
          background-color: #333;
          border-color: #444;
          .material-name {
            color: #dddddd;
          }
        }
      }

      .editor-area {
        background-color: #1e1e1e;
      }

      .editor-content {
        background-color: #2d2d2d;
        border-color: #444;
        .overlay {
          background-color: rgba(0, 0, 0, 0.1);
        }
      }
      .property-panel {
        border-left-color: #444;
        background-color: #252525;
        :deep(.form-view-wrapper) {
          background-color: #2d2d2d;
          .raw_field_editor input {
            --custom-input-color: #ddd;
          }
          .el-autocomplete-suggestion {
            background-color: #2d2d2d;
            color: #ffffff;
          }
          .el-button {
            background-color: #333;
            border-color: #444;
            color: #dddddd;
            &.el-button--primary {
            }
          }
          .el-checkbox,
          .el-upload__tip {
            color: #dddddd;
          }
          .el-input-group__append {
            background-color: #333;
            border-color: #444;
          }
          .el-input__inner {
            background-color: #333;
            border-color: #444;
          }
          .el-upload--picture-card {
            background-color: #252525;
            border-color: #444;
          }
        }
      }
    }
    :deep(.el-dialog__wrapper) {
      .el-dialog {
        background-color: #2d2d2d;
        .el-dialog__title,
        .el-dialog__headerbtn,
        .el-dialog__close {
          color: #ddd;
        }
        .el-dialog__body,
        .preview-mode {
          height: 80vh;
        }
      }
    }

    .editor-container,
    .preview-mode {
      background-color: #18181c;
      background-image: linear-gradient(#18181c 19px, transparent 0),
        linear-gradient(90deg, transparent 19px, #86909c 0);
    }
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
  padding: 0 20px;
  background-color: var(--bg-color);
  border-bottom: 1px solid #e8e8e8;

  .header-left {
    flex: 1;
    .title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }
  }
  .header-center {
    justify-content: center;
  }
  .header-right {
    justify-content: flex-end;
  }
  .header-center,
  .header-right {
    display: flex;
    align-items: center;
    flex: 1;
    .theme-toggle-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 4px;
      border: 1px solid #dcdfe6;
      background-color: var(--bg-color);
      cursor: pointer;
      transition: all 0.3s ease;
      padding: 0;
      margin-right: 10px;
      &:hover {
        background-color: #f5f7fa;
        // transform: rotate(15deg);
      }

      .theme-icon {
        font-size: 20px;
        color: #606266;
        transition: all 0.3s ease;
        &:hover {
          transform: rotate(15deg);
        }
      }
    }
  }

  .header-right {
    display: flex;
    // gap: 10px;

    button {
      padding: 8px 15px;
      // border-radius: 4px;
      // border: 1px solid #dcdfe6;
      background-color: var(--bg-color);
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
  .card-part-header {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 99;

    font-size: 12px;
    transform: translateY(-100%);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    border: none;
    line-height: 30px;
    gap: 1px;
    .part-label,
    .part-delete {
      background-color: var(--primary-color, #006cff);
      color: #fff;
      display: flex;
      align-items: center;
      height: 30px;
      padding: 0 10px;
    }
    .part-label {
      flex: 1;
      text-align: left;
      min-width: max-content;
    }
    .part-delete {
      cursor: pointer;
      font-size: 16px;
      min-width: 60px;
      justify-content: center;
      gap: 5px;
      .iconify {
        &:hover {
          font-weight: bold;
          font-size: 18px;
        }
      }
    }
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
