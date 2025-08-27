<template></template>

<script>
import ExecutorMixin from "../mixin/executor-minx";
import { ExecutorInfo } from "../model/ExecutorInfo";
import cloneDeep from "lodash/cloneDeep";
import flatten from "lodash/flatten";

export default {
  mixins: [ExecutorMixin],
  inject: {
    getSortedFields: {
      default: () => {},
    },
    getFormModel: {
      default: () => {},
    },
    getAllFields: {
      default: () => {},
    },
  },
  props: {
    service: String,
    values: Array,
    conditions: Array,
    ignoreNullValue: Boolean,
    itemsFunc: null,
    itemsPolicy: "valuePerItem", // or servicePerItem
    dependKeys: [],
    defaultValues: Object,
    duplicateType: String,
    duplicateData: Object,
    gnoColumnInfo: Object, // 编辑样式时，gno字段信息
    referenceNoColumnInfo: Object, // 编辑样式时，参考行的no字段信息
  },

  data() {
    return {
      children: [],
    };
  },

  methods: {
    /**
     * return an query object
     * */
    buildSrvQuery: function (conf, item4Srv, rtDataCtx) {
      let query = {};
      query.serviceName = conf.service;
      // buildConditionsFromConf方法获取到了condition
      query.condition = this.buildConditionsFromConf(conf, item4Srv);
      query.depend_keys = conf.dependKeys;

      if (conf.itemsFunc) {
        let validItems = conf
          .itemsFunc(rtDataCtx)
          .filter((item) => item._dirtyFlags !== "delete");
        let evalItems = validItems
          .map((item) => this.buildValuesFromConf(conf, item))
          .filter((item) => !!item)
          .map((item) => {
            if (conf.dependKeys) {
              conf.dependKeys.forEach((depend) => delete item[depend.add_col]);
            }
            return item;
          });
        query.data = evalItems;
      } else {
        let data = this.buildValuesFromConf(conf);
        query.data = data ? [data] : [];
      }

      if (
        this.service?.includes("srvpage_cfg_style") && //暂时只有样式表这样处理
        this.referenceNoColumnInfo?.value &&
        this.gnoColumnInfo?.column &&
        this.gnoColumnInfo?.value !== this.referenceNoColumnInfo?.value
      ) {
        // 编辑样式时，gno字段的值和引用行的no字段的值不一致 当前数据不数据被引用行 需要将编辑改为创建，暂时只有样式表这样处理
        query.serviceName = conf.service.replace("update", "add");
        query['duplicate'] = true;
        if(Array.isArray(query.condition)){
          if(!query.condition.find(item=>item.colName==='id') && this.defaultValues?.id){
            query.condition.push({
              colName: 'id',
              operator: 'equal',
              value: this.defaultValues?.id
            })
          }
        }
        if (query.data?.length) {
          query.data = query.data.map((item) => {
            item[this.gnoColumnInfo?.column] =
              this.referenceNoColumnInfo?.value;
            return item;
          });
        }
      }

      if (
        query?.serviceName?.endsWith("add") ||
        query.serviceName?.endsWith("update")
      ) {
        if (!query.data || query.data.length == 0) {
          return null;
        }
      } else if (
        query?.serviceName?.endsWith("delete") ||
        query?.serviceName?.endsWith("update")
      ) {
        if (!query.condition || query.condition.length == 0) {
          return null;
        }
      }

      return query;
    },

    /**
     *
     * @param conf
     * @returns {*} an array of queries
     */
    buildQuery: function (conf, rtDataCtx) {
      let queries = [];
      console.log("conf", conf);
      if (conf.itemsFunc && conf.itemsPolicy === "servicePerItem") {
        let clone = cloneDeep(conf);
        clone.itemsPolicy = "valuePerItem";
        queries = conf.itemsFunc(rtDataCtx).map((item) => {
          clone.itemsFunc = (_) => [item];
          return this.buildSrvQuery(clone, item, item);
        });
      } else {
        let query = this.buildSrvQuery(conf, null, rtDataCtx);
        if (
          query &&
          ["duplicatedeep", "duplicate"].includes(this.duplicateType)
        ) {
          query["duplicate"] = true;
        }
        // else if(this.queryMethod === 'add' && )
        if (Array.isArray(query?.data) && query.data.length > 0) {
          query.data = query.data.map((item) => {
            if (item.id) {
              delete item.id;
            }
            return item;
          });
        }
        if (
          query &&
          ["duplicatedeep", "duplicate"].includes(this.duplicateType) &&
          this.duplicateData?.id
        ) {
          // 复制、深度复制时 提交被复制数据的id
          if (conf.dependKeys && conf.originListData?.length) {
            query["condition"] = [
              ...(query?.condition || []),
              {
                colName: "id",
                ruleType: "in",
                value: conf.originListData.map((e) => e.id).toString(),
              },
            ];
          } else if (!conf.dependKeys) {
            query["condition"] = [
              ...(query?.condition || []),
              { colName: "id", ruleType: "eq", value: this.duplicateData.id },
            ];
          }
        }
        queries = [query];
      }
      queries = queries.filter((e) => !!e);
      if (conf.children && conf.children.length > 0) {
        queries.forEach((query) => {
          if (query) {
            query.data.forEach((item) => {
              let subQueries = conf.children
                .map((child) => this.buildQuery(child, item._rtDataCtx))
                .filter((e) => !!e);
              subQueries = flatten(subQueries).filter((e) => !!e);

              if (subQueries && subQueries.length > 0) {
                item.child_data_list = subQueries;
              }
            });
          }
        });
      }
      return queries;
    },

    buildRunQuries() {
      let queries = this.buildQuery(this);
      if (!queries || queries.length == 0) {
        return Promise.resolve(false);
      }

      this.santinizeQueries(queries);

      return queries;
    },

    run(e, kval, isDraft) {
      // let this = this
      let queries = [];
      try {
        queries = this.buildQuery(this);
      } catch (error) {
        console.log(error);
        debugger;
      }
      /**
       * 保存草稿独有属性 draft
       */
      if (e.name === "save_draft") {
        queries = queries.map((item, index) => {
          if (e.executor.service === item.serviceName) {
            item.reqType = "saveDraft";
          }
          return item;
        });
      }
      if (e.name === "submit" && isDraft === "draft") {
        queries = queries.map((item, index) => {
          if (e.executor.service === item.serviceName) {
            item.reqType = "submitDraft";
          }
          return item;
        });
      }
      // submitDraft
      // if(e.hasOwnProperty('draftConfig') && e.name === 'save_draft'){
      //   let config = e.draftConfig
      //   let paramsData =  config.status_config
      //   let formModelDatas = queries[0].data[0]
      //   formModelDatas[paramsData.colName] = paramsData.draftValue
      //   if(e.draftConfig.isDraft){
      //     queries = queries.map((item,index)=>{
      //           if(e.executor.service === item.serviceName){
      //             item.draft = true
      //             if(kval.value !== null){
      //               item.condition.push({'colName':kval.colName,'ruleType':'eq',value:kval.value})
      //               item.serviceName = e.draftConfig.update_srv
      //             }
      //           }
      //           return item
      //       })
      //   }
      // }else if(e.hasOwnProperty('draftConfig') && e.name === 'update_draft'){
      //   let config = e.draftConfig
      //   let paramsData =  config.status_config
      //   let formModelDatas = queries[0].data[0]
      //   formModelDatas[paramsData.colName] = paramsData.draftValue
      //   queries = queries.map((item,index)=>{
      //           if(e.executor.service === item.serviceName){
      //             item.draft = true
      //           }
      //           return item
      //       })
      // } else if(e.hasOwnProperty('draftConfig')  &&  e.draftConfig !== null && e.draftConfig.isDraft && (e.name === 'submit')){
      //   let config = e.draftConfig
      //   let paramsData =  config.status_config
      //   let formModelDatas = queries[0].data[0]
      //   formModelDatas[paramsData.colName] = paramsData.value
      //   if(e.draftConfig.isDraft){
      //     queries = queries.map((item,index)=>{
      //           if(e.executor.service === item.serviceName){
      //             if(kval.value !== null){
      //               item.condition.push({'colName':kval.colName,'ruleType':'eq',value:kval.value})
      //               item.serviceName = e.draftConfig.update_srv
      //             }
      //           }
      //           return item
      //       })
      //   }
      // }

      if (!queries || queries.length == 0) {
        return Promise.resolve(false);
      }

      this.santinizeQueries(queries);

      // 检测表单中有没有字段是穿梭框
      const fields = this.getSortedFields?.();
      if (Array.isArray(fields)) {
        const transferField = fields.find((e) => e.isTransfer === true);
        if (transferField) {
          const transferFieldRef = transferField?.editor?.$refs?.editor;
          // const values = transferFieldRef?.getTransferValues?.();
          const addValues = transferFieldRef?.getAddValues?.();
          const removeValues = transferFieldRef?.getRemoveValues?.();
          console.log("addValues", addValues, "removeValues", removeValues);

          if (Array.isArray(addValues) && addValues.length) {
            const publicData = queries[0].data[0];
            queries[0].data = addValues.map((item) => {
              const obj = { ...publicData };
              obj[transferField.info.name] =
                item[transferField.info.dispLoader.refedCol];
              if (transferField?.dependentFields?.size) {
                // 依赖字段冗余计算处理
                transferField?.dependentFields.forEach((key) => {
                  const field = fields.find((e) => e.info.name === key);
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
        }
      }

      return this.operate(queries).then((response) => {
        if (response && response.data) {
          if (response.data.state == "SUCCESS") {
            // only for local refresh of treegrid
            response.request = queries[0];
            this.$emit("executor-complete", response);
            return response;
          } else {
            return response;
          }
        }
      });
    },
  },
};
</script>
