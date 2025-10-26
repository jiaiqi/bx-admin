<template>
  <div style="width: 100%;display: flex;">
    <a
      class="flex-1"
      v-if="field.info.linkUrlFunc && !field.info.editable"
      v-show="field.getSrvVal()"
      style="white-space: normal; color: dodgerblue; cursor: pointer"
      @click="onLinkClicked()"
    >
      {{ field.getDispVal4Read() }}
    </a>
    <el-input
      class="flex-1"
      v-else-if="field.model && noData"
      clearable
      @clear="onClear()"
      :value="field.getSrvVal()"
    ></el-input>
    <el-cascader
      class="flex-1"
      v-else
      :placeholder="field.info.placeholder"
      :options="options"
      v-model="selected"
      :props="props"
      :change-on-select="unlimited"
      filterable
      clearable
      :visible-change="visibleChange"
      :show-all-levels="field.info.editable"
      :disabled="!field.info.editable"
      :before-filter="beforeFilter"
      @change="onChange"
      :emitPath="false"
      ref="elCascader"
    >
      <template
        slot-scope="{ node, data }"
        v-if="props.checkStrictly !== false"
      >
        <span @click.stop="clickNode(node, data)">{{ node.label }}</span>
      </template>
    </el-cascader>
    <el-button
      icon="el-icon-search"
      v-if="!field.info.noSearchIcon && field.info.editable"
      @click="onPopupClicked"
      type="default"
      class=""
      style="background-color: #F5F7FA;"
    >
    </el-button>

    <el-dialog
      title="查询选择"
      width="90%"
      :close-on-click-modal="1 == 2"
      append-to-body
      :visible="popup"
      v-if="popup"
      @close="popup = false"
    >
      <!-- <list
        :service="dispLoaderV2.service"
        v-if="popup"
        ref="popup"
        mode="finder"
        listType="selectlist"
        :grid-data-filter="this.dedupOptions"
        :default-condition="popupDefaultConditions()"
        @row-dbclick="onRowSelected"
      >
      </list> -->
      <tab-list
        :service="dispLoaderV2.service"
        v-if="popup"
        ref="popup"
        mode="finder"
        tabListType="treelist"
        :mode="'selectlist'"
        :grid-data-filter="this.dedupOptions"
        :default-condition="popupDefaultConditions()"
        @row-dbclick="onRowSelected"
      ></tab-list>
      <div style="text-align: center; color: red">请双击列表行进行选择</div>
    </el-dialog>
  </div>
</template>

