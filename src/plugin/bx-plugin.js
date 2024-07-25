import { $http } from "@/common/http";

export default {
  // The install method will be called with the Vue constructor as
  // the first argument, along with possible options
  install(Vue, options) {
    Vue.prototype.$http = $http;
    Vue.mixin({
      props: {
        $srvApp: {
          type: String,
        },
      },

      computed: {},

      methods: {},
    });
  },
};
