<script>
import broadcastChannelMixin from "../mixin/broadcast-channel-mixin";

export default {
  name: "custom-frame",
  mixins: [broadcastChannelMixin],
  props: {
    src: {
      type: String
    },
    type: {
      type: String,
      default: "add"
    },
    serviceName: {
      type: String,
      default: "broadCast"
    },
    mainService: {
      type: String,
    },
    colSrv: String,
    data: Object,
    memInitdatasAdd: Array,
    disabled: Boolean,
    isTree: Boolean,
    defaultCondition: {
      type: Array,
      default: function () {
        return [];
      }
    },
    childforeignkey: {
      type: Object,
      default: function () {
        return {};
      }
    }
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
          type: 'initDataChange',
          data: newValue
        })
      }
    }
  },
  computed: {
    frameSrc() {
      let src = `/dataview/#/${this.broadCastName}/${this.type}/${this.mainService}/${this.resolveDefaultSrvApp()}/${this.serviceName}`
      // if(Array.isArray(this.memInitdatasAdd)&&this.memInitdatasAdd.length){
      //   src += `?memInitdatasAdd=${encodeURIComponent(JSON.stringify(this.memInitdatasAdd))}`
      // }
      // let src = `http://localhost:5173/dataview/#/childList/${this.type}/${this.broadCastName}/${this.resolveDefaultSrvApp()}/${this.serviceName}`
      if (location.hostname === 'localhost') {
        src = `http://localhost:5173${src}`
      }
      if (this.colSrv && this.colSrv !== this.serviceName) {
        src += `?colSrv=${this.colSrv}`
      }
      if (this.isTree) {
        src += src?.includes('?') ? '&isTree=true' : `?isTree=true`
      }
      if (Array.isArray(this.defaultCondition) && this.defaultCondition.length > 0) {
        this.defaultCondition.forEach(item => {
          if (item.value && ![null, undefined, '', 'null', 'undefined'].includes(item.value)) {
            let str = `${item.colName}=${item.value}`
            src += src?.includes('?') ? `&${str}` : `?${str}`
          }
        })
      }
      if (this.disabled === true) {
        src += src?.includes('?') ? '&disabled=true' : `?disabled=true`
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
      this.emit({
        childListCfg: this.data
      })
      this.$emit("list-loaded", this)
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
            console.log('heightChange', data)
            if (this.$refs?.myFrame?.style) {
              this.$refs.myFrame.style.minHeight = data.data + 35 + 'px'
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
        console.log('emit::', data)
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
  <iframe
    ref="myFrame"
    style="width: 100%;height: 100%;min-height: 300px; border: none;"
    :src="frameSrc"
    @load="load"
  ></iframe>
</template>

<style scoped></style>