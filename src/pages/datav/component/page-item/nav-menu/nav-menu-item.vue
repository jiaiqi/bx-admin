<template>
  <div
    class="nav-menu"
    v-if="data"
    @click="onTap"
    :class="{ 'active-nav-menu': isActive }"
  >
    <div class="nav-menu-label" :style="[formatStyleData(data.nav_style_json)]">
      <span>
        {{ data.label || data._label || "" }}
      </span>
      <svg
        class="arrow"
        viewBox="0 0 160 160"
        xmlns="https://www.w3.org/2000/svg"
        v-if="data.sub_json || data.child_source === '接口请求'"
      >
        <polyline class="arrow-polyline" points="20,50 80,110 140,50">
          <animate
            class="arrow-animate"
            ref="arrowAnimate"
            attributeName="points"
            dur="0.2s"
            fill="freeze"
            restart="whenNotActive"
            :from="isActive ? '20,50 80,110 140,50' : '20,110 80,50 140,110'"
            :to="isActive ? '20,110 80,50 140,110' : '20,50 80,110 140,50'"
          ></animate>
        </polyline>
      </svg>
    </div>
  </div>
</template>

<script>
import { formatStyleData } from "@/pages/datav/common/index.js";

export default {
  name: "NavMenuItem",
  props: {
    isActive: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  watch: {
    isActive(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.$refs.arrowAnimate.beginElement();
      }
    },
  },
  data() {
    return {
      formatStyleData,
      children: [],
    };
  },
  methods: {
    async onTap() {
      debugger;
      const item = this.data;
      if (item?._label && !item.jump_json) {
        // 友情链接表
        if (item.is_leaf === "是" && item.no) {
          // 非叶子节点 有子节点 查找子节点
          if (Array.isArray(this.children) && this.children.length) {
            return this.$emit("change", {
              children: this.children,
              current: item,
            });
          }
          const requestJson = {
            colNames: ["*"],
            mapp: "ws",
            srv_type: "select",
            serviceName: "srvcms_friend_links_select",
            condition: [
              {
                colName: "parent_no",
                ruleType: "eq",
                value: item.no,
              },
            ],
          };
          const res = await this.fetchChildData(requestJson);
          if (res.data?.state === "SUCCESS") {
            this.children = res.data.data.map((data) => {
              return {
                ...data,
                _label: data[item.label_field] || data.link_name,
                _url: data[item.link_field] || data.link_url,
              };
            });
          }
          this.$emit("change", {
            children: this.children,
            current: item,
          });
        } else if (item._url) {
          // 没有子节点 继续跳转逻辑
          this.$emit("on-nav", null, item);
        }
        return;
      }
      if (item?.sub_json && typeof item.sub_json === "string") {
        try {
          item.sub_json = JSON.parse(item.sub_json);
        } catch (error) {
          console.log("error", error);
        }
      }
      if (
        item?.sub_json &&
        Array.isArray(item.sub_json) &&
        item.sub_json.length
      ) {
        this.children = item.sub_json;
        return this.$emit("change", {
          children: item.sub_json,
          current: item,
        });
      }
      if (item.child_source === "接口请求") {
        const res = await this.fetchChildData(item.request_json);
        if (res.data?.state === "SUCCESS") {
          this.children = res.data.data.map((data) => {
            return {
              ...data,
              _label: data[item.label_field],
              _url: data[item.link_field],
            };
          });
        }
        this.$emit("change", {
          children: this.children,
          current: item,
        });
        return;
      }
      if (item?.jump_json) {
        this.$emit("on-nav", item.jump_json);
        // this.navTo(item.jump_json);
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
    async fetchChildData(config) {
      let requestJson = config;
      if (typeof config === "string") {
        requestJson = JSON.parse(config);
      }
      if (requestJson?.serviceName) {
        console.log("requestJson", requestJson);
        const req = {
          colNames: requestJson.colNames || ["*"],
          condition: requestJson.condition || [],
          serviceName: requestJson.serviceName,
          page: requestJson.page || { pageNo: 1, rownumber: 100 },
        };
        const url = `${requestJson.mapp}/${requestJson.srv_type || "select"}/${
          req.serviceName
        }`;
        return await this.$http.post(url, req);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.arrow {
  width: 1em;
  height: 1em;
  margin-left: 0.25rem;
  .arrow-polyline {
    fill: none;
    stroke: currentColor;
    stroke-width: 12;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
}
</style>
