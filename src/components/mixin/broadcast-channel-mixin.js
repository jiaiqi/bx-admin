export default {
  data() {
    return {
      broadcastChannel: null,
    };
  },
  beforeDestroy() {
    this.broadcastChannel?.close();
    this.broadcastChannel = null;
  },
  mounted() {
    if (this.$route.query?.broadCastName) {
      // 在组件挂载后创建BroadcastChannel
      this.broadcastChannel = new BroadcastChannel(
        this.$route.query?.broadCastName
      );
    }
  },
  methods: {
    bcPostMessage(type, event) {
      // 通过broadcastChannel广播消息
      if (this.broadcastChannel?.postMessage) {
        const msg = {
          type,
          event,
        };
        console.log("通知别的标签页刷新数据", msg);
        this.broadcastChannel.postMessage(JSON.stringify(msg));
      }
    },
  },
};
