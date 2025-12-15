<template>
  <div
    class="rich-editor"
    v-if="getDisabled === true"
  >
    <div class="rich-editor-content" v-html="innerHtml"></div>
  </div>
  <div
    class="rich-editor"
    ref="rich-editor"
    v-else-if="domLoad"
  >
    <Toolbar
      style="border-bottom: 1px solid #ccc"
      :editor="editor"
      :defaultConfig="toolbarConfig"
      :mode="mode"
      :key="ticket + 1"
      ref="toobar"
      v-if="getDisabled !== true"
    />
    <Editor
      v-model="innerHtml"
      style="height: 220px; overflow-y: auto"
      :defaultConfig="editorConfig"
      :disabled="getDisabled"
      :mode="mode"
      @click.stop
      @onCreated="onCreated"
      @customPaste="customPaste"
      ref="editorRef"
      :key="ticket + 2"
    />

    <!-- 上传进度覆盖层 -->
    <div
      v-if="showProgress"
      class="upload-progress-overlay"
    >
      <div class="progress-card">
        <div class="title">正在上传</div>
        <div v-if="isSplitUpload" class="row">
          <span class="label">解析进度</span>
          <el-progress :percentage="hashPercentage" :text-inside="true" :stroke-width="16" />
        </div>
        <div class="row">
          <span class="label">上传进度</span>
          <el-progress :percentage="uploadPercentage" :text-inside="true" :stroke-width="16" />
        </div>
      </div>
    </div>

    <el-image
      style="width: 0; height: 0; display: none; overflow: hidden"
      :src="previewImage"
      :preview-src-list="[previewImage]"
      ref="imagePreview"
      v-if="previewImage"
    >
    </el-image>
  </div>
</template>

<script>
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import bigFileUploadMixin from "@/components/mixin/big-file-upload-mixin.js";

