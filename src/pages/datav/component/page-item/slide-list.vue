<template>
  <div class="swiper-list" v-if="!swiperList || swiperList.length === 0">
    <span v-if="pageItem && pageItem.com_label">{{ pageItem.com_label }}</span>
  </div>
  <div
    class="swiper-list"
    :class="{ 'left-bottom-dot': dotPostion === 'left-bottom' }"
    id="home-swiper-list"
    :data-order-no="pageItem['order_no']"
    v-else-if="pageItem"
  >
    <!-- <div class="home-btn" @click="setHomePage" v-if="pageItem.show_set_home!=='否'">
			<button class=" cu-btn shadow-blur" v-if="userInfo && userInfo.home_store_no !== storeInfo.store_no">
				<text class="cuIcon-home"></text></button>
		</div> -->
    <el-carousel
      class="card-swiper square-dot"
      :indicator-dots="false"
      :style="[tagStylefn(pageItem.swiper_json.style_json)]"
      :circular="true"
      :autoplay="true"
      :interval="5000"
      duration="500"
      @change="swiperChange"
      indicator-color="#333"
      indicator-active-color="#E8E8E8"
      v-if="swiperList.length > 1 && swiperStyle === '卡片'"
    >
      <el-carousel-item
        v-for="(item, index) in swiperList"
        :key="index"
        :class="current == index ? 'cur' : ''"
      >
        <div class="swiper-item">
          <div class="swiper-item-box">
            <video
              :src="item.url"
              controls
              :id="item.store_video_file"
              :poster="item.videoPoster"
              v-if="item.file_type === '视频' && current === index"
            ></video>
            <img
              lazy-load
              :src="item.url"
              mode="scaleToFill"
              v-else-if="!item.store_video_file || item.file_type !== '视频'"
              @click.stop="toDetail(item)"
            />
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
    <div class="swiper-cot"  v-else-if="swiperList.length > 1" style="height: 100%">
           <div class="swiper-mian" :style="[{height:(setSwiperBlock?'75%':'100')}]">
             <el-carousel
                 ref="carousel"
                 class="screen-swiper item-box rectangle-dot"
                 :style="[tagStylefn(pageItem.swiper_json.style_json)]"
                 easing-function="linear"
                 indicator-active-color="#00aaff"
                 :indicator-dots="true"
                 :circular="true"
                 :autoplay="autoplay"
                 :interval="interval"
                 duration="500"
                 @change="swiperChange"
             >
               <el-carousel-item
                   v-for="(item, index) in swiperList"
                   :key="item.url"
                   :data-id="item.id"
                   :class="current == index ? 'cur' : ''"
               >
                 <!--   <div class="swiper-item-box" v-if="item.file_type ==='视频'&&current===index">
                   <video :src="item.url" controls :autoplay="true" :id="item.store_video_file" :poster="item.videoPoster"></video>
                 </div> -->
                 <div class="swiper-item-box" @click.stop="toDetail(item)">
                   <img
                       :src="item.videoPoster"
                       mode="scaleToFill"
                       v-if="item.file_type === '视频'"
                   />
                   <img
                       :src="item.url"
                       mode="scaleToFill"
                       v-else-if="!item.store_video_file || item.file_type !== '视频'"
                   />
                   <div class="title" v-if="item._title">{{ item._title }}</div>
                 </div>
               </el-carousel-item>
             </el-carousel>
           </div>
            <div class="thumbnails" v-if="setSwiperBlock">
                <img v-for="(item, index) in swiperList" :key="item.id" :src="item.url" @click="changeCarousel(index)" alt="" style="width: 100px; margin: 5px; cursor: pointer;">
         </div>
    </div>

    <div class="single-media" v-else>
      <div
        class="swiper-item-box"
        :style="[tagStylefn(pageItem.swiper_json.style_json)]"
        v-for="(item, index) in swiperList"
        :key="item.url"
        :data-id="item.id"
      >
        <video
          :src="item.url"
          controls
          v-if="item.file_type === '视频' && current === index"
          :id="item.store_video_file"
          :poster="item.videoPoster"
        ></video>
        <img
          lazy-load
          :src="item.url"
          mode="scaleToFill"
          v-else-if="!item.store_video_file || item.file_type !== '视频'"
          @click.stop="toDetail(item)"
        />
        <div class="title" v-if="item._title">{{ item._title }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatStyleData, rpx2px } from "../../common/index.js";

