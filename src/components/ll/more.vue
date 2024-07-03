<template >
  <div :class="className" style="display: flex">
    <div class="ll-more">更多</div>
    <img
      style="width: 23px; height: 20px; position: relative; left: -5px"
      :src="require('@/assets/image/moreIcon.png')"
    />
  </div>
</template>

<script>
export default {
  components: {},
  mixins: [],
  props: {
    isAbsolute: {
      type: Boolean,
    },
  },
  computed: {
    className() {
        console.log(this,"parent=")
      if (this.isAbsolute) {
        return "ll-more-absolute";
      } else {
        return "";
      }
    },
  },
  provide: {
    foo: "bar",
  },
};
</script>

<style scoped>
 .ll-more-absolute{
    position: absolute;
    right:10px;
 }

.ll-more {
    cursor: pointer;
  color: rgba(193, 198, 213, 1);
  font-size: 14px;
  text-align: right;
  font-family: PingFangSC-regular;
}
</style>
