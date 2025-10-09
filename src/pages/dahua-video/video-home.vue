<template>
  <div class="video_page dark-theme">
    <div
      class="tree_left"
      :class="{ 'with-playback': videoChannel, 'collapsed': isCollapsed }"
    >
      <div
        class="collapse-btn"
        @click="toggleCollapse"
      >
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
          :defaultProps="{
            children: 'children',
            label: 'label',
            isLeaf: 'isLeaf'
          }"
          show-line
          :filter-node-method="filterNode"
          @node-click="handleSelect"
          ref="tree"
        >
          <span
            class="custom-tree-node"
            slot-scope="{ node, data }"
            @click="setNode(data)"
          >
            <span>{{ node.label }}</span>
            <span
              :title="data.chnl_online_status"
              class="is_online"
              :style="[{ color: data.chnl_online_status && data.chnl_online_status === '在线' ? '#67C23A' : '#909399' }]"
              v-if="data.isChannel && !data.children"
            ><i class="el-icon-s-opportunity"></i></span>
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
            <el-button
              size="mini"
              type="primary"
              @click="startPlayback"
              :disabled="!isPlaybackMode || isPlaying || !videoChannel"
            >开始回放
            </el-button>
            <el-button
              size="mini"
              type="danger"
              @click="stopPlayback"
              :disabled="!isPlaying || !videoChannel"
            >
              停止回放
            </el-button>
          </div>
        </div>
      </div>
    </div>
    <div
      class="video_cot"
      id="play_dh"
    ></div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import VideoUtil from "@/pages/dahua-video/video";
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
let myVideoPlayer = null;
const LoginInfo = window.APP_CONFIG.videoInfo

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

const setNode = (data) => {
  console.log('22222222', data);
}
// 切换收缩状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

// 添加单窗口模式下的通道切换方法
const switchChannelInSingleWindow = (newChannelId) => {
  if (!myVideoPlayer) {
    console.log('插件未初始化完成');
    return;
  }

  // 获取当前分屏数
  const currentDivision = myVideoPlayer.getDivision ? myVideoPlayer.getDivision() : 1;
  if (currentDivision !== 1) {
    console.log('当前不是单窗口模式');
    return;
  }

  // 先释放当前窗口的通道
  try {
    // 停止当前播放
    if (myVideoPlayer.stopReal) {
      myVideoPlayer.stopReal();
    }
    // 关闭当前窗口
    if (myVideoPlayer.closeWindow) {
      myVideoPlayer.closeWindow({
        isAll: false,
        snum: 0,
        channelList: [windowChannels.value[0]]
      });
    }
    // 清空当前窗口的通道信息
    windowChannels.value[0] = null;
  } catch (error) {
    console.error('释放窗口通道时发生错误:', error);
  }

  // 延迟一下再开始新的通道播放
  setTimeout(() => {
    // 更新窗口通道信息
    windowChannels.value[0] = newChannelId;
    console.log('切换后的窗口通道信息：', windowChannels.value);

    myVideoPlayer.startReal([{
      channelId: newChannelId,
      channelName: '通道名称',
      snum: 0, // 单窗口模式下固定使用索引0
      streamType: 1,
      deviceType: 2,
      cameraType: '1',
      capability: '00000000000000000000000000000001'
    }]);
  }, 200); // 增加延时确保释放操作完成
}

