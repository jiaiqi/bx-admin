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
        const headers = {};
        const authTicket = sessionStorage.getItem('bx_auth_ticket');
        if (authTicket) {
          headers['Authorization'] = `Bearer ${authTicket}`;
        }
        
        const response = await fetch(url, { headers });
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
      return;
    },
    async urlToBlobUrl(url) {
      try {
        const headers = {};
        const authTicket = sessionStorage.getItem('bx_auth_ticket');
        if (authTicket) {
          headers['bx-auth-ticket'] = authTicket;
          headers['bx_auth_ticket'] = authTicket;
        }
        
        const response = await fetch(url, { headers });
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
      if (
        pdfsrc.includes(location.hostname) ||
        pdfsrc.includes(window.backendIpAddr)
      ) {
        console.log("url", url);
        url = pdfsrc;
        if(!url.includes('isview=1')){
          url += '&isview=1';
        }
        // return this.pdfsrc = url;
      }
      this.dowloadpdfsrc = url;
      this.loadPdf(url);
    }
  },
};
</script>

<style lang="scss" scoped>
</style>
