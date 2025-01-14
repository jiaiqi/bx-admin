<!-- tinymc富文本 -->
<template>
  <div>
    <editor v-model="myValue" :init="init" :disabled="disabled" @onClick="onClick" @change="onChange">
    </editor>
    <dialog id="myDialog">
      <el-progress :text-inside="true" :stroke-width="24" :percentage="hashPercentage" :format="
            (percentage) => `正在计算文件哈希值，当前进度：${hashPercentage}%`
          " v-if="hashPercentage && hashPercentage < 100"></el-progress>
      <el-progress :text-inside="true" :stroke-width="24" :percentage="percentage"
        :format="(percentage) => `文件上传中，当前进度：${percentage}%`" status="success" v-else></el-progress>
    </dialog>
  </div>
</template>

<script>
import tinymce from "tinymce";
import "tinymce/plugins/paste";
import Editor from "@tinymce/tinymce-vue";

import "tinymce/skins/ui/oxide/skin.min.css";
import "tinymce/skins/content/default/content.css";
import "./langs/zh_CN.js"; // 本地汉化
import "tinymce/themes/silver/theme.min.js";
import "tinymce/plugins/image/plugin";
import "tinymce/plugins/imagetools/plugin";
import "tinymce/plugins/media/plugin";
import "tinymce/plugins/table";
import "tinymce/plugins/pagebreak";
import "tinymce/plugins/lists/plugin";
import "tinymce/plugins/contextmenu/plugin";
import "tinymce/plugins/wordcount/plugin";
import "tinymce/plugins/colorpicker/plugin";
import "tinymce/plugins/textcolor/plugin";
import "tinymce/icons/default"; // 图标 -解决测试环境找不icon问题
import { backendIpAddr, $http } from "@/common/http.js";
import bigFileUploadMixin from "@/components/mixin/big-file-upload-mixin.js";
// import request from '../utils/request'
export default {
  name: "tinymce",
  mixins: [bigFileUploadMixin],
  components: {
    Editor,
  },
  props: {
    //传入一个value，使组件支持v-model绑定
    value: {
      type: String,
      default: "",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    plugins: {
      type: [String, Array],
      default:
        // 'colorpicker colorpicker contextmenu image imagetools lists table textcolor wordcount'
        "colorpicker colorpicker contextmenu image media imagetools lists table textcolor wordcount pagebreak styleselect fontselect fontsizeselect",
    },
    toolbar: {
      type: [String, Array],
      default:
        // 'undo redo | | bold  italic | underline | strikethrough | alignleft  aligncenter alignright | outdent indent  blockquote  removeformat subscript superscript bullist numlist image charmap  table  forecolor backcolor'
        () => [
          "undo redo | | bold  italic | underline | strikethrough | alignleft  aligncenter alignright outdent indent  blockquote  removeformat subscript superscript bullist numlist | image media charmap table forecolor backcolor styleselect",
          "fontselect fontsizeselect | customlayout pagebreak",
        ],
    },
    field: Object,
  },
  computed: {
    colInfo() {
      return this.field?.info.srvCol;
    },
    columns() {
      return this.colInfo?.columns;
    },
    table_name() {
      return this.colInfo?.table_name;
    },
    uploadMaxRequest() {
      //分片上传最大并发数量
      return this.colInfo?.moreConfig?.maxRequest || 6;
    },
    fileChunkSize() {
      return this.colInfo?.moreConfig?.chunkSize || 10 * 1024 * 1024;
    },
  },
  data() {
    var that = this;
    return {
      //初始化配置
      init: {
        language_url: "/tinymce/zh_CN.js", // 这里需要单独处理
        language: "zh_CN",
        skin_url: "/tinymce/skins/ui/oxide/", // skin路径
        content_css: "/tinymce/skins/content/default/content.min.css",
        convert_urls: false,
        height: 500,
        plugins: "paste",
        plugins: this.plugins,
        toolbar: this.toolbar,
        setup: this.setup,
        branding: false,
        menubar: true,
        forced_root_block: "p",
        force_br_newlines: false,
        force_p_newlines: true,
        force_div_newlines: false,
        force_span_newlines: false,
        content_style:
          "body {font-size: 14pt; font-family:Arial;text-indent: 2em;}",
        paste_auto_cleanup_on_paste: true,
        paste_remove_styles: true,
        paste_remove_styles_if_webkit: true,
        paste_strip_class_attributes: true,
        paste_as_text: true,
        //一键排版
        layout_options: {
          style: {
            "text-align": "justify",
            "text-indent": "2em",
            "line-height": "2",
            "font-family": "Arial",
            "font-size": "14px",
          },

          filterTags: ["table>*", "tbody"], //'table，'tbody','td','tr' 将会忽略掉 同时 table>*，忽略table 标签 以及所有子标签
          //clearStyle: ['font-size'],//text-indent 将会被清除掉
          tagsStyle: {
            p: {
              "font-size": "14px",
            },
            span: {
              "font-size": "14px",
            },
            // 'table': {
            //   'line-height': 2,
            //   'text-align': 'center'
            // },
            // 'table,tbody,tr,td': { //支持并集选择
            //   'line-height': 2
            // },
            // 'tr>td,table>tbody': { //支持, 精准定位 通过 ' > '
            //   'line-height': 2,
            //   'text-align': 'center'
            // }
          },
        },
        images_upload_handler: async (blobInfo, success, failure) => {
          // var formData;
          // formData = new FormData();
          var file = blobInfo.blob(); //转化为易于理解的file对象
          const formData = new FormData();
          formData.append("file", file);
          formData.append("serviceName", "srv_bxfile_service");
          formData.append("interfaceName", "add");
          formData.append("app_no", that.resolveDefaultSrvApp());
          formData.append("table_name", that.table_name);
          formData.append("columns", that.columns);
          formData.append("thumbnailType", "fwsu_100");
          formData.append("file", file);
          document.getElementById("myDialog").showModal();
          that.percentage = 0;
          console.log("images_upload_handler", file);

          let uploadUrl = this.serviceApi().uploadFile;
          try {
            const response = await $http.post(uploadUrl, formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
                timeout: 60 * 60 * 1000,
                onUploadProgress(e) {
                  const complete = (e.loaded / e.total) * 100;
                  that.percentage = Math.round(complete);
                },
              })

            console.log("uploadImg:::", response);
            const url = this.getFileUrl(response.data.fileurl);
            const file_no = response.data.file_no;
            if (file_no && url?.startsWith('http')) {
              this.percentage = 99;
              await this.checkUploadStatus(file_no)
              this.percentage = 100;
            }
            document.getElementById("myDialog").close();
            success(url);

          } catch (error) {
            console.log(error);
            this.$message.error("上传失败:" + error);
          }
          //  $http.post(uploadUrl, formData, 
          //   {
          //     headers: {
          //       "Content-Type": "multipart/form-data",
          //     },
          //     timeout: 60 * 60 * 1000,
          //     onUploadProgress(e) {
          //       const complete = (e.loaded / e.total) * 100;
          //       that.percentage = Math.round(complete);
          //     },
          //   })
          // .then((response) => {
          //   console.log("uploadImg:::", response);
          //   const url = this.getFileUrl(response.data.fileurl);
          //   const file_no = response.data.file_no;
          //   if(file_no){

          //   }
          //   document.getElementById("myDialog").close();
          //   success(url);
          // })
          // .catch((error) => {
          //   console.log(error);
          //   this.$message.error("上传失败:" + error);
          // });
        },
        file_picker_types: "media",
        file_picker_callback: (callback, value, meta) => {
          if (meta.filetype === "media") {
            const input = document.createElement("input");
            input.setAttribute("type", "file");
            const that = this; // 为 Vue 构造函数中的 this，指向 Vue 实例对象
            input.onchange = async function () {
              const file = this.files[0]; // 为 HTMLInputElement 构造函数中的 this，指向 input 实例对象
              console.log("file_picker_callback", file);
              let fileUrl;
              const fileSize = file.size / 1024 / 1024; // 单位为MB
              if (that.useSplitChuck && fileSize > 50) {
                // 大于50M 使用分片上传
                document.getElementById("myDialog").showModal();
                that.percentage = 0;
                const { url } = await that.handelUploadBigFile(file, {
                  chunkSize: that.fileChunkSize,
                  maxRequest: that.uploadMaxRequest,
                  onHashProgress: (percentage) => {
                    that.hashPercentage = percentage;
                  },
                  onUploadProgress: (percentage) => {
                    // console.log("onUploadProgress", percentage, file);
                    if (percentage < 100) {
                      that.percentage = Math.round(percentage);
                    }
                    if (percentage >= 100) {
                      that.$message.warning("文件合并中...");
                    }
                  },
                  onUploadSuccess: (res) => {
                    console.log("onUploadSuccess", res);
                    that.percentage = 100;
                    that.$message.success("文件上传成功");
                    that.hashPercentage = 0;
                    setTimeout(() => {
                      document.getElementById("myDialog").close();
                      callback(that.getFileUrl(res.fileurl));
                    }, 1000);
                  },
                });
                fileUrl = url;
              } else {
                const { url } = await that.uploadFile(file);
                fileUrl = url;
                // const { url } = await that.uploadFile(file)
                document.getElementById("myDialog").close();
                // callback(url)
                callback(fileUrl);
              }
            };
            input.click();
          }
        },
        video_template_callback: (data) => {
          return `<video width="700" height="394" controls="controls" src=${data.source} />`;
        },
        resize: false,
      },
      myValue: "",
      percentage: 0,
      hashPercentage: 0,
    };
  },
  mounted() {
    this.myValue = this.recoverFileAddress(this.field.model);
    tinymce.init({});
  },
  methods: {
    getFileUrl(url) {
      if (url?.indexOf("http") === 0) {
        return url;
      } else if (url?.indexOf("data:image") === 0) {
        return url;
      } else {
        return `${this.serviceApi().downloadFile}${url}`;
      }
    },
    recoverFileAddress(val) {
      // 替换文件前缀
      return (
        val?.replaceAll?.("$bxFileAddress$", this.serviceApi().downloadFile) ||
        ""
      );
    },
    replaceFileAddressSuffix(val) {
      return (
        val?.replaceAll?.(this.serviceApi().downloadFile, "$bxFileAddress$") ||
        ""
      );
    },
    setSrvVal(val) {
      // 设置值
      this.myValue = this.recoverFileAddress(val || this.field.model);
      return this.myValue;
    },
    getSrvVal() {
      // 获取值
      return this.replaceFileAddressSuffix(this.myValue);
    },
    onChange() {
      console.log(this.replaceFileAddressSuffix(this.myValue));
      console.log(this.myValue);

      this.$emit(
        "field-value-changed",
        this.replaceFileAddressSuffix(this.myValue)
      );
    },
    onClick(e) {
      this.$emit("onClick", e, tinymce);
    },
    clear() {
      this.myValue = "";
    },
    setup: function (editor) {
      let that = this;
      editor.ui.registry.addButton("customlayout", {
        text: "排版",
        onAction: function () {
          // 获取编辑器内容
          var content = editor.getContent();
          console.log("content-->" + content);
          // editor.paste_auto_cleanup_on_paste=true
          // editor.paste_remove_styles=true
          // editor.paste_remove_styles_if_webkit=true
          // editor.paste_strip_class_attributes=true
          // editor.paste_as_text=true

          var div = document.createElement("div");
          div.innerHTML = content;
          var divElements = div.querySelectorAll("div");
          for (var i = 0; i < divElements.length; i++) {
            var divElement = divElements[i];
            divElement.removeAttribute("style");
            divElement.innerHTML.trim();
            divElement.style.fontSize = "14pt";
            divElement.style.fontFamily = "Microsoft YaHei";
            divElement.style.lineHeight = "2";
            divElement.style.textIndent = "2em";
          }
          // 在编辑器内容中插入自定义布局
          //var newContent = '<div style="text-indent: 2em; font-size:14pt font-family: Arial; line-height: 2; color: #000;">' + content + '</div>';

          // 将修改后的内容设置回编辑器
          //

          var pElements = div.querySelectorAll("p");
          for (var i = 0; i < pElements.length; i++) {
            var pElement = pElements[i];
            pElement.innerHTML = pElement.innerHTML.trim();
            pElement.removeAttribute("style");
            pElement.style.fontSize = "14pt";
            pElement.style.fontFamily = "Microsoft YaHei";
            pElement.style.font.fontcolor("#888888");
            pElement.style.textIndent = "2em";
            pElement.style.lineHeight = "2";
          }

          var spanElements = div.querySelectorAll("span");
          for (var i = 0; i < spanElements.length; i++) {
            var spanElement = spanElements[i];
            spanElement.innerHTML.trim();
            spanElement.removeAttribute("style");
            spanElement.style.fontSize = "14pt";
            spanElement.style.fontFamily = "Microsoft YaHei";
            spanElement.style.textIndent = "2em";
            spanElement.style.lineHeight = "2";
            if (spanElement.parentNode.tagName === "DIV") {
              let p = document.createElement("p");
              p.innerHTML = spanElement.innerHTML.trim();
              spanElement.parentNode.replaceChild(p, spanElement);
            }
          }
          // 获取所有的图片、视频和音频元素
          var mediaElements = div.querySelectorAll("img, video");

          //遍历所有的图片、视频和音频元素，设置它们的样式
          for (var i = 0; i < mediaElements.length; i++) {
            var mediaElement = mediaElements[i];
            console.log(mediaElement.className);
            if (mediaElement.className != "mce-pagebreak") {
              // 设置元素的宽度和高度
              mediaElement.style.width = "700px";
              mediaElement.style.height = "auto";

              // 设置元素的居中样式
              // mediaElement.parentElement.style.display = 'flex';
              // mediaElement.parentElement.style.justifyContent = 'center';
              mediaElement.parentElement.style.textIndent = 0;
              mediaElement.parentElement.style.display = "block";
              mediaElement.parentElement.style.margin = "auto";
            }
          }
          var audioElements = div.querySelectorAll("audio");
          for (var i = 0; i < audioElements.length; i++) {
            var audioElement = audioElements[i];
            // 设置元素的居中样式 layoutFV
            audioElement.parentElement.style.textAlign = "center";
            audioElement.parentElement.style.textIndent = 0;
            // audioElement.parentElement.style.display = 'block';
            // audioElement.parentElement.style.padding = 'auto';
          }

          console.log("div-->" + div.innerHTML);
          //debugger
          editor.setContent(div.innerHTML);
          that.$emit(
            "field-value-changed",
            this.replaceFileAddressSuffix(div.innerHTML)
          );
        },
      });
      editor.ui.registry.addButton("pagebreak", {
        text: "分页",
        onAction: function () {
          editor.insertContent('<class="pagebreak" />');
        },
      });
    },

    async uploadFile(file, folder = "images") {
      console.log("uploadFile", file);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("serviceName", "srv_bxfile_service");
      formData.append("interfaceName", "add");
      formData.append("app_no", this.resolveDefaultSrvApp());
      formData.append("table_name", this.table_name);
      formData.append("columns", this.columns);
      formData.append("thumbnailType", "fwsu_100");

      document.getElementById("myDialog").showModal();
      let that = this;
      that.percentage = 0;
      // 注：此为调用后端上传接口，需根据实际情况进行调整
      // const uploadParams = {
      //   serviceName: "srv_bxfile_service",
      //   interfaceName: "add",
      //   app_no: this.resolveDefaultSrvApp(),
      //   table_name: "",
      //   thumbnailType: "fwsu_100",
      //   columns: "",
      // }
      const { data } = await $http({
        method: "POST",
        url: this.serviceApi().uploadFile,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60 * 60 * 1000,
        onUploadProgress(e) {
          const complete = (e.loaded / e.total) * 100;
          that.percentage = Math.round(complete);
        },
      });
      console.log("uploadImg:::", data);
      const url = this.getFileUrl(data.fileurl);

      return {
        url,
        name: data.src_name,
      };
    },
    async uploadImg(file, folder = "images") {
      // const formData = new FormData()
      // formData.append('file', file)
      // formData.append('folder', folder)

      // 注：此为调用后端上传接口，需根据实际情况进行调整
      debugger;
      console.log("uploadImg", file);

      let uploadUrl = this.serviceApi().uploadFile;
      const { data } = await $http({
        method: "POST",
        url: uploadUrl,
        data: file,
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = this.getFileUrl(data.fileurl);

      return {
        url,
        name: data.src_name,
      };
    },
  },
  watch: {
    // field:{
    //   handler(newValue, oldValue) {
    //     console.log(newValue,'watchwatchwatchwatchwatchwatchwatchwatch');

    //     this.myValue = newValue.model||''
    //   },
    //   deep: true
    // },
    myValue(newValue) {
      this.onChange();
    },
  },
};
</script>
<style scoped>
#myDialog {
  width: 800px;
}
</style>
