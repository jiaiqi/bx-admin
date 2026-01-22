/**
 * 带子表的组件的mixin，主要处理主表和子表的关系。 Add, Update, Detail都使用该mixin
 */
import { evalJson } from "@/util/evalJsonExpr.js";
import remove from "lodash/remove";
import isEqual from 'lodash/isEqual'
import isString from 'lodash/isString'
export default {
  data() {
    return {
      isMarker: true,
      childrenList: [],
      childrenListLoaded: false,
      hideChildrenLists: false,
      childDataLoadedMap: {},
      buildCollapsedRun: {
        form_append: [],
        form_prepend: [],
      },
    };
  },

  props: {
    name: {
      type: String,
      default: "main",
    },
    pageName: {
      type: String,
      default: "main",
    },
    formModelDecorator: {
      type: Function,
      default: null,
    },
    approvalFormMode: {
      type: Object,
      default() {
        return null;
      },
    },
    isPlatChildForm: {
      type: Boolean,
      default: false
    }
  },
  mounted() {
    // if(this.child_service.length > 0){
    //   setTimeout(()=>{
    //     this.buildCollapsedRun = this.getBuildCollapsedRun()
    //   },200)
    // }
  },
  computed: {
    allChildDataLoaded() {
      let res = false;
      if (!this.childrenList?.length) {
        res = true;
      } else if (!this.childrenListLoaded) {
        res = true;
      } else {
        // 确保childDataLoadedMap中的每个子表都有对应的条目
        const hasAllChildEntries = this.childrenList.every(child => {
          return child.foreign_key.constraint_name && 
                 this.childDataLoadedMap.hasOwnProperty(child.foreign_key.constraint_name);
        });
        res = hasAllChildEntries;
      }
      console.log("allChildDataLoaded", res, this.childDataLoadedMap, this.childrenList);
      return res;
    },
    selectServiceName() {
      let basicForm = this.$refs.basicForm;
      return basicForm ? basicForm.loaderService : null;
    },

    serviceViewName() {
      return this.getBasicForm()?.formV2?.service_view_name
    },

    fields: function () {
      return this.getBasicForm().fields;
    },

    actions: function () {
      return this.getBasicForm().actions;
    },
    childTabShowList: function () {
      let child = [];
      let self = this;
      let mainData = self.mainFormDatas;
      let data = self.mainFormDatas;
      if (
        self.formType &&
        (self.formType === "detail" || self.formType === "procdetail")
      ) {
        child = self.child_service || [];
        child = child.filter(
          (item) =>
            item.hasOwnProperty("foreign_key") &&
            item.foreign_key.show_ui_model == "tabs"
        );
      }

      return child;
    },
    childListRun: function () {
      // console.log('childListRun')
      let self = this;
      let list;
      if (
        self.formType &&
        (self.formType === "detail" || self.formType === "procdetail")
      ) {
        if (self.child_service.length > 0) {
          let child = self.child_service;
          child = child.filter(
            (item) =>
              item.hasOwnProperty("foreign_key") &&
              item.foreign_key.show_ui_model != "tabs"
          );
          list = self.buildChildListConfig(child);
        }
      } else {
        if (self.childrenList.length > 0) {
          list = self.buildChildListConfig(self.childrenList);
        }
      }
      // jiaqi-20230831注释 此处不处理子表显示隐藏 避免子表由主表某个字段的值控制显示隐藏 而主表的那个字段的值是由子表计数得到的时 子表数据还没查回来 主表那个字段值是0所以下面逻辑会导致这个子表不在子表的数组里，导致子表永远不会显示出来

      // for(let f in list){
      //   let item = list[f]
      //   for(let child in item){
      //     let mainData = self.mainFormDatas
      //     let data = self.mainFormDatas
      //     let childs = item[child]
      //     if(childs.length > 0){
      //       for(let i = 0;i<childs.length;i++){
      //           let showExpr = childs[i].foreign_key.show_child_list_expr
      //           let isShow = childs[i].foreign_key.show_ui_child_table == '是' ? true : false
      //           if (showExpr !== null && showExpr.startsWith("{{") && showExpr.endsWith("}}")) {
      //             // for expr
      //             showExpr = showExpr.replace("{{", "").replace("}}", "");

      //             let mainData = self.mainFormDatas

      //             try {
      //               isShow = eval(showExpr);
      //             } catch (e) {
      //               debugger
      //             }
      //           }else if(showExpr){

      //             try {
      //               console.log("showChildList",eval(showExpr),showExpr)
      //               isShow = eval(showExpr);
      //             } catch (e) {
      //             }

      //           }

      //           if(!isShow){
      //             childs.splice(i,1)
      //           }
      //       }
      //     }
      //   }
      // }
      console.log(list, 77777777)
      return list;
    },
    fieldChildKeys: function () {
      let self = this;
      let field = null;
      if (self.formType === "detail" || self.formType === "procdetail") {
        if (self.child_service.length > 0) {
          field = self.buildChildListConfig(self.child_service).field;
        }
      } else {
        if (self.childrenList.length > 0) {
          field = self.buildChildListConfig(self.childrenList).field;
        }
      }
      // let field = self.buildChildListConfig(self.childrenList).field
      if (Object.prototype.toString.call(field) === "[object Object]") {
        let keys = Object.keys(field);
        return keys;
      } else {
        return [];
      }
    },
    fieldChildRun: function () {
      let self = this;
      let field = self.childListRun.field;
      return field;
    },
    buildCollapsedRun_aa: function () {
      self = this;
      let childs = this.childListRun;
      // let childs = this.getChildListRun()
      let cols = this.fieldChildKeys;
      let collapsed = {};
      if (Object.prototype.toString.call(childs) === "[object Object]") {
        collapsed = self.buildCollapsed(childs, cols);
      }
      self.buildCollapsedConfig = collapsed;
      return collapsed;
    },
  },

  methods: {
    getBuildCollapsedRun: function () {
      self = this;
      let childs = this.childListRun;
      // let childs = this.getChildListRun()
      let cols = this.fieldChildKeys;
      let collapsed = {};
      if (Object.prototype.toString.call(childs) === "[object Object]") {
        collapsed = self.buildCollapsed(childs, cols);
      }
      //console.log('getBuildCollapsedRun',collapsed,childs)
      return collapsed;
    },
    getChildListRun() {
      // console.log('childListRun')
      let self = this;
      let list;
      if (
        self.formType &&
        (self.formType === "detail" || self.formType === "procdetail")
      ) {
        if (self.child_service.length > 0) {
          list = self.buildChildListConfig(self.child_service);
        }
      } else {
        if (self.childrenList.length > 0) {
          list = self.buildChildListConfig(self.childrenList);
        }
      }
      for (let f in list) {
        let item = list[f];
        for (let child in item) {
          let mainData = self.mainFormDatas;
          let data = self.mainFormDatas;
          let childs = item[child];
          if (childs.length > 0) {
            for (let i = 0; i < childs.length; i++) {
              let showExpr = childs[i].foreign_key.show_child_list_expr;
              let isShow =
                childs[i].foreign_key.show_ui_child_table == "是"
                  ? true
                  : false;
              if (
                showExpr !== null &&
                showExpr.startsWith("{{") &&
                showExpr.endsWith("}}")
              ) {
                // for expr
                showExpr = showExpr.replace("{{", "").replace("}}", "");

                let mainData = self.mainFormDatas || mainFromData;

                try {
                  isShow = eval(showExpr);
                } catch (e) { }
              } else if (showExpr) {
                try {
                  console.log("showChildList", eval(showExpr), showExpr);
                  isShow = eval(showExpr);
                } catch (e) { }
              }

              if (!isShow) {
                childs.splice(i, 1);
              }
            }
          }
        }
      }
      return list;
    },
    hasVisibleChildList() {
      return (
        this.child_service &&
        this.child_service.filter((child) => this.showChildList(child)).length >
        0
      );
    },

    srvValFormModel() {
      let basicForm = this.$refs.basicForm;
      return basicForm ? basicForm.srvValFormModel() : null;
    },

    getBasicForm() {
      return this.$refs.basicForm;
    },

    onSubmitted2mem: function (srvvalFormMode, fields, type) {
      if (typeof fields === "object") {
        const fieldList = []
        for (let i in fields) {
          fieldList.push(fields[i])
        }
        // 检测表单中有没有字段是穿梭框
        const transferField = fieldList.find((e) => e.isTransfer === true);
        if (transferField) {
          const transferFieldRef = transferField?.editor?.$refs?.editor;
          const addValues = transferFieldRef?.getAddValues?.();
          const removeValues = transferFieldRef?.getRemoveValues?.();
          console.log("addValues", addValues, "removeValues", removeValues);
          let queries = [{
            data: []
          }]
          if (Array.isArray(addValues) && addValues.length) {
            const publicData = queries[0].data[0];
            queries[0].data = addValues.map((item) => {
              const obj = { ...publicData };
              obj[transferField.info.name] =
                item[transferField.info.dispLoader.refedCol];
              if (transferField?.dependentFields?.size) {
                // 依赖字段冗余计算处理
                transferField?.dependentFields.forEach((key) => {
                  const field = fieldList.find((e) => e.info.name === key);
                  const fieldRedundant = field?.info?.redundant;
                  if (fieldRedundant?.refedCol) {
                    // 冗余
                    obj[key] = item[field.info.redundant.refedCol];
                  } else if (fieldRedundant?.func) {
                    // 计算
                    let row = obj;
                    let moment = dayjs;
                    let ret = eval("var zz=" + func + "(row, vm); zz");
                    let update = false;
                    if (fieldRedundant.trigger == "isnull" && field.isEmpty()) {
                      update = true;
                    } else if (
                      !fieldRedundant.trigger ||
                      fieldRedundant.trigger == "always"
                    ) {
                      update = true;
                    }
                    if (
                      update &&
                      field.getSrvVal() !== ret &&
                      field.info?.subType !== "autocomplete"
                    ) {
                      if (
                        !["Invalid date"].includes(ret) &&
                        !["function"].includes(typeof ret)
                      ) {
                        obj[key] = ret;
                        console.log("表内计算：", func);
                        console.log("表内计算结果：", ret);
                      }
                    }
                  }
                });
              }
              return obj;
            });
          } else {
            queries = [];
          }
          if (removeValues?.serviceName && removeValues?.data?.length) {
            this.$emit('deleteFromMem', removeValues?.data)
            const removeQuery = removeValues.data.map((item) => {
              return {
                serviceName: removeValues.serviceName,
                condition: [
                  {
                    colName: "id",
                    ruleType: "eq",
                    value: item.id,
                  },
                ],
              };
            });
            queries = [...queries, ...removeQuery];
          }
          if (Array.isArray(queries) && queries.length) {
            let addValues = queries.reduce((pre, cur) => {
              if (Array.isArray(cur.data) && cur.data.length && !cur.condition) {
                pre = [...pre, ...cur.data]
              }
              return pre
            }, [])
            if (Array.isArray(addValues) && addValues.length) {
              addValues.forEach((item) => {
                this.$emit("submitted2mem", item, fields);
              });
            }
            return queries
          }
        }
      }
      if (Object.keys(srvvalFormMode).length) {
        Object.keys(srvvalFormMode).forEach(key => {
          if (fields[key]?.moreInfo) {
            this.$set(srvvalFormMode, `_${key}_disp`, fields[key]?.moreInfo)
          }
        });
      }
      this.$emit("submitted2mem", srvvalFormMode, fields);
    },

    validateForm: function () {
      return this.getBasicForm().validateForm();
    },

    /**
     * action type is crud
     */
    buildChildrenList: function (e) {
      // console.log("buildChildrenList ---- ",e)
      this.loadChildrenList();
    },

    /**
     * 获取子表元数据，
     * @returns {*}
     */
    loadChildrenList() {
      // console.log("loadChildrenList")
      let self = this;
      return self
        .loadColsV2(self.selectServiceName, "detail", null, this.service)
        .then((response) => {
          if (!response || !response.data || !response.data.data) {
            return
          }
          let childrenServices = response.data.data["child_service"];

          let basicForm = self.$refs.basicForm;
          for (var item of childrenServices) {
            let foreign_key = item["foreign_key"];
            if (foreign_key.foreign_key_type !== "主子表") {
              continue;
            }

            let refedCol = foreign_key["referenced_column_name"];
            let refedColValGetter = function () {
              return basicForm.fields[refedCol].getSrvVal();
            };
            item.defaultCondition = [
              {
                colName: foreign_key["column_name"],
                ruleType: "eq",
                valueFunc: refedColValGetter,
                required: true,
              },
            ];
            self.childrenList.push(item);
          }
        })
        .then((_) => {
          this.$nextTick((_) => {
            if((self.child_service && self.child_service.length > 0) || (self.childrenList && self.childrenList.length > 0)){
              if(self.childrenList && self.childrenList.length > 0){
                for(let item of self.childrenList){
                  if(item.foreign_key.constraint_name){
                    self.$set(self.childDataLoadedMap, item.foreign_key.constraint_name, false);
                  } 
                }
              }
              self.childrenListLoaded = true;
            }
          });
        });
    },

    /**
     * 把子表的model 放入formModel中，key为_children
     * @param formModel
     */
    srvvalFormModelDecorator(formModel) {
      if (this.$refs && this.$refs.childrenList) {
        let childrenList = {};

        // index and fk constraint name key-value pair
        for (let i in this.$refs.childrenList) {
          let child = this.$refs.childrenList[i];
          const listData = child?.$refs?.list?.gridData || child.gridData || []
          childrenList[i] = listData;
          childrenList[child.foreignKey.constraint_name] = listData;
        }
        this.$set(formModel, "_children", childrenList);
      }

      if (this.formModelDecorator) {
        this.formModelDecorator(formModel);
      }
    },

    /**
     * 根据子表数据冗余计算主表字段
     */
    onChildListDataChanged() {
      // trigger the js redundant computation
      let form = this;
      this.getBasicForm().handleRedundantOnFormModelChange(
        null,
        null,
        this.fields,
        (_) => form.srvValFormModel(), true
      );
    },

    onChildListLoaded(_cList) {
      let childList = _cList
      if (_cList?.$refs?.list?.$refs?.list) {
        childList = _cList?.$refs?.list
      }
      let basicForm = this.getBasicForm();
      let submitAction = basicForm.actions.submit;
      let executor = null;
      let submitName = `submit`;
      if (Array.isArray(submitAction)) {
        for (let submitIndex in submitAction) {
          submitName = `${submitName}`;
          let action = basicForm.$refs[submitName + submitIndex];
          if (action && Array.isArray(action)) {
            executor = action[0].$refs.executor;
          } else if (action) {
            executor = action.$refs.executor;
          }
        }
        if (executor && childList.isMem()) {
          childList.buildExecutors4Edit().then((subexecutors) => {
            let fk = childList.foreignKey;
            let dependKey = {
              type: "column",
              add_col: fk.column_name,
              depend_key: fk.referenced_column_name,
            };

            subexecutors.forEach((subexecutor) => {
              subexecutor.dependKeys = [dependKey];
              subexecutor.fk = fk;
              executor.children.unshift(subexecutor);
              // if (executorDraft) {
              //   executorDraft.children.unshift(subexecutor);
              // }
            });
          });
        }
        // executor = basicForm.$refs.submit[0].$refs.executor;  // 旧代码，以上代码根据 submit actions 修改为数组后 新增逻辑分支
      } else {
        if (!submitAction || !submitAction.executor) {
          return;
        }
        executor = basicForm.$refs.submit[0].$refs.executor;
        if (executor && childList.isMem()) {
          childList.buildExecutors4Edit().then((subexecutors) => {
            let fk = childList.foreignKey;
            let dependKey = {
              type: "column",
              add_col: fk.column_name,
              depend_key: fk.referenced_column_name,
            };

            subexecutors.forEach((subexecutor) => {
              subexecutor.dependKeys = [dependKey];
              subexecutor.fk = fk;
              executor.children.unshift(subexecutor);
              // if (executorDraft) {
              //   executorDraft.children.unshift(subexecutor);
              // }
            });
          });
          return

        }
      }
      // let executor = basicForm.$refs.submit[0].$refs.executor;
      let executorDraft = null;
      if (basicForm.$refs.hasOwnProperty("save_draft")) {
        executorDraft = basicForm.$refs.save_draft[0].$refs.executor;
        if (executor && childList.isMem()) {
          childList.buildExecutors4Edit().then((subexecutors) => {
            let fk = childList.foreignKey;
            let dependKey = {
              type: "column",
              add_col: fk.column_name,
              depend_key: fk.referenced_column_name,
            };

            subexecutors.forEach((subexecutor) => {
              subexecutor.dependKeys = [dependKey];
              subexecutor.fk = fk;
              executor.children.unshift(subexecutor);
              if (executorDraft) {
                executorDraft.children.unshift(subexecutor);
              }
            });
          });
        }
      }

      // 此代码已经弃用！ 由 buildRunQuries 代替
      // if (executor && childList.isMem()) {
      //   childList.buildExecutors4Edit()
      //     .then(subexecutors => {
      //       let fk = childList.foreignKey
      //       let dependKey = {
      //         type: "column",
      //         add_col: fk.column_name,
      //         depend_key: fk.referenced_column_name,
      //       };

      //       subexecutors.forEach(subexecutor => {
      //         subexecutor.dependKeys = [dependKey];
      //         subexecutor.fk = fk;
      //         executor.children.unshift(subexecutor);
      //         if(executorDraft){
      //           executorDraft.children.unshift(subexecutor);
      //         }

      //       })
      //     })
      // }
    },

    onChildInlineListLoaded(inlineList, _cList) {
      let childList = _cList
      if (_cList?.$refs?.list?.$refs?.list) {
        childList = _cList?.$refs?.list
      }
      let basicForm = this.getBasicForm();
      let submitAction = basicForm.actions.submit;
      let executor = null;
      if (Array.isArray(submitAction)) {
        executor = basicForm.$refs.submit[0].$refs.executor;
      } else {
        if (!submitAction || !submitAction.executor) {
          return;
        }
        executor = basicForm.$refs.submit[0].$refs.executor;
      }

      if (executor && childList.isMem()) {
        let fk = childList.foreignKey;
        // remove previous added
        remove(executor.children, (item) => isEqual(item.fk, fk));

        // readd
        childList.buildExecutors4Edit().then((subexecutors) => {
          let dependKey = {
            type: "column",
            add_col: fk.column_name,
            depend_key: fk.referenced_column_name,
          };

          subexecutors.forEach((subexecutor) => {
            subexecutor.dependKeys = [dependKey];
            subexecutor.fk = fk;
            executor.children.unshift(subexecutor);
          });
        });
      }
    },

    /**
     * 根据fk中的配置表达式决定子表是否显示
     * @param childList
     * @returns {*}
     */
    showChildList: function (_cList, mainFromData) {
      let childList = _cList
      if (_cList?.$refs?.list?.$refs?.list) {
        childList = _cList?.$refs?.list
      }
      let self = this;
      const fk = childList.foreign_key;
      let expr = fk.show_ui_child_table;
      let showExpr = fk.show_child_list_expr;
      let data = self.mainFormDatas || mainFromData;
      if (fk?.show_ctable_json) {
        try {
          const json = JSON.parse(fk.show_ctable_json);
          if (json && evalJson(json, data) === false) {
            return false;
          }
        } catch (error) { }
      }
      if (fk && expr) {
        if (isString(expr)) {
          if (expr === "否") {
            return false;
          } else if (expr === "是") {
            if (
              showExpr !== null &&
              showExpr.startsWith("{{") &&
              showExpr.endsWith("}}")
            ) {
              // for expr
              showExpr = showExpr.replace("{{", "").replace("}}", "");

              let mainData = self.mainFormDatas || mainFromData;

              try {
                return eval(showExpr);
              } catch (e) { }
            } else if (showExpr) {
              try {
                console.log("showChildList", eval(showExpr), showExpr);
                return eval(showExpr);
              } catch (e) { }
            } else {
              return true;
            }
          }
        }
      }
    },
  },
  watch: {
    allChildDataLoaded: {
      immediate: true,
      handler: function (value) {
        // if(value === false){
        //   const loading = this.$loading({
        //     lock: true,
        //     text: 'Loading',
        //     spinner: 'el-icon-loading',
        //     background: 'rgba(0, 0, 0, 0.7)'
        //   });
        // }
        // if(value === true){
        //   const loading = this.$loading({
        //     lock: true,
        //     text: 'Loading',
        //     spinner: 'el-icon-loading',
        //     background: 'rgba(0, 0, 0, 0.7)'
        //   });
        //   loading.close();
        // }
      }
    },
    childrenListLoaded: {
      handler: function (nval, oval) {
        if (nval == true && this.childListRun) {
          console.log("watch childListRun", nval, oval);
          this.buildCollapsedRun = this.getBuildCollapsedRun();
        }
      },
      deep: true,
    },
  },
};
