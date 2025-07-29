<template>
  <div
    class="user-list"
    v-if="field && field.col_type === 'UserList'"
  ></div>
  <div
    v-else-if="uiType == '2'"
    :title="field.label"
    class="attachment"
  >
    <el-popover
      trigger="click"
      ref="show_popover"
      :append-to-body="true"
      :popper-options="{
        boundariesElement: 'viewport',
        gpuAcceleration: true,
        positionFixed: true,
        preventOverflow: {
          options: {
            boundary: 'viewport',
          }
        },
      }"
      @show="visibleChange"
    >
      <template slot="reference">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          class="attachment-icon"
        >
          <path
            fill="currentColor"
            d="M18 15.75q0 2.6-1.825 4.425T11.75 22t-4.425-1.825T5.5 15.75V6.5q0-1.875 1.313-3.187T10 2t3.188 1.313T14.5 6.5v8.75q0 1.15-.8 1.95t-1.95.8t-1.95-.8t-.8-1.95V7q0-.425.288-.712T10 6t.713.288T11 7v8.25q0 .325.213.538t.537.212t.538-.213t.212-.537V6.5q-.025-1.05-.737-1.775T10 4t-1.775.725T7.5 6.5v9.25q-.025 1.775 1.225 3.013T11.75 20q1.75 0 2.975-1.237T16 15.75V7q0-.425.288-.712T17 6t.713.288T18 7z"
          />
        </svg>
      </template>
      <div style="min-width: 700px;">
        <simple-list
          list-type="list"
          custom-list-type="popup"
          name="filelist"
          $srvApp="file"
          :default-condition="buildFileDefaultCondition"
          :service="'srvfile_dw_select'"
          v-if="showFilePopup"
        > </simple-list>
      </div>


    </el-popover>

  </div>
  <div
    class="file-list"
    v-else
  >
    <template v-if="getFileList && getFileList.length">
      <div
        v-for="(item, index) in getFileList"
        :key="index"
        class="file-item"
      >
        <span
          v-if="isImage(item)"
          @click="onPreView(item, index)"
        >
          <i
            class="el-icon-picture m-r-1"
            title="预览"
          ></i>
          <span>
            {{ item.src_name }}
          </span>
        </span>
        <span
          v-else-if="isPDF(item)"
          @click="onPreView(item, index)"
        >
          <i
            class="el-icon-document m-r-1"
            title="预览"
          ></i>
          <span>
            {{ item.src_name }}
          </span>
        </span>
        <span v-else>
          <i
            class="el-icon-download m-r-1"
            title="下载"
            @click="download(item.url)"
          >
          </i>
          <span @click="onPreView(item)">{{ item.src_name || "--" }}</span>
        </span>
      </div>
    </template>
    <template v-else-if="data && field && field.column && data[field.column]">
      {{ data[field.column] }}
    </template>
    <template v-else> </template>
    <viewer
      v-show="false"
      :images="imageList"
      ref="viewer"
    >
      <img
        style="height: 1rem; width: 1rem"
        :class="'image-' + src.file_no"
        @error="onerror"
        @load="onerror(src.url)"
        :src="src.url"
        v-for="(src, index) in imageList"
        :key="index"
      />
    </viewer>
  </div>
</template>

