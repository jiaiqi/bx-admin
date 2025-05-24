<template>
  <div class="property-pane" :key="card_parts_no">
    <simple-update
      name="list-update"
      :defaultValues="cardUnit"
      :navAfterSubmit="false"
      :service="cardUnitService.update"
      :pk="card_no"
      app-no="config"
      pkCol="card_no"
      :group-collapse="true"
      @executor-complete="onUnitUpdate"
      @form-loaded="pageLoading = false"
      @field-value-changed="onValueChange($event, 'card-unit-update')"
      v-if="card_no && !currentCell"
    >
    </simple-update>
    <simple-update
      name="list-update"
      :defaultValues="currentCell"
      :navAfterSubmit="false"
      :service="cardPartService.update"
      :pk="card_parts_no"
      app-no="config"
      pkCol="card_parts_no"
      :group-collapse="true"
      @executor-complete="onPartsUpdate"
      @form-loaded="pageLoading = false"
      @field-value-changed="onValueChange($event, 'card-parts-update')"
      v-else-if="card_parts_no"
    >
    </simple-update>
    <div v-else class="py-4 text-center">请先保存</div>
  </div>
</template>

<script>
import simpleUpdate from "@/components/common/simple-update.vue";
import simpleAdd from "@/components/common/simple-add.vue";
import cloneDeep from "lodash/cloneDeep";
export default {
  components: {
    simpleUpdate,
    simpleAdd,
  },
  props: {
    cardUnit: Object, // 卡片单元
    currentCell: Object,
    list: Array,
  },
  computed: {
    unitId() {
      return this.cardUnit?.id;
    },
    cellId() {
      return this.currentCell?.id;
    },
    card_no() {
      return this.cardUnit?.card_no;
    },
    card_parts_no() {
      return this.currentCell?.card_parts_no;
    },
  },
  data() {
    return {
      cardUnitService: {
        select: "srvpage_cfg_card_unit_select",
        add: "srvpage_cfg_card_unit_add",
        update: "srvpage_cfg_card_unit_update",
        delete: "srvpage_cfg_card_unit_delete",
      },
      cardPartService: {
        select: "srvpage_cfg_card_parts_select",
        add: "srvpage_cfg_card_parts_add",
        update: "srvpage_cfg_card_parts_update",
        delete: "srvpage_cfg_card_parts_delete",
      },
    };
  },
  methods: {
    async onSave() {
      console.log("保存");
      if (Array.isArray(this.list) && this.list.length) {
        const oldList = cloneDeep(this.list);
        const deleteIds = this.findDataByType(oldList, "delete").map(
          (item) => item.id
        );
        console.log("deleteIds", deleteIds);
        if (deleteIds?.length) {
          const deleteObj = {
            serviceName: this.cardPartService.delete,
          };
          await this.httpOperate("delete", deleteObj, deleteIds.toString());
        }
        const updateList = this.findDataByType(oldList, "update");
        console.log("updateList", updateList);
        if (updateList?.length) {
          const updateObj = [];
          const updateKeys = ["seq", "style_no", "parent_no"];
          updateList.forEach((item) => {
            // 组装更新对象
            const data = {};
            updateKeys.forEach((key) => {
              if (item[key]) {
                data[key] = item[key];
              }
            });
            if (!Object.keys(data).length) {
              return;
            }
            const obj = {
              serviceName: this.cardPartService.update,
              condition: [
                {
                  colName: "id",
                  ruleType: "eq",
                  value: item.id,
                },
              ],
              data: [data],
            };
            if (!item.id && item.card_parts_no) {
              obj.condition = [
                {
                  colName: "card_parts_no",
                  ruleType: "eq",
                  value: item.card_parts_no,
                },
              ];
            }
            updateObj.push(obj);
          });
          await this.httpOperate("update", updateObj);
        }
        const addList = this.findDataByType(oldList, "add");
        console.log("addList", addList);
        if (addList.length) {
          const addObj = {
            serviceName: this.cardPartService.add,
            data: this.buildAddReqData(addList),
          };
          const result = await this.httpOperate(
            "add",
            addObj,
            null,
            true,
            false
          );
          console.log("result", result);
          if (result) {
            this.$emit("saved");
          }
        }
        if (!deleteIds?.length && !updateList?.length && !addList?.length) {
          this.$message.error("没有需要保存的内容！");
        }
      }
    },
    onValueChange(value, type) {
      console.log("值变化", value, type);
    },
    onUnitUpdate(event) {
      console.log("卡片单元更新完成", event);
      this.$emit("unit-update");
    },
    onPartsUpdate(event) {
      console.log("卡片单元更新完成", event);
      this.$emit("parts-update");
    },
    buildAddReqData(list) {
      if (!list?.length) {
        return [];
      }
      const ignoreField = [
        "label",
        "icon",
        "children",
        "value",
        "type",
        "component",
        "_editType",
        "_id",
      ];
      const result = list.map((item, index) => {
        let data = { ...item };
        ignoreField.forEach((item) => {
          delete data[item];
        });
        let obj = {
          ...data,
          card_no: this.card_no,
          child_data_list: item?.children?.length
            ? this.buildAddChildren(item.children)
            : [],
        };
        return obj;
      });
      return result;
    },
    buildAddChildren(list) {
      const result = [];
      const ignoreField = [
        "label",
        "icon",
        "children",
        "value",
        "type",
        "component",
        "_editType",
        "_id",
      ];
      if (Array.isArray(list) && list.length) {
        return list
          .filter((item) => !!item)
          .map((item, index) => {
            if (!item) {
              console.log(list);
            }
            let data = { ...item };
            ignoreField.forEach((item) => {
              delete data[item];
            });
            let obj = {
              serviceName: this.cardPartService.add,
              condition: [],
              depend_keys: [
                {
                  type: "column",
                  add_col: "parent_no",
                  depend_key: "card_parts_no",
                },
              ],
              data: [
                {
                  ...data,
                  card_no: this.card_no,
                  child_data_list: item?.children?.length
                    ? this.buildAddChildren(item.children)
                    : [],
                },
              ],
            };

            return obj;
          });
      }
      return result;
    },
    async httpOperate(type, o, id, returnData, returnChildren) {
      let params = [];
      switch (type) {
        case "add":
          params = [
            {
              serviceName: o.serviceName,
              srvApp: "config",
              data: o.data,
            },
          ];
          break;
        case "update":
        case "batch_add":
          params = o;
          break;
        case "delete":
          params = [
            {
              serviceName: o.serviceName,
              srvApp: "config",
              condition: [{ colName: "id", ruleType: "in", value: id }],
            },
          ];
          break;
      }

      const response = await this.operate(params);
      if (response.data.state === "SUCCESS") {
        if (type === "batch_add") {
          return response.data.response;
        }
        if (returnChildren) {
          return response.data.response[0].child_data_list;
        }
        if (returnData) {
          return response.data.response[0].response.effect_data[0];
        } else {
          return response.data.response[0].response;
        }
      } else {
        this.$message.error(response.body.resultMessage);
      }
    },
    findDataByType(list, type) {
      let result = [];
      if (!type) {
        return [];
      }
      if (Array.isArray(list) && list.length) {
        list.forEach((item) => {
          if (item?._editType === type) {
            let obj = {};
            Object.keys(item).forEach((key) => {
              if (
                item[key] &&
                typeof key === "string" &&
                !key?.startsWith("_")
              ) {
                obj[key] = item[key];
              }
            });
            result.push(obj);
          } else if (Array.isArray(item?.children) && item?.children.length) {
            result = result.concat(this.findDataByType(item?.children, type));
          }
        });
      }
      return result;
    },
  },
};
</script>

<style lang="scss" scoped>
.property-pane {
  background-color: #fff;

  :deep(.el-form) {
    > .el-row {
      border: none;
    }
    .el-col {
      width: 100%;
      .el-form-item {
        display: flex;
        flex-direction: column;
      }
      .el-form-item__label {
        width: 100% !important;
        text-align: left;
      }
      .el-form-item__content {
        width: 100% !important;
        margin-left: 0 !important;
      }
    }
  }
}
</style>
