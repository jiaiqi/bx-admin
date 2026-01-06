<template>
  <div class="id-card-upload">
    <!-- 状态提示区 -->
    <div
      v-if="overallStatus !== 'empty'"
      class="upload-status-compact"
      :class="overallStatusClass"
    >
      <div class="status-info">
        <i :class="overallStatusIcon"></i>
        <span class="status-message">{{ overallStatusTitle }}</span>
      </div>
      <div v-if="showProgress" class="progress-dots">
        <div class="dot" :class="{ completed: frontImageUrl }"></div>
        <div class="dot" :class="{ completed: backImageUrl }"></div>
      </div>
    </div>

    <!-- 上传进度条 -->
    <div
      v-if="uploadProgress > 0 && uploadProgress < 100 && uploadingFileName"
      class="upload-progress-container"
      style="margin-bottom: 16px"
    >
      <el-progress
        :percentage="uploadProgress"
        :stroke-width="6"
        text-inside
      ></el-progress>
      <div class="upload-status-text">{{ uploadingFileName }} - 上传中...</div>
    </div>

    <!-- 上传区 -->
    <div class="upload-areas">
      <div class="upload-section">
        <h3 v-if="showTitle" class="section-title">{{ frontTitle }}</h3>
        <div
          ref="frontUploader"
          class="modern-uploader"
          :class="{
            'has-image': frontImageUrl,
            'is-uploading': frontUploading,
            'drag-over': frontDragOver,
            error: frontError,
            'upload-completed': frontImageUrl && !frontUploading,
            'upload-pending': !frontImageUrl && backImageUrl,
          }"
          @click="triggerFileInput('front')"
          @drop="handleDrop($event, 'front')"
          @dragover="handleDragOver($event, 'front')"
          @dragleave="handleDragLeave($event, 'front')"
          @dragenter="handleDragEnter($event, 'front')"
          tabindex="0"
          role="button"
          :aria-label="`上传${frontTitle}`"
          @keydown="handleKeyDown($event, 'front')"
        >
          <input
            ref="frontInput"
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            style="display: none"
            @change="handleFileChange($event, 'front')"
          />

          <div v-if="!frontImageUrl" class="upload-content">
            <i class="upload-icon el-icon-camera"></i>
            <div class="upload-text">
              <div class="upload-title">{{ frontTitle }}</div>
              <div class="upload-hint">点击或拖拽文件到此区域</div>
            </div>
          </div>

          <div v-else class="image-preview-wrapper">
            <img
              :src="getFilePathByUrl(frontImageUrl)"
              alt="身份证正面"
              class="image-preview"
            />
            <div class="upload-success-badge">
              <i class="el-icon-check"></i>
            </div>
            <div class="image-overlay" v-if="!frontUploading" @click.stop="">
              <button
                class="delete-btn"
                @click.stop="removeImage('front')"
                aria-label="删除图片"
              >
                <i class="el-icon-close"></i>
              </button>
            </div>
          </div>

          <div v-if="frontUploading" class="upload-overlay">
            <div class="spinner"></div>
            <div class="upload-text">上传中...</div>
          </div>

          <div v-if="frontError" class="error-message">{{ frontError }}</div>
        </div>

        <div class="upload-tip">请上传{{ frontTitle }}图片</div>
      </div>

      <div class="upload-section">
        <h3 v-if="showTitle" class="section-title">{{ backTitle }}</h3>
        <div
          ref="backUploader"
          class="modern-uploader"
          :class="{
            'has-image': backImageUrl,
            'is-uploading': backUploading,
            'drag-over': backDragOver,
            error: backError,
            'upload-completed': backImageUrl && !backUploading,
            'upload-pending': !backImageUrl && frontImageUrl,
          }"
          @click="triggerFileInput('back')"
          @drop="handleDrop($event, 'back')"
          @dragover="handleDragOver($event, 'back')"
          @dragleave="handleDragLeave($event, 'back')"
          @dragenter="handleDragEnter($event, 'back')"
          tabindex="0"
          role="button"
          :aria-label="`上传${backTitle}`"
          @keydown="handleKeyDown($event, 'back')"
        >
          <input
            ref="backInput"
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            style="display: none"
            @change="handleFileChange($event, 'back')"
          />

          <div v-if="!backImageUrl" class="upload-content">
            <i class="upload-icon el-icon-camera"></i>
            <div class="upload-text">
              <div class="upload-title">{{ backTitle }}</div>
              <div class="upload-hint">点击或拖拽文件到此区域</div>
            </div>
          </div>

          <div v-else class="image-preview-wrapper">
            <img
              :src="getFilePathByUrl(backImageUrl)"
              alt="身份证反面"
              class="image-preview"
            />
            <div class="upload-success-badge">
              <i class="el-icon-check"></i>
            </div>
            <div class="image-overlay" v-if="!backUploading" @click.stop="">
              <button
                class="delete-btn"
                @click.stop="removeImage('back')"
                aria-label="删除图片"
              >
                <i class="el-icon-close"></i>
              </button>
            </div>
          </div>

          <div v-if="backUploading" class="upload-overlay">
            <div class="spinner"></div>
            <div class="upload-text">上传中...</div>
          </div>

          <div v-if="backError" class="error-message">{{ backError }}</div>
        </div>

        <div class="upload-tip">请上传{{ backTitle }}图片</div>
      </div>
    </div>
  </div>
