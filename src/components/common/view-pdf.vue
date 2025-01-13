<template>
  <div
    v-if="loading"
    style="width: 100vw; height: calc(100vh - 20px)"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  ></div>
  <iframe
    :src="pdfsrc"
    frameborder="0"
    id="pdf-viewer"
    style="width: 100vw; height: calc(100vh - 20px)"
    v-else
  ></iframe>
</template>

<script>
export default {
  data() {
    return {
      dowloadpdfsrc: "",
      pdfsrc: "",
      loading: false,
    };
  },
  methods: {
    async urlToBase64(url) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response was not ok");

        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(",")[1]); // 获取纯 base64 字符串部分
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(blob); // 将 Blob 转换为 data URL (base64)
        });
      } catch (error) {
        console.error("Error converting URL to base64:", error);
      }
    },

    async blobUrlToBase64(blobUrl) {
      function blobToBase64(blob) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            // The result is in the format "data:<mime type>;base64,<base64 string>"
            // If you only want the base64 string part, you can slice it.
            resolve(reader.result.split(",")[1]);
          };
          reader.onerror = () => {
            reject(reader.error);
          };
          reader.readAsDataURL(blob); // This reads the file as a data URL (which is base64 encoded)
        });
      }

      try {
        const response = await fetch(blobUrl);
        if (!response.ok) throw new Error("Network response was not ok");
        const blob = await response.blob();
        return await blobToBase64(blob);
      } catch (error) {
        console.error(
          "Error fetching or converting blob URL to base64:",
          error
        );
      }
    },

    loadPdf(url) {
      this.loading = true;
      this.urlToBlobUrl(url)
        .then((blobUrl) => {
          this.pdfsrc = blobUrl;
          this.loading = false;
        })
        .catch((error) => {
          console.error("Failed to load PDF:", error);
          this.loading = false;
        });
      // this.urlToBase64(url).then((base64String) => {
      //   this.pdfsrc = `data:application/pdf;base64,${base64String}`;
      // });
      return;
      const self = this;
      var paramData = {};
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      // 设置请求头参数，可以添加token值
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8;");
      // 设置响应体返回类型，这里需要把返回的文件流转换成 blob 类型
      xhr.responseType = "blob";
      xhr.onload = function (e) {
        if (this.status == 200) {
          var name = xhr.getResponseHeader("Content-disposition");
          name = decodeURIComponent(name);

          // debugger
          // 返回的文件流，转换成blob对象
          // var blob = new Blob([ xhr.response ], { type: xhr.response.type });
          var blob = new Blob([xhr.response], {
            type: "application/pdf;charset-UTF-8;",
          });
          let file = new File([xhr.response], name);
          // 转换成blob类型的url
          // var blobUrl = URL.createObjectURL(blob);
          var fileUrl = URL.createObjectURL(file);
          // blob = new Blob([ file ], { type: xhr.response.type });
          var blobUrl = URL.createObjectURL(blob);
          self.blobUrlToBase64(blobUrl).then((base64String) => {
            self.pdfsrc = `data:application/pdf;base64,${base64String}`;
            // document.getElementById("pdf-viewer").src = url;
          });

          document.getElementById("pdf-viewer").title = name;
          console.log("name:", file, "url", fileUrl);
        }
      };
      xhr.send(JSON.stringify(paramData));
    },
    async urlToBlobUrl(url) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response was not ok");

        const blob = await response.blob();
        return URL.createObjectURL(blob);
      } catch (error) {
        console.error("Error converting URL to Blob URL:", error);
      }
    },
  },
  mounted() {
    if (this.isTopComp() && this.$route && this.$route.query) {
      var pdfsrc = this.$route.query.pdfsrc;
      pdfsrc = decodeURIComponent(pdfsrc);
      if (!pdfsrc?.includes("http")) {
        pdfsrc = this.serviceApi().downloadFile + pdfsrc;
      }
      let url = `${
        window.backendIpAddr
      }/file/forward?targetUrl=${encodeURIComponent(pdfsrc)}`;
      if (pdfsrc.includes(location.host)) {
        console.log("url", url);
        url = pdfsrc;
      }
      this.dowloadpdfsrc = url;
      this.loadPdf(url);
    }
  },
};
</script>

<style lang="scss" scoped>

</style>
