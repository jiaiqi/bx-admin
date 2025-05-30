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
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <span>{{ node.label }}</span>
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
let myVideoPlayer = null;
const LoginInfo = {
  host: '124.160.33.135',  // icc 平台ip
  port: '4077',  //icc 平台端口 https 默认 443
  username: 'TEST',  // icc 平台用户名
  password: 'OGR28u6_cc' // icc 平台密码
}

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

// 切换收缩状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const handleSelect = (selectedKeys, e) => {
  let node = e.data ? e.data : {};
  if (node && node.isChannel) {
    videoChannel.value = node.chnl_no;
    // 重置选择的窗口为第一个
    selectedWindow.value = 0;
    // 使用固定的通道ID
    const fixedChannelId = '1002636$1$0$0';
    // 记录窗口的通道信息
    windowChannels.value[0] = fixedChannelId;
    playStartReal(fixedChannelId);
  }
}
//初始化播放器
const initPlayer = () => {
  // 如果播放器实例已存在，先销毁它
  if (myVideoPlayer) {
    try {
      // 如果正在播放，先停止播放
      if (isPlaying.value) {
        myVideoPlayer.stopPlayback();
      }
      // 销毁播放器实例
      myVideoPlayer.destroy();
      myVideoPlayer = null;
    } catch (error) {
      console.error('销毁播放器时发生错误:', error);
    }
  }

  myVideoPlayer = new VideoPlayer({
    videoId: "play_dh",
    windowType: isPlaybackMode.value ? 7 : 0,    // 播放器类型，必传， 0 - 实时预览，3 - 录像回放，7- 录像回放（支持倒放）
    usePluginLogin: true, // 采用登录 (请默认传true，插件内部自动拉流)
    pluginLoginInfo: LoginInfo,
    division: 9, // 默认显示9宫格
    draggable: false, // 窗口拖拽 【暂不支持】
    showBar: true, // 底部操作栏， 选传，【true - 显示, false - 隐藏】
    shieldClass: ['shield-class', 'select'], // 如果DOM元素被插件挡住了，把DOM元素的类名传入。
    coverShieldClass: [], // 如果插件要在dom内滚动，需要把DOM元素的类名传入，请查看案例-遮挡
    parentIframeShieldClass: [], // 有 iframe 时，top层 的 dom 元素被插件挡住了，把DOM元素的类名传入。
    // 创建播放器成功回调
    createSuccess: (versionInfo) => {
      // 初始化时默认显示9宫格
      myVideoPlayer.changeDivision(9)
    },
    // 创建播放器失败回调
    createError: (err) => {
      // 有错误码，可打印查看错误信息
      console.log(err)
    },
    // 插件公共回调
    dhPlayerMessage: (info, err) => {
    },
    // 实时预览成功回调
    realSuccess: (info) => {
    },
    // 实时预览失败回调
    realError: (info, err) => {
    },
    // 对讲成功回调
    talkSuccess: (info) => {
    },
    // 对讲失败回调
    talkError: (info, err) => {
    },
    // 录像播放成功回调
    playbackSuccess: (info) => {
    },
    // 录像播放失败回调
    playbackError: (info, err) => {
    },
    // 录像播放完成回调
    playbackFinish: (info) => {
    },
    // 抓图成功回调
    snapshotSuccess: ({base64Url, path}, info) => {
      let byteCharacters = atob(
          base64Url.replace(/^data:image\/(png|jpeg|jpg);base64,/, "")
      );
      let byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      let byteArray = new Uint8Array(byteNumbers);
      let blob = new Blob([byteArray], {
        type: undefined,
      });
      let aLink = document.createElement("a");
      aLink.download = "图片名称.jpg"; //这里写保存时的图片名称
      aLink.href = URL.createObjectURL(blob);
      aLink.click();
    },
    // 关闭视频窗口回调
    closeWindowSuccess: ({isAll, snum, channelList}) => {
    },
    // 鼠标单击窗口回调
    clickWindow: (snum) => {
      if (isPlaybackMode.value && !isPlaying.value) {
        selectedWindow.value = snum;
        console.log('当前选择的回放窗口：', snum + 1);
      }
    },
    // 鼠标双击窗口回调
    dbClickWindow: (snum) => {
    },
    // 播放器窗口的数量回调
    changeDivision: (division) => {
    },
    // rtsp 流下载录像成功回调
    downloadRecordSuccess: (info) => {
    },
    // rtsp 流下载录像失败回调
    downloadRecordError: (info, err) => {
    }
  });
}
//实时流播放
const playStartReal = (id, windowIndex = 0) => {
  if (!myVideoPlayer) {
    console.log('插件未初始化完成');
    return
  }
  // 如果当前是回放模式，先停止回放
  if (isPlaybackMode.value) {
    stopPlayback();
  }
  isPlaybackMode.value = false;
  myVideoPlayer.startReal([{
    channelId: id, // 通道id 【必传】
    channelName: '通道名称', // 通道名称 (用于本地录像下载)
    snum: windowIndex, // 使用指定的窗口序号
    streamType: 1,  // 1-主码流  2-辅码流 (可不传，默认主码流)
    deviceType: 2, // talkType 对讲类型  1-设备对讲 2-通道对讲 设备类别 (插件对讲时，需要配置该参数，否则无法对讲)
    cameraType: '1',  // 摄像头类型 (用于云台)
    capability: '00000000000000000000000000000001', // 能力集 (用于云台)
  }])
}
//历史回放
const startPlayback = () => {
  if (!myVideoPlayer) {
    console.log('插件未初始化完成');
    return;
  }

  if (!playbackStartTime.value || !playbackEndTime.value) {
    console.log('请选择开始和结束时间');
    return;
  }

  // 检查时间是否有效
  if (new Date(playbackStartTime.value) > new Date(playbackEndTime.value)) {
    console.log('开始时间不能大于结束时间');
    return;
  }

  console.log('开始回放，使用窗口：', selectedWindow.value + 1);

  isPlaying.value = true;

  // 重新初始化播放器以支持倒放
  myVideoPlayer = new VideoPlayer({
    videoId: "play_dh",
    windowType: 7,    // 使用支持倒放的模式
    usePluginLogin: true,
    pluginLoginInfo: LoginInfo,
    division: 1,
    draggable: false,
    showBar: true,
    shieldClass: ['shield-class', 'select'],
    coverShieldClass: [],
    parentIframeShieldClass: [],
    createSuccess: (versionInfo) => {
      // 开始回放
      myVideoPlayer.startPlayback([{
        channelId: windowChannels.value[selectedWindow.value],
        channelName: '通道名称',
        startTime: playbackStartTime.value,
        endTime: playbackEndTime.value,
        recordSource: recordSource.value,
        streamType: 0,
        snum: selectedWindow.value
      }]);
    },
    createError: (err) => {
      console.error('创建播放器失败:', err);
    }
  });
}

