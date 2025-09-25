<template>
  <div>
    <template v-if="isEdit === false">
      <ul class="form-imgs">
        <li
          v-for="(o, index) in fileLists"
          :key="index"
          class="imgs-item"
        >
          <div v-on:click="
            imageDialogUrl = o.url;
          imageDialog = true;
          ">
            <img
              :src="o.url"
              min-width="70"
              height="70"
            />
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
        class="preview-img"
      /><br />
      <el-button
        type="primary"
        @click="imageDialog = false"
      >确 定</el-button>
      <el-button
        type="primary"
        @click="dowmlaodUrl()"
      >下载</el-button>
    </el-dialog>

    <div
      style="display: flex; flex-wrap: wrap"
      class="img-list"
      v-if="isEdit !== false"
      v-loading="loading"
    >
      <!-- 使用element-ui自带样式 -->
      <ul class="el-upload-list el-upload-list--picture-card">
        <draggable
          v-model="fileLists"
          @end="onDragEnd"
          animation="300"
        >
          <transition-group style="display: flex; flex-wrap: wrap">
            <li
              v-for="(item, index) in fileLists"
              :key="index"
              class="el-upload-list__item is-success animated"
            >
              <img
                :src="item.url"
                alt=""
                class="el-upload-list__item-thumbnail"
              />
              <i class="el-icon-close"></i>
              <span class="el-upload-list__item-actions">
                <span
                  class="el-upload-list__item-preview"
                  title="预览"
                  @click="handlePictureCardPreviewFileDetail(item)"
                >
                  <i class="el-icon-zoom-in"></i>
                </span>
                <span
                  class="el-upload-list__item-delete"
                  title="删除"
                  @click="handleRemoveFileDetail(item, fileLists)"
                >
                  <i class="el-icon-delete"></i>
                </span>
              </span>
            </li>
          </transition-group>
        </draggable>
      </ul>
      <!-- <div
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
          <div class="upload-btn text-blue" @click.stop="handleClick">
            <div>点击选择或</div>
            <div>拖放图像文件</div>
            <div>到此区域</div>
          </div>
        </div> -->

      <div
        style="display: flex; flex-wrap: wrap"
        v-if="isEdit !== false && useFilePicker && !isHttp"
        v-loading="loading"
      >
        <div
          :class="{
            'display-none': limit && fileLength && fileLength >= limit,
          }"
          class="custom-upload"
          @click="showFilePicker = true"
        >
          <i
            class="el-icon-plus"
            style="font-size: 28px; color: #8c939d"
          ></i>
        </div>
        <file-picker
          v-if="showFilePicker"
          v-model="showFilePicker"
          @file-change="onPickerFileChange"
        ></file-picker>
      </div>
      <el-upload
        ref="upload"
        class="upload-demo"
        :class="{
          'upload-disabled': limit && (fileLength && fileLength >= limit || fileLists.length >= limit) && !isHttp,
        }"
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
        :style="useFilePicker ? 'display:none;' : ''"
        v-if="
          !limit || !fileLength || (limit && fileLength && fileLength < limit && fileLists.length < limit)
        "
      >
        <el-button
          size="small"
          type="primary"
        >点击上传</el-button>
      </el-upload>

      <div
        slot="tip"
        class="el-upload__tip w-full"
        style="margin-top: 0"
        :class="{ 'text-red111': field.getAnyValidateError() }"
      >
        <i
          slot="reference"
          class="el-icon-warning"
          v-if="field.getAnyValidateError()"
        ></i>
        {{ setFileDesc }}
      </div>
    </div>
  </div>
</template>
<script>
import cloneDeep from "lodash/cloneDeep";
import draggable from "vuedraggable";
import filePicker from "./file-picker/file-picker.vue";
import bigFileUploadMixin from "@/components/mixin/big-file-upload-mixin";
import aSaveBMixin from "../mixin/a-save-b.mixin";

