import axios from 'axios';
import { Notification } from 'element-ui';
// 本地版本信息
let localVersionInfo = null;

// 获取本地版本信息
const getLocalVersion = async () => {
  if (localVersionInfo) {
    return localVersionInfo;
  }

  try {
    const response = await axios.get('/version.json', {
      baseURL: process.env.BASE_URL,
      timeout: 5000
    });
    localVersionInfo = response.data;
    return localVersionInfo;
  } catch (error) {
    console.error('获取本地版本信息失败:', error);
    return null;
  }
};

// 获取远程版本信息
const getRemoteVersion = async () => {
  try {
    const response = await axios.get('/version.json', {
      baseURL: window.location.origin,
      timeout: 5000,
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    return response.data;
  } catch (error) {
    console.error('获取远程版本信息失败:', error);
    return null;
  }
};

// 比较版本信息
const compareVersions = (localVersion, remoteVersion) => {
  if (!localVersion || !remoteVersion) {
    return false;
  }

  // 比较 commit hash
  if (localVersion.build !== remoteVersion.build) {
    return true;
  }

  // 比较版本号（如果有 tag）
  if (localVersion.version !== 'latest' && remoteVersion.version !== 'latest') {
    const localParts = localVersion.version.split('.').map(Number);
    const remoteParts = remoteVersion.version.split('.').map(Number);

    for (let i = 0; i < Math.max(localParts.length, remoteParts.length); i++) {
      const localNum = localParts[i] || 0;
      const remoteNum = remoteParts[i] || 0;

      if (remoteNum > localNum) {
        return true;
      } else if (remoteNum < localNum) {
        return false;
      }
    }
  }

  return false;
};

// 检查更新
const checkUpdate = async () => {
  try {
    const [localVersion, remoteVersion] = await Promise.all([
      getLocalVersion(),
      getRemoteVersion()
    ]);

    const hasUpdate = compareVersions(localVersion, remoteVersion);

    return {
      hasUpdate,
      localVersion,
      remoteVersion
    };
  } catch (error) {
    console.error('检查更新失败:', error);
    return {
      hasUpdate: false,
      error
    };
  }
};

// 显示更新提示
const showUpdateNotification = (updateInfo) => {
  if (updateInfo.hasUpdate) {
    const { localVersion, remoteVersion } = updateInfo;
    
    // 构造详细的更新信息
    const updateDetails = {
      本地版本: localVersion.version,
      本地构建号: localVersion.build,
      本地提交时间: localVersion.commitTime,
      远程版本: remoteVersion.version,
      远程构建号: remoteVersion.build,
      远程提交时间: remoteVersion.commitTime
    };
    
    // 在控制台打印详细信息
    console.info('🔄 发现新版本:', updateDetails);
    
    // 构造通知消息
    const notificationMessage = `
发现新版本，刷新页面以更新

本地版本: ${localVersion.version} (${localVersion.build})
本地提交时间: ${localVersion.commitTime}

远程版本: ${remoteVersion.version} (${remoteVersion.build})
远程提交时间: ${remoteVersion.commitTime}
    `.trim();
    
    Notification({
      title: '更新提醒',
      message: notificationMessage,
      type: 'info',
      duration: 10000, // 延长显示时间，让用户有足够时间查看
      showClose: true,
      onClose: () => {
        // 可以在这里添加更新逻辑，比如强制刷新
        // window.location.reload();
      }
    });
  }
};

export default {
  checkUpdate,
  showUpdateNotification,
  getLocalVersion,
  getRemoteVersion
};
