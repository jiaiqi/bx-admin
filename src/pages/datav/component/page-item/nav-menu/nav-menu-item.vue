<template>
  <div class="nav-menu" v-if="data" @click="onTap">
    <div class="nav-menu-label" :style="[formatStyleData(data.nav_style_json)]">
      {{ data.label }}
    </div>
  </div>
</template>

<script>
import { formatStyleData } from "@/pages/datav/common/index.js";

export default {
  name: 'NavMenuItem',
  props: {
    data: {
      type: Object,
      default: () => {
        return {}
      }
    },
  },
  data() {
    return {
      formatStyleData,
      children: [],
    }
  },
  methods: {
    async onTap() {
      const item = this.data
      if (item.child_source === '接口请求') {
        const res = await this.fetchChildData(item.request_json)
        if (res.data?.state === 'SUCCESS') {
          this.children = res.data.data.map(data => {
            return {
              ...data,
              _label: data[item.label_field],
              _url: data[item.link_field]
            }
          })
        }
        this.$emit('change', {
          children: this.children,
          current: item
        })
        return
      }
      if (item?.jump_json) {
        this.navTo(item.jump_json);
        return;
      }
      const ele = event.target.getBoundingClientRect();
      this.minHeight = ele.height;
      if (this.current?.nav_no && this.current?.nav_no === item?.nav_no) {
        this.current = null;
      } else {
        if (item?.sub_json && typeof item.sub_json === "string") {
          item.sub_json = JSON.parse(item.sub_json);
        }
        this.current = item;
      }
      // 获取当前点击的nav-menu宽度
      if (event && event.currentTarget) {
        this.navMenuWidth = event.currentTarget.offsetWidth;
      }
    },
    navTo(jumpConfig) {
      if (typeof jumpConfig === "string") {
        try {
          jumpConfig = JSON.parse(jumpConfig);
        } catch (error) {
          console.error(error);
        }
      }
      if (jumpConfig?.obj_type) {
        switch (jumpConfig.obj_type) {
          case "外部页面":
            if (jumpConfig.outer_url) {
              if (jumpConfig.target_type == "原页面") {
                window.location.href = jumpConfig.outer_url;
              } else {
                window.open(jumpConfig.outer_url);
              }
            }
            break;
          default:
            if (jumpConfig.dest_page_no) {
              this.navToPath(jumpConfig);
            }
            break;
        }
      }
    },
    navToPath(jump_json) {
      let pageNo = jump_json?.dest_page_no;
      let path = "";
      if (jump_json?.tmpl_page_json.file_path) {
        path = jump_json?.tmpl_page_json.file_path.replace(":pageNo", pageNo);
      } else {
        path = `/vpages/index.html#/lowcode-grid/view/${pageNo}?srvApp=config`;
      }
      if (pageNo) {
        if (jump_json.target_type == "原页面") {
          window.location.href = path;
        } else {
          window.open(path);
        }
      }
    },
    async fetchChildData(config) {
      let requestJson = config
      if (typeof config === 'string') {
        requestJson = JSON.parse(config)
      }
      if (requestJson?.serviceName) {
        console.log('requestJson', requestJson);
        const req = {
          colNames: requestJson.colNames || ['*'],
          condition: requestJson.condition || [],
          serviceName: requestJson.serviceName,
          page: requestJson.page || { pageNo: 1, rownumber: 100 },
        }
        const url = `${requestJson.mapp}/${requestJson.srv_type || 'select'}/${req.serviceName}`
        return await this.$http.post(url, req)
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>