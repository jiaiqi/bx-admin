<template>
  <div class="d-flex w-100">
    <div v-if="Array.isArray(files) && files.length > 0" class="d-flex">
      <div
        v-for="(file, index) in files"
        class="border mr-1"
        :style="`background:#f2f2f2;width:${mainProps.width}px;height:${mainProps.height}px;position: relative;`"
      >
        <b-img
          class="p-1"
          v-bind="mainProps"
          :src="file['_url']"
          alt="加载失败"
        >
        </b-img>
        <div
          style="
            height: 28px;
            width: 28px;
            background-color: #0000006b;
            position: absolute;
            right: 0;
            top: 0;
          "
          class="float-right d-flex justify-content-center align-items-center text-white cursor-pointer"
          @click="del(file)"
        >
          <b-icon-x></b-icon-x>
        </div>
      </div>
    </div>
    <div
      v-if="!isMax"
      class="block d-flex justify-content-center align-items-center h2 m-0"
      :style="`background:#f2f2f2;width:${mainProps.width}px;height:${mainProps.height}px;`"
      @click="onCheck"
    >
      <input
        :name="initColumn"
        type="file"
        multiple="multiple"
        style="display: none"
        accept="image/*"
        :ref="`uploadInput${initColumn}`"
        @change="getImg"
      />
      <b-icon-plus></b-icon-plus>
      <!--
style="display: none;" -->
    </div>
  </div>
</template>

<script>
import { deleteFile } from "./api";
export default {
  props: {
    value: {
      type: String,
      default() {
        return "";
      },
    },
    initColumn: {
      type: String,
      default() {
        return "";
      },
    },
    initTable: {
      type: String,
      default() {
        return "";
      },
    },
    msg: {
      type: String,
      default() {
        return "";
      },
    },
    initMax: {
      type: [Number, String],
      default: 1,
    },
    mainProps: {
      type: Object,
      default() {
        return { width: 100, height: 75 };
      },
    },
    appNo: String,
  },
  computed: {
    hostPath() {
      return window.backendIpAddr;
    },
    getToken() {
      return sessionStorage.getItem("bx_auth_ticket");
    },
    isMax() {
      let is = false;
      if (this.initMax <= this.files.length) {
        is = true;
      }
      return is;
    },
    no() {
      let no = "";
      if (this.value) {
        no = this.value;
      } else if (this.loadNo) {
        no = this.loadNo;
      }
      return no;
    },
    formData() {
      let data = {
        serviceName: "srv_bxfile_service",
        interfaceName: "add",
        app_no: this.appNo || "ws",
        table_name: this.initTable || "bxws_member_info",
        thumbnailType: "fwsu_100",
        columns: this.initColumn || "",
      };
      return data;
    },
  },
  mounted() {
    if (this.no) {
      this.getInfoFiles();
    }
  },
  data() {
    return {
      loadNo: "",
      onProgress: "",
      files: [],
    };
  },
  methods: {
    async getInfoFiles() {
      let self = this;
      if (!this.no) {
        return;
      }
      const res = await this.selectFileList(this.no);
      if (res?.data?.state === "SUCCESS") {
        console.log(res);
        if (res?.data?.data) {
          const resData = res.data.data;
          if (Array.isArray(resData) && resData.length > 0) {
            this.files = resData.map((item) => {
              item[
                "_url"
              ] = `${this.hostPath}/file/download?filePath=${item.fileurl}`;
              if (this.getToken) {
                item[
                  "_url"
                ] = `${item["_url"]}&bx_auth_ticket=${this.getToken}`;
              }
              if (item?.fileurl?.indexOf("http") === 0) {
                item["_url"] = item.fileurl;
              }
              return item;
            });
          } else {
            this.files = [].map((item) => item);
            self.$set(self, "loadNo", "");
            self.$emit("change", "");
          }
        }
      }
      // .then(res => {
      // })
    },
    onCheck() {
      let refName = `uploadInput${this.initColumn}`;
      let ref = this.$refs[refName];
      if (ref) {
        ref.click();
      }
      console.log(ref);

      // this.$ref[`uploadInput${this.initColumn}`].click()
    },
    getImg(e) {
      var file = e.target.files;
      this.submit(file[0]);
    },
    del(file) {
      let self = this;
      let delIndex = null;
      for (let index in this.files) {
        if (this.files[index].fileurl == file.fileurl) {
          delIndex = index;
          let req = { fileurl: `${file.fileurl}` };
          deleteFile(req).then((res) => {
            if (res.resultCode == "SUCCESS") {
              this.$message.success("删除成功");
              self.getInfoFiles().then(() => {
                if (!this.loadNo) {
                  this.$emit("input", "");
                }
              });
            } else if (res.resultCode == "0011") {
              this.$message.error(res.resultMessage);
            }
          });
        }
      }
      if (this.initMax === 1) {
        this.files = []
        self.$set(self, "loadNo", "");
        self.$emit("change", "");
      }
      // this.img_list.splice(index,1)
    },
    submit(file) {
      let url = "";
      url = `${this.hostPath}/file/upload`;
      if (this.getToken) {
        url = `${url}?bx_auth_ticket=${this.getToken}`;
      }

      const xhr = new XMLHttpRequest(); // 1. 创建对象
      const form = new FormData(); // 创建一个空表单数据对象
      // form.append( ...this.formData);
      for (let key in this.formData) {
        form.append(key, this.formData[key]);
      }
      form.append("file", file);
      if (this.no) {
        form.append("file_no", this.no);
      }

      xhr.open("POST", url, true); // 2. 与服务器建立连接
      xhr.upload.onprogress = (e) => {
        // 监听文件传输进度
        this.onProgress && this.onProgress(e);
      };
      xhr.onload = (e) => {
        // 监听文件传输进度
        console.log("上传onload");
        if (e.target.readyState && e.target.status) {
          //4 && 200
          this.onSuccess && this.onSuccess(JSON.parse(e.target.response));
        }
      };
      xhr.onerror = (error) => {
        this.onError && this.onError(error, this.file);
      };
      xhr.send(form); // 3. 发送请求;
    },
    onSuccess(res) {
      console.log(res);
      if (res) {
        res["_url"] = `${this.hostPath}/file/download?filePath=${res.fileurl}`;
        if (this.getToken) {
          res["_url"] = `${res["_url"]}&bx_auth_ticket=${this.getToken}`;
        }
        if (!this.no) {
          this.$set(this, "loadNo", res.file_no);
        }
        this.$emit("input", res.file_no);
        this.files.push(res);
      }
    },
    onError(err) {
      console.log(err);
    },
  },
  watch: {
    no: {
      deep: true,
      handler: function (nval, oval) {
        this.$emit("change", nval);
      },
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.card-img {
  min-height: 8rem;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
