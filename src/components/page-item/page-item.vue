<template>
  <div class="page-item" v-if="pageItem && pageItem.com_type" :style="stylefn(pageItem.style_json)">
    <video-card v-if="pageItem.com_type === 'videoCard'" :pageItem="pageItem"></video-card>
    <current-info v-if="pageItem.com_type === 'currentInfo'" :pageItem="pageItem"></current-info>
    <slide-list v-if="pageItem.com_type === 'swiper'" :pageItem="pageItem"></slide-list>
    <user-list v-if="pageItem.com_type === 'userList'" :pageItem="pageItem"></user-list>
    <notice-bar v-if="pageItem.com_type === 'noticeBar'" :pageItem="pageItem"></notice-bar>
    <map-card v-if="pageItem.com_type === 'map'" :pageItem="pageItem"></map-card>
  </div>
</template>

<script>
import {
  formatStyleData
} from '@/common/common.js'
import videoCard from './video-card'
import currentInfo from './current-info'
import slideList from './slide-list'
import userList from './user-list'
import noticeBar from './notice-bar'
import mapCard from './map-card'

export default {
  components: {
    videoCard,
    currentInfo,
    slideList,
    userList,
    noticeBar,
    mapCard,
  },
  props: {
    pageItem: {
      type: Object
    },
  },
  mounted() {
    // console.log(this.pageItem)
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