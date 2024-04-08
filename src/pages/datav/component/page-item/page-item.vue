<template>
  <div class="page-item" :class="{'mobile':screenType==='mobile'}" v-if="pageItem && pageItem.com_type"
       :style="stylefn(pageItem.style_json)">
    <video-card :class="{'mobile':screenType==='mobile'}" v-if="pageItem.com_type === 'videoCard'"
                :ref="pageItem.com_type" :pageItem="pageItem"></video-card>
    <current-info :class="{'mobile':screenType==='mobile'}" v-else-if="pageItem.com_type === 'currentInfo'"
                  :ref="pageItem.com_type"
                  :pageItem="pageItem"></current-info>
    <slide-list :class="{'mobile':screenType==='mobile'}" v-else-if="pageItem.com_type === 'swiper'" :ref="pageItem.com_type"
                :pageItem="pageItem"></slide-list>
    <user-list :class="{'mobile':screenType==='mobile'}" v-else-if="pageItem.com_type === 'userList'"
               :ref="pageItem.com_type" :pageItem="pageItem"></user-list>
    <notice-bar :class="{'mobile':screenType==='mobile'}" v-else-if="pageItem.com_type === 'noticeBar'"
                :ref="pageItem.com_type" :pageItem="pageItem"></notice-bar>
    <map-card :class="{'mobile':screenType==='mobile'}" v-else-if="pageItem.com_type === 'map'" :ref="pageItem.com_type"
              :pageItem="pageItem"></map-card>
    <page-item-chart :class="{'mobile':screenType==='mobile'}" v-else-if="pageItem.com_type === 'chart'"
                     :ref="pageItem.com_type" :pageParamsModel="pageParamsModel"
                     :pageItem="pageItem" :index="layout.i" :layout="layout"></page-item-chart>
    <List :class="{'mobile':screenType==='mobile'}" v-else-if="pageItem.com_type === 'list'"
          :pageParamsModel="pageParamsModel" @setPageParams="setPageParams"
          :ref="pageItem.com_type" :pageItem="pageItem"></List>
    <tab-list :class="{'mobile':screenType==='mobile'}" v-else-if="pageItem.com_type === 'tabs'"
              :pageParamsModel="pageParamsModel" :ref="pageItem.com_type"
              :pageItem="pageItem"></tab-list>
    <!-- <mix-list
      v-if="pageItem.com_type === 'list'"
      :ref="pageItem.com_type"
      :pageItem="pageItem"
    ></mix-list> -->
    <page-widget :class="{'mobile':screenType==='mobile'}" v-else-if="pageItem.com_type === '控件'" :ref="pageItem.com_type"
                 :pageItem="pageItem" :page-no="pageNo"
                 @resize="$emit('resize')"></page-widget>
    <card-group :class="{'mobile':screenType==='mobile'}" v-else-if="pageItem.com_type === 'cardGroup'"
                :ref="pageItem.com_type" :pageItem="pageItem"></card-group>
    <grid-card :class="{'mobile':screenType==='mobile'}" v-else-if="pageItem.com_type === 'grid'" :ref="pageItem.com_type"
               :pageItem="pageItem"></grid-card>
    <form-add :class="{'mobile':screenType==='mobile'}"
              v-else-if="pageItem.com_type==='form'&&pageItem.form_json&&pageItem.form_json.form_type==='新增'"
              :ref="pageItem.com_type" :pageItem="pageItem"></form-add>
    <div v-else-if="pageItem&&pageItem.com_label" :class="{'mobile':screenType==='mobile'}">{{pageItem.com_label}}</div>
  </div>
</template>

<script>
import {formatStyleData} from "../../common/index.js";
import videoCard from "./video-card.vue";
import currentInfo from "./current-info.vue";
import slideList from "./slide-list.vue";
import userList from "./user-list.vue";
import noticeBar from "./notice-bar.vue";
import mapCard from "./map-card.vue";
import basicChart from "./chart-basic.vue";
import pageItemChart from "./chart/page-item-chart.vue";
import mixList from "./mix-list/list.vue";
import List from './list/list.vue'
import pageWidget from "./widget.vue";
import cardGroup from "./card-group/card-group.vue";
import tabList from './list/tabs-list.vue'
import gridCard from './grid-card.vue'
import formAdd from './form/add.vue'
// 页面组件级 参数交互处理
import pageItemParams from '../../common/params/page-item-params-mixin.js'

export default {
  mixins: [pageItemParams],
  components: {
    videoCard,
    currentInfo,
    slideList,
    userList,
    noticeBar,
    mapCard,
    basicChart,
    pageItemChart,
    mixList,
    List,
    pageWidget,
    cardGroup,
    tabList,
    gridCard,
    formAdd
  },
  props: {
    pageItem: {
      type: Object,
    },
    layout: {
      type: Object,
    },
    screenType: String
  },
  mounted() {
    // console.log(this.pageItem)
  },
  methods: {
    onResize(i) {
      // console.log(this.$refs);
      // this.$refs[this.pageItem.com_type].onResize?.();
    },
    stylefn(style) {
      if (style) {
        let res = formatStyleData(style);
        if (this.layout?.h && this.layout?.w) {
          res.height = "100%";
          res.width = "100%";
        }
        return res;
      }
    },
  },
};
</script>

<style lang="scss">
.page-item {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-size: 100% 100%;
  color: #333;

  &.mobile {
    background-color: #eee;
    border: 1px solid #ccc;
    box-sizing: border-box;
    .mobile{
      text-align: center;
    }
  }
}
</style>
