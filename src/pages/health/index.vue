<template>
  <div>
    <RichEditor :value="content" @field-value-changed="onChange"   />
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
      onChange (e) {
        console.log(e)
      }
    },
    mounted () {
    }
  }
</script>

<style lang="scss" scoped>

</style>