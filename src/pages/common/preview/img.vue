<template>
  <div style="display: flex;justify-content: center;align-items: center;height: 100%;">
    <viewer ref="viewer" :images="images" v-if="images && images.length > 0" @inited="inited" style="width: 100%;text-align: center;">
      <img v-for="src in images" :key="src" :src="src" style="width: 50%;min-width: 500px;margin:0 auto;cursor: pointer;box-shadow: 0 2px 12px 0 rgba(0,0,0,.5);">
      <!-- <el-image v-for="src in images" :src="src" style="width: 80%;" fit="contain" @click="show"></el-image> -->
    </viewer>
  </div>
</template>

<script>
export default {
  name: "ImagePreview",
  props: {
    url: String,
  },
  data() {
    return {
      path: ""
    }
  },
  computed: {
    images() {
      if (this.path?.includes(",")) {
        return this.path.split(",")
      } else if (this.path) {
        return [this.path]
      } else {
        return []
      }
    }
  },
  methods: {
    inited(viewer) {
      // this.$viewer = viewer
    },
    show() {
      this.$refs.viewer?.$viewer?.show()
    },
  },
  mounted() {
    if (this.props?.url) {
      this.path = this.props.url
    } else if (this.$route.query.url) {
      this.path = this.$route.query.url
    }
    // this.$nextTick(() => {
    //   if (this.path) {
    //     this.show()
    //   }
    // })
  }
}
</script>

<style
  lang="scss"
  scoped
></style>