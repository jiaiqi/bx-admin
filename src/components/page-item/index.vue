<template>
  <div class="page-item" v-if="comItem && comItem.com_type">
    <video-card v-if="comItem.com_type === 'videoCard'" :comItem="comItem"></video-card>
    <current-info v-if="comItem.com_type === 'currentInfo'" :comItem="comItem"></current-info>
    <slide-list v-if="comItem.com_type === 'swiper'" :comItem="comItem"></slide-list>
  </div>
</template>

<script>
import {
  formatStyleData
} from '@/common/common.js'
import videoCard from './video-card'
import currentInfo from './current-info'
import slideList from './slide-list'

export default {
  components: {
    videoCard,
    currentInfo,
    slideList
  },
  props: {
    comItem: {
      type: Object
    },
  },
  mounted() {
    // console.log(this.comItem)
  },
  methods: {    
    stylefn(style) {
      if (style) {
        return formatStyleData(style)
      }
    },
  }
}
</script>