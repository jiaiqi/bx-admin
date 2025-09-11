<template>
  <div
    class="rich-editor"
    v-if="domLoad"
    ref="rich-editor"
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
import ChunkUploadUtil from "@/util/chunk-upload-util.js";

export default {
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
      chunkUploadUtil: null,
    };
  },
  created() {
    this.ticket = sessionStorage.getItem("bx_auth_ticket");
    this.innerHtml = this.recoverFileAddress4richText(this.value);
    
    // 初始化分片上传工具
    this.chunkUploadUtil = new ChunkUploadUtil({
      chunkSize: 20 * 1024 * 1024, // 20MB
      limitSize: 50, // 50MB
      maxRequest: 6,
      useSplitChuck: true
    });
    
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
        // 自定义上传函数，支持分片上传
        customUpload: async (file, insertFn) => {
          try {
            // 检查是否应该使用分片上传
            if (self.chunkUploadUtil.shouldUseChunkUpload(file)) {
              console.log('使用分片上传:', file.name, file.size);
              
              const result = await self.chunkUploadUtil.uploadFile(file, {
                onHashProgress: (percentage) => {
                  console.log('Hash计算进度:', percentage + '%');
                },
                onUploadProgress: (percentage) => {
                  console.log('上传进度:', percentage + '%');
                },
                onUploadSuccess: (res) => {
                  console.log('分片上传成功:', res);
                },
                onError: (error) => {
                  console.error('分片上传失败:', error);
                  self.$message.error('文件上传失败: ' + error.message);
                },
                app_no: self.srvApp || top?.pathConfig?.application || sessionStorage.getItem("current_app") || "oa",
                table_name: "",
                columns: ""
              });

              if (result && result.fileurl) {
                const url = self.chunkUploadUtil.getFileUrl(result.fileurl);
                insertFn(url);
                self.$message.success('文件上传成功');
              } else {
                throw new Error('上传结果异常');
              }
            } else {
              // 使用普通上传
              console.log('使用普通上传:', file.name, file.size);
              const formData = new FormData();
              formData.append('file', file);
              formData.append('serviceName', 'srv_bxfile_service');
              formData.append('interfaceName', 'add');
              formData.append('app_no', self.srvApp || top?.pathConfig?.application || sessionStorage.getItem("current_app") || "oa");

              const response = await fetch(window.backendIpAddr + "/file/upload?bx_auth_ticket=" + self.ticket, {
                method: 'POST',
                body: formData,
                headers: {
                  'bx_auth_ticket': self.ticket,
                  'bx-auth-ticket': self.ticket,
                }
              });

              const res = await response.json();
              
              if (res.fileurl) {
                const url = `${window.backendIpAddr}/file/download?filePath=${res.fileurl}`;
                insertFn(url);
                self.$message.success('文件上传成功');
              } else {
                if (res?.resultCode === "0011") {
                  self.$message.error(res.resultMessage);
                  self.$emit("needLogin", () => {
                    self.ticket = sessionStorage.getItem("bx_auth_ticket");
                  });
                } else {
                  throw new Error(res?.resultMessage || '上传失败');
                }
              }
            }
          } catch (error) {
            console.error('上传失败:', error);
            self.$message.error('文件上传失败: ' + error.message);
          }
        },
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
      return {
        ...this.uploadConfig,
        maxFileSize: 100 * 1024 * 1024, // 100M，支持大图片分片上传
        // 选择文件时的类型限制，默认为 ['image/*'] 。如不想限制，则设置为 []
        allowedFileTypes: ["image/*"],
      }
    },
    videoUploadCfg() {
      return {
        ...this.uploadConfig,
        maxFileSize: 1024 * 1024 * 1024, // 1GB，支持大视频分片上传
        // 选择文件时的类型限制，默认为 ['image/*'] 。如不想限制，则设置为 []
        allowedFileTypes: ["video/*"],
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
}
</style>
<style src="@wangeditor/editor/dist/css/style.css"></style>