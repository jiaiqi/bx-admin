<template>
  <div class="video_page">
    <div class="tree_left" :class="{ 'with-playback': videoChannel, 'collapsed': isCollapsed }">
      <div class="collapse-btn" @click="toggleCollapse">
        <i :class="isCollapsed ? 'el-icon-arrow-right' : 'el-icon-arrow-left'"></i>
      </div>
      <li class="tree_tl">
        <el-input
            v-model="filterText"
            placeholder="输入关键字进行快速搜索"
            size="mini"
            clearable
            class="filter-input"
        />
        <el-tree
            style="font-size: 0.875rem"
            :data="videoTree"
            :props="fieldNames"
            :default-expanded-keys="expandedKeys"
            :default-checked-keys="selectedKeys"
            show-line
            :filter-node-method="filterNode"
            @node-click="handleSelect"
            ref="tree"
        >
          <span class="custom-tree-node" slot-scope="{ node, data }" @click="setNode(data)">
            <span>{{ node.label }}</span>
            <span :title="data.chnl_online_status" class="is_online" :style="[{color:data.chnl_online_status&&data.chnl_online_status==='在线'?'#67C23A':'#909399'}]" v-if="data.isChannel&&!data.children"><i class="el-icon-s-opportunity"></i></span>
          </span>
        </el-tree>
      </li>
      <div class="playback-controls">
        <div class="control-title">历史回放</div>
        <div class="divider"></div>
        <div class="control-content">
          <el-switch
              size="mini"
              v-model="isPlaybackMode"
              @change="handlePlaybackModeChange"
              active-text="回放模式"
              inactive-text="实时模式"
          />
          <div class="record-source-title">录像来源:</div>
          <el-radio-group
              size="mini"
              v-model="recordSource"
              :disabled="!isPlaybackMode"
              class="radio-group"
          >
            <el-radio :label="2">设备录像</el-radio>
            <el-radio :label="3">中心录像</el-radio>
          </el-radio-group>
          <div class="date-picker-group">
            <el-date-picker
                size="mini"
                v-model="playbackStartTime"
                type="datetime"
                placeholder="开始时间"
                format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-dd HH:mm:ss"
                :disabled="!isPlaybackMode"
                class="date-picker"
            />
            <el-date-picker
                size="mini"
                v-model="playbackEndTime"
                type="datetime"
                placeholder="结束时间"
                format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-dd HH:mm:ss"
                :disabled="!isPlaybackMode"
                class="date-picker"
            />
          </div>
          <div class="button-group">
            <el-button size="mini" type="primary" @click="startPlayback"
                       :disabled="!isPlaybackMode || isPlaying || !videoChannel">开始回放
            </el-button>
            <el-button size="mini" type="danger" @click="stopPlayback" :disabled="!isPlaying || !videoChannel">
              停止回放
            </el-button>
          </div>
        </div>
      </div>
    </div>
    <div class="video_cot" id="play_dh"></div>
  </div>
</template>
<script setup>
import {onMounted, ref, watch} from 'vue';
import VideoUtil from "@/pages/dahua-video/video";
import {Message} from 'element-ui';
import { Notification } from 'element-ui';
const Videos = new VideoUtil();
const videoTree = ref([]);
const expandedKeys = ref([]);
const selectedKeys = ref([]);
const videoChannel = ref('');
const fieldNames = {
  children: 'children',
  label: 'area_name',
  value: 'area_no'
}
const filterText = ref(''); //树节点过滤使用
const tree = ref(null);

// 添加历史回放相关的状态变量
const playbackStartTime = ref('');
const playbackEndTime = ref('');
const isPlaying = ref(false);
const isPlaybackMode = ref(false);
const selectedWindow = ref(0);
const recordSource = ref(2); // 默认选择设备录像
// 添加收缩状态控制
const isCollapsed = ref(false);
// 记录每个窗口的通道信息
const windowChannels = ref({});
// 保存回放前的播放器状态
const previousPlayerState = ref({
  division: 9, // 默认9宫格
  channels: {}
});

let myVideoPlayer = null;
const LoginInfo = window.APP_CONFIG.videoInfo;

const setNode = (data) => {
  console.log('选中节点数据：', data);
}

