<template>
  <div
    class="map-view custom-map"
    v-if="mapJson && mapJson.map_base_supplier === '自定义底图'"
    :style="{
      backgroundImage: `url(${baseImage})`,
      backgroundSize: '100% 100%',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }"
    @click="tapMarker()"
  >
    <div
      class="map-marker"
      :style="getItemPosition(item)"
      @click.stop="tapMarker(item)"
      :class="{ 'cursor-pointer': !!cardUnitJson }"
      v-for="item in markerList"
      :key="item.id"
    >
      <div class="popover-content" 
          v-if="activeMarker && activeMarker.id === item.id"
      >
        <card-group-cell
          :page-item="pageItem"
          :cellsLayout="[cardUnitJson]"
          :cell-item-data="activeMarker"
        ></card-group-cell>
      </div>
      <img
        :src="getItemIcon(item)"
        class="marker-icon"
        v-if="getItemIcon(item)"
      />
    </div>
  </div>

  <div class="map-view" v-else>
    <!-- 定义地图显示容器 -->
    <div :id="mapId" class="map-container"></div>

    <div class="map-legend">
      <div
        v-for="item in iconJson"
        :key="item.legend_label"
        class="legend-wrap"
      >
        <img :src="getImagePath(item.icon)" class="legend-icon" />
        <span class="legend-text">{{ item.legend_label || "" }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, nextTick, computed } from "vue";
import CardCellPart from "./card-group-cell/card-cell-part-without-card-group.vue";
import { getImagePath } from "../../common/http";
import {
  initMapData,
  generateMapID,
  initMap,
} from "../../common/functions/mapUtils.js";
import { $selectList } from "@/common/http";
import cardGroupCell from "./card-group-cell/card-group-cell.vue";

const props = defineProps({
  pageItem: Object,
});

const mapJson = computed(() => {
  return props.pageItem.map_json || {};
});
const mapBaseSupplier = computed(() => {
  return mapJson.value.map_base_supplier || "";
});
const baseImage = computed(() => {
  return mapBaseSupplier.value === "自定义底图"
    ? getImagePath(mapJson.value.base_image)
    : "";
});

const mapInstance = ref(null); // 地图实例
const mapId = ref(""); // 地图编号
const iconJson = ref([]); //地图图例
const markerInfo = ref({});

const markerList = ref([]);
const activeMarker = ref({});
const cardUnitJson = computed(() => mapJson.value.tips_card_unit_json);

// const title = ref("");
// const longitude = ref("");
// const latitude = ref("");
// const scale = ref(18); //地图缩放级别
function initTencentMap() {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src =
    "https://map.qq.com/api/gljs?v=1.exp&key=G3VBZ-CKMKB-4CFUZ-JZLSE-676K6-J4FWP";
  document.head.appendChild(script);
  mapId.value = generateMapID(props.pageItem?.com_no, "map-container");
  setTimeout(() => {
    nextTick(() => {
      mapInstance.value = initMap(mapId.value, props.pageItem);
      initMapData(mapInstance.value, props.pageItem).then((markerData) => {
        markerInfo.value = markerData;
        if (markerData.iconJson) {
          iconJson.value = markerData.iconJson;
        }
        // if(markerData?.center&&markerData?.markers){
        // }
      });
    });
  }, 1000);
}

async function initCustomMap() {
  console.log("自定义底图");
  let list = [];
  if (
    props.pageItem.srv_req_type === "请求数据" &&
    props.pageItem.srv_req_json
  ) {
    const reqJson = props.pageItem.srv_req_json;
    const req = props.pageItem.srv_req_json;
    const url = `/${reqJson.mapp}/select/${reqJson.serviceName}`;
    const res = await $selectList(url, req);
    if (res.ok) {
      list = res.data;
    }
  } else if (props.pageItem.srv_req_type === "模拟数据") {
    list = props.pageItem.mock_data_json;
  }
  return list;
}

function getItemIcon(item = {}) {
  if (mapJson.value?.marker_icon_col && item[mapJson.value?.marker_icon_col]) {
    return getImagePath(item[mapJson.value?.marker_icon_col]);
  } else if (mapJson.value?.icon_default) {
    return getImagePath(mapJson.value?.icon_default);
  }
  return "";
}

function getItemPosition(item = {}) {
  let post = {
    left: 0,
    top: 0,
  };
  if (mapJson.value?.x_col && item[mapJson.value?.x_col]) {
    post.left = item[mapJson.value?.x_col] + "%";
  }
  if (mapJson.value?.y_col && item[mapJson.value?.y_col]) {
    post.top = item[mapJson.value?.y_col] + "%";
  }
  return post;
}

function tapMarker(item) {
  activeMarker.value = item;
}

onMounted(() => {
  // 实例化地图
  if (mapBaseSupplier.value === "腾讯地图") {
    initTencentMap();
  } else if (mapBaseSupplier.value === "自定义底图") {
    initCustomMap().then((res) => {
      markerList.value = res;
    });
  }
});
</script>

<style lang="scss" scoped>
.map-view {
  width: 100%;
  height: 100%;
  position: relative;
}
.custom-map {
  .map-marker {
    position: absolute;
    transform: translate(-50%, -50%);
    &.cursor-pointer{
      cursor: pointer;
    }
    .marker-icon {
      width: 30px;
      // height: 30px;
    }
    .popover-content {
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translate(-50%, -100%);
      z-index: 1000;
      border-radius: 5px;
      box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
      &:after{
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translate(-50%, 0);
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 5px solid #fff;
      }
    }
  }
}
.map-container {
  width: 100%;
  height: 100%;
}

.map-legend {
  position: absolute;
  right: 0;
  bottom: 0;
  background: #fff;
  border-radius: 5px;
  z-index: 10;
  .legend-wrap {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
  }

  .legend-icon {
    width: 30px;
    height: 30px;
    vertical-align: text-top;
  }

  .legend-text {
    color: #202e64;
    font-size: 14px;
    line-height: 30px;
    margin: 0 5px;
  }
}
</style>
