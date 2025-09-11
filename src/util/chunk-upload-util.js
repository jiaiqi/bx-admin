import { backendIpAddr, $http } from "@/common/http.js";

/**
 * 分片上传工具类
 * 基于现有的 big-file-upload-mixin.js 逻辑，提取为独立的工具类
 */
class ChunkUploadUtil {
  constructor(options = {}) {
    this.chunkSize = options.chunkSize || 20 * 1024 * 1024; // 默认20MB
    this.limitSize = options.limitSize || 50; // 默认50MB启用分片上传
    this.maxRequest = options.maxRequest || 6; // 默认最大并发数
    this.useSplitChuck = options.useSplitChuck !== false; // 默认启用分片上传
  }

  /**
   * 检查是否应该使用分片上传
   * @param {File} file 文件对象
   * @returns {boolean}
   */
  shouldUseChunkUpload(file) {
    if (!this.useSplitChuck) return false;
    const fileSize = file.size / 1024 / 1024; // 转换为MB
    return fileSize > this.limitSize;
  }

  /**
   * 使用Worker计算文件hash
   * @param {File} file 文件对象
   * @returns {Promise<{fileHash: string, fileChunkList: Array}>}
   */
  useWorker(file) {
    return new Promise((resolve) => {
      const worker = new Worker('/hash-worker.js');
      worker.postMessage({ file, chunkSize: this.chunkSize });
      
      worker.onmessage = (e) => {
        const { fileHash, fileChunkList } = e.data;
        if (fileHash) {
          resolve({ fileHash, fileChunkList });
        }
      };
      
      worker.onerror = (error) => {
        console.error('Worker error:', error);
        resolve({ fileHash: null, fileChunkList: [] });
      };
    });
  }

  /**
   * 上传单个分片
   * @param {FormData} formData 分片数据
   * @returns {Promise<any>}
   */
  async uploadChunk(formData) {
    const url = `/file/chunk`;
    const res = await $http.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 10 * 60 * 1000, // 10分钟超时
    });
    return res?.data;
  }

  /**
   * 合并分片
   * @param {Object} data 合并参数
   * @returns {Promise<any>}
   */
  async mergeChunk(data) {
    const { fileName, fileHash, chunkNumber, uploadId, app_no, table_name, columns } = data;
    const url = `/file/merge`;
    const req = {
      uploadId,
      fileName,
      fileHash,
      totalChunks: chunkNumber,
      app_no: app_no || 'oa',
      table_name: table_name || '',
      columns: columns || '',
      file_no: ''
    };
    const res = await $http.post(url, req);
    return res?.data;
  }

  /**
   * 执行分片上传
   * @param {File} file 文件对象
   * @param {Object} options 配置选项
   * @returns {Promise<any>}
   */
  async uploadFile(file, options = {}) {
    const {
      onHashProgress,
      onUploadProgress,
      onUploadSuccess,
      onError,
      app_no,
      table_name,
      columns
    } = options;

    try {
      // 1. 计算文件hash
      if (onHashProgress) onHashProgress(0);
      const { fileHash, fileChunkList } = await this.useWorker(file);
      
      if (!fileHash) {
        throw new Error('文件hash计算失败');
      }

      if (onHashProgress) onHashProgress(100);

      // 2. 准备分片数据
      const uploadId = fileHash;
      const chunkNumber = fileChunkList.length;
      
      const allChunkList = fileChunkList.map((item, index) => ({
        fileHash,
        fileSize: file.size,
        fileName: file.name,
        index,
        chunkFile: item.chunkFile,
        chunkHash: item.chunkMD5,
        chunkSize: item.chunkSize,
        chunkNumber,
        finish: false,
      }));

      // 3. 并发上传分片
      let finishNumber = 0;
      let errNumber = 0;
      const maxConcurrent = Math.min(this.maxRequest, chunkNumber);
      
      const uploadPromises = [];
      const chunksToUpload = [...allChunkList];

      // 创建上传任务
      const uploadChunkTask = async (chunkData) => {
        const formData = new FormData();
        formData.append('uploadId', fileHash);
        formData.append('chunkIndex', chunkData.index);
        formData.append('chunkHash', chunkData.chunkHash);
        formData.append('file', chunkData.chunkFile);

        try {
          const res = await this.uploadChunk(formData);
          
          if (res && res.state === 'SUCCESS') {
            finishNumber++;
            chunkData.finish = true;
            
            // 更新进度
            const percentage = Math.round((finishNumber / chunkNumber) * 100);
            if (onUploadProgress) onUploadProgress(percentage);
            
            return { success: true, chunkData };
          } else {
            throw new Error(res?.message || '分片上传失败');
          }
        } catch (error) {
          errNumber++;
          console.error(`分片 ${chunkData.index} 上传失败:`, error);
          
          // 如果错误次数过多，抛出错误
          if (errNumber > 3) {
            throw new Error('分片上传失败次数过多');
          }
          
          // 重试当前分片
          return uploadChunkTask(chunkData);
        }
      };

      // 控制并发上传
      const uploadWithConcurrency = async () => {
        const activeUploads = new Set();
        
        while (chunksToUpload.length > 0 || activeUploads.size > 0) {
          // 启动新的上传任务（如果还有分片且未达到并发限制）
          while (chunksToUpload.length > 0 && activeUploads.size < maxConcurrent) {
            const chunkData = chunksToUpload.shift();
            const uploadPromise = uploadChunkTask(chunkData);
            activeUploads.add(uploadPromise);
            
            uploadPromise.finally(() => {
              activeUploads.delete(uploadPromise);
            });
          }
          
          // 等待至少一个任务完成
          if (activeUploads.size > 0) {
            await Promise.race(activeUploads);
          }
        }
      };

      await uploadWithConcurrency();

      // 4. 合并分片
      if (onUploadProgress) onUploadProgress(95);
      
      const mergeResult = await this.mergeChunk({
        fileName: file.name,
        fileHash,
        chunkNumber,
        uploadId,
        app_no,
        table_name,
        columns
      });

      if (mergeResult && mergeResult.id) {
        if (onUploadProgress) onUploadProgress(100);
        if (onUploadSuccess) onUploadSuccess(mergeResult);
        return mergeResult;
      } else {
        throw new Error('文件合并失败');
      }

    } catch (error) {
      console.error('分片上传失败:', error);
      if (onError) onError(error);
      throw error;
    }
  }

  /**
   * 获取文件URL
   * @param {string} url 文件路径
   * @returns {string}
   */
  getFileUrl(url) {
    if (url?.indexOf("http") === 0) {
      return url;
    } else if (url?.indexOf("data:image") === 0) {
      return url;
    } else {
      return `${backendIpAddr}/file/download?filePath=${url}`;
    }
  }
}

export default ChunkUploadUtil;