</template>

<script>
import { Message } from "element-ui";
import bigFileUploadMixin from "@/components/mixin/big-file-upload-mixin";
import { getFilePathByUrl } from "@/common/http";

export default {
  name: "IdCardUpload",
  mixins: [bigFileUploadMixin],
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    mainformDatas: {
      type: Object,
    },
    field: {
      type: Object,
    },
    defaultValues: {
      type: Object,
    },
    currentSelected: {
      type: Object,
    },
    // 自定义配置项
    maxSize: {
      type: Number,
      default: 10, // 默认10MB
      description: "上传图片的最大大小，单位MB",
    },
    allowedTypes: {
      type: Array,
      default: () => ["jpeg", "jpg", "png", "webp"],
      description: "允许上传的图片类型",
    },
    showTitle: {
      type: Boolean,
      default: false,
      description: "是否显示标题",
    },
    frontTitle: {
      type: String,
      default: "身份证正面（国徽面）",
      description: "正面图片标题",
    },
    backTitle: {
      type: String,
      default: "身份证反面（人像面）",
      description: "反面图片标题",
    },
    autoSave: {
      type: Boolean,
      default: true,
      description: "上传成功后是否自动保存到服务器",
    },

    frontPhotoColumn: {
      type: String,
      default: "idcard_front_image",
      description: "正面图片字段名",
    },
    backPhotoColumn: {
      type: String,
      default: "idcard_back_image",
      description: "反面图片字段名",
    },
  },
  data() {
    return {
      formModel: {
        tenant_no: "", // 租户编号
        owner_no: "", // 归属业务编号
        // 动态字段名在created生命周期中设置
      },
      frontImageUrl: "",
      backImageUrl: "",
      frontImageFileNo: "",
      backImageFileNo: "",
      uploadUrl: "",
      uploadData: {},
      uploadHeaders: {},

      // 新增状态变量
      frontUploading: false,
      backUploading: false,
      frontDragOver: false,
      backDragOver: false,
      frontError: "",
      backError: "",

      // 大文件上传相关变量
      uploadProgress: 0,
      uploadingFileName: "",

      // 整体状态管理
      isRecordSaving: false,
      recordSaved: false,
    };
  },

  created() {
    // 初始化动态字段名
    this.initFormModelFields();
  },
  computed: {
    srvCol() {
      return this.field?.info?.srvCol;
    },
    optionV2() {
      return this.srvCol?.option_list_v2;
    },
    serviceName() {
      return this.optionV2?.serviceName || "";
    },
    srvApp() {
      return (
        this.optionV2?.srv_app ||
        this.$srvApp ||
        this.resolveDefaultSrvApp() ||
        sessionStorage.getItem("current_app") ||
        top.pathConfig.application
      );
    },
    // 整体状态计算属性
    overallStatus() {
      if (this.recordSaved) return "completed";
      if (this.isRecordSaving) return "saving";
      if (this.frontImageUrl && this.backImageUrl) return "ready";
      if (this.frontImageUrl || this.backImageUrl) return "partial";
      return "empty";
    },
    overallStatusClass() {
      return `status-${this.overallStatus}`;
    },
    overallStatusIcon() {
      switch (this.overallStatus) {
        case "completed":
          return "el-icon-success";
        case "saving":
          return "el-icon-loading";
        case "ready":
          return "el-icon-warning";
        case "partial":
          return "el-icon-info";
        default:
          return "el-icon-upload2";
      }
    },
    overallStatusTitle() {
      switch (this.overallStatus) {
        case "completed":
          return "身份证信息已保存";
        case "saving":
          return "正在保存...";
        case "ready":
          return "图片已上传完成";
        case "partial":
          if (this.frontImageUrl && !this.backImageUrl) {
            return "请继续上传反面（人像面）";
          } else if (!this.frontImageUrl && this.backImageUrl) {
            return "请继续上传正面（国徽面）";
          }
          return "请继续上传";
        default:
          return "请上传身份证正反面";
      }
    },
    showProgress() {
      return this.overallStatus !== "empty";
    },
  },
  mounted() {
    this.initUploadConfig();
    this.initSplitUploadConfig();
  },

  methods: {
    getFilePathByUrl(url) {
      return getFilePathByUrl(url, false);
    },
    // 初始化动态字段名
    initFormModelFields() {
      if (this.field?.info?.srvCol) {
        this.formModel = {
          ...this.formModel,
          [this.frontPhotoColumn]: "",
          [this.backPhotoColumn]: "",
        };
      }
    },
    async insertRecord() {
      try {
        this.isRecordSaving = true;

        const url = `/${this.srvApp}/operate/srvsys_type_idcard_add`;
        const req = [
          {
            serviceName:
              this.optionV2?.add_srv_cfg?.srv ||
              this.serviceName?.replace("_select", "_add") ||
              "srvsys_type_idcard_add",
            condition: [],
            data: [{ ...this.formModel }],
          },
        ];

        if (!this.srvApp) {
          Message.error("请配置服务名称");
          return;
        }

        const res = await this.$http.post(url, req);
        // console.log(res);

        if (res.data.state === "SUCCESS") {
          const respData =
            res.data.response.length > 0 &&
            res.data.response[0].response?.effect_data?.[0];
          if (respData?.rec_no) {
            this.formModel.rec_no = respData.rec_no;
            this.recordSaved = true;

            Message.success("身份证信息保存成功!");

            this.$emit("input", respData.rec_no);
            this.$emit("on-selected", respData);
            this.$emit("record-saved", respData);
          }
        } else {
          Message.error(res.data.resultMessage || "保存失败，请重试");
        }
      } catch (error) {
        // console.error("保存身份证信息失败:", error);
        Message.error("保存失败，请重试");
      } finally {
        this.isRecordSaving = false;
      }
    },
    initUploadConfig() {
      // 初始化上传配置
      this.uploadUrl = this.getUploadUrl();
      this.uploadHeaders = {
        bx_auth_ticket: sessionStorage.getItem("bx_auth_ticket") || "",
      };
      this.uploadData = {
        serviceName: "srv_bxfile_service",
        interfaceName: "add",
        app_no: this.srvApp,
        table_name: "bxsys_type_idcard",
        thumbnailType: "fwsu_100",
        columns: "",
      };
    },

    // 初始化分片上传配置
    initSplitUploadConfig() {
      // 设置分片大小和其他配置参数
      this.chunkSize = 1 * 1024 * 1024; // 默认1MB
      this.limitSize = 20; // 默认超过20MB使用分片上传
      this.useSplitChuck = true; // 启用分片上传
    },

    getUploadUrl() {
      // 获取上传接口地址
      return `${window.backendIpAddr}/file/upload`;
    },

    // 上传到服务器
    async uploadToServer(formData, file, type) {
      try {
        // 使用项目通用的上传接口
        const response = await this.$http.post(this.uploadUrl, formData, {
          headers: {
            ...this.uploadHeaders,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              this.uploadProgress = progress;
            }
          },
        });

        return response.data;
      } catch (error) {
        // console.error("Upload error:", error);
        throw error;
      }
    },

    // 新的文件选择方法
    triggerFileInput(type) {
      if (this.disabled) return;
      const inputRef = type === "front" ? "frontInput" : "backInput";
      this.$refs[inputRef]?.click();
    },

    // 键盘事件处理
    handleKeyDown(event, type) {
      if (this.disabled) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        this.triggerFileInput(type);
      }
    },

    // 拖拽事件处理
    handleDragEnter(event, type) {
      event.preventDefault();
      if (this.disabled) return;
      if (type === "front") {
        this.frontDragOver = true;
      } else {
        this.backDragOver = true;
      }
    },

    handleDragOver(event, type) {
      event.preventDefault();
    },

    handleDragLeave(event, type) {
      if (this.disabled) return;
      // 确保离开的是上传区域，而不是进入子元素
      const uploaderRef = type === "front" ? "frontUploader" : "backUploader";
      if (!this.$refs[uploaderRef].contains(event.relatedTarget)) {
        if (type === "front") {
          this.frontDragOver = false;
        } else {
          this.backDragOver = false;
        }
      }
    },

    handleDrop(event, type) {
      event.preventDefault();
      if (this.disabled) return;

      // 重置拖拽状态
      this.clearDragOverState(type);

      const files = event.dataTransfer.files;
      if (files.length > 0) {
        this.handleFileUpload(files[0], type);
      }
    },

    // 文件选择变化处理
    handleFileChange(event, type) {
      const file = event.target.files[0];
      if (file) {
        this.handleFileUpload(file, type);
      }
    },

    // 文件上传处理
    async handleFileUpload(file, type) {
      try {
        // 验证文件
        this.validateFile(file, type);

        // 显示上传状态
        this.showUploadingState(type);

        // 检查文件大小，决定是否使用分片上传
        const fileSizeInMB = file.size / (1024 * 1024);
        this.uploadingFileName = file.name;

        // 根据文件大小选择上传方式
        if (this.useSplitChuck && fileSizeInMB >= this.limitSize) {
          // 对大文件使用分片上传
          await this.handleBigFileUpload(file, type);
        } else {
          // 对小文件使用普通上传
          await this.handleNormalUpload(file, type);
        }
      } catch (error) {
        this.showError(type, error.message);
      }
    },

    // 通用上传准备
    prepareUpload(file, type) {
      // 显示预览
      this.showImagePreview(file, type);

      // 构建FormData
      const formData = new FormData();
      const uploadParams = this.getUploadParams(type);

      // 添加文件
      formData.append("file", file);

      // 添加上传参数
      Object.keys(uploadParams).forEach((key) => {
        formData.append(key, uploadParams[key]);
      });

      // 添加类型标识
      // formData.append('img_type', type);

      return formData;
    },

    // 获取上传参数
    getUploadParams(type) {
      return {
        serviceName: "srv_bxfile_service",
        interfaceName: "add",
        app_no: this.srvApp,
        table_name: "bxsys_type_idcard",
        thumbnailType: "fwsu_100",
        columns:
          type === "front" ? this.frontPhotoColumn : this.backPhotoColumn,
      };
    },

    // 普通文件上传处理
    async handleNormalUpload(file, type) {
      try {
        const formData = this.prepareUpload(file, type);
        const response = await this.uploadToServer(formData, file, type);
        await this.handleUploadSuccess(response, file, type);
      } catch (error) {
        throw error;
      }
    },

    // 大文件上传处理
    async handleBigFileUpload(file, type) {
      const _this = this;
      try {
        // 调用分片上传方法
        await this.handelUploadBigFile(file, {
          onUploadProgress: (progress) => {
            _this.updateProgress(progress, file, type);
          },
          onHashProgress: (progress) => {
            _this.updateProgress(progress, file, type);
          },
          onUploadSuccess: async (res) => {
            // console.log("分片上传成功:", res);

            // 构造响应格式
            const response = {
              ...res,
              code: 200,
              data: {
                url: res.fileurl || res.path || res.url,
                id: res.file_no || res.id,
              },
            };

            // 显示预览并处理成功
            _this.showImagePreview(file, type);
            await _this.handleUploadSuccess(response, file, type);
          },
        });
      } catch (error) {
        // console.error("分片上传失败:", error);
        throw new Error("文件上传失败，请重试");
      }
    },

    // 统一的进度更新方法
    updateProgress(progress, file, type) {
      this.uploadProgress = progress;
      this.uploadingFileName = file.name;
      this.setUploadingState(type, true);
    },

    // 统一设置上传状态
    setUploadingState(type, isUploading) {
      this.updateImageInfo(type, { uploading: isUploading });
    },

    // 统一设置错误状态
    setErrorState(type, error) {
      this.updateImageInfo(type, { 
        error, 
        uploading: false, 
        dragOver: false 
      });
      this.uploadProgress = 0;
    },

    // 清除拖拽状态
    clearDragOverState(type) {
      this.updateImageInfo(type, { dragOver: false });
    },

    // 批量更新图片信息
    updateImageInfo(type, data) {
      const key = type === "front" ? "front" : "back";
      const fields = {
        data: `${key}_json`,
        url: `${key}ImageUrl`,
        file_no: `${key}ImageFileNo`,
        uploading: `${key}Uploading`,
        error: `${key}Error`,
        dragOver: `${key}DragOver`
      };
      
      Object.keys(data).forEach(dataKey => {
        if (dataKey === 'data' && typeof data.data === 'object') {
          this.formModel[fields.data] = JSON.stringify(data.data);
        } else if (fields[dataKey]) {
          this[fields[dataKey]] = data[dataKey];
        }
      });
    },

    // 文件验证
    validateFile(file, type) {
      const fileExtension = file.type.split("/")[1];
      const isValidType = this.allowedTypes.includes(fileExtension);
      const isLtMaxSize = file.size / 1024 / 1024 < this.maxSize;
      
      if (!isValidType) {
        const typeNames = this.allowedTypes.map(t => t.toUpperCase()).join("、");
        throw new Error(`只能上传 ${typeNames} 格式的图片!`);
      }
      if (!isLtMaxSize) {
        throw new Error(`上传图片大小不能超过 ${this.maxSize}MB!`);
      }
    },

    // 显示上传状态
    showUploadingState(type) {
      this.updateImageInfo(type, { uploading: true, error: "" });
      this.uploadProgress = 0;
      this.$emit("before-upload", { type, file: null });
    },

    // 模拟上传过程
    simulateUpload() {
      return new Promise((resolve) => {
        setTimeout(resolve, 1500); // 模拟1.5秒上传时间
      });
    },

    // 显示图片预览
    showImagePreview(file, type) {
      if (file instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.updateImageInfo(type, { url: e.target.result });
        };
        reader.readAsDataURL(file);
      }
    },

    // 处理上传成功
    async handleUploadSuccess(response, file, type) {
      if (response && response.fileurl) {
        const data = response;

        // 使用统一方法更新图片信息
        this.updateImageInfo(type, {
          data: response,
          url: data.fileurl,
          file_no: data.file_no,
          uploading: false,
          error: "",
        });

        const typeName = type === "front" ? "正面" : "反面";
        Message.success(`身份证${typeName}上传成功`);

        // 触发上传成功事件
        this.$emit("upload-success", {
          type,
          url: data.fileurl,
          file_no: data.file_no,
          file: file,
        });

        // 检查是否已上传完两张图片
        this.checkCompletion();

        // 如果只上传了一张，提示用户继续上传另一张
        if (!this.frontImageUrl || !this.backImageUrl) {
          const nextType = type === "front" ? "反面" : "正面";
          setTimeout(() => {
            Message.info(`请继续上传身份证${nextType}图片`);
          }, 1000);
        }
      } else {
        throw new Error(`上传失败: ${response?.message || "未知错误"}`);
      }
    },

    // 显示错误信息
    showError(type, message) {
      this.setErrorState(type, message);
      Message.error(message);
      this.$emit("upload-error", { type, error: message });
    },
    async deleteImage(fileurl) {
      const url = `/file/delete`;
      const req = {
        fileurl: fileurl,
      };
      const res = await this.$http.post(url, req);
      if (res?.data?.state === "SUCCESS") {
        // Message.success(`身份证${type === "front" ? "正面" : "反面"}删除成功`);
      } else {
        throw new Error(`删除失败: ${res?.data?.resultMessage || "未知错误"}`);
      }
    },
    // 移除图片
    async removeImage(type) {
      const fileurl = type === "front" ? this.frontImageUrl : this.backImageUrl;
      
      // 使用统一方法清除图片信息
      this.updateImageInfo(type, {
        data: {},
        url: "",
        file_no: "",
        uploading: false,
        error: "",
        dragOver: false,
      });

      // 重置保存状态
      this.recordSaved = false;
      this.isRecordSaving = false;

      // 清空文件输入
      const inputRef = type === "front" ? "frontInput" : "backInput";
      if (this.$refs[inputRef]) {
        this.$refs[inputRef].value = "";
      }
      
      await this.deleteImage(fileurl);
      const typeName = type === "front" ? "正面" : "反面";
      Message.info(`已删除身份证${typeName}图片`);

      this.$emit("image-removed", { type });

      // 触发清除事件
      if (!this.frontImageUrl && !this.backImageUrl) {
        this.$emit("images-cleared");
      }
    },



    checkCompletion() {
      // 检查是否已上传完两张图片
      if (this.frontImageUrl && this.backImageUrl) {
        // 更新formModel中的图片字段
        this.formModel[this.frontPhotoColumn] = this.frontImageFileNo;
        this.formModel[this.backPhotoColumn] = this.backImageFileNo;

        // 触发all-uploaded事件
        this.$emit("all-uploaded", {
          front: { url: this.frontImageUrl, id: this.frontImageFileNo },
          back: { url: this.backImageUrl, id: this.backImageFileNo },
        });

        // 自动调用insertRecord函数
        this.insertRecord();
      }
    },

    // 提供给父组件的方法，用于手动保存到服务器
    async saveAllToServer() {
      // 当前版本已简化，直接在checkCompletion中自动保存
      // console.warn('saveAllToServer已废弃，改为自动保存机制');
    },

    // 清空已上传的图片
    clearImages() {
      this.updateImageInfo('front', { url: '', file_no: '' });
      this.updateImageInfo('back', { url: '', file_no: '' });
      this.$emit("images-cleared");
    },
  },
};
</script>

