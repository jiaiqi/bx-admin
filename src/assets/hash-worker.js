importScripts('spark-md5.min.js')
// 创建文件切片（不使用 async/await，避免 Babel 注入 runtime）
function createFileChunk(file, chunkSize) {
  return new Promise((resolve, reject) => {
    if (chunkSize <= 0) {
      reject(new Error('Invalid chunk size'))
      return
    }
    const fileChunkList = []
    let cur = 0
    while (cur < file.size) {
      fileChunkList.push({ chunkFile: file.slice(cur, cur + chunkSize) })
      cur += chunkSize
    }
    resolve(fileChunkList)
  })
}

// // 创建文件切片并计算每个切片的MD5
// async function createFileChunk(file, chunkSize) {
//   return new Promise((resolve, reject) => {
//     if (chunkSize <= 0) {
//       reject(new Error('Invalid chunk size'));
//       return;
//     }

//     try {
//       let fileChunkList = [];

//       const promises = [];
//       for (let cur = 0; cur < file.size; cur += chunkSize) {
//         const chunkFile = file.slice(cur, cur + chunkSize);
//         const reader = new FileReader();

//         const promise = new Promise((resolve, reject) => {
//           reader.onload = (e) => {
//             try {
//               const spark = new SparkMD5.ArrayBuffer();
//               spark.append(e.target.result);
//               const chunkMD5 = spark.end();
//               fileChunkList.push({ chunkFile, chunkMD5 });
//               resolve();
//             } catch (err) {
//               reject(err);
//             } finally {
//               reader.abort(); // 确保 FileReader 被正确释放
//             }
//           };

//           reader.onerror = (err) => {
//             reject(err);
//           };

//           reader.readAsArrayBuffer(chunkFile);
//         });

//         promises.push(promise);
//       }

//       Promise.all(promises)
//         .then(() => {
//           resolve(fileChunkList);
//         })
//         .catch((err) => {
//           reject(err);
//         });
//     } catch (err) {
//       reject(err);
//     }
//   });
// }


// 加载并计算文件切片的MD5（改为 Promise 链式，避免 async/await）
function calculateChunksHash(fileChunkList) {
  return new Promise((resolveOuter, rejectOuter) => {
    const spark = new SparkMD5.ArrayBuffer()
    let percentage = 0
    let count = 0

    function loadNext(index) {
      if (index >= fileChunkList.length) {
        return Promise.resolve(spark.end())
      }
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsArrayBuffer(fileChunkList[index].chunkFile)
        reader.onload = (e) => {
          count++
          spark.append(e.target.result)
          percentage += 100 / fileChunkList.length
          self.postMessage({ percentage })
          resolve(loadNext(index + 1))
        }
        reader.onerror = (err) => {
          reject(err)
        }
      })
    }

    loadNext(0)
      .then((fileHash) => {
        self.postMessage({ percentage: 100, fileHash, fileChunkList })
        self.close()
        resolveOuter()
      })
      .catch((err) => {
        self.postMessage({ name: 'error', data: err })
        self.close()
        rejectOuter(err)
      })
  })
}

// 监听消息
self.addEventListener(
  'message',
  function (e) {
    const { file, chunkSize } = e.data
    createFileChunk(file, chunkSize)
      .then((fileChunkList) => calculateChunksHash(fileChunkList))
      .catch((err) => {
        console.error('worker监听发生错误:', err)
      })
  },
  false
)

// 主线程可以监听 Worker 是否发生错误。如果发生错误，Worker 会触发主线程的error事件。
self.addEventListener('error', function (event) {
  console.log('Worker触发主线程的error事件：', event)
  self.close() // 关闭Worker
})