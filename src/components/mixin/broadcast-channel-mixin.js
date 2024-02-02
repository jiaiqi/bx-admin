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
    this.broadcastChannel = new BroadcastChannel("myChannel");
  },
  methods: {
    bcPostMessage(type,event) {
      // 通过broadcastChannel广播消息
      if(this.broadcastChannel?.postMessage){
        const msg = {
          type,
          event,
          broadCastId:this.$route.query?.broadCastId
        }
        this.broadcastChannel.postMessage(
          JSON.stringify(msg)
        )
      }
      this.broadcastChannel.postMessage(event);
    },
  },
};
