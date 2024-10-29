<template>
  <div>
    <template v-if="isEdit === false" padding="10px">
      <ul class="form-imgs">
        <li v-for="(o, index) in fileLists" :key="index" class="imgs-item">
          <div
            v-on:click="
              imageDialogUrl = o.url;
              imageDialog = true;
            "
          >
            <img :src="o.url" min-width="70" height="70" />
          </div>
        </li>
      </ul>
    </template>
    <el-dialog
      title="图片预览"
      :visible.sync="imageDialog"
      width="60%"
      height="65%"
      style="text-align: center"
    >
      <img
        :src="imageDialogUrl"
        width="80%"
        height="70%"
        style="margin: 0 auto"
      /><br />
      <el-button type="primary" @click="imageDialog = false">确 定</el-button>
      <el-button type="primary" @click="dowmlaodUrl()">下载</el-button>
    </el-dialog>
    <el-upload
      v-if="isEdit"
      class="upload-demo"
      :class="{ 'upload-disabled': limit && fileLength && fileLength >= limit }"
      :action="uploadFile"
      :with-credentials="true"
      :headers="getHeaders()"
      :on-preview="handlePreview"
      :before-remove="beforeRemove"
      :before-upload="beforeAvatarUpload"
      :on-remove="handleRemove"
      :on-success="handleSuccess"
      :on-exceed="handleExceed"
      :file-list="fileLists"
      :data="uploadParams"
      clearable
      :limit="limit"
      :disabled="!field.info.editable"
      list-type="picture-card"
    >
      <el-button size="small" type="primary">点击上传</el-button>
      <div
        slot="tip"
        class="el-upload__tip"
        :class="{ 'text-red': field.getAnyValidateError() }"
      >
        <i
          slot="reference"
          class="el-icon-warning"
          v-if="field.getAnyValidateError()"
        ></i>
        {{ setFileDesc }}
      </div>
    </el-upload>
  </div>
</template>
<script>
import cloneDeep from "lodash/cloneDeep";

