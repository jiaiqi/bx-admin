<template>
  <div id="app">
    <router-view v-if="ready" :key="$route.path"></router-view>
    <login-dialog ref="loginRef"></login-dialog>
  </div>
</template>

<script>
import extjs from "./components/test/extjs.js";
// import dummy from "./components/test/spa_mock.js";
import loginDialog from "./components/ui/login-dialog/login-dialog.vue";
import Vue from "vue";
// import { LoadScript } from './common/common'
export default {
  name: "App",
  components: {
    loginDialog,
  },
  data() {
    return {
      ready: false,
    };
  },
  created() {
    if (sessionStorage.getItem("theme")) {
      let theme = sessionStorage.getItem("theme");
      try {
        theme = JSON.parse(theme);
      } catch (error) {
        console.log("error", error);
      }
      if (theme && theme.name) {
        Object.keys(theme).forEach((key) => {
          if (key == "name") {
            return;
          }
          if (key.includes("-color")) {
            document.documentElement.style.setProperty(`--${key}`, theme[key]);
          }
        });
      }
    }
    if (this.$route?.query?.bx_auth_ticket) {
      sessionStorage.setItem(
        "bx_auth_ticket",
        this.$route?.query?.bx_auth_ticket
      );
      localStorage.setItem(
        "bx_auth_ticket",
        this.$route?.query?.bx_auth_ticket
      );
    }
  },
  mounted() {
    if (process?.env?.NODE_ENV === "development") {
      Vue.prototype.$loginRef = this.$refs.loginRef;
    }

    const init = () => {
      // const AK = 'FC190506b9b4fa8b366db9f78cb5e93e';
      // const bMapSrc = `${location.protocol}//api.map.baidu.com/api?v=2.0&ak=${AK}&s=1&callback=onBMapCallback`
      // const bMapSrc = `${location.protocol}//30.61.1.37:8119/dugis-demo-3d/api/booter.js`
      // const bMapSrc = `${location.protocol}//30.61.1.37:8119/dugis-demo-3d/api/api.js`
      // const bMapGLSrc = `${location.protocol}//api.map.baidu.com/api?type=webgl&v=2.0&ak=${AK}`
      // LoadScript(bMapSrc).then((bmap)=>{
      // console.log(bmap)
      // setTimeout(() => {
      this.$store.commit("setBMapLoaded", true);

      // }, 1000);
      // })
    };
    init();
    if (!top.user && sessionStorage.current_login_user) {
      top.user = JSON.parse(sessionStorage.current_login_user);
    }
  },

  methods: {
    getExtjsCondition() {
      let path = this.$route.path;
      let tokens = path.split("/").filter((i) => !!i);
      let pageType = tokens[0];
      let pageParam = tokens[1];
      if (path.startsWith("/procdetail") || path.startsWith("/startproc")) {
        pageType = "proc";
      }

      let pageTypes = ["list", "add", "detail", "update", "proc", "listproc"];
      if (pageTypes.includes(pageType)) {
        return [
          {
            colName: "page_type",
            ruleType: "eq",
            value: pageType,
          },
          {
            colName: "page_param",
            ruleType: "eq",
            value: pageParam,
          },
        ];
      }

      return null;
    },

    loadExtJs() {
      this.ready = true;

      // let condition = this.getExtjsCondition();
      // if (!condition) {

      //   this.ready = true;
      // } else {
      //   this.select("srvsys_page_extjs_select", condition).then((resp) => {
      //     try {
      //       if (resp.data && resp.data.data && resp.data.data.length > 0) {
      //         eval(resp.data.data[0].extjs)
      //       }
      //     } finally {
      //       // note: always last statement

      //       this.ready = true;
      //     }
      //   })
      // }
    },

    // 开发调试extjs
    testExtJs() {
      // !!! mock test code !!!!
      new Promise((resolve) => setTimeout(resolve, 200)).then(() => {
        extjs.bind(this)();

        // note: always last statement

        this.ready = true;
      });
    },
  },

  beforeMount: function () {
    // dummy();
    window.debugExtjs ? this.testExtJs() : this.loadExtJs();
    if (
      this.$route?.query?.viewMode === "demo" ||
      sessionStorage.getItem("viewMode") === "demo"
    ) {
      document.body.classList.add("is-demo");
    }
  },
};
</script>

<style lang="scss">
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";

html {
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  height: 100%;
  margin: 0;
  padding: 0;
}

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
  color: #2c3e50;
  &.dark-mode,
  > .dark-mode {
    color: #eee;
  }
}

