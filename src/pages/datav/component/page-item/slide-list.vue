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
    <div
      class="swiper-cot"
      v-else-if="swiperList.length > 1"
      style="height: 100%"
    >
      <div
        class="swiper-mian"
        :class="{
          'thumbnails-mode': useThumbnails,
        }"
      >
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
              <div
                class="title"
                v-if="item._title && !isTopSwiperBottomContent"
              >
                {{ item._title }}
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
      <div
        class="content-card"
        v-if="isTopSwiperBottomContent && activeData && activeData.id"
      >
        <card-group-cell
          :page-item="pageItem"
          :cellsLayout="[getCardJson]"
          :cell-data="[item]"
          v-for="(item, index) in swiperList"
          v-if="index === current"
          :key="item.id"
        ></card-group-cell>
      </div>
      <div class="thumbnails-container" v-else-if="useThumbnails">
        <button
          class="scroll-btn scroll-btn-left"
          @click="scrollThumbnails('left')"
          :disabled="scrollPosition <= 0"
        >
          <i class="el-icon-arrow-left"></i>
        </button>
        <div class="thumbnails" ref="thumbnailsContainer">
          <img
            v-for="(item, index) in swiperList"
            :key="item.id"
            :src="item.url"
            @click="changeCarousel(index)"
            :class="{ active: current === index }"
            alt=""
            class="thumbnail-img"
          />
        </div>
        <button
          class="scroll-btn scroll-btn-right"
          @click="scrollThumbnails('right')"
          :disabled="scrollPosition >= maxScrollPosition"
        >
          <i class="el-icon-arrow-right"></i>
        </button>
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
import cardGroupCell from "./card-group-cell/card-group-cell.vue";

export default {
  name: "home-swiper-list",
  components: {
    cardGroupCell,
  },
  computed: {
    //判定是否含有缩略图显示选项
    useThumbnails() {
      return this.pageItem?.swiper_json?.swiper_options?.includes("缩略图");
    },
    isTopSwiperBottomContent() {
      return this.pageItem?.swiper_json?.swiper_options?.includes("上图下文");
    },
    getCardJson() {
      return this.pageItem?.swiper_json?.card_json;
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
    activeData() {
      return this.swiperList?.[this.current];
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
      activeIndex: 0,
      storeNo: "",
      current: 0,
      swiperList: [],
      videoContext: {},
      isFirstSwiperList: false,
      scrollPosition: 0,
      maxScrollPosition: 0,
    };
  },
  mounted() {
    this.getSwiperList();
  },
  updated() {
    this.$nextTick(() => {
      this.updateScrollPosition();
    });
  },
  methods: {
    handleChange(index) {
      this.activeIndex = index;
    },
    changeCarousel(index) {
      this.$refs.carousel.setActiveItem(index);
    },
    scrollThumbnails(direction) {
      const container = this.$refs.thumbnailsContainer;
      if (!container) return;

      const scrollAmount = 100; // 一个图片的宽度

      if (direction === "left") {
        this.scrollPosition = Math.max(0, this.scrollPosition - scrollAmount);
      } else {
        this.scrollPosition = Math.min(
          this.maxScrollPosition,
          this.scrollPosition + scrollAmount
        );
      }

      container.scrollTo({
        left: this.scrollPosition,
        behavior: "smooth",
      });
    },
    updateScrollPosition() {
      const container = this.$refs.thumbnailsContainer;
      if (!container) return;

      this.maxScrollPosition = Math.max(
        0,
        container.scrollWidth - container.clientWidth
      );
    },
    scrollToActiveThumbnail() {
      if (!this.useThumbnails) return;

      const container = this.$refs.thumbnailsContainer;
      if (!container) return;

      const thumbnailWidth = 100; // 图片宽度
      const thumbnailGap = 5; // 图片间距
      const itemWidth = thumbnailWidth + thumbnailGap;

      // 计算当前active thumbnail的位置
      const activeItemLeft = this.current * itemWidth;
      const activeItemRight = activeItemLeft + thumbnailWidth;

      // 获取容器的可视区域
      const containerWidth = container.clientWidth;
      const currentScrollLeft = container.scrollLeft;
      const visibleLeft = currentScrollLeft;
      const visibleRight = currentScrollLeft + containerWidth;

      // 判断是否需要滚动
      let newScrollPosition = currentScrollLeft;

      if (activeItemLeft < visibleLeft) {
        // 如果active item在可视区域左侧，滚动到该item
        newScrollPosition = activeItemLeft;
      } else if (activeItemRight > visibleRight) {
        // 如果active item在可视区域右侧，滚动使其显示在右边界
        newScrollPosition = activeItemRight - containerWidth;
      }

      // 确保滚动位置在有效范围内
      newScrollPosition = Math.max(
        0,
        Math.min(newScrollPosition, this.maxScrollPosition)
      );

      if (newScrollPosition !== currentScrollLeft) {
        this.scrollPosition = newScrollPosition;
        container.scrollTo({
          left: newScrollPosition,
          behavior: "smooth",
        });
      }
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
      this.$nextTick(() => {
        // 自动滚动thumbnails到当前active的图片
        this.scrollToActiveThumbnail();
      });
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
            content_no: item.content_no || item.article_no || "",
            id: item.id,
          },
        });
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
        reqJson = JSON.parse(
          this.renderStr(JSON.stringify(reqJson), { ...this.$route.query })
        );
        const res = await this.$http.post(url, reqJson);
        if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
          this.swiperList = res.data.data.map((item, index) => {
            return {
              ...item,
              url: this.getImagePath(item[swiperJson?.srv_col_image]),
              _title: item[swiperJson?.srv_col_title || "title"] || "",
            };
          });
          if (swiperJson?.swiper_options?.includes("单行数据多张图片")) {
            const fileNo = res.data.data[0]?.[swiperJson?.srv_col_image];
            if (fileNo) {
              const response = await this.selectFileList(fileNo);
              let list = [];
              const prefix = this.serviceApi().downloadFile;
              for (let i in response.body.data) {
                let file = response.body.data[i];
                file.name = response.body.data[i].src_name;
                file.url = `${prefix}${response.body.data[i].fileurl}`;
                if (file?.fileurl?.indexOf("http") === 0) {
                  file.url = file.fileurl;
                }
                list.push(file);
              }
              this.swiperList = list;
            }
          }
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
  }
}

.thumbnails-container {
  display: flex;
  align-items: center;
  margin-top: 10px;
  position: relative;
}

.thumbnails {
  display: flex;
  overflow-x: hidden;
  scroll-behavior: smooth;
  flex: 1;
  margin: 0 ;
  gap: 5px;
}

.thumbnail-img {
  width: 100px;
  height: 60px;
  cursor: pointer;
  object-fit: cover;
  border: 2px solid transparent;
  border-radius: 4px;
  transition: border-color 0.3s ease;
  flex-shrink: 0;
  filter: opacity(0.3);
}

.thumbnail-img:hover {
  border-color: #409eff;
  filter: opacity(1);
}

.thumbnail-img.active {
  border-color: #409eff;
  filter: opacity(1);
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.3);
}

.scroll-btn {
  width: 24px;
  height: 58px;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  background-color: #bdb6b6;
  color: #fff;
}

.scroll-btn:hover:not(:disabled) {
  background-color: #858585;
  font-size: 20px;
}

.scroll-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.scroll-btn-left {
  margin-right: 5px;
}

.scroll-btn-right {
  margin-left: 5px;
}
.thumbnails-mode {
  :deep(.el-carousel) {
    .el-carousel__indicators {
      display: none;
    }
  }
}
</style>
