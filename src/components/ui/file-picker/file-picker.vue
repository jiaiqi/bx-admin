<template>
  <el-dialog
    :visible="visible"
    :show-close="false"
    :close-on-click-modal="false"
    append-to-body
    width="600px"
  >
    <div>
      <div class="title">
        <span>上传文件</span>
        <i class="el-icon-close close-btn" title="关闭" @click="cancel"></i>
      </div>
      <div class="content">
        <div class="tab-content">
          <div class="tab-content-name">
            <div
              class="tab-content-name-item"
              :class="{ active: activeTabIndex === index }"
              v-for="(item, index) in tabList"
              :key="index"
              @click="changeTab(index)"
            >
              <div class="tab-item-title">{{ item.title }}</div>
            </div>
          </div>
          <template v-for="(item, index) in tabList">
            <div
              class="tab-content-item"
              v-if="index === activeTabIndex"
              :key="index"
            >
              <div v-if="imageUrl && item.value === 'normal'" class="drag-area">
                <i
                  class="el-icon-close close-btn"
                  title="删除图片"
                  @click="deleteFile"
                ></i>
                <div class="img-box">
                  <img :src="imageUrl" alt="" class="img" />
                </div>
              </div>
              <div
                v-else-if="item.value === 'normal'"
                class="drag-area"
                :class="{ hovering: isHovering }"
                @dragenter.prevent="onDragEnter"
                @dragover.prevent="onDragOver"
                @dragleave.prevent="onDragLeave"
                @drop.prevent="handleDrop"
              >
                <button class="primary-btn upload-btn" @click="chooseFile">
                  上传图片
                </button>

                <div>可拖入图片或粘贴图片</div>
                <!-- 隐藏的文件输入框 -->
                <input
                  ref="fileInput"
                  type="file"
                  style="display: none"
                  :accept="fileType === 'image' ? 'image/*' : '*'"
                  @change="onFileSelected"
                />
              </div>
              <div v-else-if="item.value === 'url'" class="">
                <el-input
                  placeholder="请输入图片地址"
                  v-model="fileUrl"
                  clearable
                ></el-input>
                <div class="tip-text">
                  输入http或https开头的图片地址，例如：https://www.baidu.com/img/bd_logo1.png
                </div>
                <div class="img-box" v-if="fileUrl">
                  <img class="file-url-img" :src="fileUrl" alt="" />
                </div>
              </div>
            </div>
          </template>
        </div>
        <div class="button-box">
          <button
            class="primary-btn"
            :class="{ disabled: isLoading || (!files.length && !fileUrl) }"
            @click="confirm"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "file-picker",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    fileType: {
      type: String,
      default: "image",
    },
    multi: {
      type: Boolean,
      default: false,
    },
  },
  model: {
    prop: "visible",
    event: "change",
  },
  data() {
    return {
      // dialogVisible: true,
      tabPosition: "left",
      activeTabIndex: 0,
      tabList: [
        {
          title: "普通",
          value: "normal",
        },
        {
          title: "链接",
          value: "url",
        },
      ],
      files: [],
      fileUrl: "",
      isLoading: false,
      imageUrl: "",
      isHovering: false,
    };
  },
  methods: {
    changeTab(index) {
      this.activeTabIndex = index;
      if (index === 0) {
        this.files = [];
      }
      if (index === 1) {
        this.fileUrl = "";
      } else {
        this.imageUrl = "";
      }
    },
    deleteFile() {
      this.imageUrl = "";
      this.files.slice(-1);
      console.log(this.files);
    },
    chooseFile() {
      // 触发文件输入框的点击事件
      let fileInputRef = this.$refs.fileInput;
      if (Array.isArray(fileInputRef) && fileInputRef.length > 0) {
        fileInputRef = fileInputRef[0];
      }
      fileInputRef.click();
    },
    onFileSelected(event) {
      const file = event.target.files[0];
      if (file) {
        // 创建一个指向文件的临时 URL
        this.imageUrl = URL.createObjectURL(file);
        console.log("选择了文件:", file.name);
        this.files.push(file);
      } else {
        console.log("没有选择文件");
      }
    },
    confirm() {
      if (this.isLoading) return;
      if (!this.fileUrl?.trim() && this.files.length === 0) {
        return this.$message.warning("请选择文件或输入链接");
      }
      this.$emit("file-change", {
        files: this.files,
        url: this.fileUrl,
      });
      this.$nextTick(() => {
        this.cancel();
      });
    },
    cancel() {
      this.$emit("change", false);
      // 移除事件监听器，避免内存泄漏
      document.removeEventListener("paste", this.handlePaste);
    },
    handlePaste(event) {
      // 阻止默认行为
      if (!this.visible) return;
      if (this.activeTabIndex !== 0) {
        return;
      }
      event.preventDefault();

      // 获取剪切板中的数据
      let clipboardData = event.clipboardData || window.clipboardData;
      console.log(clipboardData.items);
      const items = clipboardData?.items;
      if (items && items.length > 0) {
        this.handleFileItems(items);
      }
    },
    handleDrop(event) {
      console.log(event, "handleDrop");
      event?.preventDefault?.();
      const items = event.dataTransfer.items;
      if (items && items.length > 0) {
        this.handleFileItems(items);
      }
    },
    onDragEnter(e) {
      this.isHovering = true;
    },
    onDragOver(e) {
      e.preventDefault(); // 防止默认行为以触发drop事件
      this.isHovering = true;
    },
    onDragLeave(e) {
      this.isHovering = false;
    },
    handleFileItems(items) {
      // 循环遍历所有粘贴项
      const files = [];
      for (let j = 0; j < items.length; j++) {
        const item = items[j];
        if (item.kind === "file") {
          const file = items[j].getAsFile();
          if (this.fileType === "image") {
            // 图片文件
            if (file.type.startsWith("image/")) {
              files.push(file);
            } else {
              console.log("非图片文件", file);
            }
          } else {
            // 其他文件
            files.push(file);
          }
        }
      }
      if (files.length > 0) {
        this.files.push(...files);
        if (this.multi === false) {
          this.files = [files[0]];
          console.log("单文件上传", this.files);
          if (this.fileType === "image") {
            this.imageUrl = URL.createObjectURL(files[0]);
          }
        }
      } else {
        const msg =
          this.fileType === "image"
            ? "粘贴板中没有图片文件"
            : "粘贴板中没有文件";
        this.$message({
          message: msg,
          type: "warning",
        });
      }
    },
    // url转成File对象
    async urlToFile(url, filename, mimeType) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response was not ok");

        const blob = await response.blob();
        return new File([blob], filename, { type: mimeType });
      } catch (error) {
        console.error("Error converting URL to file:", error);
      }

      // 使用示例
      // urlToFile('https://example.com/image.jpg', 'image.jpg', 'image/jpeg')
      //     .then(file => {
      //         console.log('Converted file:', file);
      //         // 现在你可以像处理普通文件一样处理这个file对象
      //     });
    },
  },
  mounted() {
    // 监听全局粘贴事件
    document.addEventListener("paste", this.handlePaste);
  },
  beforeDestroy() {
    // 移除事件监听器，避免内存泄漏
    document.removeEventListener("paste", this.handlePaste);
    // 在组件销毁之前，释放创建的对象 URL
    if (this.imageUrl) {
      URL.revokeObjectURL(this.imageUrl);
    }
  },
};
</script>

