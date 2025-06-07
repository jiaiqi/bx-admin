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
        <div class="editor-container" @click="handleContainerClick">
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
 * 优化说明：
 * 1. 将魔法字符串和配置值提取为常量，便于维护和修改
 * 2. 避免重复使用字符串字面量，减少拼写错误
 * 3. 集中管理配置，便于后续扩展
 */
const CONSTANTS = {
  STORAGE_KEY: "card_part_clipboard", // 用于localStorage的key
  SAVE_DEBOUNCE_TIME: 300, // 保存操作的防抖时间
  PART_IDENTIFIER: "_isCardPart", // 用于标识卡片部件数据的字段
};

/**
 * 工具函数集合
 * 优化说明：
 * 1. 提取公共函数，避免代码重复
 * 2. 统一处理逻辑，确保行为一致
 * 3. 提高代码复用性和可维护性
 * 4. 不影响原有功能，只是重构了实现方式
 */
const utils = {
  /**
   * 深拷贝对象
   * 优化说明：
   * 1. 统一使用JSON方式实现深拷贝
   * 2. 替代之前的JSON.parse(JSON.stringify())写法
   * 3. 保持原有功能不变
   */
  deepClone: (obj) => JSON.parse(JSON.stringify(obj)),

  /**
   * 生成唯一ID
   * 优化说明：
   * 1. 统一ID生成方式
   * 2. 替代之前直接使用new Date().getTime()的写法
   * 3. 便于后续扩展其他ID生成策略
   */
  generateUniqueId: () => new Date().getTime(),

  /**
   * 递归处理子部件
   * 优化说明：
   * 1. 将递归逻辑抽取为独立函数
   * 2. 使用函数式编程方式，提高代码可读性
   * 3. 支持自定义处理函数，增加灵活性
   * 4. 替代之前的重复递归代码
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
   * 优化说明：
   * 1. 将查找逻辑抽取为独立函数
   * 2. 优化代码结构，提高可读性
   * 3. 保持原有功能不变
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
};

export default {
  name: "CardCellEditor", // 添加组件名称，便于调试
  components: {
    Icon,
    CardPart,
    propertyEditor,
    CardCell,
  },
  data() {
    return {
      cardNo: "",
      cardInfo: null,
      type: "add",
      partsList: [],
      selectedPart: null,
      draggedPart: null,
      onSaving: false,
      isPreview: false,
      hiddenPartsVisible: false,
      isDarkMode: false,
      partHeaderStyle: {},
      clipboardData: null,
      storageKey: CONSTANTS.STORAGE_KEY, // 使用常量
      useSystemClipboard: true,
      saveTimer: null, // 用于防抖的定时器
      partHeaderStyleCache: new Map(), // 用于缓存样式计算结果
      isEditorActive: false, // 添加编辑器激活状态
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
    /**
     * 优化样式计算
     * 优化说明：
     * 1. 添加缓存机制，避免重复计算
     * 2. 使用Map存储计算结果
     * 3. 当部件ID相同时直接返回缓存结果
     */
    optimizedPartHeaderStyle() {
      if (!this.selectedPart) return {};

      // const cacheKey = this.selectedPart._id || this.selectedPart.id;
      // if (this.partHeaderStyleCache.has(cacheKey)) {
      //   return this.partHeaderStyleCache.get(cacheKey);
      // }

      const style = this.calcPartHeaderPosition(this.selectedPart);
      // this.partHeaderStyleCache.set(cacheKey, style);
      return style;
    },
  },
  methods: {
    /**
     * 统一的错误处理方法
     * 优化说明：
     * 1. 统一错误处理逻辑
     * 2. 提供默认错误消息
     * 3. 同时输出到控制台和显示给用户
     * 4. 便于统一管理和修改错误处理方式
     */
    handleError(error, message = "操作失败") {
      console.error(message, error);
      this.$message.error(message);
    },

    /**
     * 加载状态管理
     * 优化说明：
     * 1. 统一管理加载状态
     * 2. 自动处理错误情况
     * 3. 确保加载状态正确清除
     * 4. 提供加载提示消息
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
     * 优化保存方法
     * 优化说明：
     * 1. 添加防抖处理，避免频繁保存
     * 2. 使用统一的加载状态管理
     * 3. 优化错误处理
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
     * 优化拖拽体验
     * 优化说明：
     * 1. 添加自定义拖拽图像
     * 2. 设置拖拽效果为复制
     * 3. 优化视觉反馈
     */
    onDragStart(event, item) {
      event.dataTransfer.effectAllowed = "copy";
      event.dataTransfer.setData("part", JSON.stringify(item));
      this.draggedPart = item;

      const dragImage = document.createElement("div");
      dragImage.className = "drag-image";
      dragImage.textContent = item.label || item.parts_type;
      document.body.appendChild(dragImage);
      event.dataTransfer.setDragImage(dragImage, 0, 0);

      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
    },

    /**
     * 优化拖拽放置体验
     * 优化说明：
     * 1. 添加放置动画效果
     * 2. 优化错误处理
     * 3. 使用工具函数处理数据
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

          Object.keys(newPart).forEach((key) => {
            if (key.startsWith("_default_")) {
              newPart[key.replace("_default_", "")] = newPart[key];
              delete newPart[key];
            }
          });

          this.partsList.push(newPart);

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
      this.clearCache();
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
      
      const ignoreKeys = [
        "create_user_disp",
        "create_time",
        "create_user",
        "modify_time",
        "modify_user_disp",
        "modify_user",
        "card_parts_no",
        "del_flag",
        "is_leaf",
      ];
      const duplicatedPart = JSON.parse(JSON.stringify(part));
      duplicatedPart.id = null;
      duplicatedPart.card_parts_no = null;
      // 生成新的唯一ID
      duplicatedPart._id = utils.generateUniqueId();
      duplicatedPart._editType = "add";
      if (part.id) {
        duplicatedPart._duplicate_id = part.id;
      }
      ignoreKeys.forEach((key) => {
        delete duplicatedPart[key];
      });
      // 如果部件有子部件，递归处理子部件
      if (duplicatedPart.children && duplicatedPart.children.length) {
        const duplicateChildren = (children) => {
          return children.map((child, index) => {
            const newChild = JSON.parse(JSON.stringify(child));
            newChild.id = null;
            newChild.card_parts_no = null;
            newChild._id = utils.generateUniqueId() + Math.random() * 100;
            newChild._editType = "add";
            if (child.id) {
              newChild._duplicate_id = child.id;
            }
            if (newChild.children && newChild.children.length) {
              newChild.children = duplicateChildren(newChild.children);
            }
            ignoreKeys.forEach((key) => {
              delete newChild[key];
            });
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
          duplicatedPart.seq = (this.partsList.length + 1) * 100;
          this.partsList.push(duplicatedPart);
        } else {
          // 如果是子节点，添加到父节点的children数组末尾
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
        // 如果找不到父节点，添加到根节点
        duplicatedPart.seq = (this.partsList.length + 1) * 100;
        this.partsList.push(duplicatedPart);
      }

      // 选中新复制的部件
      this.$nextTick(() => {
        this.selectPart(duplicatedPart);
      });
    },
    // 删除部件
    deletePart(part, index) {
      // 清除相关缓存
      if (part._id || part.id) {
        this.partHeaderStyleCache.delete(part._id || part.id);
      }

      // 原有的删除逻辑
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
    async selectPart(part) {
      // 检查剪贴板支持
      if (this.selectedPart === part) return; // 避免重复选择

      this.selectedPart = part;
      this.partHeaderStyle = this.optimizedPartHeaderStyle;
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
      this.clearCache();
      this.getCardInfo();
    },
    // 预览卡片
    previewCard() {
      if (!this.partsList.length) {
        this.$message.warning("请先添加卡片部件");
        return;
      }

      // 添加过渡动画
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
    // 新增：检查是否可以使用系统剪贴板
    async checkClipboardSupport() {
      if (!navigator.clipboard) {
        this.useSystemClipboard = false;
        return;
      }

      try {
        // 尝试写入一个测试数据
        await navigator.clipboard.writeText("test");
        this.useSystemClipboard = true;
      } catch (e) {
        console.warn("系统剪贴板不可用，将使用localStorage:", e);
        this.useSystemClipboard = false;
      }
    },
    async handleCopyPart() {
      // 处理复制功能
      const ignoreKeys = [
        "create_user_disp",
        "create_time",
        "create_user",
        "modify_time",
        "modify_user_disp",
        "modify_user",
        "card_parts_no",
        "del_flag",
        "is_leaf",
      ];
      if (this.selectedPart) {
        try {
          const data = utils.deepClone(this.selectedPart);
          data[CONSTANTS.PART_IDENTIFIER] = true;
          ignoreKeys.forEach((key) => {
            delete data[key];
          });
          await this.checkClipboardSupport();
          if (this.useSystemClipboard) {
            await navigator.clipboard.writeText(JSON.stringify(data));
          } else {
            this.clipboardData = data;
            localStorage.setItem(this.storageKey, JSON.stringify(data));
          }
          this.$message.success("已复制到剪贴板");
        } catch (e) {
          console.error("复制失败:", e);
          this.$message.error("复制失败");
        }
      } else {
        this.$message.warning("请先选择要复制的部件");
      }
    },

    async handleKeyDown(event) {
      if (event.ctrlKey && event.key === "c") {
        this.handleCopyPart();
      }

      // 处理粘贴功能
      if (event.ctrlKey && event.key === "v") {
        this.pastePart();
      }

      // 处理删除功能
      if (event.key === "Delete" || event.key === "Backspace") {
        if (this.selectedPart) {
          // 查找部件在列表中的索引
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

    async pastePart() {
      try {
        let clipboardData;

        if (this.useSystemClipboard) {
          const clipboardText = await navigator.clipboard.readText();
          if (!clipboardText) {
            this.$message.warning("剪贴板为空");
            return;
          }
          clipboardData = JSON.parse(clipboardText);
        } else {
          const storedData = localStorage.getItem(this.storageKey);
          if (!storedData) {
            this.$message.warning("剪贴板为空");
            return;
          }
          clipboardData = JSON.parse(storedData);
        }

        if (!clipboardData || !clipboardData[CONSTANTS.PART_IDENTIFIER]) {
          this.$message.warning("剪贴板数据不是有效的卡片部件");
          return;
        }

        const newPart = utils.deepClone(clipboardData);
        newPart._editType = "add";
        delete newPart[CONSTANTS.PART_IDENTIFIER];
        const ignoreKeys = [
          "create_user_disp",
          "create_time",
          "create_user",
          "modify_time",
          "modify_user_disp",
          "modify_user",
          "card_parts_no",
          "del_flag",
          "is_leaf",
          "id",
          "parent_no",
        ];
        newPart._duplicate_id = newPart.id;
        newPart._id = utils.generateUniqueId();
        ignoreKeys.forEach((key) => {
          delete newPart[key];
        });
        
        if (Array.isArray(newPart.children)) {
          function foreachChildren(list) {
            if (Array.isArray(list) && list.length) {
              return list.map((item) => {
                item._duplicate_id = item.id;
                item._id = utils.generateUniqueId();
                ignoreKeys.forEach((key) => {
                  delete item[key];
                });
                if (Array.isArray(item.children)) {
                  item.children = foreachChildren(item.children);
                }
                return item;
              });
            }
          }
          newPart.children = foreachChildren(newPart.children);
        }
        // 如果没有选中部件，直接添加到根级别
        if (!this.selectedPart) {
          return this.duplicatePart(newPart);
        }
        // 如果被粘贴的组件是当前选中的组件
        if (
          (this.selectedPart._id &&
            this.selectedPart._id === newPart._duplicate_id) ||
          (this.selectedPart.id &&
            this.selectedPart.id === newPart._duplicate_id)
        ) {
          // 查找父节点
          const parentInfo = utils.findParentNode(
            this.partsList,
            this.selectedPart
          );
          if (parentInfo) {
            if (parentInfo.isRoot) {
              // 如果是根节点，添加到partsList中
              newPart.seq = (this.partsList.length + 1) * 100;
              this.partsList.push(newPart);
              this.$message.success("粘贴成功");
            } else {
              // 如果是子节点，添加到父节点的children中
              newPart.seq = (parentInfo.parent.children.length + 1) * 100;
              if (parentInfo.parent.card_parts_no) {
                newPart.parent_no = parentInfo.parent.card_parts_no;
              }
              if (parentInfo.parent.card_no) {
                newPart.card_no = parentInfo.parent.card_no;
              }
              

              parentInfo.parent.children.push(newPart);
              this.$message.success("粘贴成功");
            }
          } else {
            // 如果找不到父节点，添加到根节点
            newPart.seq = (this.partsList.length + 1) * 100;
            this.partsList.push(newPart);
            this.$message.success("粘贴成功");
          }
        } else {
          // 如果被粘贴的组件不是当前选中的组件
          if (this.selectedPart.parts_type === "row") {
            // 如果选中的是row类型，添加到其children中
            if (!this.selectedPart.children) {
              this.$set(this.selectedPart, "children", []);
            }
            if (this.selectedPart.card_parts_no) {
              newPart.parent_no = this.selectedPart.card_parts_no;
            }
            if (this.selectedPart.card_no) {
              newPart.card_no = this.selectedPart.card_no;
            }
            newPart.seq = (this.selectedPart.children.length + 1) * 100;
            this.selectedPart.children.push(newPart);
            this.$message.success("粘贴成功");
          } else {
            this.$message.warning("只能将组件粘贴到类型为row的部件中");
            return;
          }
        }

        // 选中新粘贴的部件
        this.$nextTick(() => {
          this.selectPart(newPart);
        });
      } catch (e) {
        console.error("粘贴失败:", e);
        this.$message.error("粘贴失败，数据格式错误");
      }
    },

    // 新增：监听storage事件
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
    // 新增：清理缓存的方法
    clearCache() {
      this.partHeaderStyleCache.clear();
    },
    /**
     * 处理编辑器点击事件
     * 优化说明：
     * 1. 点击空白处时激活编辑器
     * 2. 清除当前选中的部件
     * 3. 添加高亮效果
     */
    handleEditorClick() {
      this.isEditorActive = true;
      this.selectedPart = null;
      this.partHeaderStyle = null;
      this.partHeaderStyleCache.clear();
    },
    /**
     * 处理容器点击事件
     * 优化说明：
     * 1. 点击容器空白区域时激活编辑器
     * 2. 阻止事件冒泡
     * 3. 与editor-content的点击效果保持一致
     */
    handleContainerClick(event) {
      // 如果点击的是容器本身（而不是其子元素）
      if (event.target === event.currentTarget) {
        // this.handleEditorClick();
        this.selectPart();
        this.isEditorActive = false;
      }
    },
  },
  created() {
    this.init();
  },
  async mounted() {
    // 添加键盘事件监听
    window.addEventListener("keydown", this.handleKeyDown);

    // 如果不使用系统剪贴板，添加storage事件监听
    if (!this.useSystemClipboard) {
      window.addEventListener("storage", this.handleStorageChange);
    }
  },
  beforeDestroy() {
    // 清除定时器
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    // 清除缓存
    this.clearCache();

    // 移除事件监听
    window.removeEventListener("keydown", this.handleKeyDown);
    if (!this.useSystemClipboard) {
      window.removeEventListener("storage", this.handleStorageChange);
    }
  },
};
</script>

<style lang="scss" scoped>
/**
 * 2025.6.7样式优化说明：
 * 1. 添加拖拽相关样式，提供更好的视觉反馈
 * 2. 添加动画效果，提升用户体验
 * 3. 优化深色模式样式
 * 4. 添加响应式布局支持
 */

// 拖拽相关样式
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

// 动画相关样式
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
  cursor: pointer; // 添加指针样式

  // 添加悬停效果
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

    // 将选中效果移到overlay上
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
