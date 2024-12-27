<template>
  <div>
    <template v-if="isEdit === false">
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
      append-to-body
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

    <div
      style="display: flex; flex-wrap: wrap"
      v-if="isEdit !== false"
      v-loading="loading"
    >
      <!-- 使用element-ui自带样式 -->
      <ul class="el-upload-list el-upload-list--picture-card">
        <draggable v-model="fileLists" @end="onDragEnd" animation="300">
          <transition-group>
            <li
              v-for="(item, index) in fileLists"
              :key="item.id"
              class="el-upload-list__item is-success animated"
            >
              <img
                :src="item.url"
                alt=""
                class="el-upload-list__item-thumbnail"
              />
              <i class="el-icon-close"></i>
              <span class="el-upload-list__item-actions">
                <!-- 预览 -->
                <span
                  class="el-upload-list__item-preview"
                  @click="handlePictureCardPreviewFileDetail(item)"
                >
                  <i class="el-icon-zoom-in"></i>
                </span>
                <!-- 删除 -->
                <span
                  class="el-upload-list__item-delete"
                  @click="handleRemoveFileDetail(item, fileLists)"
                >
                  <i class="el-icon-delete"></i>
                </span>
              </span>
            </li>
          </transition-group>
        </draggable>
      </ul>
      <div
        :class="{
          'display-none': limit && fileLength && fileLength >= limit,
          'on-focus': onfocus === true,
        }"
        class="custom-upload"
        @drop.prevent="handleDrop"
        @paste="handlePaste"
        @dragover.prevent
        v-if="isEdit"
        @click.stop.prevent="onfocus = true"
        v-click-outside="onOutsideClick"
      >
        <div class="upload-btn" @click.stop="handleClick">
          <div>点击选择或</div>
          <div>拖放图像文件</div>
          <div>到此区域进行上传</div>
          <!-- <div>
                <el-button size="small" type="primary">直接粘贴</el-button>
              </div> -->
        </div>
      </div>
      <el-upload
        v-if="isEdit"
        ref="upload"
        class="upload-demo"
        :class="{
          'upload-disabled': limit && fileLength && fileLength >= limit,
        }"
        style="display: none"
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
        :show-file-list="false"
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
  </div>
</template>
<script>
import cloneDeep from "lodash/cloneDeep";
import draggable from "vuedraggable";