<style lang="scss" scoped>
::v-deep .el-dialog__header {
  display: none;
}
::v-deep .el-dialog__body {
  padding: 20px;
}
$primary-color: #409eff;
// $primary-color: #207ab7;

.title {
  line-height: normal;
  margin-bottom: 20px;
  font-weight: bold;
  color: #333;
  display: flex;
  justify-content: space-between;
  .close-btn {
    font-size: 1.4em;
    cursor: pointer;
    &:hover {
      transition: all 0.2s ease;
      scale: 1.4;
      color: #000;
    }
  }
}
.content {
  // --primary-color: #207ab7;
  .button-box {
    text-align: center;
    margin-top: 20px;
    .disabled {
      cursor: not-allowed;
      // pointer-events: none;
      filter: grayscale(100%);
    }
  }
  .primary-btn {
    line-height: 40px;
    border-radius: 4px;
    width: 150px;
    text-align: center;
    cursor: pointer;
    background: $primary-color;
    color: #fff;
    outline: none;
    &:active {
      box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2);
    }
    &:hover {
      opacity: 0.9;
    }
  }
}
.tab-content {
  display: flex;
  .tab-content-name {
    margin-right: 20px;
  }
  .tab-content-name-item {
    padding: 5px 15px;
    line-height: normal;
    cursor: pointer;
    border-bottom: 3px solid transparent;
    &:hover {
      color: $primary-color;
    }
    &.active {
      color: $primary-color;
      background-color: rgba($color: $primary-color, $alpha: 0.2);
      border-bottom-color: $primary-color;
    }
  }
  .tab-content-item {
    flex: 1;
    height: 300px;
    .img-box {
      width: 100%;
      height: 230px;
      padding: 20px;
      text-align: center;
      border: 1px dashed #ccc;
      background-image: linear-gradient(
          45deg,
          #ccc 25%,
          transparent 0,
          transparent 75%,
          #ccc 0
        ),
        linear-gradient(45deg, #ccc 25%, transparent 0, transparent 75%, #ccc 0);
      background-position: 0 0, 10px 10px;
      background-size: 20px 20px;
    }
    .file-url-img {
      width: 100%;
      height: 100%;
      object-fit: none;
    }
    .drag-area {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 300px;
      flex-direction: column;
      border: 1px dashed #ccc;
      position: relative;
      .upload-btn {
        background-color: rgba($color: $primary-color, $alpha: 0.9);
      }
      .close-btn {
        position: absolute;
        right: 5%;
        top: 5%;
        color: #000;
        background-color: #ccc;
        font-size: 24px;
        cursor: pointer;
        display: none;
      }
      &.hovering {
        border-color: $primary-color;
        // cursor: pointer;
      }
      &:hover {
        // border-color: $primary-color;
        // cursor: pointer;
        .close-btn {
          display: block;
        }
      }
      .img {
        width: 90%;
        height: 90%;
        display: inline-block;
        object-fit: none;
      }
    }
    .tip-text {
      font-size: 12px;
      color: #999;
      line-height: normal;
      padding: 5px 0;
    }
  }
}
</style>