// 切换收缩状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const handleSelect = (selectedKeys, e) => {
  let node = e.data ? e.data : {};
  if(node && node.isChannel && !node.chnl_online_status || node.chnl_online_status ==='离线') {
    return Notification({
      title: '注意!',
      message: '当前视频离线',
      type: 'warning',
      position: 'top-left',
      showClose: false,
      duration: 2000
    });
  }
  if (node && node.isChannel && node.chnl_online_status && node.chnl_online_status ==='在线') {
    videoChannel.value = node.chnl_no;
    console.log('选中在线通道：', videoChannel.value);
  }
}

//处理节点数据重新组装
const processTreeData = (data) => {
  return data.map(item => {
    const newItem = {...item};

    // 处理当前节点的 channels
    if (item.channels && item.channels.length > 0) {
      const channelsParent = {
        area_name: '视频通道',
        area_no: `${item.area_no}_channels`,
        children: item.channels.map(channel => ({
          ...channel,
          area_name: channel.chnl_name,
          area_no: channel.chnl_no,
          isChannel: true
        }))
      };
      newItem.children = [
        ...(newItem.children || []),
        channelsParent
      ];
    }

    // 递归处理子节点
    if (newItem.children) {
      newItem.children = processTreeData(newItem.children);
    }
    return newItem;
  });
};

//获取视频节点树
const getVideoInfo = () => {
  Videos.getVideoListByArea().then(res => {
    if (res.data.state !== 'SUCCESS') return;
    videoTree.value = processTreeData(res.data.data);
  }).catch(err => {
    console.error('获取视频节点树失败：', err);
  });
}

// 监听过滤文本变化
watch(filterText, (val) => {
  tree.value?.filter(val);
});

// 过滤节点方法
const filterNode = (value, data) => {
  if (!value) return true;
  return data.area_name.toLowerCase().includes(value.toLowerCase());
};

// 处理回放模式切换
const handlePlaybackModeChange = (checked) => {
  console.log('切换回放模式：', checked);
}

// 开始回放
const startPlayback = () => {
  if (!playbackStartTime.value || !playbackEndTime.value) {
    return Message.warning('请选择开始和结束时间');
  }

  if (new Date(playbackStartTime.value) > new Date(playbackEndTime.value)) {
    return Message.warning('开始时间不能大于结束时间');
  }

  if (!videoChannel.value) {
    return Message.warning('请选择要回放的通道');
  }

  isPlaying.value = true;
  console.log('开始回放，通道：', videoChannel.value);
}

// 停止回放
const stopPlayback = () => {
  isPlaying.value = false;
  console.log('停止回放');
}

onMounted(() => {
  // sessionStorage.removeItem('bx_auth_ticket');
  // sessionStorage.setItem('bx_auth_ticket','xabxdzkj-44752573-edee-460d-a6e6-f53638ab5bef');
  getVideoInfo();
})
</script>

<style scoped lang="scss">
li {
  list-style: none;
}
.is_online{
  font-size: 0.75rem;
  margin-left: 0.3125rem;
}
.video_page {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0.625rem;

  .tree_left {
    width: 11%;
    height: 100%;
    overflow: auto;
    background: #fff;
    display: flex;
    flex-direction: column;
    transition: width 0.3s ease;
    position: relative;

    &.with-playback {
      width: 20%;
    }

    &.collapsed {
      width: 40px !important;
      overflow: hidden;

      .tree_tl,
      .playback-controls {
        opacity: 0;
        visibility: hidden;
      }
    }

    .collapse-btn {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 20px;
      height: 40px;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: 1px solid #dcdfe6;
      border-right: none;
      border-radius: 4px 0 0 4px;
      z-index: 1;

      &:hover {
        background: #f5f7fa;
      }
    }

    .tree_tl {
      flex: 1;
      overflow: auto;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    }

    .playback-controls {
      padding: 10px;
      border-top: 1px solid #ebeef5;
      background: #fff;
      transition: opacity 0.3s ease, visibility 0.3s ease;

      .control-title {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 10px;
        color: #303133;
      }

      .control-content {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .radio-group {
          width: 100%;
          display: flex;
          justify-content: space-between;
        }

        .date-picker-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;

          .date-picker {
            width: 100%;
          }
        }

        .button-group {
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }
      }
    }
  }

  .video_cot {
    flex: 1;
    height: 100%;
    background: #000;
  }
}

.filter-input {
  margin-bottom: 10px;
  width: 100%;
}

.record-source-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.divider {
  height: 1px;
  background-color: #ebeef5;
  margin: 0 0 10px 0;
  width: 100%;
}
</style>