.el-loading-spinner {
  .circular {
    display: inline-block;
  }
}

.el-input.is-disabled .el-input__inner {
  color: #303133 !important;
}

.el-textarea.is-disabled .el-textarea__inner {
  color: #303133 !important;
}

// 统一add\update\detail表单在页面跟弹窗中样式，底部按钮固定
.customDialogClass {
  .el-dialog {
    margin-top: 5vh !important;
  }

  .el-dialog__header {
    padding: 10px 20px;

    .el-dialog__headerbtn {
      top: 10px;
    }
  }

  .el-dialog__body {
    padding: 0px 20px 10px !important;

    .form-view-wrapper.el-row {
      max-height: 75vh;
      overflow-y: auto;

      // &.plat-child-form{
      //   max-height: unset;
      //   overflow: unset;
      // }
      .text.item {
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      .el-collapse-item {
        display: flex;
        flex-direction: column;
      }
    }

    .child-form-field {
      .form-view-wrapper.el-row {
        max-height: unset;
        overflow: unset;
      }
    }
  }
}

// .form-view-wrapper.el-row {
//   max-height: calc(100vh - 150px);
//   overflow-y: auto;
//   padding-bottom: 10px;
// }

#proc_detail {
  .form-view-wrapper.el-row {
    max-height: unset;
    overflow: unset;
    padding-bottom: unset;
  }
}

