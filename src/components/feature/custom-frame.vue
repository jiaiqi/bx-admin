<script>
import broadcastChannelMixin from "../mixin/broadcast-channel-mixin";

export default {
  name: "custom-frame",
  mixins: [broadcastChannelMixin],
  props: {
    src: {
      type: String
    },
    serviceName: {
      type: String,
      default: "broadCast"
    },
    colSrv:String,
    data: Object,
    memInitdatasAdd:Array
  },
  data() {
    return {
      broadcastChannel: null,
      broadCastName: null,
      listData: null
    }
  },
  watch: {
    memInitdatasAdd: {
      immediate: true,
      deep: true,
      handler(newValue, oldValue) {
        this.emit({
          type:'initDataChange',
          data:newValue
        })
      }
    }
  },
  computed: {
    frameSrc() {
      let src = `/dataview/#/childList/add/${this.broadCastName}/ledu/${this.serviceName}`
      if(this.colSrv&&this.colSrv!==this.serviceName){
        src+=`?colSrv=${this.colSrv}`
      }
      return src
    },
    getData() {
      return this.listData
    }
  },
  mounted() {
    this.initBroadcastChannel(this.serviceName)
  },
  methods: {
    buildRunQuries() {
      return this.listData
    },
    load() {
      this.emit(this.data)
    },
    initBroadcastChannel(str = '') {
      this.broadCastName = new Date().getTime() + `_${str}`
      this.broadcastChannel = new BroadcastChannel(this.broadCastName);
      this.broadcastChannel.addEventListener("message", this.on)
    },
    on(event) {
      if (event.data) {
        try {
          let data = JSON.parse(event.data)
          if (data?.type === 'getData') {
            this.listData = data.data
          }
          if (data?.type === 'heightChange') {
            if (this.$refs?.myFrame?.style) {
              this.$refs.myFrame.style.minHeight = data.data + 35 +'px'
              console.log('min-height', data.data)
            }
          }
          console.log('listener', data)
        } catch (e) {
          console.log(e)
        }
      }
    },
    emit(data = {}) {
      // 通过broadcastChannel广播消息
      if (this.broadcastChannel?.postMessage) {
        console.log('emit::',data)
        this.broadcastChannel.postMessage(JSON.stringify(data));
      }
    },
    beforeDestroy() {
      this.broadcastChannel?.close();
      this.broadcastChannel = null;
    },
  },
}
</script>

<template>
  <iframe ref="myFrame" style="width: 100%;height: 100%;min-height: 300px; border: none;" :src="frameSrc"
          @load="load"></iframe>
</template>

<style scoped>

</style>