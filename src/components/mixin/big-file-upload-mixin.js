import { backendIpAddr, $http } from "@/common/http.js";
const stateMap = ['', '正在解析中', '正在上传中', '上传完成', '上传失败']
async function uploadFile(formdata) {
  const url = `/file/chunk`
  const res = await $http.post(url, formdata, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 10 * 60 * 1000,//10分钟
    // onUploadProgress(e) {
    //   const complete = (e.loaded / e.total) * 100;
    //   const percentage = Math.round(complete);
    //   console.log(percentage, 'onUploadProgress');
    // },
  })
  // console.log(res, '-----uploadFileRes');
  return res?.data
}
export default {
  data() {
    return {
      useSplitChuck: true, //是否使用分片上传
      limitSize: 50, // 超过多少兆开启分片上传 默认50M
      chunkSize: 20 * 1024 * 1024, // 分片大小 默认20M
      // 上传文件列表
      uploadFileList: [],
      // 请求最大并发数
      maxRequest: 6,
      onUploadProgress: null,
      onUploadSuccess: null,
      onHashProgress: null,
      hashPercentage: 0,//hash计算进度
    }
  },
  created() {
    if (sessionStorage.getItem('useSplitChuck') === '否' || top?.pathConfig?.['useSplitChuck'] === '否') {
      // 不使用useSplitChuck
      this.useSplitChuck = false
    } else if (sessionStorage.getItem('useSplitChuck') === '是' || top?.pathConfig?.['useSplitChuck'] === '是') {
      // 使用分片上传
      this.useSplitChuck = true
    }
    // 限制超过多少兆开启分片上传
    if (top?.pathConfig?.['limitSize']) {
      if (top?.pathConfig?.['limitSize'] && !isNaN(Number(top?.pathConfig?.['limitSize']))) {
        this.limitSize = Number(top?.pathConfig?.['limitSize'])
      }
    }
    // 分片大小
    if (top?.pathConfig?.['chunkSize'] && !isNaN(Number(top?.pathConfig?.['chunkSize']))) {
      this.chunkSize = Number(top?.pathConfig?.['chunkSize']) * 1024 * 1024
    }
    // 并发数
    if (top?.pathConfig?.['maxRequest'] && !isNaN(Number(top?.pathConfig?.['maxRequest']))) {
      this.maxRequest = Number(top?.pathConfig?.['maxRequest'])
    }

  },
  methods: {
    getFileUrl(url) {
      if (url?.indexOf("http") === 0) {
        return url;
      } else if (url?.indexOf("data:image") === 0) {
        return url;
      } else {
        return `${this.serviceApi().downloadFile}${url}`;
      }
    },
    async handelUploadBigFile(file, cfg = {}) {
      const { chunkSize, onUploadProgress, onUploadSuccess, onHashProgress, maxRequest } = cfg
      if (onUploadProgress) { //  上传进度
        this.onUploadProgress = onUploadProgress
      }
      if (onUploadSuccess) {  // 上传成功回调
        this.onUploadSuccess = onUploadSuccess
      }
      if (onHashProgress) { // hash值计算进度
        this.onHashProgress = onHashProgress
      }
      if (maxRequest) { // 并发数
        this.maxRequest = maxRequest
      }
      if (chunkSize) { // 分片大小
        this.chunkSize = chunkSize
      }
      // 单个上传文件
      const uploadId = this.getUuid()
      let inTaskArrItem = {
        id: uploadId, // 唯一标识
        uploadId,
        state: 0, // 0不做任何处理，1是计算hash中，2是正在上传中，3是上传完成，4是上传失败，5是上传取消
        fileHash: '',
        fileName: file.name,
        fileSize: file.size,
        allChunkList: [], // 所有请求的数据
        whileRequests: [], // 正在请求中的请求个数,目前是要永远都保存请求个数为6
        finishNumber: 0, //请求完成的个数
        errNumber: 0, // 报错的个数,默认是0个,超多3个就是直接上传中断
        percentage: 0, // 单个文件上传进度条
      }
      this.uploadFileList.push(inTaskArrItem)

      // 开始处理解析文件
      inTaskArrItem.state = 1
      console.log('开始处理解析文件', stateMap[inTaskArrItem.state]);
      this.$message.info('开始处理解析文件')
      if (file.size === 0) {
        // 文件大小为0直接取消该文件上传
        this.uploadFileList.splice(i, 1)
      }
      // 计算文件hash
      const { fileHash, fileChunkList } = await this.useWorker(file)
      inTaskArrItem.uploadId = fileHash
      inTaskArrItem.id = fileHash
      console.log(fileHash, '文件hash计算完成', fileChunkList)
      this.$message.info('文件hash计算完成')
      // 解析完成开始上传文件
      let baseName = ''
      // 查找'.'在fileName中最后出现的位置
      const lastIndex = file.name.lastIndexOf('.')
      // 如果'.'不存在，则返回整个文件名
      if (lastIndex === -1) {
        baseName = file.name
      }
      // 否则，返回从fileName开始到'.'前一个字符的子串作为文件名（不包含'.'）
      baseName = file.name.slice(0, lastIndex)

      // 这里要注意！可能同一个文件，是复制出来的，出现文件名不同但是内容相同，导致获取到的hash值也是相同的
      inTaskArrItem.fileHash = `${fileHash}`
      inTaskArrItem.state = 2
      console.log(stateMap[inTaskArrItem.state]);
      this.$message.info(stateMap[inTaskArrItem.state])
      // 初始化需要上传所有切片列表
      inTaskArrItem.allChunkList = fileChunkList.map((item, index) => {
        return {
          // 总文件hash
          fileHash: `${fileHash}`,
          // 总文件size
          fileSize: file.size,
          // 总文件name
          fileName: file.name,
          index: index,
          // 切片文件本身
          chunkFile: item.chunkFile,
          // 单个切片hash,以 - 连接
          chunkHash: item.chunkMD5,
          // 切片文件大小
          chunkSize: item.chunkSize,
          // 切片个数
          chunkNumber: fileChunkList.length,
          // 切片是否已经完成
          finish: false,
        }
      })
      // // 逐步对单个文件进行切片上传
      return await this.uploadSingleFile(inTaskArrItem)

      // console.log(this.uploadFileList, 'uploadFileList')
    },

    // 生成文件 hash（web-worker）
    useWorker(file) {
      const that = this
      return new Promise((resolve) => {
        const worker = new Worker('./hash-worker.js')
        worker.postMessage({ file, chunkSize: that.chunkSize })
        worker.onmessage = (e) => {
          const { fileHash, fileChunkList } = e.data
          // console.log('useWorker:',e?.data?.percentage);
          if (e?.data?.percentage && typeof that.onHashProgress === 'function') {
            that.onHashProgress?.(Math.round(e?.data?.percentage))
          }
          if (fileHash) {
            resolve({
              fileHash,
              fileChunkList,
            })
          }
        }
      })
    },

    // 单个文件上传
    uploadSingleFile(taskArrItem) {
      // 如果没有需要上传的切片 / 正在上传的切片还没传完，就不做处理
      if (
        taskArrItem.allChunkList.length === 0 ||
        taskArrItem.whileRequests.length > 0
      ) {
        return false
      }
      // 找到文件处于处理中/上传中的 文件列表（是文件而不是切片）
      const isTaskArrIng = this.uploadFileList.filter(
        (itemB) => itemB.state === 1 || itemB.state === 2
      )

      // 实时动态获取并发请求数,每次调请求前都获取一次最大并发数
      // 浏览器同域名同一时间请求的最大并发数限制为6
      // 例如如果有3个文件同时上传/处理中，则每个文件切片接口最多调 6 / 3 == 2个相同的接口
      // this.maxRequest = Math.ceil(6 / isTaskArrIng.length)

      // 从数组的末尾开始提取 maxRequest 个元素。
      let whileRequest = taskArrItem.allChunkList.slice(-this.maxRequest)

      // 设置正在请求中的个数
      taskArrItem.whileRequests.push(...whileRequest)
      //  如果总请求数大于并发数
      if (taskArrItem.allChunkList.length > this.maxRequest) {
        // 则去掉即将要请求的列表
        taskArrItem.allChunkList.splice(-this.maxRequest)
      } else {
        // 否则总请求数置空,说明已经把没请求的全部放进请求列表了，不需要做过多请求
        taskArrItem.allChunkList = []
      }
      return new Promise((resolve, reject) => {
        // 单个分片请求
        const uploadChunk = async (needObj, uploadId) => {
          const fd = new FormData()
          const {
            fileHash,
            fileSize,
            fileName,
            index,
            chunkFile,
            chunkHash,
            chunkSize,
            chunkNumber,
          } = needObj
          // fd.append('uploadId', uploadId)
          fd.append('uploadId', fileHash)
          fd.append('chunkIndex', index)
          fd.append('chunkHash', chunkHash)
          fd.append('file', chunkFile)
          // fd.append('fileHash', fileHash)
          // fd.append('fileSize', String(fileSize))
          // fd.append('fileName', fileName)
          // fd.append('index', String(index))
          // fd.append('chunkFile', chunkFile)
          // fd.append('chunkHash', chunkHash)
          // fd.append('chunkSize', String(chunkSize))
          // fd.append('chunkNumber', String(chunkNumber))
          const res = await uploadFile(fd).catch(() => { })
          // 先判断是不是取消状态，就什么都不要再做了,及时停止
          if (taskArrItem.state === 5) {
            return false
          }

          // 请求异常,或者请求成功服务端返回报错都按单片上传失败逻辑处理,.then.catch的.catch是只能捕捉请求异常的
          if (!res || res.state !== 'SUCCESS') {
            // 切片上传失败+1
            taskArrItem.errNumber++
            // 超过3次之后直接上传中断
            if (taskArrItem.errNumber > 3) {
              console.log('切片上传失败超过三次了')
              // 标识文件上传失败
              taskArrItem.state = 4
            } else {
              console.log('切片上传失败还没超过3次')
              uploadChunk(needObj, uploadId) // 失败了一片,继续当前分片请求
            }
          } else if (res.state === 'SUCCESS') {
            if (res.data.message) {
              console.log(res.data.message, res.data);
            }
            // 单个文件上传失败次数大于0则要减少一个
            taskArrItem.errNumber > 0 ? taskArrItem.errNumber-- : 0
            // 单个文件切片上传成功数+1
            taskArrItem.finishNumber++
            // 单个切片上传完成
            needObj.finish = true
            // 单个文件上传成功后就要更新文件进度条
            this.signleFileProgress(needObj, taskArrItem) // 更新进度条
            // 上传成功了就删掉请求中数组中的那一片请求
            taskArrItem.whileRequests = taskArrItem.whileRequests.filter(
              (item) => item.chunkFile !== needObj.chunkFile
            )

            // 如果单个文件最终成功数等于切片个数
            if (taskArrItem.finishNumber === chunkNumber) {
              // 全部上传完切片后就开始合并切片
              console.log('全部上传完切片后开始合并切片');
              const mergeResult = await this.handleMerge(taskArrItem, chunkNumber)
              resolve(mergeResult)
            } else {
              // 如果还没完全上传完，则继续上传
              this.uploadSingleFile(taskArrItem)
            }
          }
        }
        // 开始上传单个切片
        for (const item of whileRequest) {
          uploadChunk(item, taskArrItem.id)
        }
      })

    },

    async mergeChunk(data) {
      const { fileName, fileHash, chunkNumber, uploadId } = data
      const url = `/file/merge`
      const req = {
        uploadId,// 分片上传任务ID
        fileName,// 合并后文件名
        fileHash, //文件MD5值
        totalChunks: chunkNumber,// 总分片数量
        app_no: this.resolveDefaultSrvApp(),
        table_name: this.table_name,
        columns: this.columns,
        file_no: ''
      }
      const res = await $http.post(url, req)
      console.log(res, 'mergeChunk');
      return res?.data
    },
    // 调取合并接口处理所有切片
    async handleMerge(taskArrItem, chunkNumber) {
      const { fileName, fileHash } = taskArrItem
      const res = await this.mergeChunk({
        chunkSize: this.chunkSize,
        fileName,
        fileHash,
        chunkNumber,
        uploadId: taskArrItem.id
      }).catch((err) => {
        console.log(err);
      })
      //  如果合并成功则标识该文件已经上传完成
      if (res && res.id) {
        // 设置文件上传状态
        this.finishTask(taskArrItem)
        console.log('文件合并成功！', res)
      } else {
        // 否则上传文件失败
        taskArrItem.state = 4
        console.log('文件合并失败！', res)
      }
      //  最后赋值文件切片上传完成个数为0
      taskArrItem.finishNumber = 0
      this.onUploadSuccess?.(res)
      if (res?.fileurl) {
        const url = this.getFileUrl(res.fileurl);
        return {
          url,
          name: res.src_name,
        };
      } else {
        return res
      }
    },

    // 更新单个文件进度条
    signleFileProgress(needObj, taskArrItem) {
      taskArrItem.percentage = Number(
        ((taskArrItem.finishNumber / needObj.chunkNumber) * 100).toFixed(2)
      )
      console.log('单个文件进度条', taskArrItem.percentage);
      if (typeof this.onUploadProgress === 'function') {
        this.onUploadProgress?.(Math.round(taskArrItem.percentage), taskArrItem.file)
      }
    },
    // 设置单个文件上传已完成
    finishTask(item) {
      item.state = 3
      item.percentage = 100
      console.log(stateMap[item.state]);
    },

    cancelUpload(item) {
      item.state = 5
      console.log(stateMap[item.state]);

      // 取消上传后删除该文件
      this.uploadFileList = this.uploadFileList.filter(
        (itemB) => itemB.fileHash !== item.fileHash
      )
    },
  },
}