const handleSelect = (selectedKeys, e) => {
  let node = e.data ? e.data : {};
  if (node && node.isChannel && !node.chnl_online_status || node.chnl_online_status === '离线')
    return Notification({
      title: '注意!',
      message: '当前视频离线',
      type: 'warning',
      position: 'top-left',
      showClose: false,
      duration: 2000
    })
  if (node && node.isChannel && node.chnl_online_status && node.chnl_online_status === '在线') {
    videoChannel.value = node.chnl_no;
    // // 测试使用使用固定的通道ID
    // const fixedChannelId = '1002636$1$0$0';
    // videoChannel.value = fixedChannelId;

    // 获取当前选中的窗口索引
    const currentWindowIndex = selectedWindow.value;

    // 记录当前窗口的通道信息
    windowChannels.value[currentWindowIndex] = videoChannel.value;
    console.log('当前所有窗口通道信息：', windowChannels.value);

    // 确保播放器已经初始化
    if (!myVideoPlayer) {
      initPlayer();
    }

    // 获取当前分屏数
    const currentDivision = myVideoPlayer.getDivision ? myVideoPlayer.getDivision() : 1;

    if (currentDivision === 1) {
      // 单窗口模式下，先停止当前播放
      try {
        if (isPlaybackMode.value && isPlaying.value) {
          // 如果是回放模式且正在播放，先停止回放
          stopPlayback();
        } else if (myVideoPlayer.stopReal) {
          // 如果是实时模式，停止实时播放
          myVideoPlayer.stopReal();
        }
      } catch (error) {
        console.error('停止当前播放时发生错误:', error);
      }

      // 延迟一下再开始新的通道播放
      setTimeout(() => {
        if (isPlaybackMode.value && isPlaying.value) {
          // 如果是回放模式且正在播放，开始新的回放
          startPlayback();
        } else {
          // 否则开始实时播放
          myVideoPlayer.startReal([{
            channelId: videoChannel.value,
            channelName: '通道名称',
            snum: 0, // 单窗口模式下固定使用索引0
            streamType: 1,
            deviceType: 2,
            cameraType: '1',
            capability: '00000000000000000000000000000001'
          }]);
        }
      }, 200);
    } else {
      // 多窗口模式下使用原有的播放逻辑
      if (isPlaybackMode.value && isPlaying.value) {
        stopPlayback();
        setTimeout(() => {
          startPlayback();
        }, 200);
      } else {
        playStartReal(videoChannel.value, currentWindowIndex);
      }
    }
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
      console.log(LoginInfo)
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
    snapshotSuccess: ({ base64Url, path }, info) => {
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
    closeWindowSuccess: ({ isAll, snum, channelList }) => {
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
    return;
  }
  // 如果当前是回放模式，先停止回放
  if (isPlaybackMode.value) {
    stopPlayback();
  }
  isPlaybackMode.value = false;

  // 更新窗口通道信息
  windowChannels.value[windowIndex] = id;
  console.log('当前所有窗口通道信息：', windowChannels.value);

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

  if (!videoChannel.value) {
    console.log('请选择要回放的通道');
    return;
  }

  console.log('开始回放，使用窗口：', selectedWindow.value + 1);
  console.log('回放通道：', videoChannel.value);

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
        channelId: videoChannel.value, // 使用当前选中的通道
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
      isPlaying.value = false;
    }
  });
}

// 停止回放
const stopPlayback = () => {
  if (myVideoPlayer && isPlaying.value) {
    try {
      // 使用 controlPlayback 方法暂停播放
      myVideoPlayer.controlPlayback({
        snum: selectedWindow.value,
        state: 0  // 0 表示暂停
      });
      isPlaying.value = false;

      // 保持当前窗口状态，不销毁播放器实例
      if (myVideoPlayer.changeDivision) {
        myVideoPlayer.changeDivision(1); // 保持单窗口模式
      }
    } catch (error) {
      console.error('停止回放时发生错误:', error);
    }
  }
}