// 停止回放
const stopPlayback = () => {
  if (myVideoPlayer && isPlaying.value) {
    try {
      if (typeof myVideoPlayer.stopPlayback === 'function') {
        myVideoPlayer.stopPlayback();
      } else {
        console.log('停止回放方法不存在');
      }
      isPlaying.value = false;
    } catch (error) {
      console.error('停止回放时发生错误:', error);
    }
  }
}

// 取消回放，切换到实时模式
const cancelPlayback = () => {
  if (myVideoPlayer) {
    try {
      if (isPlaying.value) {
        if (typeof myVideoPlayer.stopPlayback === 'function') {
          myVideoPlayer.stopPlayback();
        }
      }
      isPlaybackMode.value = false;
      isPlaying.value = false;
      // 清空时间选择
      playbackStartTime.value = '';
      playbackEndTime.value = '';

      // 恢复之前的播放器状态
      myVideoPlayer = new VideoPlayer({
        videoId: "play_dh",
        windowType: 0,    // 实时预览模式
        usePluginLogin: true,
        pluginLoginInfo: LoginInfo,
        division: 9, // 先切换到9宫格
        draggable: false,
        showBar: true,
        shieldClass: ['shield-class', 'select'],
        coverShieldClass: [],
        parentIframeShieldClass: [],
        createSuccess: (versionInfo) => {
          // 确保切换到9宫格
          myVideoPlayer.changeDivision(9);
          // 等待窗口切换完成后再恢复播放
          setTimeout(() => {
            // 恢复所有通道的播放
            const channels = previousPlayerState.value.channels;
            const playbackList = Object.entries(channels).map(([windowIndex, channelId]) => ({
              channelId: channelId,
              channelName: '通道名称',
              snum: parseInt(windowIndex),
              streamType: 1,
              deviceType: 2,
              cameraType: '1',
              capability: '00000000000000000000000000000001'
            }));

            if (playbackList.length > 0) {
              myVideoPlayer.startReal(playbackList);
            }
          }, 100);
        },
        createError: (err) => {
          console.error('创建播放器失败:', err);
        }
      });
    } catch (error) {
      console.error('取消回放时发生错误:', error);
    }
  }
}

// 处理回放模式切换
const handlePlaybackModeChange = (checked) => {
  if (checked) {
    // 切换到回放模式
    if (myVideoPlayer) {
      // 保存当前播放器状态
      previousPlayerState.value = {
        division: 9,
        channels: {...windowChannels.value}
      };
      // 切换到单窗口模式
      myVideoPlayer.changeDivision(1);
    }
  } else {
    // 切换回实时模式
    cancelPlayback();
  }
};


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

const getVideoInfo = () => {
  Videos.getVideoListByArea().then(res => {
    if (res.data.state !== 'SUCCESS') return;
    console.log('---', processTreeData(res.data.data))
    videoTree.value = processTreeData(res.data.data);
    console.log(videoTree.value, 'videoTree.value');
  }).catch(err => {
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

onMounted(() => {
  getVideoInfo()
  initPlayer()
})
</script>

<style scoped lang="less">
li {
  list-style: none;
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

  .tree-node-title {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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