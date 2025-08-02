<template>
  <div class="map-editor-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <i class="el-icon-edit-outline"></i>
            地图标记点编辑器
          </h1>
          <p class="page-description">
            拖拽移动标记点位置，支持批量保存更改
          </p>
        </div>

        <div class="header-actions">
          <el-button
            type="primary"
            icon="el-icon-upload2"
            @click="handleImportData"
          >
            导入数据
          </el-button>
          <el-button
            icon="el-icon-refresh"
            @click="handleResetData"
          >
            重置数据
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="page-content">
      <!-- 左侧配置面板 -->
      <div class="config-panel">
        <el-card shadow="never">
          <div
            slot="header"
            class="card-header"
          >
            <span>地图配置</span>
          </div>

          <el-form
            :model="mapConfig"
            label-width="80px"
            size="small"
          >
            <el-form-item label="底图">
              <el-input
                v-model="mapConfig.base_image"
                placeholder="请输入底图URL"
                clearable
              >
                <el-button
                  slot="append"
                  icon="el-icon-upload"
                  @click="handleUploadImage"
                >
                  上传
                </el-button>
              </el-input>
            </el-form-item>

            <el-form-item label="填充方式">
              <el-select
                v-model="mapConfig.base_image_fill_method"
                placeholder="选择填充方式"
              >
                <el-option
                  label="包含"
                  value="contain"
                ></el-option>
                <el-option
                  label="覆盖"
                  value="cover"
                ></el-option>
                <el-option
                  label="拉伸"
                  value="100% 100%"
                ></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="X坐标字段">
              <el-input
                v-model="mapConfig.x_col"
                placeholder="如: x_position"
              />
            </el-form-item>

            <el-form-item label="Y坐标字段">
              <el-input
                v-model="mapConfig.y_col"
                placeholder="如: y_position"
              />
            </el-form-item>
          </el-form>

          <div class="marker-stats">
            <div class="stat-item">
              <span class="stat-label">总标记点:</span>
              <span class="stat-value">{{ markerList.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">可编辑:</span>
              <span class="stat-value">{{ editableMarkersCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">已修改:</span>
              <span class="stat-value">{{ changedMarkersCount }}</span>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 右侧地图编辑区域 -->
      <div class="editor-area">
        <MapEditorView
          :map-config="mapConfig"
          :marker-list="markerList"
          :loading="loading"
          @marker-position-change="handleMarkerPositionChange"
          @save-changes="handleSaveChanges"
          @cancel-changes="handleCancelChanges"
        />
      </div>
    </div>

    <!-- 文件上传对话框 -->
    <el-dialog
      title="导入标记点数据"
      :visible.sync="importDialogVisible"
      width="500px"
    >
      <el-upload
        class="upload-demo"
        drag
        action=""
        :auto-upload="false"
        :on-change="handleFileChange"
        accept=".json"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将JSON文件拖到此处，或<em>点击上传</em></div>
        <div
          class="el-upload__tip"
          slot="tip"
        >只能上传JSON格式文件</div>
      </el-upload>

      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="confirmImport"
        >确定导入</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { $http, $selectOne } from '@/common/http'
import MapEditorView from './components/MapEditorView.vue'
import { MessageBox } from 'element-ui'

/**
 * 地图标记点编辑器页面
 * @description 独立的地图编辑功能页面，支持拖拽编辑标记点位置
 */
export default {
  name: 'MapEditorPage',
  components: {
    MapEditorView
  },
  data() {
    return {
      loading: false,
      importDialogVisible: false,
      pendingFile: null,

      // 地图配置
      mapConfig: {
        base_image: '/static/images/demo-map.jpg',
        base_image_fill_method: 'contain',
        x_col: 'x_position',
        y_col: 'y_position'
      },

      // 标记点列表
      markerList: [],

      // 位置变更记录
      markerChanges: {},
      originalPositions: {}
    }
  },
  computed: {
    markerSourceConfig() {
      let cfgJson = this.mapConfig.multi_src_poi_json
      if (cfgJson && typeof cfgJson === 'string') {
        return JSON.parse(cfgJson)
      }
    },

    /**
     * 可编辑标记点数量
     */
    editableMarkersCount() {
      return this.markerList.filter(marker =>
        marker._poi_info?.marker_edit_cfg?.update_request_no
      ).length
    },

    /**
     * 已修改标记点数量
     */
    changedMarkersCount() {
      return Object.keys(this.markerChanges).length
    },

    /**
     * 是否有未保存的更改
     */
    hasChanges() {
      return this.changedMarkersCount > 0
    }
  },
  watch: {
    markerSourceConfig: {
      immediate: true,
      deep: true,
      handler(newValue, oldValue) {
        if (Array.isArray(newValue) && newValue.length) {
          this.fetchAllMarkers(newValue)
        }
      }
    }
  },
  mounted() {
    this.initDemoData()
  },
  created() {
    if (this.$route.params.mapNo) {
      this.getMapConfig()
    }
  },
  methods: {
    async getMapConfig() {
      const url = `/config/select/srvpage_cfg_com_map_select`
      const req = {
        "serviceName": "srvpage_cfg_com_map_select",
        "colNames": ["*"],
        "condition": [{ "colName": "map_no", "ruleType": "like", "value": this.$route.params.mapNo }],
        "page": { "pageNo": 1, "rownumber": 1 }
      }
      const res = await $selectOne(url, req)
      if (res.ok) {
        this.mapConfig = res.data
      } else if (res.msg) {
        MessageBox.error(res.msg)
      }
    },

    async fetchAllMarkers(sourceJson) {
      let successCount = 0
      this.markerList = []
      for (let src of sourceJson) {
        try {
          const res = await this.getMarkers(src)
          if (res.ok) {
            successCount++
          }
          if (Array.isArray(res.data)) {
            this.markerList.push(...res.data)
          }
        } catch (error) {
          console.error(`数据源 ${src.poi_name} 请求失败：`, error)
        }
      }
    },

    /**
     * 获取标记点数据
     * @param {Object} params - 请求参数
     * @param {Object} params.srv_req_json - 服务请求配置
     * @param {string} params.poi_name - POI名称
     * @param {string} params.poi_type - POI类型
     * @param {Object} params.col_map - 列映射配置
     */
    async getMarkers(params = {}) {
      let { srv_req_json: p, poi_name, poi_type, col_map } = params
      if (params.srv_req_info) {
        // 配置变动,srv_req_json改为从srv_req_info中获取
        p = params.srv_req_info.srv_req_json
      } else {
        console.warn('获取标记点数据：缺少必要的服务配置参数', params)
        return
      }


      // 参数验证
      if (!p || !p.mapp || !p.serviceName) {
        console.warn('获取标记点数据：缺少必要的服务配置参数', params)
        return
      }

      const reqInfo = params.srv_req_info
      const {
        map_filter_poi_col: filterCol, // condition中的colName
        map_filter_poi_rule: ruleType, // 比较规则
        poi_refer_map_filter_col: dataCol // 数据中对应的字段
      } = reqInfo;

      // if (filterCol && ruleType && dataCol && props.mapData[dataCol]) {
      //   const obj = {
      //     colName: filterCol,
      //     value: props.mapData[dataCol],
      //     ruleType: ruleType === '等于' ? 'eq' : 'like]'
      //   }
      //   if (p.condition) {
      //     p.condition.push(obj)
      //   } else {
      //     p.condition = [obj]
      //   }
      // }
      // let pageParamsModel = cloneDeep(props.pageParamsModel)

      // if (pageParamsModel && typeof pageParamsModel === 'object') {
      //   for (let key in pageParamsModel) {
      //     if (pageParamsModel[key]?.value) {
      //       pageParamsModel[key] = pageParamsModel[key].value
      //     }
      //   }
      // }

      // if (p.condition?.length) {
      //   const globalParams = {
      //     ...pageParamsModel || {},
      //     ...props.mapData || {}
      //   }
      //   const conditions = cloneDeep(p.condition)
      //   const conds = []
      //   for (let cond of conditions) {
      //     let condModel = cloneDeep(cond)
      //     condModel._raw_value = condModel.value
      //     if (cond && condModel.value && condModel.value.indexOf('${') !== -1 && condModel.value.indexOf('}') !== -
      //       1 && params) {
      //       if (renderStr(condModel.value, globalParams) && renderStr(condModel.value, globalParams).indexOf('[object') == -1) {
      //         condModel.value = renderStr(condModel.value, globalParams)
      //       } else {
      //         let key = condModel.value
      //         var sreg = new RegExp("\\${", "g"); // 加'g'，删除字符串里所有的"a"
      //         var ereg = new RegExp("\}", "g"); // 加'g'，删除字符串里所有的"a"
      //         key = key.replace(sreg, "");
      //         key = key.replace(ereg, "");
      //         console.log('--srvReq', params, key)
      //         condModel.value = params && params.hasOwnProperty(key) ? params[key] : ""
      //         if (condModel.value?.value) {
      //           condModel.value = condModel.value.value
      //         }
      //       }
      //     }
      //     conds.push(cloneDeep(condModel))
      //   }
      //   p.condition = conds
      // }
      try {
        const url = `/${p.mapp}/select/${p.serviceName}`
        const res = await $http.post(url, p)

        if (res?.data?.state === 'SUCCESS') {
          const data = res.data.data

          // 数据验证
          if (!Array.isArray(data)) {
            console.warn('获取标记点数据：返回数据格式不正确', data)
            return
          }

          // 处理数据，添加POI信息和列映射
          const list = data.map(item => ({
            ...item,
            _poi_info: {
              poi_name,
              poi_type,
              ...params
            },
            _col_map: col_map || {}
          }))
          return {
            ok: true,
            data: list
          }
        } else {
          const errorMsg = res?.data?.resultMessage || '获取标记点数据失败'
          console.error('获取标记点数据失败：', errorMsg)
          MessageBox.error(errorMsg)
          error.value = errorMsg
        }
      } catch (err) {
        const errorMsg = `获取标记点数据异常：${err.message}`
        console.error(errorMsg, err)
        MessageBox.error(errorMsg)
        error.value = errorMsg
      }
    },
    /**
     * 初始化演示数据
     */
    initDemoData() {
      this.markerList = [
        {
          id: '1',
          name: '设备A',
          x_position: 100,
          y_position: 150,
          icon_url: '',
          _poi_info: {
            marker_edit_cfg: {
              update_request_no: 'req_001'
            }
          }
        },
        {
          id: '2',
          name: '设备B',
          x_position: 300,
          y_position: 200,
          icon_url: '',
          _poi_info: {
            marker_edit_cfg: {
              update_request_no: 'req_001'
            }
          }
        },
        {
          id: '3',
          name: '设备C',
          x_position: 500,
          y_position: 100,
          icon_url: '',
          _poi_info: {
            marker_edit_cfg: {
              update_request_no: 'req_002'
            }
          }
        }
      ]

      // 保存原始位置
      this.saveOriginalPositions()
    },

    /**
     * 保存原始位置
     */
    saveOriginalPositions() {
      this.originalPositions = {}
      this.markerList.forEach(marker => {
        if (marker.id) {
          this.originalPositions[marker.id] = {
            x: marker[this.mapConfig.x_col],
            y: marker[this.mapConfig.y_col]
          }
        }
      })
    },

    /**
     * 处理标记点位置变更
     */
    handleMarkerPositionChange(marker, newX, newY) {
      if (!marker.id) return

      // 更新标记点数据
      marker[this.mapConfig.x_col] = newX
      marker[this.mapConfig.y_col] = newY

      // 记录变更
      const originalPos = this.originalPositions[marker.id]
      if (originalPos && (originalPos.x !== newX || originalPos.y !== newY)) {
        this.$set(this.markerChanges, marker.id, {
          marker,
          originalPosition: originalPos,
          newPosition: { x: newX, y: newY },
          updateRequestNo: marker._poi_info?.marker_edit_cfg?.update_request_no
        })
      } else {
        this.$delete(this.markerChanges, marker.id)
      }
    },

    /**
     * 保存更改
     */
    async handleSaveChanges() {
      if (!this.hasChanges) return

      try {
        this.loading = true

        // 按 update_request_no 分组
        const groupedChanges = this.groupChangesByRequestNo()

        // 模拟API调用
        await this.saveChangesToServer(groupedChanges)

        // 更新原始位置记录
        Object.values(this.markerChanges).forEach(change => {
          if (change.marker.id) {
            this.originalPositions[change.marker.id] = change.newPosition
          }
        })

        // 清空变更记录
        this.markerChanges = {}

        this.$message.success('保存成功！')

      } catch (error) {
        console.error('保存失败:', error)
        this.$message.error('保存失败，请重试')
      } finally {
        this.loading = false
      }
    },

    /**
     * 取消更改
     */
    handleCancelChanges() {
      if (!this.hasChanges) return

      this.$confirm('确定要取消所有更改吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 恢复原始位置
        Object.values(this.markerChanges).forEach(change => {
          const marker = change.marker
          const originalPos = change.originalPosition
          marker[this.mapConfig.x_col] = originalPos.x
          marker[this.mapConfig.y_col] = originalPos.y
        })

        // 清空变更记录
        this.markerChanges = {}

        this.$message.info('已取消所有更改')
      })
    },

    /**
     * 按请求号分组变更
     */
    groupChangesByRequestNo() {
      const grouped = {}

      Object.values(this.markerChanges).forEach(change => {
        const requestNo = change.updateRequestNo
        if (!grouped[requestNo]) {
          grouped[requestNo] = {
            update_request_no: requestNo,
            markers: []
          }
        }

        grouped[requestNo].markers.push({
          id: change.marker.id,
          originalPosition: change.originalPosition,
          newPosition: change.newPosition
        })
      })

      return Object.values(grouped)
    },

    /**
     * 保存到服务器（模拟）
     */
    async saveChangesToServer(changes) {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1000))

      console.log('保存的变更数据:', changes)

      // 这里应该调用实际的API
      // return await this.$http.post('/api/map/markers/update', changes)
    },

    /**
     * 导入数据
     */
    handleImportData() {
      this.importDialogVisible = true
    },

    /**
     * 重置数据
     */
    handleResetData() {
      this.$confirm('确定要重置所有数据吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.initDemoData()
        this.markerChanges = {}
        this.$message.success('数据已重置')
      })
    },

    /**
     * 上传图片
     */
    handleUploadImage() {
      this.$message.info('图片上传功能待实现')
    },

    /**
     * 处理文件变更
     */
    handleFileChange(file) {
      this.pendingFile = file
    },

    /**
     * 确认导入
     */
    confirmImport() {
      if (!this.pendingFile) {
        this.$message.warning('请选择文件')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          if (Array.isArray(data)) {
            this.markerList = data
            this.saveOriginalPositions()
            this.markerChanges = {}
            this.$message.success('导入成功')
            this.importDialogVisible = false
          } else {
            this.$message.error('文件格式错误，需要数组格式')
          }
        } catch (error) {
          this.$message.error('文件解析失败')
        }
      }
      reader.readAsText(this.pendingFile.raw)
    }
  }
}
</script>

<style lang="scss" scoped>
.map-editor-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.page-header {
  background: white;
  border-bottom: 1px solid #e8e8e8;
  padding: 16px 24px;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .title-section {
    .page-title {
      margin: 0 0 4px 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
      display: flex;
      align-items: center;
      gap: 8px;

      i {
        color: #409eff;
      }
    }

    .page-description {
      margin: 0;
      font-size: 14px;
      color: #666;
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.page-content {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 16px;
  overflow: hidden;
}

.config-panel {
  width: 300px;
  flex-shrink: 0;

  .card-header {
    font-weight: 600;
  }

  .marker-stats {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;

    .stat-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;

      .stat-label {
        color: #666;
        font-size: 14px;
      }

      .stat-value {
        font-weight: 600;
        color: #333;
      }
    }
  }
}

.editor-area {
  flex: 1;
  min-height: 0;
}

.dialog-footer {
  text-align: right;
}

.upload-demo {
  text-align: center;
}

@media (max-width: 1200px) {
  .page-content {
    flex-direction: column;
  }

  .config-panel {
    width: 100%;
  }
}
</style>