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
        <div
          class="editor-container"
          ref="editorContainer"
          @click="handleContainerClick"
          tabindex="0"
          @focus="handleContainerFocus"
        >
          <div
            class="editor-content"
            :style="[setStyle]"
            ref="editorContent"
            @dragover.prevent
            @drop="onDrop($event, null)"
            @dragenter="onDragEnter($event, 'editor')"
            @dragleave="onDragLeave($event, 'editor')"
            @mouseleave="onDragLeave($event, 'editor')"
            @click.stop="handleEditorClick"
          >
            <div
              class="card-part-header"
              :style="optimizedPartHeaderStyle"
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
                    @click.native.stop="handleCopyPart()"
                  ></Icon>
                </i>
                <i title="粘贴">
                  <Icon
                    icon="ri:file-copy-2-line"
                    @click.native.stop="handlePastePart()"
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
            <div
              class="overlay"
              :class="{ 'overlay--active': isEditorActive && !selectedPart }"
              @click.stop="handleEditorClick"
            ></div>
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
              @copy-part="handleContextCopyPart"
              @paste-part="handleContextPastePart"
              @cut-part="handleCutPart"
              @move-part="handleMovePart"
              @show-properties="handleShowProperties"
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

/**
 * 常量定义
 * @constant {Object} CONSTANTS
 */
const CONSTANTS = {
  STORAGE_KEY: "card_part_clipboard",
  SAVE_DEBOUNCE_TIME: 300,
  PART_IDENTIFIER: "_isCardPart",
  IGNORE_KEYS: [
    "create_user_disp",
    "create_time",
    "create_user",
    "modify_time",
    "modify_user_disp",
    "modify_user",
    "card_parts_no",
    "del_flag",
    "is_leaf",
    "parent_no",
  ],
};

/**
 * 工具函数集合
 * @constant {Object} utils
 */
const utils = {
  /**
   * 深拷贝对象
   * @param {Object} obj - 要拷贝的对象
   * @returns {Object} 拷贝后的新对象
   */
  deepClone: (obj) => JSON.parse(JSON.stringify(obj)),

  /**
   * 生成唯一ID
   * @returns {number} 时间戳ID
   */
  generateUniqueId: () => new Date().getTime() + Math.random() * 1000000,

  /**
   * 递归处理子部件
   * @param {Array} children - 子部件数组
   * @param {Function} processFn - 处理函数
   * @returns {Array} 处理后的子部件数组
   */
  processChildren: (children, processFn) => {
    if (!Array.isArray(children)) return children;
    return children.map((child) => {
      const newChild = processFn(child);
      if (newChild.children?.length) {
        newChild.children = utils.processChildren(newChild.children, processFn);
      }
      return newChild;
    });
  },

  /**
   * 查找父节点
   * @param {Array} list - 部件列表
   * @param {Object} targetPart - 目标部件
   * @returns {Object|null} 父节点信息
   */
  findParentNode: (list, targetPart) => {
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      if (item.children?.length) {
        const childIndex = item.children.findIndex(
          (child) =>
            (child._id && child._id === targetPart._id) ||
            (child.id && child.id === targetPart.id)
        );
        if (childIndex !== -1) {
          return { parent: item, isRoot: false };
        }
        const result = utils.findParentNode(item.children, targetPart);
        if (result) return result;
      }
    }
    const rootIndex = list.findIndex(
      (item) =>
        (item._id && item._id === targetPart._id) ||
        (item.id && item.id === targetPart.id)
    );
    return rootIndex !== -1 ? { parent: list, isRoot: true } : null;
  },

  /**
   * 处理部件数据
   * @param {Object} part - 部件数据
   * @returns {Object} 处理后的部件数据
   */
  processPartData: (part) => {
    const newPart = utils.generatePartData(part);
    if (Array.isArray(newPart.children)) {
      newPart.children = utils.processChildren(newPart.children, (child) => {
        return utils.generatePartData(child);
      });
    }
    return newPart;
  },

  /**
   * 初始化复制/新增的卡片部件数据
   * @param {Object} part - 部件数据
   * @returns {Object} 处理后的部件数据
   */
  generatePartData(part) {
    const newPart = utils.deepClone(part);
    newPart._editType = "add";
    const _duplicate_id = newPart._duplicate_id || newPart.id;
    if (_duplicate_id) {
      newPart._duplicate_id = _duplicate_id;
    }
    newPart._id = utils.generateUniqueId();
    delete newPart.id;
    CONSTANTS.IGNORE_KEYS.forEach((key) => {
      delete newPart[key];
    });
    return newPart;
  },
  /**
   * 设置部件序号和父级信息
   * @param {Object} part - 部件数据
   * @param {Object} parent - 父级部件
   * @param {number} index - 序号
   * @returns {Object} 处理后的部件数据
   */
  setupPartInfo: (part, parent, index) => {
    part.seq = (index + 1) * 100;
    if (parent?.card_parts_no) {
      part.parent_no = parent.card_parts_no;
    }
    if (parent?.card_no) {
      part.card_no = parent.card_no;
    }
    return part;
  },
};