<script>
export default {
  components: {
    SimpleList: () => import('../../common/list.vue'),
  },
  props: {
    field: {
      type: Object,
      default: () => {
        return {};
      },
    },
    data: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      imgUrl: "",
      showFilePopup: false
    };
  },
  computed: {
    buildFileDefaultCondition() {
      let cond = [
        {
          colName: 'file_no',
          ruleType: 'eq',
          value: this.data[this.field.column]
        }
      ]
      return cond
    },
    pageAttribute() {
      let pages_attribute = sessionStorage.pages_attribute;
      if (pages_attribute && typeof pages_attribute === 'string') {
        try {
          pages_attribute = JSON.parse(pages_attribute)
        } catch (error) {
          console.error(error);
          pages_attribute = {}
        }
      }
      return pages_attribute
    },
    uiType() {
      // 1：直接使用文件名称展示所有文件；
      // 2：文件数量为1时显示文件名称;文件数量大于1时只展示图标，点击弹出文件列表
      return this.pageAttribute['列表附件字段展示方式']
    },
    getJson() {
      let dispKey = `_${this.field.column}_disp`
      if (Array.isArray(this.data?.[dispKey]) && this.data?.[dispKey].length) {
        return this.data[dispKey]
      }
      if (
        this.field?._obj_info?.a_save_b_obj_col &&
        this.data[this.field._obj_info.a_save_b_obj_col]
      ) {
        let objStr = this.data[this.field._obj_info.a_save_b_obj_col];
        return JSON.parse(objStr);
      }
    },
    imageList() {
      return this.getFileList?.filter((item) => item.isImage === true);
    },
    getFileList() {
      if (Array.isArray(this.getJson) && this.getJson.length) {
        return this.getJson.map((item) => {
          const fileUrl = this.serviceApi().downloadFile + item.fileurl;
          return {
            ...item,
            file_type: item.file_type || item.src_name.split(".").pop(),
            name: item.src_name,
            url: fileUrl,
            isImage: this.isImage(item),
          };
        });
      }
    },
  },
  methods: {
    visibleChange(visible) {
      console.log('visibleChange:', visible);

      this.showFilePopup = true
    },
    onPreView(file = {}, index) {
      if (this.isImage(file)) {
        const viewer2 = this.$el.querySelector(".image-" + file.file_no);
        let imgIndex = index || 0;
        this.imageList.forEach((item, i) => {
          if (item.file_no && item.file_no == file.file_no) {
            imgIndex = i;
          }
        });
        const viewer = this.$refs.viewer.$viewer;
        viewer.index = imgIndex;
        console.log(viewer, imgIndex, viewer2, this.$refs.viewer);
        viewer.show();
      } else if (file.file_type === "pdf") {
        let currLocation = window.location.href;
        let hashIndex = currLocation.indexOf("#");
        if (hashIndex > 0) {
          let pdfPreviewUrl =
            currLocation.substring(0, hashIndex) +
            "#/viewpdf?pdfsrc=" +
            encodeURIComponent(file.url);
          this.addTabByUrl(pdfPreviewUrl, "文件预览");
          return;
        }
      } else {
        // window.location.href = file.url;
        this.$message({
          message:
            "只支持【pdf】/【jpg】/【png】格式预览，其他格式请点击左侧下载图标下载后查看",
          type: "warning",
        });
      }
    },
    isImage(item) {
      let fileType = item.file_type || item.src_name.split(".").pop();
      if (fileType) {
        fileType = fileType.toLowerCase();
      }
      const imgTypes = ["png", "jpg", "jpeg", "gif", "bmp", "webp", "svg"];
      return imgTypes.includes(fileType);
    },
    isPDF(item) {
      let fileType = item.file_type || item.src_name.split(".").pop();
      if (fileType) {
        fileType = fileType.toLowerCase().trim();
      }
      return fileType === "pdf";
    },
    onerror(e) {
      console.log("显示失败", e);
    },
  },
};
</script>

<style scoped lang="scss">
.attachment {
  &-icon {
    cursor: pointer;
    color: var(--primary-color, #409eff);
    transition: all 0.1s ease;
    &:hover {
      transform: scale(1.01);
    }
    &:active{
      transform: scale(0.95);
    }
  }
}

.file-item {
  &:hover {
    text-decoration: underline;
    color: #409eff;
    cursor: pointer;
  }

  .m-r-1 {
    margin-right: 2px;
  }

  .el-icon-download {
    transition: all 0.5s ease;

    &:hover {
      transform: scale(1.5);
    }
  }
}
</style>