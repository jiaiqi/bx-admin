<template>
  <div>
    <RichEditor :value="content" @onClick="onClick"   />
  </div>
</template>

<script>
  import RichEditor from '@/components/common/tinymce'
  export default {
    components: { RichEditor },
    data () {
      return {
        content: '<p>Hello World!</p>',
       
      }
    },
    methods: {
      onClick (e) {
        console.log(e)
      }
    },
    mounted () {
    }
  }
</script>

<style lang="scss" scoped>

</style>