<script>
import debounce from "lodash/debounce";
export default {
  components: {
    List: () => import("../common/list.vue"),
    TabList: () => import("@/components/common/tab-list2.vue"),
  },
  props: {
    field: Object,
    allowChangeModel: {
      type: Boolean,
      default: true,
    }
  },
  data() {
    return {
      // value组成的路径数组
      selected: [],
      // 树形结构数据
      options: [],
      noData: false,
      visibleChange: false,
      hasInit: false, //已经设置过初始值
      popup: false, // 列表弹窗

    };
  },

  computed: {
    props: function () {
      let props = {
        value: this.field.info.valueCol,
        label: this.needRenameLabel() ? "valuezh" : this.field.info.dispCol,
        checkStrictly:
          top?.env?.includes("health") ||
            this.optionListV2?.checkStrictly === false ||
            this.optionListV2?.["只能选择叶子节点"] === true
            ? false
            : true, //只有健康科普资源库后台需要只能选择最后一级节点,其他都需要
        lazy: this.dispLoaderV2?.lazyLoad === false ? false : true,
        lazyLoad: (node, resolve) => {
          if (
            this.dispLoaderV2?.refedCol &&
            node.data?.[this.dispLoaderV2.refedCol]
          ) {
            this.loadChildren(
              this.dispLoaderV2,
              node.data[this.dispLoaderV2.refedCol]
            ).then((list) => {
              resolve(list);
            });
          } else if (!node.data?.[this.dispLoaderV2.refedCol]) {
            this.loadOptions().then((res) => {
              if (Array.isArray(res)) {
                resolve(res);
              }
            });
          }
        },
      };
      return props;
    },
    unlimited: function () {
      // 是否允许选择 任意一级， false ，true
      let unlimited =
        this.optionListV2 || this.field.info.srvCol.option_list_v2;
      if (
        unlimited.hasOwnProperty("unlimited") &&
        unlimited.unlimited === false
      ) {
        return false;
      } else {
        return true;
      }
    },
    dispLoaderV2() {
      if (this.optionListV2?.refed_col) {
        const optionListV2 = this.optionListV2;
        return {
          service: optionListV2.serviceName || optionListV2.service,
          conditions: optionListV2.conditions || [],
          relation_conditions: optionListV2.relation_conditions || null,
          orders: optionListV2.orders || null,
          showAsPair: optionListV2.show_as_pair || null,
          imgType: optionListV2.img_type || null, // 图片类型：img-图片 eicon- el-icon图标
          imgCol: optionListV2.refed_col || null, // 图片字段 同之前的img_url_expr
          imgUrlExpr: optionListV2.img_url_expr || optionListV2.img_col || null,
          dedup: optionListV2.dedup,
          srvApp: optionListV2.srv_app || null,
          parentCol:
            optionListV2.parent_col ||
            optionListV2.parent_no_col ||
            "parent_no",
          refedCol: optionListV2.refed_col,
          dispCol: optionListV2.key_disp_col || optionListV2.disp_col,
          lazyLoad:
            optionListV2.lazy_load ??
            optionListV2.lazyLoad ??
            optionListV2["懒加载"] ??
            true,
        };
      } else {
        return this.field?.info?.dispLoader;
      }
    },
    optionListV2() {
      if (this.field?.info?.srvCol?.option_list_v3?.length) {
        const option_list_v3 = this.field?.info?.srvCol?.option_list_v3;
        const formModel = this.field.form.srvValFormModel();
        const result = option_list_v3.find((item) => {
          if (item.conds?.length) {
            // 条件外键
            return item.conds.every((cond) =>
              cond.case_val?.includes?.(formModel[cond.case_col])
            );
          } else {
            return true;
          }
        });
        if (result) {
          return result;
        } else {
          return null;
        }
      }
      return this.field?.info?.srvCol?.option_list_v2;
    },
  },

  methods: {
    emitFieldValueChange() {
      let objCol = null;
      let objInfo = this.optionListV2?.obj_info;
      if (objInfo?.a_save_b_cols && objInfo?.a_save_b_obj_col) {
        // fk字段值改变后，更新其option_list_v3中配置的的a_save_b_obj_col
        let newValue = this.field.model;
        if (this.isFks) {
          newValue = this.$refs?.tablePicker?.getSelectedData?.();
        }
        const cols = objInfo?.a_save_b_cols.split(",");
        let obj = {};
        let objStr = "";
        if (cols?.includes("*")) {
          obj = cloneDeep(newValue);
        } else if (newValue && cols?.length) {
          cols.forEach((col) => {
            obj[col] = newValue?.[col];
          });
        }
        objStr = JSON.stringify(obj);
        if (objStr === "{}" || !newValue || !isObject(newValue)) {
          objStr = "";
        }
        objCol = {
          type: "a_save_b_obj",
          col: objInfo.a_save_b_obj_col,
          val: objStr,
        };
        console.log("更新obj_info", objCol);
        // 将更新的字段信息保存在_obj_col上，方便在form中获取
        this.$set(this.field, "_obj_col", objCol);
      } else if (this.field?._obj_col?.val) {
        // 清空通过_obj_col保存的值
        this.$set(this.field["_obj_col"], "val", "");
      }
      this.$emit("field-value-changed", this.field.info.name, this.field);
    },
    async onRowSelected(row, event) {
      let item = row;
      // this.field.model = item;

      // this.$emit("blur", this.field);
      // this.emitFieldValueChange();
      let fieldInfo = this.field.info;
      let loader = this.dispLoaderV2;
      // this.selected =
      //   loader.showAsPair !== true
      //     ? item[fieldInfo.dispCol]
      //     : `${item[fieldInfo.dispCol]}/${item[fieldInfo.valueCol]}`;
      this.popup = false;
      if (this.allowChangeModel !== false) {
        this.changeFieldModel(item || null);
      } else {
        this.onlyEmitData(item || null);
      }

      // 修复：正确设置el-cascader的selected路径
      if (item && item.path) {
        // 将path按'/'分割，并转换为对应的value值数组
        let pathArray = item.path.split('/').filter(Boolean);
        this.selected = pathArray.map((val) => {
          // 如果value字段是数字类型，需要转换为数字
          if (typeof item[this.props.value] === "number" && !isNaN(Number(val))) {
            return Number(val);
          }
          return val;
        });

        // 获取完整路径数据并构建树形结构
        try {
          const treeStructureData = await this.getFullPathData(item.path);
          console.log('完整路径树形数据:', treeStructureData);
          this.options = treeStructureData
          // 触发自定义事件，将树形结构数据传递给父组件
          this.$emit('path-data-loaded', {
            selectedItem: item,
            treeStructureData: treeStructureData,
            path: item.path
          });
        } catch (error) {
          console.error('获取完整路径数据失败:', error);
        }
      } else {
        this.selected = [];
      }

    },

    /**
     * 根据路径查询所有相关数据并构建树形结构
     * @param {string} path - 路径字符串，如 "1/2/3"
     * @returns {Object} 树形结构数据
     */
    async getFullPathData(path) {
      if (!path) return null;

      try {
        const loader = this.dispLoaderV2 || this.field.info.dispLoader;
        if (!loader) {
          console.error('数据加载器配置不存在');
          return null;
        }

        const pathArray = path.split('/').filter(item => item !== '');
        if (pathArray.length === 0) return null;

        // 获取最顶级节点的值
        const topLevelValue = pathArray[0];

        // 构建查询条件 - 使用path进行like查询
        let conditions = this.buildConditions(loader);
        conditions.push({
          colName: "path",
          ruleType: "like",
          value: topLevelValue
        });

        const params = {
          serviceName: loader.service,
          colNames: ["*"],
          condition: conditions
        };

        const url = this.getServiceUrl("select", loader.service);
        const response = await this.$http.post(url, params);

        if (response?.data?.state === "SUCCESS" && response.data.data?.length > 0) {
          // 按照treeLazySelect中的方法处理数据
          let allData = response.data.data.map((item) => {
            item.children = item.is_leaf === "是" ? null : [];
            item.leaf = item.is_leaf === "是";
            return item;
          });

          // 如果需要重命名标签
          if (this.needRenameLabel()) {
            allData.forEach((item) => this.renameLable(item));
          }

          // // 从查询结果中筛选出路径相关的数据
          // const pathRelatedData = [];

          // for (let i = 0; i < pathArray.length; i++) {
          //   const currentPath = pathArray.slice(0, i + 1).join('/');
          //   const nodeData = allData.find(item => item.path && item.path.includes(currentPath));

          //   if (nodeData) {
          //     pathRelatedData.push(nodeData);
          //   } else {
          //     console.warn(`未找到路径对应的数据: ${currentPath}`);
          //     break;
          //   }
          // }

          // 构建树形结构
          const treeOptions = {
            idField: this.props?.value || 'id',
            parentField: this.dispLoaderV2?.parentCol || 'parentId',
            childrenField: 'children',
            rootValue: null
          };
          return this.buildTreeStructure(allData, treeOptions);

        } else {
          console.error('查询路径数据失败');
          return null;
        }

      } catch (error) {
        console.error('获取完整路径数据失败:', error);
        return null;
      }
    },

    /**
     * 将路径数据数组构建成树形结构
     * @param {Array} pathDataArray - 路径数据数组
     * @returns {Object} 树形结构数据
     */
    /**
     * 将数组数据构建为树形结构
     * @param {Array} dataArray - 数据数组
     * @param {Object} options - 配置选项
     * @param {string} options.idField - ID字段名，默认为 'id'
     * @param {string} options.parentField - 父节点字段名，默认为 'parentId'
     * @param {string} options.childrenField - 子节点字段名，默认为 'children'
     * @param {*} options.rootValue - 根节点的父节点值，默认为 null
     * @returns {Array} 树形结构数组
     */
    buildTreeStructure(dataArray, options = {}) {
      if (!dataArray || !Array.isArray(dataArray) || dataArray.length === 0) {
        return [];
      }

      const {
        idField = this.props?.value || 'id',
        parentField = this.dispLoaderV2?.parentCol || 'parentId',
        childrenField = 'children',
        rootValue = null
      } = options;

      // 创建数据副本，避免修改原数组
      const dataMap = new Map();
      const result = [];

      // 第一步：创建所有节点的映射
      dataArray.forEach(item => {
        const nodeData = { ...item };
        nodeData[childrenField] = [];
        dataMap.set(nodeData[idField], nodeData);
      });

      // 第二步：构建父子关系
      dataArray.forEach(item => {
        const nodeData = dataMap.get(item[idField]);
        const parentId = item[parentField];

        if (parentId === rootValue || parentId === null || parentId === undefined || parentId === '') {
          // 根节点
          result.push(nodeData);
        } else {
          // 子节点
          const parentNode = dataMap.get(parentId);
          if (parentNode) {
            parentNode[childrenField].push(nodeData);
          } else {
            // 如果找不到父节点，也作为根节点处理
            result.push(nodeData);
          }
        }
      });

      // 第三步：清理空的children数组（可选）
      const cleanEmptyChildren = (nodes) => {
        nodes.forEach(node => {
          if (node[childrenField] && node[childrenField].length === 0) {
            node[childrenField] = node.leaf === true ? null : [];
          } else if (node[childrenField] && node[childrenField].length > 0) {
            cleanEmptyChildren(node[childrenField]);
          }
        });
      };

      cleanEmptyChildren(result);
      return result;
    },

    popupDefaultConditions(loader) {
      let conditions = this.defaultConditions || [];
      let fieldInfo = this.field.info;
      loader = loader || this.dispLoaderV2;
      return conditions.concat(this.buildConditions(loader));
    },

    dedupOptions(options, loader) {
      loader = loader || this.dispLoaderV2;
      if (!loader?.dedup) {
        return;
      }

      let form = this.field.form;
      if (form) {
        let gridData = form.srvValFormModel()._gridData;
        if (gridData && gridData.length) {
          let key_col = this.field.info.srvCol.columns;
          let existVals = gridData.map((item) => item[key_col]);
          remove(options, (option) => existVals.includes(option[key_col]));
        }
      }
    },

    onPopupClicked() {
      if (!this.field.info.editable) {
        return;
      }

      this.popup = true;

      // hide suggestions
      this.$refs.elCascader.activated = false;
    },
    changeFieldModel(data, emitEvent = true) {
      this.field.model = data;
      if (emitEvent) {
        this.$emit("field-value-changed", this.field.info.name, this.field);
      }
    },
    onlyEmitData(data) {
      this.$emit("on-change", data);
    },
    clickNode(node, data) {
      if (this.props.checkStrictly === false) {
        if (data.is_leaf !== "是") {
          // 非叶子节点 只能选择叶子节点
          return;
        }
      }
      console.log(node, data, "clickNode");
      // this.field.model = data;
      // if (this.dispLoaderV2?.lazyLoad === false) {
      //   this.selected = [data[this.props.value]];
      // } else {
      this.selected = node.path;
      // }
      // this.$emit("field-value-changed", this.field.info.name, this.field);
      if (this.allowChangeModel !== false) {
        this.changeFieldModel(data);
      } else {
        this.onlyEmitData(data);
      }
      this.$nextTick(() => {
        this.$refs.elCascader.dropDownVisible = false;
      });
    },
    onClear() {
      if (this.allowChangeModel !== false) {
        this.changeFieldModel(null);
      } else {
        this.onlyEmitData(null);

      }
      this.$nextTick(() => {
        this.loadOptions();
      });
    },
    needRenameLabel() {
      return this.field.info.dispCol === "value";
    },
    onItemChange(val) {
      if (Array.isArray(val) && val.length > 0) {
        this.onSelectChange(val[val.length - 1]);
      }
    },
    async beforeFilter(value) {
      console.log("beforeFilter", value);
      let loader = this.dispLoaderV2 || this.field.info.dispLoader;
      if (loader.parentCol) {
        const url = this.getServiceUrl("select", loader.service);
        const fieldInfo = this.field.info;
        const relation_condition = {
          relation: "OR",
          data: [
            {
              colName: fieldInfo.valueCol,
              ruleType: "like",
              value: value,
            },
            {
              colName: fieldInfo.dispCol,
              ruleType: "like",
              value: value,
            },
          ],
        };
        let conditions = this.buildConditions(loader);
        var params = {
          serviceName: loader.service,
          colNames: ["*"],
          condition: conditions,
          relation_condition: relation_condition,
          // page: {
          //   pageNo: 1,
          //   pageSize: 2000,
          // },
        };
        const response = await this.$http.post(url, params);
        if (response?.data?.state == "SUCCESS") {
          let options = response.data.data.map((item) => {
            item.children = item.is_leaf === "是" ? null : [];
            item.leaf = item.is_leaf === "是";
            return item;
          });
          this.options = options;
        }
      }
    },
    inputChange: debounce(function (e) {
      console.log(e.target.value);
      let val = e.target.value;
      let loader = this.dispLoaderV2 || this.field.info.dispLoader;
      if (loader.parentCol) {
        console.log(val, "onSelectChange");
        this.treeLazySelect(loader, null, val);
      }
    }, 500),
    async loadChildren(loader, parentNo, val, curVal) {
      let conditions = [];
      // let conditions = this.buildConditions(loader)
      if (Array.isArray(parentNo)) {
        if (parentNo.length > 0) {
          parentNo = parentNo[parentNo.length - 1];
        } else {
          parentNo = "";
        }
      }
      if (parentNo) {
        conditions.push({
          colName: loader.parentCol,
          ruleType: "eq",
          value: parentNo,
        });
      }
      var params = {
        serviceName: loader.service,
        colNames: ["*"],
        condition: conditions,
        page: {
          pageNo: 1,
          pageSize: 500,
        },
      };
      var url = this.getServiceUrl("select", loader.service);

      const response = await this.$http.post(url, params);
      if (response?.data?.state == "SUCCESS") {
        function setTreeData(data) {
          if (!data || data.length === 0) {
            return;
          }
          data.forEach((item) => {
            item.children = item.is_leaf === "是" ? null : [];
            item.leaf = item.is_leaf === "是";
            if (item.children && item.children.length > 0) {
              setTreeData(item.children);
            }
          });
        }

        const data = response.data.data.map((item) => {
          item.children = item.is_leaf === "是" ? null : [];
          item.leaf = item.is_leaf === "是";
          return item;
        });
        setTreeData(data);
        return data;
      } else {
        console.error("loadChildren error", response.data);
        return [];
      }
    },
    /**
     * 树型数据懒加载
     * @param parentNo {string} 点击的节点的编号
     * @param val {string} 搜索的值
     * @param curVal {string} 字段默认值
     * 加载逻辑：
     * 如果是点击节点后进行查询，则将所点击的节点的编号parentNo为父节点 作为过滤条件
     * 如果是搜索的，则将搜索值val作为relation_contiton（OR）
     * 如果有默认值，则将默认值curVal作为过滤条件
     * 如果不是点击节点后查询、不是搜索、没有默认值 则将父节点编号isnull 作为过滤条件
     * 如果有默认条件（option_list配置的）,以上所有情况 请求都带上默认条件
     */
    async treeLazySelect(loader, parentNo = "", val = "", curVal) {
      const fieldInfo = this.field.info;
      let conditions = this.buildConditions(loader);
      let relation_condition = {};
      var url = this.getServiceUrl("select", loader.service);
      if (Array.isArray(parentNo)) {
        if (parentNo.length > 0) {
          parentNo = parentNo[parentNo.length - 1];
        } else {
          parentNo = "";
        }
      }
      if (val) {
        relation_condition = {
          relation: "OR",
          data: [
            {
              colName: fieldInfo.valueCol,
              ruleType: "like",
              value: val,
            },
            {
              colName: fieldInfo.dispCol,
              ruleType: "like",
              value: val,
            },
          ],
        };
      } else if (curVal) {
        conditions = [
          ...conditions,
          {
            colName: this.props.value,
            ruleType: "eq",
            value: curVal,
          },
        ];
      } else if (parentNo) {
        if (loader.parentCol) {
          conditions = [
            ...conditions,
            {
              colName: loader.parentCol,
              ruleType: "eq",
              value: parentNo,
            },
          ];
        }
      } else if (this.selected && this.selected.length > 0) {
        parentNo = this.selected[this.selected.length - 1];
        conditions = [
          ...conditions,
          {
            colName: loader.parentCol,
            ruleType: "eq",
            value: parentNo,
          },
        ];
      } else {
        // 加载第一级数据

        // if (this.field.model) {
        //   let curVal = this.field.getSrvVal()
        //   conditions = [ ...conditions, {
        //     colName: fieldInfo.valueCol,
        //     ruleType: "eq",
        //     value: curVal
        //   } ]
        // }

        if (loader.parentCol) {
          // 2023年11月13日11点35分注释，top tree data特性，后端返回符合条件的树型数据的最顶层节点数据，不使用parentCol为null作为条件
          // conditions = [
          //   ...conditions,
          //   {
          //     colName: loader.parentCol,
          //     ruleType: "isnull"
          //   }
          // ];
        }
      }

      var params = {
        serviceName: loader.service,
        colNames: ["*"],
        condition: conditions,
        relation_condition: relation_condition,
        rdt: "ttd", //2023年11月13日 修改，top tree data特性，后端返回符合条件的树型数据的最顶层节点数据,
        // page: {
        //   pageNo: 1,
        //   pageSize: 2000,
        // },
      };
      if (loader.lazyLoad === false) {
        // params.page = {
        //   pageNo: 1,
        //   pageSize: 2000,
        // };
        delete params.rdt;
        params.treeData = true;
        delete params.condition;
      }
      const response = await this.$http.post(url, params);
      this.noData = false;
      if (response && response.data && response.data.data) {
        if (response.data.data.length === 0) {
          this.noData = true;
        }

        if (loader.lazyLoad === false) {
          this.options = response.data.data;
          // this.selected = this.field.model;
        } else {
          let options = response.data.data.map((item) => {
            item.children = item.is_leaf === "是" ? null : [];
            item.leaf = item.is_leaf === "是";
            return item;
          });
          if (this.needRenameLabel()) {
            options.forEach((option) => this.renameLable(option));
          }
          if (curVal && response.data.data.length > 0) {
            let item = response.data.data[0];
            // this.selected = [item[this.props.value]];
            // let path = item.path;
            // this.selected = path
            //   .split("/")
            //   .map((val) => {
            //     if (
            //       typeof item[this.props.value] === "number" &&
            //       !isNaN(Number(val))
            //     ) {
            //       return Number(val);
            //     }
            //     return val;
            //   })
            //   .filter((t) => !!t);
            this.selected = item?.path?.split("/").filter((item) => !!item) || [];
            if (this.allowChangeModel !== false) {
              this.changeFieldModel(item);
            } else {
              this.onlyEmitData(item);
            }
          }
          return options;
        }

        // if (!this.options||this.options.length === 0) {
        // this.options = options;
        // if(this.selected.length && options.length === 1 && options[0][loader.refedCol] === this.selected[this.selected.length - 1]){
        //   this.selected = [this.selected[this.selected.length - 1]];
        // }
        // }
        // if (parentNo && this.options.length > 0) {
        //   this.options = this.setOptionChild(
        //     this.options,
        //     this.props.value,
        //     parentNo,
        //     options
        //   );
        // } else {
        //   this.options = options;
        // }
      }
    },
    setInitVal() {
      let fieldInfo = this.field.info;
      if (
        this.hasInit === false &&
        this.options.length > 0 &&
        !this.field.model &&
        this.field.info &&
        this.field.info.srvCol &&
        this.field.info.srvCol.init_expr === "$firstRowData"
      ) {
        let loader = this.dispLoaderV2;
        this.field.model = this.options[0];
        this.selected =
          loader.showAsPair !== true
            ? this.options[0][fieldInfo.dispCol]
            : `${this.options[0][fieldInfo.dispCol]}/${this.options[0][fieldInfo.valueCol]
            }`;
        this.hasInit = true;
      } else if (this.field.model && (this.finderSelected || this.field.finderSelected)) {
        this.selected = this.finderSelected || this.field.finderSelected;
      } else if (!this.field.model && !this.finderSelected) {
        this.selected = null;
      }
      // this.inputValue = this.selected
    },
    async setInitValOption() {
      let fieldInfo = this.field.info;
      let arr = this.selected;
      let loader = fieldInfo.dispLoader;
      let options = [];
      if (Array.isArray(arr) && arr.length > 0) {
        for (let index = 0; index < arr.length; index++) {
          const item = arr[index];
          let url = this.getServiceUrl("select", loader.service);
          let params = {
            serviceName: loader.service,
            colNames: ["*"],
            condition: [],
          };
          params.condition = [
            {
              colName: loader.parentCol,
              ruleType: "eq",
              value: item,
            },
          ];
          let data = [];
          let res = await this.$http.post(url, params);
          if (res.data.state == "SUCCESS") {
            data = res.data.data;
          }
          options = this.setOptionChild(
            this.options,
            this.props.value,
            item,
            data
          );
        }
        this.noData = !options?.length;
        this.options = options;
      }
    },
    setOptionChild(options, valCol, parentNo, children) {
      options = options.map((item) => {
        if (item[valCol] === parentNo) {
          if (children.length === 0) {
            children = null;
          }
          item.children = children;
        } else if (Array.isArray(item.children) && item.children.length > 0) {
          item.children = this.setOptionChild(
            item.children,
            valCol,
            parentNo,
            children
          );
        }
        return item;
      });
      return options;
    },
    async loadDetail() {
      const loader = this.dispLoaderV2;
      
      // 获取当前节点的详细信息
      const conditions = [
        {
          colName: loader.refedCol,
          ruleType: "eq",
          value: this.field.model,
        },
      ];
      const params = {
        serviceName: loader.service,
        colNames: ["*"],
        condition: conditions,
        page: {
          pageNo: 1,
          rownumber: 1,
        },
      };
      const url = this.getServiceUrl("select", loader.service);
      const response = await this.$http.post(url, params);
      
      if (response && response.data && response.data.data && response.data.data.length > 0) {
        const item = response.data.data[0];
        
        // 如果有路径信息，构建完整的树形结构
        if (item.path) {
          try {
            // 获取完整路径的树形数据
            const treeStructureData = await this.getFullPathData(item.path);
            if (treeStructureData && treeStructureData.length > 0) {
              this.options = treeStructureData;
              
              // 设置正确的selected路径
              const pathArray = item.path.split('/').filter(Boolean);
              this.selected = pathArray.map((val) => {
                // 如果value字段是数字类型，需要转换为数字
                if (typeof item[this.props.value] === "number" && !isNaN(Number(val))) {
                  return Number(val);
                }
                return val;
              });
              
              console.log('默认值路径设置完成:', {
                path: item.path,
                selected: this.selected,
                options: this.options
              });
            } else {
              // 如果无法获取完整路径数据，使用原有逻辑
              this.selected = item?.path?.split("/").filter((item) => !!item) || [];
            }
          } catch (error) {
            console.error('构建完整路径失败，使用简单路径:', error);
            this.selected = item?.path?.split("/").filter((item) => !!item) || [];
          }
        } else {
          // 没有路径信息时的处理
          this.selected = [];
        }
        
        // 设置字段模型
        if (this.allowChangeModel !== false) {
          this.changeFieldModel(item);
        } else {
          this.onlyEmitData(item);
        }
      }
    },
    async loadOptions() {
      let fieldInfo = this.field.info;
      let conditions = [];
      let loader = this.dispLoaderV2;
      conditions = this.buildConditions(loader);
      if (loader.parentCol) {
        let curVal = this.field.getSrvVal();
        return await this.treeLazySelect(loader, null, null, curVal);
        // if (loader.parentCol) {
        //   let curVal = this.field.getSrvVal();
        //   return this.treeLazySelect(loader, null, null, curVal);
        // } else {
        //   return this.treeSelect(loader.service, conditions).then((response) => {
        //     if (response && response.data && response.data.data) {
        //       let options = response.data.data;
        //       if (this.needRenameLabel()) {
        //         options.forEach((option) => this.renameLable(option));
        //       }
        //       this.options = options;
        //       this.noData = !options?.length;
        //     }
        //   });
      }
      this.treeSelect(loader.service, conditions).then((response) => {
        if (response && response.data && response.data.data) {
          let options = response.data.data;
          if (this.needRenameLabel()) {
            options.forEach((option) => this.renameLable(option));
          }
          this.options = options;
          this.noData = !options?.length;
        }
      });
    },

    renameLable(option) {
      if (!option) {
        return;
      }
      option.valuezh = option.value;

      if (option.children && option.children.length > 0) {
        option.children.forEach((child) => this.renameLable(child));
      }
    },
    onChange(val) {
      if (Array.isArray(val)) {
        if (val.length) {
          val = val[val.length - 1];
        } else {
          val = null;
        }
      }
      setTimeout(() => {
        const data = this.$refs?.elCascader?.getCheckedNodes?.()?.[0]?.data;
        if (val !== this.field.getSrvVal()) {
          // if (data) {
          //   this.field.model = data;
          // } else {
          //   this.field.model = null;
          // }
          if (this.allowChangeModel !== false) {
            this.changeFieldModel(data || null);
          } else {
            this.onlyEmitData(data || null);
          }
          // this.$emit("field-value-changed", this.field.info.name, this.field);
        }
        let loader = this.dispLoaderV2;
        if (loader.parentCol && !val) {
          console.log(val, "onSelectChange");
          this.treeLazySelect(loader, val).then((res) => {
            if (Array.isArray(res) && res.length > 0) {
              this.options = res;
            }
          });
        }
      }, 100);
    },
    onSelectChange(val) {
      let loader = this.dispLoaderV2;

      // if (this.selected && this.selected.length > 0) {
      //   this.field.model = this.findSelectedItem() || this.field.model;
      //   // this.selected = this.field.model
      // } else {
      //   this.field.model = null;
      // }
      const data = this.selected && this.selected.length > 0 ? this.findSelectedItem() || this.field.model : null
      if (this.allowChangeModel !== false) {
        this.changeFieldModel(data || null, false);
      } else {
        this.onlyEmitData(data || null, false);
      }
      if (loader.parentCol) {
        console.log(val, "onSelectChange");
        this.treeLazySelect(loader, val);
      }
      // if (val !== this.field.getSrvVal()) {
      //   this.$emit("field-value-changed", this.field.info.name, this.field);
      // }


    },
    getPath(val) {
      let option = {};
      if (val) {
        option = this.options.find((item) => item[this.props.value] === val);
      }
      if (option && option.path) {
        return option.path;
      }
    },
    findSelectedItem() {
      let valueCol = this.field.info.valueCol;
      let targets = this.options;
      for (let i in this.selected) {
        targets = targets.filter((opt) => opt[valueCol] == this.selected[i]);
        if (!targets || targets.length == 0) {
          return null;
        }

        if (i < this.selected.length - 1) {
          targets = targets[0].children;
        }
      }

      if (!targets || targets.length == 0) {
        return null;
      } else {
        return targets[0];
      }
    },

    setSrvVal(srvVal) {
      if (srvVal == null || srvVal == undefined) {
        if (this.selected && this.selected.length > 0) this.selected = [];
        return;
      }
      let fieldInfo = this.field.info;
      let loader = this.dispLoaderV2;
      let queryJson = {
        serviceName: loader.service,
        queryMethod: "select",
        colNames: ["*"],
        condition: [
          { colName: fieldInfo.valueCol, value: srvVal, ruleType: "eq" },
        ],
      };
      return this.selectList(queryJson).then((response) => {
        if (
          response &&
          response.data &&
          response.data.data &&
          response.data.data.length > 0
        ) {
          let item = response.data.data[0];
          let path = item.path;
          this.selected = path
            .split("/")
            .map((val) => {
              if (
                typeof item[this.props.value] === "number" &&
                !isNaN(Number(val))
              ) {
                return Number(val);
              }
              return val;
            })
            .filter((t) => !!t);
          if (this.allowChangeModel !== false) {
            this.changeFieldModel(item || null, false);
          } else {
            this.onlyEmitData(item || null, false);
          }
          // this.field.model = item;
          // this.$emit("field-value-changed", this.field.info.name, this.field);
          if (this.selected.length > 0 && loader.parentCol) {
            // this.setInitValOption()
          }
        }
      });
    },
    buildConditions: function (dispLoader) {
      let ret = [];
      for (let i in dispLoader.conditions) {
        let cond = dispLoader.conditions[i];
        let condition = {};

        try {
          condition.colName = cond.colName;
          condition.ruleType = cond.ruleType;
          if (cond.disableExpr && eval(cond.disableExpr)) {
            continue;
          }

          let valueExpr = cond.valueExpr || cond.value;
          if (valueExpr) {
            // literal value or js expr
            if (cond.literalValue) {
              condition.value = valueExpr;
            } else {
              condition.value = this.evalExprOrFunc(
                valueExpr,
                this.field.form.srvValFormModel(),
                null
              );
            }
          } else if (cond.valueFunc) {
            condition.value = cond.valueFunc();
          }
        } catch (e) {
          continue;
        }
        if (condition.ruleType === "isnull") {
          /**
           * 增加支持 ruleType === isnull
           */
          ret.push(condition);
        } else {
          if (condition.value != null && condition.value != "") {
            if (Array.isArray(condition.value)) {
              if (condition.value.length == 0) {
                continue;
              }
            }
            ret.push(condition);
          } else if (
            !this.field.info._finderAuto &&
            condition.value === null &&
            cond.value !== null
          ) {
            condition.value = "";
            ret.push(condition);
          }
        }
      }

      return ret;
    },
    getLinkUrl() {
      let data =
        this.field && this.field.form && this.field.form.srvValFormModel();
      if (this.field.info.linkUrlFunc) {
        let url = this.field.info.linkUrlFunc(data, this);
        // 处理url menuapp , 如果用户url 携带 menuapp 不为空 则更新 sessionStorage current_app
        if (url.indexOf("menuapp=") === -1) {
          if (url.indexOf("&") === -1) {
            url = url + "?menuapp=" + sessionStorage.getItem("current_app");
          } else {
            url = url + "&menuapp=" + sessionStorage.getItem("current_app");
          }
        } else {
          let menuapp = "";
          // a.substr(a.indexOf("menuapp=") + 8,a.lastIndexOf("&") - a.indexOf("menuapp=") - 8)
          if (
            url.lastIndexOf("&") !== -1 &&
            url.lastIndexOf("&") > url.indexOf("menuapp=")
          ) {
            menuapp = url.substr(
              url.indexOf("menuapp=") + 8,
              url.lastIndexOf("&") - url.indexOf("menuapp=") - 8
            );
          } else {
            menuapp = url.substr(url.indexOf("menuapp=") + 8, url.length);
          }
          if (menuapp.length > 0) {
            sessionStorage.setItem("current_app", menuapp);
          }
        }
        return url;
      }
    },

    onLinkClicked() {
      let tabTitle =
        this.optionListV2?.service_label ||
        this.field.info?.srvCol?.option_list_v2?.service_label ||
        "详情";
      this.addTabByUrl(this.getLinkUrl(), tabTitle);
    },
  },

  destroyed: function () { },

  created: function () {
    if (this.field.model) {
      this.loadDetail();
    } else {
      // 如果没有默认值，加载初始选项
      this.loadOptions();
    }
    console.log('created:', this.dispLoaderV2);

    // this.loadOptions.then((_) => {
    //   if (this.selected.length == 0 && this.field.model) {
    //     let value = this.field.model[this.field.info.valueCol];
    //     if (value == undefined || value == null) {
    //       value = this.field.model;
    //     }
    //     console.log("tree-finder", this);
    //     if (this.dispLoaderV2?.parentCol) {
    //       // this.setInitValOption(value)
    //     } else {
    //       this.setSrvVal(value);
    //     }
    //   } else if (
    //     this.hasInit === false &&
    //     this.options.length > 0 &&
    //     !this.field.model &&
    //     this.field.info &&
    //     this.field.info.srvCol &&
    //     this.field.info.srvCol.init_expr === "$firstRowData"
    //   ) {
    //     // 默认选中首行数据
    //     // this.field.model = this.options[0];
    //     const model = this.options[0];

    //     // this.$emit("field-value-changed", this.field.info.name, this.field);
    //     if (this.allowChangeModel !== false) {
    //       this.changeFieldModel(model, false);
    //     } else {
    //       this.onlyEmitData(model, false);
    //     }
    //     this.selected = [this.field.model[this.field.info.valueCol]];
    //     this.hasInit = true;
    //   }
    // });
  },
  watch: {
    "field.model": {
      deep: true,
      handler(newValue, oldValue) {
        console.log(newValue, oldValue, "field.model", this.field);
        if (newValue && oldValue && typeof newValue === typeof oldValue && typeof newValue === 'object') {
          if (this.dispLoaderV2.refedCol && newValue[this.dispLoaderV2.refedCol] === oldValue[this.dispLoaderV2.refedCol]) {
            return
          }
        }
        if (newValue && oldValue && typeof newValue === 'object' && typeof oldValue === 'string') {
          if (this.dispLoaderV2.refedCol && newValue[this.dispLoaderV2.refedCol] === oldValue) {
            return
          }
        }
        if (newValue !== oldValue) {
          // 如果新值存在且与旧值不同，重新加载详情以构建完整路径
          if (newValue && typeof newValue === 'object' && newValue[this.dispLoaderV2?.refedCol]) {
            this.loadDetail();
          } else {
            this.setInitVal();
          }
        }
      },
    },
    visibleChange: function (newValue, oldValue) {
      if (newValue) {
        this.loadOptions();
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>