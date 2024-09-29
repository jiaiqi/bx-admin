<template>
  <div class="app-container">
    <div class="bg"></div>
  </div>
</template>

<script>
  export default {
    
  }
</script>

<style lang="scss" scoped>
.app-container{
  width: 100%;
  height: 100%;
  background-color: #EAF0F7;
  padding: 34px;
  overflow-y: auto;
}
.bg{
  height: 1655px;
  width: 100%;
  background-repeat: no-repeat;
  max-width: 1347px;
  background-size: contain;
  background-image: url(./static/img/report.png);
  margin: 0 auto;
}
</style>