export default {
  props: {
    field: {
      type: Object,
      default: null,
    },
    limit: {
      type: Number,
      default: 100,
    },

    // $srvApp: {
    //   type: String,
    //   default: "file",
    // },
  },
  computed: {
    objInfo() {
      return this.field.info?.dispLoader?.objInfo;
    },
    setFileDesc() {
      if (this.field.getAnyValidateError()) {
        return this.field.getAnyValidateError();
      }
      const fileType = this.field.fileType || "jpg/png/svg";
      const fileSize = this.fileSize ? this.fileSize / 1024 : 2;
      return `请上传${fileType}格式的图片,大小不超过${fileSize}MB`;
    },
  },
  data() {
    return {
      fileLists: [],
      fileLength: 0,
      fileDesc:
        this.field.info.moreConfig &&
        this.field.info.moreConfig !== null &&
        this.field.info.moreConfig.fileMaxSize
          ? "请上传jpg/png/svg格式的图片,大小不超过" +
            this.field.info.moreConfig.fileMaxSize +
            "MB"
          : "请上传jpg/png/svg格式的图片,大小不超过2Mb",
      fileType: "jpg/png/svg/PNG/JPG/JPEG/jpeg/gif/GIF/bmp/tif/tiff",
      fileSize:
        this.field.info.moreConfig &&
        this.field.info.moreConfig !== null &&
        this.field.info.moreConfig.fileMaxSize
          ? this.field.info.moreConfig.fileMaxSize * 1024
          : 2 * 1024,
      imageDialog: false,
      imageDialogUrl: "",
      uploadFile: this.serviceApi().uploadFile,
      uploadParams: {
        serviceName: "srv_bxfile_service",
        interfaceName: "add",
        app_no: this.resolveDefaultSrvApp(),
        table_name: "",
        thumbnailType: "fwsu_100",
        columns: "",
      },
      isEdit: true,
    };
  },
  created: function () {
    // 获取数据，
    if (this.objInfo?.a_save_b_obj_col) {
      const formModel = this.field?.form?.srvValFormModel?.();
      if (formModel && formModel[this.objInfo?.a_save_b_obj_col]) {
        try {
          let files = JSON.parse(formModel[this.objInfo?.a_save_b_obj_col]);
          if (Array.isArray(files) && files.length) {
            files.forEach((file) => {
              file.name = file.src_name;
              file.url =
                this.serviceApi().downloadFile + file.fileurl;
              this.fileLists.push(file);
            });
            return;
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
    this.getData();
  },
  methods: {
    getHeaders() {
      let bx_auth_ticket = sessionStorage.getItem("bx_auth_ticket");
      return {
        bx_auth_ticket: bx_auth_ticket,
      };
    },

    getData() {
      this.uploadParams.table_name = this.field?.info?.srvCol?.table_name||'';
      this.uploadParams.columns = this.field?.info?.srvCol?.columns||'';

      this.fileLists = []; //初始化文件列表
      if (this.field.fileDesc != null) {
        this.fileDesc = this.field.fileDesc;
      }
      if (this.field.fileSize != null) {
        this.fileSize = this.field.fileSize;
      }
      if (this.field.fileType != null) {
        this.fileType = this.field.fileType;
      }
      if (this.field.info.editable) {
        //判断是否是编辑
        this.isEdit = true;
        if (this.field.model != null) {
          //如果有file_no则查询出相关的图片信息
          this.uploadParams.file_no = this.field.model;
          this.queryData();
        }
      } else {
        this.isEdit = false;
        this.queryData();
      }
    },
    queryData() {
      this.selectFileList(this.field.model).then((response) => {
        for (let i in response.body.data) {
          let file = response.body.data[i];
          file.name = response.body.data[i].src_name;
          file.url =
            this.serviceApi().downloadFile + response.body.data[i].fileurl;
          if(file?.fileurl?.indexOf('http')===0){
            file.url = file.fileurl
          }
          this.fileLists.push(file);
        }
      });
    },
    beforeAvatarUpload(file) {
      if (file.size / 1024 > this.fileSize) {
        this.$message.error("文件大小不能超过" + this.fileSize + "kb");
        return false;
      }
      let flag = false;
      for (let i in this.fileType.split("/")) {
        let fileType = this.fileType.split("/")[i];
        if (fileType && typeof fileType === "string") {
          fileType = fileType.toLowerCase();
        }
        if (file.name.split(".")[1] === fileType) {
          flag = true;
          break;
        }
      }
      if (!flag) {
        this.$message.error("只能上传" + this.fileType + "文件!");
        return false;
      }
    },
    handleRemove(file, fileList) {
      this.setObjInfo(fileList);
      if (fileList.length === 0) {
        self.field.model = "";
      }
    },
    handlePreview(file) {
      if (file.url == null) {
        //如果是新上传的文件需要获取url
        file.url = this.serviceApi().downloadFile + file.response.fileurl;
      }
      window.open(file.url);
    },
    async beforeRemove(file, fileList) {
      if (file && file.status === "success") {
        //删除
        let fileurl;
        if (file.response) {
          fileurl = file.response.fileurl;
        } else {
          fileurl = file.url.split("filePath=")[1];
        }
        let params = {
          fileurl: fileurl,
        };
        const response = await this.deleteFile(params);
        this.fileLength = fileList.length - 1;
        this.$emit("change", this.field.model);
        if (response && response.body.resultCode === "SUCCESS") {
          this.$message.info(response.body.state);
          return true;
        } else {
          this.$message.info(response.body.state);
          return false;
        }
      }
    },
    handleSuccess(response, file, fileList) {
      console.log(fileList);
      if (response.state === undefined) {
        this.$message.info("上传成功！");
        this.uploadParams.file_no = response.file_no;
        this.field.model = response.file_no;
        this.$emit("change", this.field.model);
        this.setObjInfo(fileList);
      } else {
        this.$message.error("上传失败！");
        this.fileLists.splice(this.fileLists.length - 1, 1);
      }
      this.fileLength = fileList.length;
    },
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
            if (fileItem?.response?.fileurl) {
              newValue = { ...newValue?.response };
            }
            if (cols?.includes("*") && newValue?.fileurl) {
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
    },
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择 ${this.limit}个文件`);
    },
    setSrvVal(srvVal) {
      this.field.model = srvVal;
      this.getData();
    },

    getSrvVal() {
      return this.field.model;
    },
    dowmlaodUrl() {
      window.open(this.imageDialogUrl);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.upload-disabled {
  .el-upload {
    display: none;
  }
}

.text-red {
  color: #f56c6c;
}

.el-table th {
  text-align: center;
}

.el-table tbody tr td:first-child {
  text-align: center;
}

.form-imgs {
  padding: 0;
}
</style>