export default {
  mixins: [bigFileUploadMixin],
  components: { Editor, Toolbar },
  props: {
    value: String,
    field: Object,
    disable: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      default: "default", //default or 'simple'
    },
  },
  data() {
    return {
      ticket: null,
      toolbarConfig: {},
      editor: null,
      innerHtml: null,
      domLoad: false,
      previewImage: null,
      // 上传进度相关
      showProgress: false,
      isSplitUpload: false,
      hashPercentage: 0,
      uploadPercentage: 0,
    };
  },
  created() {
    this.ticket = sessionStorage.getItem("bx_auth_ticket");
    this.innerHtml = this.recoverFileAddress4richText(this.value);

    this.$nextTick(() => {
      this.domLoad = true;
    });
  },
  watch: {
    innerHtml(newValue) {
      if (newValue !== this.value) {
        if (!this.value && newValue === "<p><br></p>") return;
        this.onChange(this.editor);
        // this.$emit("input", newValue);
        // this.field.model = newValue;
        // this.$nextTick(()=>{
        //     this.$emit('field-changed')
        // })
      }
    },
    value(newValue) {
      if (newValue !== this.innerHtml) {
        this.innerHtml = this.recoverFileAddress4richText(newValue);
      }
    },
  },
  methods: {
    onDblClick(event) {
      if (event.target.nodeName === "IMG") {
        this.previewImage =
          event.target.currentSrc || event.target.href || null;
      } else {
        this.previewImage = null;
      }
      if (this.previewImage) {
        this.$nextTick(() => {
          this.$refs["imagePreview"].showViewer = true;
        });
      }
    },
    setSrvVal(srvVal) {
      this.innerHtml = this.recoverFileAddress4richText(srvVal);
    },
    getSrvVal() {
      // 获取值
      if (this.innerHtml == "<p><br></p>") return ""
      return this.replaceFileAddressSuffix(this.innerHtml);
    },
    replaceFileAddressSuffix(val = "") {
      const prefix = this.serviceApi().downloadFilePrefix;
      val = val?.replaceAll?.(prefix, "$bxFileAddress$");
      return val;
    },
    recoverFileAddress4richText(val = "") {
      const prefix = this.serviceApi().downloadFilePrefix;
      val = val?.replaceAll?.("$bxFileAddress$", prefix);
      return val;
    },
    // 统一处理文件上传
    async handleFileUpload(file, insertFn, fileType = 'image') {
      try {
        const fileSize = file.size / 1024 / 1024; // 转换为MB

        // 检查是否应该使用分片上传
        if (this.useSplitChuck && fileSize > this.limitSize) {
          console.log(`使用分片上传${fileType}:`, file.name, fileSize + 'MB');

          // 打开进度覆盖层
          this.showProgress = true;
          this.isSplitUpload = true;
          this.hashPercentage = 0;
          this.uploadPercentage = 0;

          const result = await this.handelUploadBigFile(file, {
            chunkSize: this.chunkSize,
            maxRequest: this.maxRequest,
            onHashProgress: (percentage) => {
              // hash 计算进度
              this.hashPercentage = Number(percentage) || 0;
            },
            onUploadProgress: (percentage) => {
              // 分片整体上传进度
              this.uploadPercentage = Number(percentage) || 0;
            },
            onUploadSuccess: (res) => {
              console.log('分片上传成功:', res);
            }
          });

          console.log('分片上传结果:', result);
          if (result && result.url) {
            // 统一使用insertFn方法，不管是图片还是视频
            insertFn(result.url);
            this.$message.success(`${fileType === 'image' ? '图片' : '视频'}上传成功`);
          } else if (result && result.fileurl) {
            // 如果返回的是原始格式，需要构造URL
            // 使用与普通上传一致的URL构造方式
            const url = `${window.backendIpAddr}/file/download?filePath=${result.fileurl}`;
            // 统一使用insertFn方法
            insertFn(url);
            this.$message.success(`${fileType === 'image' ? '图片' : '视频'}上传成功`);
          } else {
            this.$message.error('文件上传失败：结果异常');
          }

          // 关闭进度覆盖层
          this.showProgress = false;
          this.isSplitUpload = false;
          this.hashPercentage = 0;
          this.uploadPercentage = 0;
        } else {
          // 使用普通上传
          console.log(`使用普通上传${fileType}:`, file.name, fileSize + 'MB');
          const formData = new FormData();
          formData.append('file', file);
          formData.append('serviceName', 'srv_bxfile_service');
          formData.append('interfaceName', 'add');
          formData.append('app_no', this.srvApp || top?.pathConfig?.application || sessionStorage.getItem("current_app") || "oa");

          // 打开进度覆盖层（普通上传无需 hash 进度）
          this.showProgress = true;
          this.isSplitUpload = false;
          this.hashPercentage = 100;
          this.uploadPercentage = 0;

          // 使用 XMLHttpRequest 以展示上传进度
          const xhr = new XMLHttpRequest();
          xhr.open('POST', window.backendIpAddr + "/file/upload?bx_auth_ticket=" + this.ticket, true);
          xhr.withCredentials = true;
          xhr.setRequestHeader('bx_auth_ticket', this.ticket);
          xhr.setRequestHeader('bx-auth-ticket', this.ticket);

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percentage = Math.round((e.loaded / e.total) * 100);
              this.uploadPercentage = percentage;
            }
          };

          xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
              try {
                const res = JSON.parse(xhr.responseText || '{}');
                console.log('普通上传结果:', res);
                if (res.fileurl) {
                  const url = `${window.backendIpAddr}/file/download?filePath=${res.fileurl}`;
                  insertFn(url);
                  this.$message.success(`${fileType === 'image' ? '图片' : '视频'}上传成功`);
                } else {
                  if (res?.resultCode === "0011") {
                    this.$message.error(res.resultMessage);
                    this.$emit("needLogin", () => {
                      this.ticket = sessionStorage.getItem("bx_auth_ticket");
                    });
                  } else {
                    console.error('上传失败:', res);
                    throw new Error(res?.resultMessage || '上传失败');
                  }
                }
              } catch (err) {
                console.error('上传失败:', err);
                this.$message.error('文件上传失败: ' + err.message);
              } finally {
                // 关闭进度覆盖层
                this.showProgress = false;
                this.isSplitUpload = false;
                this.hashPercentage = 0;
                this.uploadPercentage = 0;
              }
            }
          };

          xhr.onerror = (err) => {
            console.error('上传失败:', err);
            this.$message.error('文件上传失败: 网络错误');
            this.showProgress = false;
            this.isSplitUpload = false;
            this.hashPercentage = 0;
            this.uploadPercentage = 0;
          };

          xhr.send(formData);
        }
      } catch (error) {
        console.error('上传失败:', error);
        this.$message.error('文件上传失败: ' + error.message);
        // 异常时关闭进度覆盖层
        this.showProgress = false;
        this.isSplitUpload = false;
        this.hashPercentage = 0;
        this.uploadPercentage = 0;
      }
    },
    onCreated(editor) {
      this.editor = Object.seal(editor); // 【注意】一定要用 Object.seal() 否则会报错
      this.$refs?.["rich-editor"]
        ?.querySelector(".w-e-text-container")
        ?.addEventListener("dblclick", this.onDblClick);
    },
    onInput(event) {
      console.log(event, "oninput");
    },
    onChange(editor) {
      console.log("onChange", this.innerHtml, this.getSrvVal(), this.field.model); // onChange 时获取编辑器最新内容
      if (this.getSrvVal() !== this.field.model) {
        this.$set(this.field, "model", this.replaceFileAddressSuffix(this.getSrvVal()));
        this.$emit("change", this.field.info.name, this.field);
      }
    },
    insertTextHandler() {
      const editor = this.editor;
      if (editor == null) return;
      editor.insertText(" hello ");
    },
    printEditorHtml() {
      const editor = this.editor;
      if (editor == null) return;
      console.log(editor.getHtml());
    },
    disableHandler() {
      const editor = this.editor;
      if (editor == null) return;
      editor.disable();
    },
    customPaste(editor, event) {
      // event 是 ClipboardEvent 类型，可以拿到粘贴的数据
      // 可参考 https://developer.mozilla.org/zh-CN/docs/Web/API/ClipboardEvent
      // const html = event.clipboardData.getData('text/html') // 获取粘贴的 html
      // event.preventDefault();
      //   let text = event.clipboardData.getData("text/plain"); // 获取粘贴的纯文本
      return true;
      // editor.dangerouslyInsertHtml(text);
      // return false
      // if (/<[^>]+>/.test(text)) {
      //   // 包含html标签
      //   // editor.insertText(text);
      //   text = `<p><br></p>${text}<p><br></p>`;
      //   console.log(editor.getHtml());
      //   editor.dangerouslyInsertHtml(text);
      //   console.log(editor.getHtml());
      //   event.preventDefault();
      //   // 阻止默认的粘贴行为
      //   return false;
      // } else {
      //   // 继续执行默认的粘贴行为
      //   return true;
      // }
    },
  },
  computed: {
    getDisabled() {
      if (this.disable) return true
      if (this.field?.info?.editable === false) {
        return true;
      }
      return false;
    },
    editorConfig() {
      return {
        autoFocus: false,
        placeholder: "请输入内容...",
        readOnly: this.getDisabled,
        MENU_CONF: {
          uploadImage: this.imgUploadCfg,
          uploadVideo: this.videoUploadCfg,
          fontSize: {
            // 元素支持两种形式
            //   1. 字符串；
            //   2. { name: 'xxx', value: 'xxx' }
            fontSizeList: (() => {
              let arr = [];
              for (let i = 12; i <= 40; i++) {
                arr.push(i + 'px');
              }
              return arr;
            })(),
          },
          fontFamily: {
            fontFamilyList: ["宋体", "仿宋", "微软雅黑", "楷体", "黑体", "Arial", "Tahoma", "Verdana", "Times New Roman", "Courier New"]
          }
        },

      };
    },
    uploadConfig() {
      const self = this;
      return {
        server:
          window.backendIpAddr + "/file/upload?bx_auth_ticket=" + this.ticket,
        // form-data fieldName ，默认值 'wangeditor-uploaded-image'
        fieldName: "file",
        // 单个文件的最大体积限制，默认为 2M
        maxFileSize: 500 * 1024 * 1024, // 500M
        // 最多可上传几个文件，默认为 100
        maxNumberOfFiles: 1,
        // 选择文件时的类型限制，默认为 ['image/*'] 。如不想限制，则设置为 []
        // allowedFileTypes: ["image/*"],
        // 自定义上传参数，例如传递验证的 token 等。参数会被添加到 formData 中，一起上传到服务端。
        meta: {
          serviceName: "srv_bxfile_service",
          interfaceName: "add",
          app_no:
            this.srvApp ||
            top?.pathConfig?.application ||
            sessionStorage.getItem("current_app") ||
            "oa",
        },
        // 自定义增加 http  header
        headers: {
          bx_auth_ticket: this.ticket,
          "bx-auth-ticket": this.ticket,
        },
        // 跨域是否传递 cookie ，默认为 false
        withCredentials: true,
        // 超时时间，默认为 10 秒
        timeout: 100 * 1000, //100 秒
        customInsert(res, insertFn) {
          // JS 语法
          // res 即服务端的返回结果
          // 从 res 中找到 url alt href ，然后插入图片
          if (res.fileurl) {
            const url = `${window.backendIpAddr}/file/download?filePath=${res.fileurl}`;
            insertFn(url);
          } else {
            if (res?.resultCode === "0011") {
              //登录超时
              self.$message.error(res.resultMessage);
              self.$emit("needLogin", () => {
                self.ticket = sessionStorage.getItem("bx_auth_ticket");
              });
            }
          }
        },
      };
    },
    imgUploadCfg() {
      const self = this;
      return {
        ...this.uploadConfig,
        maxFileSize: 100 * 1024 * 1024, // 100M，支持大图片分片上传
        // 选择文件时的类型限制，默认为 ['image/*'] 。如不想限制，则设置为 []
        allowedFileTypes: ["image/*"],
        // 自定义上传函数，支持分片上传
        customUpload: async (file, insertFn) => {
          await self.handleFileUpload(file, insertFn, 'image');
        },
      }
    },
    videoUploadCfg() {
      const self = this;
      return {
        ...this.uploadConfig,
        maxFileSize: 1024 * 1024 * 1024, // 1GB，支持大视频分片上传
        // 选择文件时的类型限制，默认为 ['image/*'] 。如不想限制，则设置为 []
        allowedFileTypes: ["video/*"],
        // 自定义上传函数，支持分片上传
        customUpload: async (file, insertFn) => {
          await self.handleFileUpload(file, insertFn, 'video');
        },
      }
    },
  },
  beforeDestroy() {
    const editor = this.editor;
    if (editor == null) return;
    editor.destroy(); // 组件销毁时，及时销毁 editor ，重要！！！
  },
};
</script>

<style>
.rich-editor {
  z-index: 10;
  /* border: 2px solid #000; */
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  position: relative;

}

.rich-editor .rich-editor-content {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  padding: 10px;
  box-sizing: border-box;
}

.upload-progress-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.progress-card {
  width: 520px;
  max-width: 90%;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 16px 20px;
}

.progress-card .title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
}

.progress-card .row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 8px 0;
}

.progress-card .label {
  flex: 0 0 72px;
  color: #606266;
  font-size: 13px;
}
</style>
<style src="@wangeditor/editor/dist/css/style.css"></style>