/**
 * 卡片单元设计器组件
 * @component CardCellEditor
 * @description 用于设计和编辑卡片单元的组件，支持拖拽、复制、粘贴等操作
 */
export default {
  name: "CardCellEditor",
  components: {
    Icon,
    CardPart,
    propertyEditor,
    CardCell,
  },
  data() {
    return {
      cardNo: "", // 卡片编号
      cardInfo: null, // 卡片信息对象
      type: "add", // 操作类型：add-新增，edit-编辑
      partsList: [], // 部件列表
      selectedPart: null, // 当前选中的部件
      draggedPart: null, // 正在拖拽的部件
      onSaving: false, // 是否正在保存
      isPreview: false, // 是否处于预览模式
      hiddenPartsVisible: false, // 是否显示隐藏的部件
      isDarkMode: false, // 是否为深色模式
      partHeaderStyle: {}, // 部件头部样式
      clipboardData: null, // 剪贴板数据
      storageKey: CONSTANTS.STORAGE_KEY, // 本地存储的key
      useSystemClipboard: true, // 是否使用系统剪贴板
      saveTimer: null, // 保存操作的定时器
      partHeaderStyleCache: new Map(), // 部件头部样式缓存
      isEditorActive: false, // 编辑器是否处于激活状态
    };
  },
  computed: {
    /**
     * 计算编辑器容器的样式
     * @returns {Object} 样式对象
     */
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

    /**
     * 获取可用的卡片部件列表
     * @returns {Array} 部件列表
     */
    cardParts() {
      let arr = cloneDeep(cardParts?.comList || []);
      arr.unshift({
        label: "row",
        icon: "ri-rectangle-line",
        parts_type: "row",
      });
      return arr;
    },

    /**
     * 计算选中部件的头部样式
     * @returns {Object} 样式对象
     */
    optimizedPartHeaderStyle() {
      if (!this.selectedPart) return {};
      const style = this.calcPartHeaderPosition(this.selectedPart);
      return style;
    },
  },
  methods: {
    handleContainerFocus() {
      console.log("handleContainerFocus");
      this.checkClipboardSupport();
      if (!this.useSystemClipboard) {
        window.addEventListener("storage", this.handleStorageChange);
      } else {
        window.removeEventListener("storage", this.handleStorageChange);
      }
    },
    /**
     * 统一的错误处理方法
     * @param {Error} error - 错误对象
     * @param {string} [message="操作失败"] - 错误提示信息
     */
    handleError(error, message = "操作失败") {
      console.error(message, error);
      this.$message.error(message);
    },

    /**
     * 处理右键菜单复制部件
     * @param {Object} part - 要复制的部件
     */
    handleContextCopyPart(part) {
      if (part) {
        this.selectPart(part);
      }
      this.handleCopyPart();
    },

    /**
     * 处理右键菜单粘贴部件
     * @param {Object} part - 目标部件
     */
    handleContextPastePart(part) {
      if (part) {
        this.selectPart(part);
      }
      this.handlePastePart();
    },

    /**
     * 处理右键菜单剪切部件
     * @param {Object} part - 要剪切的部件
     */
    async handleCutPart(part) {
      if (part) {
        this.selectPart(part);
        await this.handleCopyPart();
        this.deletePart(part);
        this.$message.success("已剪切部件");
      }
    },

    /**
     * 处理部件移动
     * @param {Object} part - 要移动的部件
     * @param {string} direction - 移动方向 ('up' | 'down')
     */
    handleMovePart(part, direction) {
      const parentInfo = utils.findParentNode(this.partsList, part);
      if (!parentInfo) return;

      const { parent, isRoot } = parentInfo;
      const list = isRoot ? this.partsList : parent.children;
      const currentIndex = list.findIndex(
        (item) => 
          (item._id && item._id === part._id) ||
          (item.id && item.id === part.id)
      );

      if (currentIndex === -1) return;

      let targetIndex;
      if (direction === 'up' && currentIndex > 0) {
        targetIndex = currentIndex - 1;
      } else if (direction === 'down' && currentIndex < list.length - 1) {
        targetIndex = currentIndex + 1;
      } else {
        this.$message.warning(`无法${direction === 'up' ? '上' : '下'}移`);
        return;
      }

      // 交换位置和seq值
      const temp = list[currentIndex];
      const tempSeq = list[currentIndex].seq;

      // 交换seq值
      this.$set(list[currentIndex], 'seq', list[targetIndex].seq);
      this.$set(list[targetIndex], 'seq', tempSeq);
      
      // 交换位置
      this.$set(list, currentIndex, list[targetIndex]);
      this.$set(list, targetIndex, temp);

      this.$message.success(`已${direction === 'up' ? '上' : '下'}移部件`);
    },

    /**
     * 显示部件属性
     * @param {Object} part - 要显示属性的部件
     */
    handleShowProperties(part) {
      this.selectPart(part);
      // 可以在这里添加额外的属性面板聚焦逻辑
      this.$nextTick(() => {
        const propertyPanel = document.querySelector('.property-panel');
        if (propertyPanel) {
          propertyPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    },

    /**
     * 带加载状态的操作包装器
     * @param {Function} operation - 要执行的操作函数
     * @param {string} [loadingMessage="加载中..."] - 加载提示信息
     * @returns {Promise<void>}
     */
    async withLoading(operation, loadingMessage = "加载中...") {
      this.onSaving = true;
      try {
        await operation();
      } catch (error) {
        this.handleError(error);
      } finally {
        this.onSaving = false;
      }
    },

    /**
     * 保存卡片数据
     * @returns {Promise<void>}
     */
    async saveCard() {
      if (!this.partsList.length) {
        this.$message.warning("请先添加卡片部件");
        return;
      }

      if (this.saveTimer) {
        clearTimeout(this.saveTimer);
      }

      this.saveTimer = setTimeout(async () => {
        await this.withLoading(async () => {
          await this.$refs?.propertyEditor?.onSave();
          await this.getCardInfo();
        }, "保存中...");
      }, CONSTANTS.SAVE_DEBOUNCE_TIME);
    },

    /**
     * 处理拖拽开始事件
     * @param {DragEvent} event - 拖拽事件对象
     * @param {Object} item - 被拖拽的部件数据
     */
    onDragStart(event, item) {
      event.dataTransfer.effectAllowed = "copy";
      event.dataTransfer.setData("part", JSON.stringify(item));
      this.draggedPart = item;

      // 创建自定义拖拽图像
      const dragImage = document.createElement("div");
      dragImage.className = "drag-image";
      dragImage.textContent = item.label || item.parts_type;
      document.body.appendChild(dragImage);
      event.dataTransfer.setDragImage(dragImage, 0, 0);

      // 清理临时创建的拖拽图像
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
    },

    /**
     * 处理拖拽放置事件
     * @param {DragEvent} event - 拖拽事件对象
     * @param {Object|null} targetPart - 目标部件
     */
    onDrop(event, targetPart) {
      event.preventDefault();
      event.stopPropagation();

      try {
        const partData = JSON.parse(event.dataTransfer.getData("part"));
        if (!targetPart) {
          const newPart = utils.deepClone(partData);
          if (newPart.parts_type === "row") {
            newPart.children = [];
          }
          newPart._id = utils.generateUniqueId();
          newPart._editType = "add";
          newPart.seq = (this.partsList.length + 1) * 100;
          newPart.card_parts_name =
            newPart?.label ||
            newPart?.parts_type ||
            `卡片部件${this.partsList.length + 1}`;

          // 处理默认属性
          Object.keys(newPart).forEach((key) => {
            if (key.startsWith("_default_")) {
              newPart[key.replace("_default_", "")] = newPart[key];
              delete newPart[key];
            }
          });

          this.partsList.push(newPart);

          // 添加放置动画效果
          this.$nextTick(() => {
            const newElement = document.querySelector(
              `[data-part-id="${newPart._id}"]`
            );
            if (newElement) {
              newElement.animate(
                [
                  { transform: "scale(0.8)", opacity: 0 },
                  { transform: "scale(1)", opacity: 1 },
                ],
                {
                  duration: 300,
                  easing: "ease-out",
                }
              );
            }
          });
        }
      } catch (error) {
        this.handleError(error, "放置部件失败");
      }

      this.draggedPart = null;
      event?.currentTarget?.classList?.remove("drag-over-editor");
    },

    /**
     * 切换主题模式
     * @param {MouseEvent} e - 鼠标事件对象
     */
    changeTheme(e) {
      this.isDarkMode = !this.isDarkMode;
      const ele = this.$refs.cardCellEditor;
      const transition = document.startViewTransition(() => {
        ele.classList.toggle("dark-mode");
      });

      transition.ready.then(() => {
        const { clientX, clientY } = e;

        // 计算动画半径
        const radius = Math.hypot(
          Math.max(clientX, innerWidth - clientX),
          Math.max(clientY, innerHeight - clientY)
        );

        // 执行主题切换动画
        ele.animate(
          {
            clipPath: [
              `circle(0% at ${clientX}px ${clientY}px)`,
              `circle(${radius}px at ${clientX}px ${clientY}px)`,
            ],
          },
          {
            duration: 500,
            pseudoElement: "::view-transition-new(.card-cell-editor)",
          }
        );
      });
    },

    /**
     * 初始化组件
     */
    init() {
      this.clearCache();
      if (this.$route.params.cardNo) {
        this.type = "edit";
        this.cardNo = this.$route.params.cardNo;
        this.getCardInfo();
      }
    },

    /**
     * 获取卡片信息
     * @returns {Promise<void>}
     */
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
        // 构建部件树结构
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

    /**
     * 获取卡片部件列表
     * @returns {Promise<void>}
     */
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

    /**
     * 处理拖拽进入事件
     * @param {DragEvent} event - 拖拽事件对象
     * @param {string} type - 拖拽类型
     */
    onDragEnter(event, type) {
      if (type === "editor") {
        event?.currentTarget?.classList.add("drag-over-editor");
      }
    },

    /**
     * 处理拖拽离开事件
     * @param {DragEvent} event - 拖拽事件对象
     * @param {string} type - 拖拽类型
     */
    onDragLeave(event, type) {
      if (type === "editor") {
        event?.currentTarget?.classList.remove("drag-over-editor");
      }
    },

    /**
     * 复制部件
     * @param {Object} part - 要复制的部件
     */
    duplicatePart(part) {
      const duplicatedPart = utils.processPartData(part);
      const parentInfo = utils.findParentNode(this.partsList, part);
      if (parentInfo) {
        if (parentInfo.isRoot) {
          duplicatedPart.seq = (this.partsList.length + 1) * 100;
          this.partsList.push(duplicatedPart);
        } else {
          duplicatedPart.seq = (parentInfo.parent.children.length + 1) * 100;
          if (parentInfo.parent.card_parts_no) {
            duplicatedPart.parent_no = parentInfo.parent.card_parts_no;
          }
          if (parentInfo.parent.card_no) {
            duplicatedPart.card_no = parentInfo.parent.card_no;
          }

          parentInfo.parent.children.push(duplicatedPart);
        }
      } else {
        duplicatedPart.seq = (this.partsList.length + 1) * 100;
        this.partsList.push(duplicatedPart);
      }

      this.$nextTick(() => {
        this.selectPart(duplicatedPart);
      });
    },

    /**
     * 删除部件
     * @param {Object} part - 要删除的部件
     * @param {number} index - 部件索引
     */
    deletePart(part, index) {
      // 清除样式缓存
      if (part._id || part.id) {
        this.partHeaderStyleCache.delete(part._id || part.id);
      }

      if (this.selectedPart) {
        this.selectedPart = null;
      }
      if (!index && index !== 0 && part._id) {
        this.$set(part, "_is_delete", true);
        return;
      }

      if (part?.id || part?.card_parts_no) {
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
          // 处理子部件的删除
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

    /**
     * 选择部件
     * @param {Object} part - 要选择的部件
     */
    async selectPart(part) {
      if (this.selectedPart === part) return;

      this.selectedPart = part;
      this.partHeaderStyle = this.optimizedPartHeaderStyle;
    },

    /**
     * 计算部件头部位置
     * @param {Object} part - 部件对象
     * @returns {Object|null} 样式对象
     */
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

    /**
     * 处理单元更新
     */
    onUnitUpdate() {
      this.getCardInfo();
    },

    /**
     * 处理部件更新
     */
    onPartsUpdate() {
      this.getCardInfo();
    },

    /**
     * 保存成功后的处理
     * @returns {Promise<void>}
     */
    async saved() {
      this.$message.success("保存成功");
      this.onSaving = false;
      await this.getCardInfo();
      this.selectPart();
    },

    /**
     * 刷新数据
     */
    refresh() {
      this.clearCache();
      this.getCardInfo();
    },

    /**
     * 预览卡片
     */
    previewCard() {
      if (!this.partsList.length) {
        this.$message.warning("请先添加卡片部件");
        return;
      }

      const transition = document.startViewTransition(() => {
        this.isPreview = !this.isPreview;
      });

      transition.ready.then(() => {
        const previewContent = document.querySelector(".preview-content");
        if (previewContent) {
          previewContent.animate(
            [
              { opacity: 0, transform: "scale(0.95)" },
              { opacity: 1, transform: "scale(1)" },
            ],
            {
              duration: 300,
              easing: "ease-out",
            }
          );
        }
      });
    },

    /**
     * 检查剪贴板支持
     * @returns {Promise<void>}
     */
    async checkClipboardSupport() {
      if (!navigator.clipboard) {
        this.useSystemClipboard = false;
        return;
      }

      try {
        await navigator.clipboard.readText();
        this.useSystemClipboard = true;
      } catch (e) {
        console.warn("系统剪贴板不可用，将使用localStorage:", e);
        this.useSystemClipboard = false;
      }
      //  // 如果不使用系统剪贴板，添加storage事件监听
      // if (!this.useSystemClipboard) {
      //   window.addEventListener("storage", this.handleStorageChange);
      // } else {
      //   window.removeEventListener("storage", this.handleStorageChange);
      // }
    },

    /**
     * 处理复制部件
     * @returns {Promise<void>}
     */
    async handleCopyPart() {
      if (this.isEditorActive && !this.selectedPart) {
        // 选中卡片单元的情况下 按下复制快捷键 复制所有部件
        const allParts = utils.deepClone(this.partsList);
        allParts.forEach((part) => (part[CONSTANTS.PART_IDENTIFIER] = true));

        try {
          await this.checkClipboardSupport();
          if (this.useSystemClipboard) {
            await navigator.clipboard.writeText(JSON.stringify(allParts));
          } else {
            this.clipboardData = allParts;
            localStorage.setItem(this.storageKey, JSON.stringify(allParts));
          }
          this.$message.success("已复制所有部件到剪贴板");
        } catch (e) {
          this.handleError(e, "复制失败");
        }
        return;
      }

      if (!this.selectedPart) {
        this.$message.warning("请先选择要复制的部件");
        return;
      }

      try {
        const data = utils.processPartData(this.selectedPart);
        data[CONSTANTS.PART_IDENTIFIER] = true;

        await this.checkClipboardSupport();
        if (this.useSystemClipboard) {
          await navigator.clipboard.writeText(JSON.stringify(data));
        } else {
          this.clipboardData = data;
          localStorage.setItem(this.storageKey, JSON.stringify(data));
        }
        this.$message.success("已复制到剪贴板");
      } catch (e) {
        this.handleError(e, "复制失败");
      }
    },

    /**
     * 处理键盘事件
     * @param {KeyboardEvent} event - 键盘事件对象
     */
    async handleKeyDown(event) {
      // console.log("handleKeyDown:", event);
      // 处理键盘快捷键
      if (event.ctrlKey) {
        event.preventDefault();
        switch (event.key) {
          case "c":
            this.handleCopyPart();
            break;
          case "v":
            this.handlePastePart();
            break;
          case "a":
            this.handleEditorClick();
            break;
        }
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        if (this.selectedPart) {
          const findPartIndex = (list, targetPart) => {
            for (let i = 0; i < list.length; i++) {
              if (
                list[i]._id === targetPart._id ||
                list[i].id === targetPart.id
              ) {
                return { index: i, list };
              }
              if (list[i].children?.length) {
                const result = findPartIndex(list[i].children, targetPart);
                if (result) return result;
              }
            }
            return null;
          };

          const partInfo = findPartIndex(this.partsList, this.selectedPart);
          if (partInfo) {
            this.deletePart(this.selectedPart, partInfo.index);
          }
        } else {
          this.$message.warning("请先选择要删除的部件");
        }
      }
    },

    /**
     * 粘贴部件
     * @returns {Promise<void>}
     */
    async handlePastePart() {
      try {
        const clipboardData = await this.getClipboardData();
        if (!clipboardData) return;

        // 处理多个部件粘贴
        if (Array.isArray(clipboardData)) {
          for (const partData of clipboardData) {
            const newPart = utils.processPartData(partData);
            if (!this.selectedPart) {
              this.duplicatePart(newPart);
            } else if (this.isSamePart(this.selectedPart, newPart)) {
              // 如果是相同部件，粘贴到同级
              await this.pasteToSameLevel(newPart);
            } else {
              // 粘贴到选中的部件下
              await this.pasteToSelectedPart(newPart);
            }
          }
          this.$message.success(`已粘贴${clipboardData.length}个部件`);
          return;
        }

        // 单个部件粘贴
        const newPart = utils.processPartData(clipboardData);
        if (!this.selectedPart) {
          return this.duplicatePart(newPart);
        }

        if (this.isSamePart(this.selectedPart, newPart)) {
          await this.pasteToSameLevel(newPart);
        } else {
          await this.pasteToSelectedPart(newPart);
        }
        this.$message.success("已粘贴部件");

        this.$nextTick(() => {
          this.selectPart(newPart);
        });
      } catch (e) {
        this.handleError(e, "粘贴失败，数据格式错误");
      }
    },

    /**
     * 获取剪贴板数据
     * @returns {Promise<Object|null>} 剪贴板数据
     */
    async getClipboardData() {
      let clipboardData;
      if (this.useSystemClipboard) {
        const clipboardText = await navigator.clipboard.readText();
        if (!clipboardText) {
          this.$message.warning("剪贴板为空");
          return null;
        }
        clipboardData = JSON.parse(clipboardText);
      } else {
        const storedData = localStorage.getItem(this.storageKey);
        if (!storedData) {
          this.$message.warning("剪贴板为空");
          return null;
        }
        clipboardData = JSON.parse(storedData);
      }
      if (Array.isArray(clipboardData)) {
        let isParts = clipboardData.every(
          (item) => item[CONSTANTS.PART_IDENTIFIER]
        );
        if (!isParts) {
          this.$message.warning("剪贴板数据不是有效的卡片部件");
          return null;
        }
      } else if (!clipboardData || !clipboardData[CONSTANTS.PART_IDENTIFIER]) {
        this.$message.warning("剪贴板数据不是有效的卡片部件");
        return null;
      }

      delete clipboardData[CONSTANTS.PART_IDENTIFIER];
      return clipboardData;
    },

    /**
     * 判断是否是同一个部件
     * @param {Object} part1 - 部件1
     * @param {Object} part2 - 部件2
     * @returns {boolean} 是否是同一个部件
     */
    isSamePart(part1, part2) {
      return (
        (part1._id && part1._id === part2._duplicate_id) ||
        (part1.id && part1.id === part2._duplicate_id)
      );
    },

    /**
     * 粘贴到同级
     * @param {Object} newPart - 新部件
     * @returns {Promise<void>}
     */
    async pasteToSameLevel(newPart) {
      const parentInfo = utils.findParentNode(
        this.partsList,
        this.selectedPart
      );
      if (parentInfo) {
        if (parentInfo.isRoot) {
          utils.setupPartInfo(newPart, null, this.partsList.length);
          this.partsList.push(newPart);
        } else {
          utils.setupPartInfo(
            newPart,
            parentInfo.parent,
            parentInfo.parent.children.length
          );
          parentInfo.parent.children.push(newPart);
        }
      } else {
        utils.setupPartInfo(newPart, null, this.partsList.length);
        this.partsList.push(newPart);
      }
      // this.$message.success("粘贴成功");
    },

    /**
     * 粘贴到选中部件
     * @param {Object} newPart - 新部件
     * @returns {Promise<void>}
     */
    async pasteToSelectedPart(newPart) {
      if (this.selectedPart.parts_type === "row") {
        if (!this.selectedPart.children) {
          this.$set(this.selectedPart, "children", []);
        }
        utils.setupPartInfo(
          newPart,
          this.selectedPart,
          this.selectedPart.children.length
        );
        this.selectedPart.children.push(newPart);
        // this.$message.success("粘贴成功");
      } else {
        this.$message.warning("只能将组件粘贴到类型为row的部件中");
      }
    },

    /**
     * 处理存储变化事件
     * @param {StorageEvent} event - 存储事件对象
     */
    handleStorageChange(event) {
      if (event.key === this.storageKey) {
        try {
          this.clipboardData = event.newValue
            ? JSON.parse(event.newValue)
            : null;
        } catch (e) {
          console.error("解析剪贴板数据失败:", e);
        }
      }
    },

    /**
     * 清除缓存
     */
    clearCache() {
      this.partHeaderStyleCache.clear();
    },

    /**
     * 处理编辑器点击事件
     */
    handleEditorClick() {
      this.isEditorActive = true;
      this.selectedPart = null;
      this.partHeaderStyle = null;
      this.partHeaderStyleCache.clear();
    },

    /**
     * 处理容器点击事件
     * @param {MouseEvent} event - 鼠标事件对象
     */
    handleContainerClick(event) {
      if (event.target === event.currentTarget) {
        this.selectPart();
        this.isEditorActive = false;
      }
    },
  },
  created() {
    this.init();
  },
  async mounted() {
    // 添加键盘事件监听到编辑器容器
    this.$refs.editorContainer.addEventListener("keydown", this.handleKeyDown);
    // this.checkClipboardSupport();
    // if (!this.useSystemClipboard) {
    //   window.addEventListener("storage", this.handleStorageChange);
    // } else {
    //   window.removeEventListener("storage", this.handleStorageChange);
    // }
  },
  beforeDestroy() {
    // 清除定时器
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    // 清除缓存
    this.clearCache();

    // 移除事件监听
    this.$refs.editorContainer.removeEventListener(
      "keydown",
      this.handleKeyDown
    );
    if (!this.useSystemClipboard) {
      window.removeEventListener("storage", this.handleStorageChange);
    }
  },
};
</script>

<style lang="scss" scoped>
.drag-image {
  position: fixed;
  top: -1000px;
  left: -1000px;
  padding: 8px 12px;
  background-color: var(--primary-color, #409eff);
  color: white;
  border-radius: 4px;
  font-size: 14px;
  pointer-events: none;
  z-index: 9999;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

::view-transition-new(root),
::view-transition-old(root) {
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
      background-color: rgba($color: #2d2d2d, $alpha: 0.5);
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
        background-color: rgba($color: #2d2d2d, $alpha: 0.5);
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

    button {
      padding: 8px 15px;
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
  cursor: pointer;

  &:hover {
    background-color: #f0f0f5;
  }
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
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.2s ease;

    &:hover:not(&--active) {
      background-color: rgba(103, 194, 58, 0.05);
      border: 2px dashed #67c23a;
    }

    &--active {
      border: 2px solid #67c23a;
      box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.2);
      background-color: rgba(103, 194, 58, 0.1);
    }
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