// 主题相关-start
:root {
  --primary: var(--primary-color, #409eff);
}

.el-tabs__item.is-active,
.el-tabs__item:hover,
.el-collapse-item .el-collapse-item__header.is-active {
  color: var(--primary-color, #409eff) !important;
}

.el-select-dropdown.el-popper {
  .el-select-dropdown__item.selected {
    color: var(--primary-color, #409eff) !important;
  }
}

.el-form-item__label,
span.section-title {
  color: var(--primary-color, #409eff) !important;
}

.el-upload--picture-card:hover,
.el-upload:focus {
  border-color: var(--primary-color, #409eff) !important;
  color: var(--primary-color, #409eff) !important;
}

.el-select .el-input__inner:focus,
.el-range-editor.is-active,
.el-range-editor.is-active:hover,
.el-select .el-input.is-focus .el-input__inner,
.el-cascader .el-input .el-input__inner:focus,
.el-cascader .el-input.is-focus .el-input__inner {
  border-color: var(--primary-color, #409eff) !important;
}
.el-tabs__active-bar {
  background-color: var(--primary-color, #409eff);
}

.lowcode-wrapper,
.table-head-btns,
.cell,
.el-row,
.el-dialog__body,
.el-dialog__footer,
.el-dialog__wrapper,
.customDialogClass,
.el-form,
.el-message-box__btns,
.el-message-box__content,
.el-message-box__headerbtn,
.el-message-box__input,
.el-message-box__title,
.el-message-box__header,
.el-dialog__header,
.el-dropdown-menu.el-popper,
.el-pagination,
.el-radio-group,
.el-checkbox-group,
.el-checkbox__input.is-indeterminate,
.bx_action,
.el-table-filter,
.pagination-box,
.dialog-footer,
.handler-bar,
.upload-demo {
  &.highlight,
  .el-table-filter__bottom button:hover,
  .el-form .el-form-item .el-form-item__label {
    color: var(--primary-color, #007aff);
  }
  .el-table__cell.descending .caret-wrapper .sort-caret.descending {
    border-top-color: var(--primary-color, #007aff);
  }
  .el-table__cell.ascending .caret-wrapper .sort-caret.ascending {
    border-bottom-color: var(--primary-color, #007aff);
  }

  .el-table {
    th.el-table__cell > .cell.highlight {
      color: var(--primary-color, #007aff);
    }
  }

  *::selection {
    color: #fff;
    background: var(--primary-color, #007aff);
  }
  .el-pagination.is-background {
    .el-pager li:not(.disabled):hover {
      color: var(--primary-color, #007aff);
    }
    .el-pager li:not(.disabled).active {
      background-color: var(--primary-color, #409eff);
      color: #fff;
    }
  }
  .materia-warp {
    .type-item.active {
      color: var(--primary-color, #007aff);
    }
  }
  a,
  .el-radio__input.is-checked + .el-radio__label,
  .el-checkbox__input.is-checked + .el-checkbox__label {
    color: var(--primary-color, #409eff);
  }

  .el-tag:not(.el-tag--info) {
    background-color: var(--menu-bg-light-color, #b3d8ff);
    border-color: var(--menu-light-border-color, #b3d8ff);
    color: var(--primary-color, #409eff);
  }

  .el-button:focus,
  .el-button:hover {
    color: var(--primary-color, #409eff);
    background-color: var(--menu-bg-light-color, #ecf5ff);
    border-color: var(--menu-light-border-color, #c6e2ff);
  }

  .el-input.is-active .el-input__inner,
  .el-input__inner:focus {
    border-color: var(--primary-color, #409eff);
  }

  a:not([href]):not([class]) {
    color: var(--primary-color, #409eff) !important;
  }

  .link-to-detail:hover {
    color: var(--primary-color, #409eff);
  }

  .el-button--primary,
  .el-radio__input.is-checked .el-radio__inner,
  .el-checkbox__input.is-checked .el-checkbox__inner {
    color: #fff;
    background-color: var(--menu-bg-color, #409eff);
    border-color: var(--menu-bg-color, #409eff);
    color: var(--menu-text-color, #fff);
    &.is-plain {
      color: var(--menu-bg-color, #409eff);
      background: var(--menu-bg-light-color, #ecf5ff);
      border-color: var(--menu-light-border-color, #b3d8ff);

      &:hover,
      &:active,
      &:focus {
        background-color: var(--menu-bg-color, #409eff);
        color: var(--menu-text-color, #fff);
        border-color: var(--menu-light-border-color, unset);
      }
    }

    &:focus,
    &:hover {
      color: var(--menu-text-color, #fff);
      background-color: var(--menu-bg-color, #66b1ff);
      border-color: var(--menu-bg-color, #66b1ff);
    }
  }
}

// 主题相关-end

.is-demo {
  // 原型图样式
  .el-checkbox__input.is-checked + .el-checkbox__label {
    color: #666;
  }

  .el-checkbox__input.is-checked .el-checkbox__inner,
  .el-checkbox__input.is-indeterminate .el-checkbox__inner {
    background-color: #666;
    border-color: #666;
  }

  .el-checkbox__inner {
    border-color: #666;
  }

  .el-input__inner::-webkit-input-placeholder {
    color: #666 !important;
    font-size: 12px;
  }

  .el-collapse-item__header.is-active {
    color: #333 !important;
  }

  .el-input__inner,
  .el-textarea__inner {
    border: 1px solid #999;
    border-radius: 0;
    height: 30px;
    line-height: 30px;
  }

  .el-textarea__inner {
    height: unset;
  }

  .el-form .el-form-item .el-form-item__label {
    color: #666;

    .normal {
      color: #666 !important;
    }
  }

  a {
    color: #333 !important;
  }

  .el-form-item__label.required::before {
    color: #666;
  }

  .el-button {
    &.el-button--success {
      background-color: #999;
      border-color: #999;
    }

    i {
      display: none;
    }

    &.el-button--primary {
      color: #000;
      background-color: #dbdbdb;
      outline: none;
      border-color: #dbdbdb;
    }
  }

  .el-button--primary.is-plain {
    color: #000;
    background-color: #dbdbdb;
    outline: none;
    border-color: #dbdbdb;
  }

  .el-button--primary.is-plain:hover {
    color: #000;

    background-color: #dbdbdb;
    outline: none;
    border-color: #dbdbdb;
  }

  .el-table {
    // 统一处理el-table样式
    margin: 20px;

    .el-table--border::after {
      background-color: #8b8b8b;
    }

    th > .cell {
      color: #333;
    }

    .cell {
      color: #333;
    }

    th {
      background-color: #dadada;
    }

    .hover-row,
    .hover-row > td,
    .current-row > td {
      background-color: #ececec !important;
    }

    .el-table--border td,
    .el-table--border th,
    td,
    th {
      border-right: 1px solid #8b8b8b !important;
      border-bottom: 1px solid #8b8b8b !important;
    }

    &.el-table--border,
    &.el-table--group {
      border-top: 1px solid #8b8b8b !important;
      border-bottom: 1px solid #8b8b8b !important;
      border-left: 1px solid #8b8b8b !important;
      border-right: 1px solid #8b8b8b !important;
    }
  }
}

/* 在el-dialog中tinymce z-index 被太小而被遮挡 */
.tox-tinymce-aux {
  z-index: 99999 !important;
}

.tinymce.ui.FloatPanel {
  z-index: 99;
}

.field-editor {
  .el-form-item__label {
    margin-bottom: 10px;

    label {
      margin-bottom: 0;
    }
  }
}
.form-view-wrapper .el-form span.section-title {
  margin-bottom: 10px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  &.is-collapse {
    margin-bottom: 0;
    border-bottom: none;
  }
}
</style>