<style lang="scss" scoped>
.id-card-upload {
  // 变量
  --primary-100: #e6f2ff;
  --primary-500: #409eff;
  --primary-700: #005ecc;
  --neutral-50: #f8f9fa;
  --neutral-100: #ffffff;
  --neutral-200: #e5e7eb;
  --neutral-400: #8a94a6;
  --neutral-700: #4b5563;
  --neutral-900: #111827;
  --success-500: #28a745;
  --success-100: #d4edda;
  --error-500: #dc3545;
  --warning-500: #ffc107;
  --warning-100: #fff3cd;
  --info-500: #007aff;
  --info-100: #e6f2ff;
  --space-xs: 8px;
  --space-sm: 16px;
  --space-md: 24px;
  --space-lg: 32px;
  --space-xl: 48px;
  --space-xxl: 64px;
  --radius-card: 16px;
  --radius-button: 8px;
  --radius-preview: 12px;
  --shadow-card: 0px 4px 12px rgba(0, 0, 0, 0.05);
  --shadow-hover: 0px 8px 24px rgba(0, 122, 255, 0.12);

  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: 0;

  // 简洁状态提示
  .upload-status-compact {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-button);
    transition: all 0.3s ease;
    border-left: 4px solid;

    &.status-partial {
      background: var(--info-100);
      border-left-color: var(--info-500);
    }

    &.status-ready {
      background: var(--warning-100);
      border-left-color: var(--warning-500);
    }

    &.status-saving {
      background: var(--primary-100);
      border-left-color: var(--primary-500);
    }

    &.status-completed {
      background: var(--success-100);
      border-left-color: var(--success-500);
    }

    .status-info {
      display: flex;
      align-items: center;
      gap: var(--space-xs);

      i {
        font-size: 16px;

        &.el-icon-info {
          color: var(--info-500);
        }
        &.el-icon-warning {
          color: var(--warning-500);
        }
        &.el-icon-loading {
          color: var(--primary-500);
        }
        &.el-icon-success {
          color: var(--success-500);
        }
      }

      .status-message {
        font-size: 14px;
        font-weight: 500;
        color: var(--neutral-900);
      }
    }

    .progress-dots {
      display: flex;
      gap: 6px;

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--neutral-400);
        transition: all 0.3s ease;

        &.completed {
          background: var(--success-500);
          transform: scale(1.2);
        }
      }
    }
  }

  // 上传区域容器
  .upload-areas {
    display: flex;
    gap: var(--space-md);
    flex-wrap: wrap;
  }

  .upload-progress-container {
    width: 100%;
    margin-bottom: var(--space-sm);
    padding: 0 var(--space-xs);

    .upload-status-text {
      margin-top: var(--space-xs);
      font-size: 14px;
      color: var(--neutral-700);
      text-align: center;
    }
  }

  .upload-section {
    // max-width: calc(50% - var(--space-md) / 2);

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--neutral-900);
      margin-bottom: var(--space-sm);
      padding-left: var(--space-xs);
    }

    .modern-uploader {
      position: relative;
      width: 321px;
      height: 204px;
      min-height: 200px;
      background: var(--neutral-100);
      border: 2px dashed var(--neutral-400);
      border-radius: var(--radius-card);
      padding: var(--space-lg);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 250ms ease-out;
      box-shadow: var(--shadow-card);
      outline: none;
      overflow: hidden;
      &:hover {
        border-color: var(--primary-500);
        box-shadow: var(--shadow-hover);
        transform: translateY(-2px);
      }

      &:focus {
        outline: 2px solid var(--primary-500);
        outline-offset: 2px;
      }

      &.drag-over {
        border: 2px solid var(--primary-500);
        background: var(--primary-100);
        box-shadow: var(--shadow-hover);
        transform: translateY(-2px);
      }

      &.has-image {
        border: 2px solid var(--success-500);
        padding: 0;
        min-height: 200px;
      }

      &.upload-completed {
        border: 2px solid var(--success-500);
        box-shadow: 0px 4px 12px rgba(40, 167, 69, 0.15);
      }

      &.upload-pending {
        border: 2px dashed var(--warning-500);
        background: var(--warning-100);
        animation: pulse 3s infinite;
      }

      &.error {
        border: 2px solid var(--error-500);
      }

      &.is-uploading {
        pointer-events: none;
        opacity: 0.8;
      }

      .upload-content {
        text-align: center;
        transition: opacity 200ms ease-out;

        .upload-icon {
          width: 48px;
          height: 48px;
          color: var(--primary-500);
          margin-bottom: var(--space-sm);
          font-size: 48px;
          transition: all 200ms ease-out;
        }

        .upload-text {
          .upload-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--neutral-900);
            margin-bottom: var(--space-xs);
            line-height: 1.4;
          }

          .upload-hint {
            font-size: 14px;
            color: var(--neutral-400);
            line-height: 1.6;
          }
        }
      }

      .image-preview-wrapper {
        position: relative;
        width: 321px;
        height: 204px;
        border-radius: var(--radius-preview);
        overflow: hidden;
        background: var(--neutral-50);

        .image-preview {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .upload-success-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 24px;
          height: 24px;
          background: var(--success-500);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

          i {
            color: white;
            font-size: 14px;
          }
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(17, 24, 39, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 200ms ease-out;

          .delete-btn {
            width: 40px;
            height: 40px;
            background: rgba(220, 53, 69, 0.9);
            border: none;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 200ms ease-out;

            &:hover {
              background: var(--error-500);
              transform: scale(1.1);
            }

            i {
              color: white;
              font-size: 18px;
            }
          }
        }

        &:hover .image-overlay {
          opacity: 1;
        }
      }

      .upload-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(17, 24, 39, 0.5);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-preview);

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid var(--neutral-100);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: var(--space-xs);
        }

        .upload-text {
          color: var(--neutral-100);
          font-size: 16px;
          font-weight: 500;
        }
      }

      .error-message {
        position: absolute;
        bottom: var(--space-xs);
        left: var(--space-sm);
        right: var(--space-sm);
        color: var(--error-500);
        font-size: 14px;
        text-align: center;
        margin-top: var(--space-xs);
        line-height: 1.4;
      }
    }

    .upload-tip {
      margin-top: var(--space-sm);
      font-size: 14px;
      color: var(--neutral-700);
      padding-left: var(--space-xs);
      line-height: 1.5;
    }
  }

  // 动画效果
  .fade-in {
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.05);
    }
  }

  // 响应式设计
  @media (max-width: 650px) {
    .upload-areas {
      flex-direction: column;
      gap: var(--space-md);
    }

    .upload-section {
      .modern-uploader {
        width: 321px;
        height: 204px;
        min-height: 180px;
        padding: var(--space-md);

        .upload-content {
          .upload-icon {
            width: 40px;
            height: 40px;
            font-size: 40px;
          }

          .upload-text {
            .upload-title {
              font-size: 16px;
            }

            .upload-hint {
              font-size: 13px;
            }
          }
        }
      }
    }
  }

  @media (max-width: 480px) {
    .upload-section {
      .modern-uploader {
        width: 321px;
        height: 204px;
        min-height: 160px;
        padding: var(--space-sm);

        .upload-content {
          .upload-title {
            font-size: 15px;
          }

          .upload-hint {
            font-size: 12px;
          }
        }
      }

      .upload-tip {
        font-size: 13px;
      }
    }
  }

  // 焦点状态优化
  .modern-uploader:focus,
  .delete-btn:focus {
    outline: 2px solid var(--primary-500);
    outline-offset: 2px;
  }

  // 工具类
  .hidden {
    display: none !important;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
}
</style>
