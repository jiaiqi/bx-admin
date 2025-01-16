import { $http } from "@/common/http";
import Viewer from "v-viewer";
import "viewerjs/dist/viewer.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BootstrapVue, BootstrapVueIcons } from "bootstrap-vue";

export default {
  // The install method will be called with the Vue constructor as
  // the first argument, along with possible options
  install(Vue, options) {
    Vue.prototype.$http = $http;
    Vue.prototype.$axios = $http;

    Vue.use(Viewer);
    Viewer.setDefaults({
      Options: {
        inline: true,
        button: true,
        navbar: true,
        title: true,
        toolbar: true,
        tooltip: true,
        movable: true,
        zoomable: true,
        rotatable: true,
        scalable: true,
        transition: true,
        fullscreen: true,
        keyboard: true,
        url: "data-source",
      },
    });

    Vue.use(BootstrapVue);
    Vue.use(BootstrapVueIcons);

    Vue.mixin({
      props: {
        $srvApp: {
          type: String,
        },
      },

      computed: {},

      methods: {},
    });

    // 生产环境重写console.log达到去除log的目的
    function rewirteLog() {
      console.log = (function (log) {
        return process.env.NODE_ENV == "production" ? function () {} : log;
      })(console.log);
    }
    rewirteLog();
  },
};
