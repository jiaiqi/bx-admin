<template>
  <div :class="`${color} ll-small-button-tag`">
    {{ text }}
  </div>
</template>

<script>
export default {
  data() {
    return {
      class: "",
    };
  },

  props: {
    color: {
      type: String,
    },
    text: {
      type: String,
    },
  },

  created() {},
};
</script>

<style scoped>
.ll-small-button-tag {
  box-sizing: border-box;
  padding: 2px 6px;
  border-radius: 7px;
  font-size: 12px;
}
.orange {
  background: #feebe5;
  color: #f77a50;

  border-radius: 7px;
}

.deepBlue {
  background: #3894ff;
  color: #3945ab;
  padding: 2px 6px;
  border-radius: 7px;
}
</style>