export default {
  name: "home-swiper-list",
  computed: {
    //判定是否含有缩略图显示选项
    setSwiperBlock(){
      return this.pageItem?.swiper_options
    },
    swiperStyle() {
      return this.pageItem?.swiper_style || "平铺";
    },
    interval() {
      return this.pageItem?.more_config?.interval || 5000;
    },
    autoplay() {
      return this.pageItem?.more_config?.autoplay === false ? false : true;
    },
    dotPostion() {
      return this.pageItem?.more_config?.dotPosition || "bottom-center";
    },
    height() {
      if (this.pageItem?.img_ratio) {
        return `${350 * this.pageItem?.img_ratio}px`;
      }
      return `${this.pageItem?.more_config?.swiperHeight || 150}px`;
    },
    calcStyle() {
      let obj = {};
      if (
        this.pageItem &&
        (this.pageItem.margin || this.pageItem.margin == 0)
      ) {
        obj.margin = this.pageItem.margin;
      }
      if (this.height) {
        obj.height = this.height;
        obj.minHeight = this.height;
      }
      return this.pageItem.swiper_json.style_json;
      // return `height:${obj.height}!important;min-height:${obj.minHeight}`
    },
  },
  props: {
    pageItem: {
      type: Object,
    },
    beforeClick: {
      type: Function,
      default: null,
    },
    queryOptions: Object,
  },
  data() {
    return {
      activeIndex:0,
      storeNo: "",
      current: 0,
      swiperList: [],
      videoContext: {},
      isFirstSwiperList: false,
    };
  },
  mounted() {

    this.getSwiperList();
  },
  methods: {
    handleChange(index) {
      this.activeIndex = index;
    },
    changeCarousel(index) {
      this.$refs.carousel.setActiveItem(index);
    },
    tagStylefn(style) {
      if (style) {
        return formatStyleData(style);
      }
    },
    swiperChange(e) {
      if (this.videoContext.parse) {
        this.videoContext.parse();
      }
      this.current = e?.detail?.current || e;
      if (this.swiperList[this.current].file_type === "视频") {
        // this.videoContext = uni.createVideoContext(
        //   this.swiperList[this.current].store_video_file,
        //   this
        // );
      }
    },
    async fetchJumpJson(jump_no) {
      const url = `${window.backendIpAddr}/config/select/srvpage_cfg_jump_action_select`;
      const req = {
        serviceName: "srvpage_cfg_jump_action_select",
        colNames: ["*"],
        condition: [
          {
            colName: "jump_no",
            ruleType: "like",
            value: jump_no,
          },
        ],
        page: {
          pageNo: 1,
          rownumber: 1,
        },
      };
      const res = await this.$http.post(url, req);
      if (res?.data?.data?.length) {
        return res.data.data[0];
      }
    },
    async toDetail(item) {
      if (
        this.pageItem?.swiper_json?.img_origin === "接口请求" &&
        item[this.pageItem?.swiper_json?.srv_col_jump_no]
      ) {
        const jumpJson = await this.fetchJumpJson(
          item[this.pageItem?.swiper_json?.srv_col_jump_no]
        );
        if (jumpJson?.row_json) {
          this.jumpAction(jumpJson?.row_json, item);
        }
        return;
      }
      let jumpUrl = "";
      if (jumpUrl) {
        // uni.navigateTo({
        //   url: jumpUrl,
        // });
      } else if (item.mini_program_url) {
        
      } else if (item.content_no || item.content) {
        // 跳到文章详情
        this.$router.push({
          path: `/site/PG2504171010470001`,
          query: {
            content_no: item.content_no || item.article_no || '',
            id: item.id,
          }
        })
      } else {
        // this.toPredivimg(item.url);
      }
    },
    async getFilePath(file_no) {
      let url = `${window.backendIpAddr}/file/select/srvfile_attachment_guest_select`;
      let req = {
        serviceName: "srvfile_attachment_guest_select",
        colNames: ["*"],
        condition: [
          {
            colName: "file_no",
            value: file_no,
            ruleType: "eq",
          },
        ],
      };
      if (file_no) {
        let response = await this.$http.post(url, req);
        // console.log('srvfile_attachment_select', response);
        if (
          response.data.state === "SUCCESS" &&
          response.data.data.length > 0
        ) {
          return response.data.data;
        }
      }
    },
    async getSwiperList() {
      const swiperJson = this.pageItem?.swiper_json;
      if (swiperJson?.image_origin === "接口请求") {
        let reqJson =
          this.pageItem.swiper_json.srv_req_json || this.pageItem.srv_req_json;
        const app =
          reqJson.mapp ||
          this.resolveDefaultSrvApp?.() ||
          this.$route.query.srvApp;
        const url = `/${app}/select/${reqJson.serviceName}`;
        const res = await this.$http.post(url, reqJson);
        if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
          this.swiperList = res.data.data.map((item, index) => {
            return {
              ...item,
              url: this.getImagePath(item[swiperJson?.srv_col_image]),
              _title: item[swiperJson?.srv_col_title || "title"] || "",
            };
          });
        }
      } else if (swiperJson?.image_origin === "集中传图" && swiperJson?.image) {
        let res = await this.getFilePath(swiperJson?.image);
        if (Array.isArray(res)) {
          this.swiperList = res.reduce((pre, cur) => {
            if (cur.fileurl) {
              cur.url =
                `${window.backendIpAddr}/file/download?filePath=` +
                cur.fileurl +
                "&bx_auth_ticket=" +
                sessionStorage.getItem("bx_auth_ticket");
            }
            pre.push(cur);
            return pre;
          }, []);
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.swiper-list {
  // border-radius: 20rpx;
  overflow: hidden;
  position: relative;
  // min-width: 335px;
  height: 100%;
  width: 100%;

  .item-box {
    height: 100%;
    width: 100%;
  }

  ::v-deep .el-carousel__container {
    height: 100%;
    width: 100%;
  }

  .swiper-item-box {
    width: 100%;
    height: 100%;
    position: relative;
    .title {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      z-index: 10;
      background-color: rgba($color: #000000, $alpha: 0.5);
      color: #fff;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 10px;
      box-sizing: border-box;
    }
    video,
    img {
      width: 100%;
      height: 100%;
      object-fit: fill;
      min-height: 100px;
    }

  }

  // @media screen and (min-width: 1300px) {
  // 	width: min( 400px,100%);
  // 	margin: auto;
  // }

  .home-btn {
    position: absolute;
    right: 20rpx;
    top: 20rpx;
    z-index: 10;

    .cu-btn {
      width: 80rpx;
      height: 80rpx;
      line-height: 80rpx;
      text-align: center;
      background-color: rgba($color: #000000, $alpha: 0.1);
      // border: 1rpx solid #c2c2c2;
      color: #fff;
      border-radius: 50%;
      font-size: 40rpx;
      margin: 0;
      padding: 0;
    }

    .cuIcon-home {
    }
  }
}

.left-bottom-dot {
  // uni-swiper[class*="-dot"] .wx-swiper-dots,
  // uni-swiper[class*="-dot"] .a-swiper-dots,
  // uni-swiper[class*="-dot"] .uni-swiper-dots {
  //   justify-content: flex-start !important;
  // }
}
.thumbnails {
  display: flex;
  justify-content: center;
  margin-top: 10px; /* 根据需要调整 */
}
.thumbnails div {
  margin: 0 5px; /* 根据需要调整 */
  cursor: pointer; /* 鼠标悬停时显示手形图标 */
}
.thumbnails div.active img {
  border: 2px solid blue; /* 当前激活的缩略图样式 */
}
</style>