export default {
  components: {
    draggable,
  },
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
  directives: {
    "click-outside": {
      bind(el, binding, vnode) {
        el.clickOutsideEvent = function (event) {
          if (!(el == event.target || el.contains(event.target))) {
            vnode.context[binding.expression](event);
          }
        };
        document.body.addEventListener("click", el.clickOutsideEvent);
      },
      unbind(el) {
        document.body.removeEventListener("click", el.clickOutsideEvent);
      },
    },
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
      fileType: "jpg/png/svg/PNG/JPG/JPEG/jpeg/gif/GIF/bmp/tif/tiff/webp",
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
      dialogVisibleDetail: false,
      dialogImageDetailUrl: "",
      loading: false,
      onfocus: false,
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
              file.url = this.serviceApi().downloadFile + file.fileurl;
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
    dataURLtoBlob(dataurl) {
      //将base64转换为blob
      var arr = dataurl.split(","),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    },
    blobToFile(theBlob, fileInfo) {
      // 将blob转换为file
      theBlob.lastModifiedDate = new Date();
      theBlob.name = fileInfo?.name || `${new Date().getTime()}.jpeg`;
      return theBlob;
    },
    uploadImgFromPaste(file, type, info) {
      /**调用element的上传方法 需要把base64转换成file上传**/
      let a = this.dataURLtoBlob(file);
      let b = this.blobToFile(a, info);
      const upload = this.$refs.upload;
      upload.handleStart(b);
      setTimeout(() => {
        upload.submit();
      });
    },
    handleClick() {
      // 获取 el-upload 组件实例
      const uploadComponent = this.$refs.upload;

      // 访问内部的 input[type="file"] 元素并触发 click 事件
      if (uploadComponent) {
        // 因为默认的触发按钮被隐藏了，所以需要找到实际的 input 元素
        const input = uploadComponent.$el.querySelector('input[type="file"]');
        if (input) {
          input.click(); // 触发文件选择对话框
        }
      }
    },
    handleDrop(event) {
      const items = event.dataTransfer.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === "file") {
          const file = items[i].getAsFile();
          console.log(file);

          if (file.type.startsWith("image/")) {
            this.handleImage(file);
          } else {
            this.$message.error("只能上传图片!");
          }
        }
      }
    },
    handlePaste(event) {
      // 阻止默认行为
      if (this.onfocus === false) return;
      event.preventDefault();

      // 获取剪切板中的数据
      let clipboardData = event.clipboardData || window.clipboardData;
      console.log(clipboardData.items);

      let items = clipboardData.items;

      if (items && items.length > 0) {
        // 循环遍历所有粘贴项
        for (let i = 0; i < items.length; i++) {
          let item = items[i];
          if (item.kind === "file") {
            let file = item.getAsFile();
            console.log("非图片文件", file);
            // 确认是图片文件
            if (file.type.startsWith("image/")) {
              this.handleImage(file);
              break; //一次只上传第一张图片
            } else {
              console.log("非图片文件", file);
            }
          }
        }
      }
    },
    onOutsideClick(event) {
      console.log(event, "onOutsideClick");
      this.onfocus = false;
    },
    async readClipboardImage() {
      try {
        // 检查浏览器是否支持 Clipboard API
        if (!navigator.clipboard) {
          this.$message.error("当前浏览器不支持剪贴板操作");
          return;
        }

        // 请求读取权限（部分浏览器需要）
        if (navigator.permissions) {
          await navigator.permissions
            .query({ name: "clipboard-read" })
            .then((result) => {
              if (result.state === "denied") {
                this.$message.warning("需要授予访问剪贴板的权限");
                return;
              }
            });
        }

        // 读取剪贴板内容
        const clipboardItems = await navigator.clipboard.read();
        console.log("clipboardItems", clipboardItems);

        let hasImages = false;

        for (const item of clipboardItems) {
          for (const type of item.types) {
            if (type.startsWith("image/")) {
              hasImages = true;
              const blob = await item.getType(type);
              this.handleImage(blob);
            }
          }
        }

        if (!hasImages) {
          this.$message.error("粘贴板无图片");
        } else {
          this.errorMessage = "";
        }
      } catch (error) {
        console.error("读取剪贴板失败:", error);
        this.$message.error("读取剪贴板失败，请确保已复制图片到剪贴板");
      }
    },
    handleImage(blob) {
      const reader = new FileReader();
      const _this = this;
      reader.onload = (event) => {
        console.log("图片数据:", event.target.result);
        let base64_str = event.target.result;
        // 上传逻辑
        _this.uploadImgFromPaste(base64_str, "paste", {
          name: blob.name,
          type: blob.type,
          size: blob.size,
        });
      };
      reader.readAsDataURL(blob);
    },
    refreshFileList() {
      this.loading = true;
      this.selectFileList(this.field.model).then((response) => {
        let list = [];
        const prefix = this.serviceApi().downloadFile;
        for (let i in response.body.data) {
          let file = response.body.data[i];
          file.name = response.body.data[i].src_name;
          file.url = `${prefix}${response.body.data[i].fileurl}`;
          if (file?.fileurl?.indexOf("http") === 0) {
            file.url = file.fileurl;
          }
          console.log("refreshFileList");
          list.push(file);
        }
        this.fileLists = list;
        this.loading = false;
      });
    },
    async changeFileSeq(newIndex, oldIndex) {
      let id = this.fileLists[newIndex].id;
      let oldId = this.fileLists[oldIndex].id;
      if (newIndex < oldIndex) {
        [id, oldId] = [oldId, id]; // 交换顺序
      }
      const req = [
        {
          serviceName: "srvfile_set_file_seq_update",
          condition: [
            {
              colName: "id",
              ruleType: "eq",
              value: id,
            },
          ],
          data: [
            {
              target_id_after: oldId,
            },
          ],
        },
      ];
      const url = `/file/operate/srvfile_set_file_seq_update`;
      this.loading = true;
      const res = await this.$http.post(url, req);
      this.loading = false;
      console.log(res);
      if (res.data.state === "SUCCESS") {
        this.$message.success("排序成功");
      } else {
        this.$message.error("排序失败:" + res.data.resultMessage);
      }
      this.refreshFileList();
      // let list = this.deepClone(this.fileLists);
      // let seq = 100;
      // if (list.length > 1) {
      //   list.forEach((item, index) => {
      //     item.seq = seq + index * 10;
      //   });
      //   const url = `/file/update/srvfile_attachment_update`;
      //   const req = list.map((item) => {
      //     return {
      //       serviceName: "srvfile_attachment_update",
      //       condition: [
      //         {
      //           colName: "id",
      //           ruleType: "eq",
      //           value: item.id,
      //         },
      //       ],
      //       data: [
      //         {
      //           seq: item.seq,
      //         },
      //       ],
      //     };
      //   });
      //   const res = await this.$http.post(url, req);
      //   console.log(res);
      //   if (res.data.state === "SUCCESS") {
      //     this.$message.success("排序成功");
      //   } else {
      //     this.$message.error("排序失败:" + res.data.resultMessage);
      //   }
      // }
    },
    onDragEnd(event) {
      console.log("onDragEnd:", event);
      if (event.newIndex === event.oldIndex) {
        return;
      }
      this.changeFileSeq(event.newIndex, event.oldIndex);
    },
    // 放大
    handlePictureCardPreviewFileDetail(file) {
      this.imageDialogUrl = file.url;
      this.imageDialog = true;
    },
    // 删除
    async handleRemoveFileDetail(file, fileList, index) {
      const isDelete = await this.beforeRemove(file, fileList);
      if (isDelete) {
        this.fileLists.splice(index, 1);
        this.handleRemove(file, fileList);
      }
    },
    getHeaders() {
      let bx_auth_ticket = sessionStorage.getItem("bx_auth_ticket");
      return {
        bx_auth_ticket: bx_auth_ticket,
      };
    },

    getData() {
      this.uploadParams.table_name = this.field?.info?.srvCol?.table_name || "";
      this.uploadParams.columns = this.field?.info?.srvCol?.columns || "";

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
        if (
          this.field.model != null &&
          this.field.model?.indexOf("http") !== 0
        ) {
          //如果有file_no则查询出相关的图片信息
          this.uploadParams.file_no = this.field.model;
          this.queryData();
        } else if (this.field.model?.indexOf("http") === 0) {
          console.log(2222222222222);

          this.fileLists.push({
            url: this.field.model,
          });
        }
      } else {
        this.isEdit = false;
        this.queryData();
      }
    },
    queryData() {
      if (this.field.model?.indexOf("http") == 0) {
        console.log(33333333333);

        this.fileLists.push({
          url: this.field.model,
        });
        return;
      }
      this.selectFileList(this.field.model).then((response) => {
        for (let i in response.body.data) {
          let file = response.body.data[i];
          file.name = response.body.data[i].src_name;
          file.url =
            this.serviceApi().downloadFile + response.body.data[i].fileurl;
          if (file?.fileurl?.indexOf("http") === 0) {
            file.url = file.fileurl;
          }
          console.log(4444444444444444);

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
      let type = file.name.slice(file.name.lastIndexOf(".") + 1).toLowerCase();
      if (this.fileType.includes(type)) {
        flag = true;
      }
      // for (let i in this.fileType.split("/")) {
      //   let fileType = this.fileType.split("/")[i];
      //   if (fileType && typeof fileType === "string") {
      //     fileType = fileType.toLowerCase();
      //   }
      //   if (file.name.toLowerCase().indexOf(fileType.toLowerCase()) !== -1) {
      //     flag = true;
      //     break;
      //   }

      //   // if (file.name.split(".")[1] === fileType) {
      //   //   flag = true;
      //   //   break;
      //   // }
      // }
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
      console.log(fileList, "handleSuccess");
      if (response.state === undefined) {
        this.$message.info("上传成功！");
        this.uploadParams.file_no = response.file_no;
        this.field.model = response.file_no;
        response.url = this.serviceApi().downloadFile + response.fileurl;
        this.fileLists.push(response);
        if (response.fileurl?.indexOf("http") === 0) {
          this.field.model = response.fileurl;
        }
        this.$emit("change", this.field.model);
        this.setObjInfo(fileList);
      } else {
        this.$message.error("上传失败！");
        console.log(55555555555555);
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
<style scoped lang="scss">
::v-deep .el-upload-list {
  border: none !important;
}

.custom-upload {
  background-color: #fbfdff;
  border: 1px dashed #c0ccda;
  border-radius: 6px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  width: 148px;
  height: 148px;
  // line-height: 146px;
  vertical-align: top;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  cursor: pointer;

  .upload-btn {
    cursor: pointer;
    line-height: 20px;
    &:hover {
      color: #409eff;
    }
  }
}

.display-none {
  display: none;
}
.on-focus {
  border-color: #409eff;
}

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
