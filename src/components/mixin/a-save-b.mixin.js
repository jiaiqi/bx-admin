import cloneDeep from "lodash/cloneDeep";
export default {
  computed: {
    objInfo() {
      return this.field.info?.dispLoader?.objInfo;
    }
  },
  created() {
  },
  methods: {
    setObjInfo(fileList) {
      const objInfo = this.objInfo;
      if (objInfo?.a_save_b_cols && objInfo?.a_save_b_obj_col) {
        // fk字段值改变后，更新其obj_info中配置的的a_save_b_obj_col
        const cols = objInfo?.a_save_b_cols.split(",");
        let obj = [];
        let objStr = "";
        if (fileList?.length && cols?.length) {
          fileList.forEach((fileItem) => {
            let newValue = cloneDeep(fileItem);
            if (this.uploadFile) {
              // 文件、图片上传组件 
              if (fileItem?.response?.fileurl) {
                newValue = { ...newValue?.response };
              }
            }
            if (cols?.includes("*")) {
              obj.push(cloneDeep(newValue));
            } else {
              let objItem = {};
              cols.forEach((col) => {
                objItem[col] = newValue[col];
              });
              obj.push(objItem);
            }
          });
        }
        objStr = JSON.stringify(obj);
        if (objStr === "[]") {
          objStr = "";
        }
        let objCol = {
          type: "a_save_b_obj",
          col: objInfo.a_save_b_obj_col,
          val: objStr,
        };
        console.log("更新obj_info", objCol);
        // 将更新的字段信息保存在_obj_col上，方便在form中获取
        this.$set(this.field, "_obj_col", objCol);
      } else if (this.field?._obj_col?.val) {
        // 清空通过_obj_col保存的值
        this.$set(this.field["_obj_col"], "val", null);
      }
      this.$emit("field-value-changed", this.field.info.name, this.field);
    }
  },
}