export default {
  mixins: [aSaveBMixin, bigFileUploadMixin],
  components: {
    draggable,
    filePicker,
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
    getDisabled() {
      if (!this.field.info.editable) {
        return true;
      } else if (this.limit && this.fileLength) {
        return this.fileLength >= this.limit;
      }
      return false;
    },
    setFileDesc() {
      // if (this.field.getAnyValidateError()) {
      //   return this.field.getAnyValidateError();
      // }
      const fileType = this.field.fileType || "jpg/png/svg";
      const fileSize = this.fileSize ? this.fileSize / 1024 : 10; // 默认10MB
      return `请上传${fileType}格式的图片,大小不超过${fileSize}MB`;
    },
    useFilePicker() {
      return this.field.info?.moreConfig?.useFilePicker;
    },
    isHttp() {
      return this.field.model && this.field.model.startsWith("http");
    },
  },
  data() {
    return {
      showFilePicker: false,
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
          : 10 * 1024, // 默认10MB
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
              if (file.fileurl.indexOf("http") == -1) {
                file.url = this.serviceApi().downloadFile + file.fileurl;
              } else {
                file.url = file.fileurl;
              }
              // file.url = this.serviceApi().downloadFile + file.fileurl;
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
  mounted() {
    // 初始化分片上传相关配置
    this.initSplitUploadConfig();
  },
  methods: {
    // 初始化分片上传配置
    initSplitUploadConfig() {
      // 确保使用大文件上传混入的功能
      if (typeof this.initBigFileUpload === 'function') {
        this.initBigFileUpload();
      }
      // 设置分片大小和其他配置参数
      this.chunkSize = 1 * 1024 * 1024; // 默认10MB
      this.limitSize = 2; // 默认超过20MB使用分片上传
      this.useSplitChuck = true; // 启用分片上传
    },
    onPickerFileChange(event) {
      if (event?.files?.length) {
        const file = event?.files[0];
        
        // 检查文件大小，决定是否使用分片上传
        const fileSizeInMB = file.size / (1024 * 1024);
        if (this.useSplitChuck && fileSizeInMB >= this.limitSize) {
          // 对大文件使用分片上传
          this.handleBigFileUpload(file);
        } else {
          // 对小文件使用默认上传
          const newFile = new File([file], file.name, { type: file.type });
          const upload = this.$refs.upload;
          upload.handleStart(newFile);
          setTimeout(() => {
            upload.submit();
          });
        }
      } else if (event?.url) {
        if (event.url?.indexOf("http") === 0) {
          if (this.fileLists?.length) {
            return this.$message.error("文件url不能上传多条");
          }
          this.field.model = event.url;
          this.fileLists.push({
            fileurl: event.url,
            url: event.url,
            name: '外部图片'
          });
        }
      }
    },
    
    // 处理大文件上传的统一方法
    handleBigFileUpload(file) {
      const _this = this;
      
      // 显示上传中状态
      this.loading = true;
      
      // 调用分片上传方法
      this.handelUploadBigFile(file, {
        onUploadProgress: (progress) => {
          // 可以在这里处理上传进度
          console.log('上传进度:', progress + '%');
        },
        onHashProgress: (progress) => {
          // 可以在这里处理文件hash计算进度
          console.log('文件处理进度:', progress + '%');
        },
        onUploadSuccess: async (res) => {
          // 上传成功后的处理
          console.log('分片上传成功:', res);
          _this.loading = false;
          
          // 调用handleSuccess方法处理上传结果
          if (res) {
            // 构造类似普通上传的响应格式
            const response = {
              ...res,
              file_no: res.file_no || res.id,
              fileurl: res.fileurl || res.path || res.url,
              src_name: res.src_name || res.fileName || file.name
            };
            
            // 调用handleSuccess处理响应
            await _this.handleSuccess(response, { ...file, response }, _this.fileLists);
          }
        }
      }).catch(error => {
        console.error('分片上传失败:', error);
        _this.loading = false;
        _this.$message.error('文件上传失败，请重试');
      });
    },
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
      
      // 检查文件大小，决定是否使用分片上传
      const fileSizeInMB = b.size / (1024 * 1024);
      if (this.useSplitChuck && fileSizeInMB >= this.limitSize) {
        // 对大文件使用分片上传
        this.handleBigFileUpload(b);
      } else {
        // 对小文件使用默认上传
        const upload = this.$refs.upload;
        upload.handleStart(b);
        setTimeout(() => {
          upload.submit();
        });
      }
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
      // console.log(event, "onOutsideClick");
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
      
      // 检查文件大小，决定是否直接使用blob进行分片上传
      // 对于粘贴的图片，通常不会太大，但为了一致性还是保留逻辑
      const fileSizeInMB = blob.size / (1024 * 1024);
      
      if (this.useSplitChuck && fileSizeInMB >= this.limitSize) {
        // 对于大文件，直接使用blob创建File对象进行分片上传
        const file = new File([blob], blob.name || 'pasted-image.png', { type: blob.type });
        _this.handleBigFileUpload(file);
      } else {
        // 对于小文件，转换为base64后上传
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
      }
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
        // if (file?.url?.indexOf("http") !== 0) {
        this.handleRemove(file, fileList);
        // }
      }
    },
    getHeaders() {
      let bx_auth_ticket = sessionStorage.getItem("bx_auth_ticket");
      return {
        bx_auth_ticket: bx_auth_ticket,
        "bx-auth-ticket": bx_auth_ticket,
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
          this.field.model?.indexOf("http") !== 0 &&
          this.field.model // 确保model有值
        ) {
          //如果有file_no则查询出相关的图片信息
          this.uploadParams.file_no = this.field.model;
          this.queryData();
        } else if (this.field.model?.indexOf("http") === 0) {
          // 直接使用HTTP URL作为图片源
          this.fileLists.push({
            url: this.field.model,
            fileurl: this.field.model,
            name: '外部图片'
          });
        }
      } else {
        this.isEdit = false;
        this.queryData();
      }
    },
    queryData() {
      if (this.field.model?.indexOf("http") == 0) {
        // 直接使用HTTP URL作为图片源
        this.fileLists.push({
          url: this.field.model,
          fileurl: this.field.model,
          name: '外部图片'
        });
        return;
      }
      this.selectFileList(this.field.model).then((response) => {
        for (let i in response.body.data) {
          let file = response.body.data[i];
          file.name = response.body.data[i].src_name;
          // 使用getFileUrl方法统一处理文件路径
          file.url = this.getFileUrl(response.body.data[i].fileurl);
          this.fileLists.push(file);
        }
      });
    },
    
    // 删除文件方法，支持删除通过分片上传的文件
    async deleteFile(params) {
      try {
        const url = `/file/delete`;
        const res = await this.$http.post(url, params);
        return res?.data;
      } catch (error) {
        console.error('删除文件失败:', error);
        this.$message.error('删除文件失败');
        return { body: { resultCode: 'ERROR', state: '删除失败' } };
      }
    },
    
    // 检查上传状态方法
    async checkUploadStatus(fileNo) {
      try {
        const url = `/file/checkStatus`;
        const res = await this.$http.post(url, { file_no: fileNo });
        return res?.data;
      } catch (error) {
        console.error('检查上传状态失败:', error);
        return null;
      }
    },
    beforeAvatarUpload(file) {
      // 检查文件类型
      let flag = false;
      let type = file.name.slice(file.name.lastIndexOf(".") + 1).toLowerCase();
      if (this.fileType.includes(type)) {
        flag = true;
      }
      if (!flag) {
        this.$message.error("只能上传" + this.fileType + "文件!");
        return false;
      }

      // 检查文件大小
      if (file.size / 1024 > this.fileSize) {
        this.$message.error("文件大小不能超过" + this.fileSize + "kb");
        return false;
      }

      // 判断是否需要使用分片上传
      const fileSizeInMB = file.size / (1024 * 1024);
      if (this.useSplitChuck && fileSizeInMB >= this.limitSize) {
        // 阻止默认上传
        const _this = this;
        
        // 显示上传中状态
        this.loading = true;
        
        // 设置上传参数
        const uploadParams = {
          table_name: this.uploadParams.table_name,
          columns: this.uploadParams.columns,
          app_no: this.resolveDefaultSrvApp()
        };
        
        // 调用分片上传方法
        this.handelUploadBigFile(file, {
          onUploadProgress: (progress) => {
            // 可以在这里处理上传进度
            console.log('上传进度:', progress + '%');
          },
          onHashProgress: (progress) => {
            // 可以在这里处理文件hash计算进度
            console.log('文件处理进度:', progress + '%');
          },
          onUploadSuccess: async (res) => {
            // 上传成功后的处理
            console.log('分片上传成功:', res);
            _this.loading = false;
            
            // 调用handleSuccess方法处理上传结果
            if (res) {
              // 构造类似普通上传的响应格式
              const response = {
                ...res,
                file_no: res.file_no || res.id,
                fileurl: res.fileurl || res.path || res.url,
                src_name: res.src_name || res.fileName || file.name
              };
              
              // 调用handleSuccess处理响应
              await _this.handleSuccess(response, { ...file, response }, _this.fileLists);
            }
          }
        }).catch(error => {
          console.error('分片上传失败:', error);
          _this.loading = false;
          _this.$message.error('文件上传失败，请重试');
        });
        
        // 返回false阻止默认上传
        return false;
      }
      
      // 小文件使用默认上传方式
      return true;
    },
    handleRemove(file, fileList) {
      this.setObjInfo(fileList);
      if (fileList.length === 0) {
        this.field.model = "";
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
      if (file?.file_no) {
        file.status = "success";
      }
      if (file && file.status === "success") {
        //删除
        let fileurl;
        if (file?.file_no && !file.response) {
          file.response = { ...file };
        }
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
      } else if (typeof file === "string" && file.indexOf("http") === 0) {
        this.field.model = "";
        this.$emit("change", this.field.model);
        return true;
      }
    },
    async handleSuccess(response, file, fileList) {
      // 统一处理分片上传和普通上传的响应格式
      const normalizedResponse = this.normalizeResponse(response);
      
      if (normalizedResponse.fileurl?.startsWith("http")) {
        // 返回的http链接 查询上传状态 上传成功后再继续后面操作 避免未成功上传到华为云就显示在页面上导致显示的图片加载失败
        console.time("handleSuccess");
        this.loading = true;
        if (normalizedResponse?.file_no) {
          // 查询文件上传状态
          await this.checkUploadStatus(normalizedResponse.file_no);
        }
        this.loading = false;
        console.timeEnd("handleSuccess");
      }
      
      // 检查是否上传成功
      const isSuccess = normalizedResponse.state === 'SUCCESS' || normalizedResponse.state === undefined;
      
      if (isSuccess) {
        this.$message.info("上传成功！");
        
        // 检查是否有自定义的handleSuccess方法
        let modelValue = normalizedResponse.file_no;
        if (this.field.handleSuccess && typeof this.field.handleSuccess === 'function') {
          // 使用自定义的handleSuccess方法处理响应
          modelValue = this.field.handleSuccess(normalizedResponse);
        } else {
          // 默认处理逻辑
          this.uploadParams.file_no = normalizedResponse.file_no;
          if (normalizedResponse.fileurl?.indexOf("http") === 0) {
            modelValue = normalizedResponse.fileurl;
          }
        }
        
        // 设置model值
        this.field.model = modelValue;
        
        // 设置文件URL
        normalizedResponse.url = this.getFileUrl(normalizedResponse.fileurl);
        
        // 添加到文件列表并触发事件
        // 检查是否已经存在相同的文件，避免重复添加
        const exists = this.fileLists.some(item => item.file_no === normalizedResponse.file_no || item.fileurl === normalizedResponse.fileurl);
        if (!exists) {
          this.fileLists.push(normalizedResponse);
        }
        this.$emit("change", this.field.model);
        this.setObjInfo(fileList);
      } else {
        this.$message.error("上传失败！" + (normalizedResponse.message || ''));
        // 从文件列表中移除失败的文件
        const index = this.fileLists.findIndex(item => item.file_no === normalizedResponse.file_no || item.fileurl === normalizedResponse.fileurl);
        if (index !== -1) {
          this.fileLists.splice(index, 1);
        }
      }
      this.fileLength = this.fileLists.length;
      this.loading = false;
    },
    
    // 统一归一化响应格式，处理分片上传和普通上传的不同响应结构
    normalizeResponse(response) {
      if (!response) return {};
      
      // 从big-file-upload-mixin继承的handleMerge方法返回的数据格式
      if (response.id && !response.file_no) {
        return {
          ...response,
          file_no: response.id,
          fileurl: response.fileurl || response.path || response.url,
          src_name: response.src_name || response.fileName || response.name
        };
      }
      
      // 普通上传响应格式
      return {
        ...response,
        file_no: response.file_no || '',
        fileurl: response.fileurl || '',
        src_name: response.src_name || response.fileName || ''
      };
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

  &:hover {
    border-color: #409eff;
  }

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
  display: none;

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

  .imgs-item {
    max-width: 200px;
  }
}

.img-list .el-upload-list--picture-card .el-upload-list__item,
.preview-img {
  background-image: linear-gradient(45deg, #eee 25%, transparent 25%),
    linear-gradient(-45deg, #eee 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #eee 75%),
    linear-gradient(-45deg, transparent 75%, #eee 75%) !important;
  background-size: 20px 20px !important;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px !important;
}
</style>