// 处理回放模式切换
const handlePlaybackModeChange = (checked) => {
  console.log('切换回放模式，当前状态：', {
    isPlaybackMode: isPlaybackMode.value,
    checked,
    windowChannels: windowChannels.value,
    previousState: previousPlayerState.value
  });

  if (checked) {
    // 切换到回放模式
    if (myVideoPlayer) {
      // 保存当前所有窗口的通道信息
      const currentChannels = {};
      // 遍历所有窗口，获取当前播放的通道信息
      for (let i = 0; i < 9; i++) {
        if (windowChannels.value[i]) {
          currentChannels[i] = windowChannels.value[i];
        }
      }

      // 保存当前播放器状态
      previousPlayerState.value = {
        division: myVideoPlayer.getDivision ? myVideoPlayer.getDivision() : 9,
        channels: currentChannels
      };

      console.log('切换到回放模式，保存的实时模式通道信息：', {
        savedChannels: currentChannels,
        previousState: previousPlayerState.value
      });

      // 切换到单窗口模式
      myVideoPlayer.changeDivision(1);
    }
  } else {
    // 切换回实时模式
    cancelPlayback();
  }
};
//切换回实时播放时的回调业务
const cancelPlayback = () => {
  console.log('开始取消回放，当前状态：', {
    isPlaybackMode: isPlaybackMode.value,
    isPlaying: isPlaying.value,
    windowChannels: windowChannels.value,
    previousState: previousPlayerState.value
  });

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

      // 保存当前播放器实例的引用和通道信息
      const currentPlayer = myVideoPlayer;
      const savedChannels = { ...previousPlayerState.value.channels };
      console.log('切换前保存的通道信息：', {
        savedChannels,
        previousState: previousPlayerState.value,
        windowChannels: windowChannels.value
      });

      // 创建新的播放器实例
      myVideoPlayer = new VideoPlayer({
        videoId: "play_dh",
        windowType: 0,    // 实时预览模式
        usePluginLogin: true,
        pluginLoginInfo: LoginInfo,
        division: 9, // 固定使用9宫格
        draggable: false,
        showBar: true,
        shieldClass: ['shield-class', 'select'],
        coverShieldClass: [],
        parentIframeShieldClass: [],
        createSuccess: (versionInfo) => {
          console.log('播放器创建成功，准备恢复播放');
          // 确保切换到9宫格
          myVideoPlayer.changeDivision(9);

          // 增加延时确保窗口切换完成
          setTimeout(() => {
            // 使用保存的通道信息
            console.log('准备恢复的通道信息：', {
              savedChannels,
              previousState: previousPlayerState.value,
              windowChannels: windowChannels.value
            });

            const playbackList = Object.entries(savedChannels)
              .filter(([_, channelId]) => channelId) // 过滤掉空值
              .map(([windowIndex, channelId]) => {
                // 确保通道ID格式正确
                const formattedChannelId = channelId.includes('$') ? channelId : `${channelId}$1$0$0`;
                console.log(`处理窗口 ${windowIndex} 的通道: ${formattedChannelId}`);
                return {
                  channelId: formattedChannelId,
                  channelName: '通道名称',
                  snum: parseInt(windowIndex),
                  streamType: 1,
                  deviceType: 2,
                  cameraType: '1',
                  capability: '00000000000000000000000000000001'
                };
              });

            if (playbackList.length > 0) {
              console.log('最终要恢复播放的通道列表：', playbackList);
              // 确保所有通道都停止后再开始新的播放
              if (typeof myVideoPlayer.stopReal === 'function') {
                myVideoPlayer.stopReal();
              }

              // 短暂延时后开始新的播放
              setTimeout(() => {
                myVideoPlayer.startReal(playbackList);
                // 更新窗口通道信息
                windowChannels.value = { ...savedChannels };
                console.log('播放恢复完成，当前窗口通道信息：', {
                  windowChannels: windowChannels.value,
                  savedChannels,
                  previousState: previousPlayerState.value
                });
              }, 200);
            } else {
              console.log('没有需要恢复的通道，当前状态：', {
                savedChannels,
                previousState: previousPlayerState.value,
                windowChannels: windowChannels.value
              });
            }
          }, 500); // 增加延时到500ms，确保窗口切换完成
        },
        createError: (err) => {
          console.error('创建播放器失败:', err);
        },
        // 添加实时预览成功回调
        realSuccess: (info) => {
          console.log('实时预览成功:', info);
        },
        // 添加实时预览失败回调
        realError: (info, err) => {
          console.error('实时预览失败:', info, err);
        }
      });

      // 销毁旧的播放器实例
      if (currentPlayer && typeof currentPlayer.destroy === 'function') {
        currentPlayer.destroy();
      }
    } catch (error) {
      console.error('取消回放时发生错误:', error);
    }
  }
}
//处理节点数据重新组装
const processTreeData = (data) => {
  return data.map(item => {
    const newItem = { ...item };

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
    if (newItem.is_leaf !== '否' && !newItem.children?.length) {
      newItem.isLeaf = true;
    }
    return newItem;
  });
};
//获取视频节点树
const getVideoInfo = () => {
  Videos.getVideoListByArea().then(res => {
    if (res.data.state !== 'SUCCESS') return;
    console.log('---', processTreeData(res.data.data))
    videoTree.value = processTreeData(res.data.data);
    console.log('--12videoTree', videoTree.value);
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
  // 给body添加暗色主题类
  document.body.classList.add('dark-theme');
  getVideoInfo()
  initPlayer()

})

// 组件卸载时移除暗色主题类
onUnmounted(() => {
  document.body.classList.remove('dark-theme');
})
</script>

<style lang="less">
li {
  list-style: none;
}

// 定义CSS变量 - 暗色主题颜色系统
.dark-theme {
  // 背景色
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --bg-tertiary: #3a3a3a7c;
  --bg-sidebar: #2525257e;
  --bg-control-panel: #2a2a2a9d;

  // 文字颜色
  --text-primary: #ffffff;
  --text-secondary: #b3b3b3;
  --text-muted: #888888;
  --text-title: #e6e6e6;

  // 边框颜色
  --border-primary: #404040;
  --border-secondary: #333333;
  --border-hover: #555555;

  // 按钮和交互元素
  --btn-bg: #404040;
  --btn-bg-hover: #4a4a4a;
  --btn-text: #ffffff;

  // 状态颜色
  --status-online: #67C23A;
  --status-offline: #909399;

  // 输入框
  --input-bg: #333333;
  --input-border: #404040;
  --input-text: #ffffff;
  --input-placeholder: #888888;
}

.light-theme {}

.is_online {
  font-size: 0.75rem;
  margin-left: 0.3125rem;
}

.video_page {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0.625rem;

  // 暗色主题适配
  &.dark-theme {
    background: var(--bg-primary);
    color: var(--text-primary);

    .tree_left {
      background: var(--bg-sidebar);
      border: 1px solid var(--border-primary);
      color: var(--text-primary);

      .collapse-btn {
        background: var(--btn-bg);
        border-color: var(--border-primary);
        color: var(--text-primary);

        &:hover {
          background: var(--btn-bg-hover);
        }

      }

      .playback-controls {
        background: var(--bg-control-panel);
        border-top-color: var(--border-primary);

        .control-title {
          color: var(--text-title);
        }
      }
    }
  }

  .tree_left {
    width: 350px;
    height: 100%;
    overflow: auto;
    background: #fff;
    display: flex;
    flex-direction: column;
    transition: width 0.3s ease;
    position: relative;

    // &.with-playback {
    //   width: 20%;
    // }

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
      cursor: pointer;
      transition: transform 0.3s ease;
      &:hover {
        background: #f5f7fa;
      }
    }

    .tree_tl {
      flex: 1;
      overflow: auto;
      transition: opacity 0.3s ease, visibility 0.3s ease;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .el-tree {
        flex: 1;
        overflow-y: auto;
      }
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

  // Element UI 组件暗色主题适配
  &.dark-theme {

    // 树形组件
    .el-tree {
      background: transparent !important;
      color: var(--text-primary) !important;
      flex: 1;
      scrollbar-width: thin;
      scrollbar-color: var(--bg-primary) var(--bg-sidebar);
      scrollbar-gutter: stable;

      .el-tree-node:focus>.el-tree-node__content {
        background-color: var(--bg-tertiary) !important;
      }

      .el-tree-node__content {
        color: var(--text-primary) !important;

        &:hover {
          background-color: var(--bg-tertiary) !important;
        }
      }

      .el-tree-node__expand-icon {
        color: var(--text-secondary) !important;
      }

      .custom-tree-node {
        color: var(--text-primary) !important;
      }
    }

    // 开关组件
    .el-switch {
      .el-switch__core {
        background-color: var(--border-primary) !important;
        border-color: var(--border-primary) !important;
      }

      .el-switch__label {
        color: var(--text-secondary) !important;

        &.is-active {
          color: var(--text-primary) !important;
        }
      }
    }

    // 单选按钮组
    .el-radio-group {
      .el-radio {
        .el-radio__label {
          color: var(--text-primary) !important;
        }

        .el-radio__input.is-disabled+.el-radio__label {
          color: var(--text-muted) !important;
        }
      }
    }

    // 日期选择器
    .el-date-editor {
      .el-input__inner {
        background-color: var(--input-bg) !important;
        border-color: var(--input-border) !important;
        color: var(--input-text) !important;

        &::placeholder {
          color: var(--input-placeholder) !important;
        }

        &:focus {
          border-color: var(--border-hover) !important;
        }
      }

      &.is-disabled .el-input__inner {
        background-color: var(--bg-secondary) !important;
        color: var(--text-muted) !important;
      }
    }

    // 按钮组件
    .el-button {
      &.el-button--mini {
        background-color: var(--btn-bg) !important;
        border-color: var(--border-primary) !important;
        color: var(--btn-text) !important;

        &:hover:not(.is-disabled) {
          background-color: var(--btn-bg-hover) !important;
          border-color: var(--border-hover) !important;
        }

        &.is-disabled {
          background-color: var(--bg-secondary) !important;
          border-color: var(--border-secondary) !important;
          color: var(--text-muted) !important;
        }
      }

      &.el-button--primary {
        &.is-disabled {
          background-color: var(--bg-secondary) !important;
          border-color: var(--border-secondary) !important;
        }
      }

      &.el-button--danger {
        &.is-disabled {
          background-color: var(--bg-secondary) !important;
          border-color: var(--border-secondary) !important;
        }
      }
    }
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

// 暗色主题适配 - Element UI输入框
.dark-theme .filter-input {
  .el-input__inner {
    background-color: var(--input-bg) !important;
    border-color: var(--input-border) !important;
    color: var(--input-text) !important;
    border-radius: 0;
    &::placeholder {
      color: var(--input-placeholder) !important;
    }

    &:focus {
      border-color: var(--border-hover) !important;
    }
  }
}

.record-source-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.dark-theme .record-source-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;

  // 暗色主题适配
  .dark-theme & {
    color: var(--text-secondary);
  }
}

.divider {
  height: 1px;
  background-color: #ebeef5;
  margin: 0 0 10px 0;
  width: 100%;
}

// 暗色主题适配
.dark-theme .divider {
  background-color: var(--border-primary);
}

.dark-theme {
  .el-picker-panel {
    background-color: var(--input-bg) !important;
    border-color: var(--input-border) !important;
    color: var(--input-text) !important;

    .el-date-picker__header-label {
      color: var(--input-text) !important;
    }

    .el-picker-panel__content {

      .el-date-table th {
        border-color: var(--input-border) !important;
        color: var(--input-text) !important;
      }
    }

    .el-date-picker__time-header,
    .el-picker-panel__footer {
      background-color: var(--input-bg) !important;
      border-color: var(--input-border) !important;
      color: var(--input-text) !important;

      .el-input__inner {
        background-color: var(--input-bg) !important;
        border-color: var(--input-border) !important;
        color: var(--input-text) !important;
      }

      .el-button.el-button--default {
        background-color: var(--btn-bg) !important;
        border-color: var(--border-primary) !important;
        color: var(--btn-text) !important;
      }
    }

    .popper__arrow {
      border-top-color: var(--input-border) !important;

      &::after {
        border-top-color: var(--input-bg) !important;
      }
    }
  }

}
</style>