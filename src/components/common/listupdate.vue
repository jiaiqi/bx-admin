<template>
  <div class="listupdate-container">
    <el-card v-for="(item, index) in editableData" :key="item.id || item.obj_id || item.booking_id" class="listupdate-item">
      <div class="listupdate-header">
        <h3>{{ item.obj_type+'评价' }}</h3>
      </div>
      
      <div class="listupdate-content">
        <el-row :gutter="16">
          <el-col :span="12">
            <div class="info-item">
              <label>编号：</label>
              <span>{{ item.no || '-' }}</span>
            </div>
            <div class="info-item">
              <label>预约单号：</label>
              <span>{{ item.order_no || '-' }}</span>
            </div>
            <div class="info-item">
              <label>评价：</label>
              <span>{{ item.obj_name || '-' }}</span>
            </div>
            <div class="info-item">
              <label>学校名称：</label>
              <span>{{ item.school_name || '-' }}</span>
            </div>
          </el-col>
        </el-row>
        
        <!-- 星星评分 -->
        <div class="listupdate-section">
          <label>评分：</label>
          <div class="listupdate-wrapper">
            <bx-input-number
              v-model="item.score"
              :disabled="false"
              :fieldMoreConfig="{ subType: 'rate', showScore: true }"
              :max="5"
              :min="1"
              @input="onScoreChange(item, $event)"
            />
            <span class="score-max">/ 5分</span>
          </div>
        </div>
        
        <!-- 评论输入 -->
        <div class="listupdate-section">
          <label>评论意见：</label>
          <div class="listupdate-wrapper">
            <el-input
              v-model="item.remark"
              type="textarea"
              :rows="4"
              placeholder="请输入评论意见"
              resize="none"
            />
          </div>
        </div>
        
        <!-- 图片上传 -->
        <div class="listupdate-section">
          <label>上传图片：</label>
          <div class="listupdate-wrapper">
            <upload-image
              ref="uploadImage"
              :limit="3"
              :field="getUploadField(item)"
              @change="imgChange($event, item)"
            />
          </div>
        </div>
      </div>
    </el-card>
    
    <!-- 底部提交按钮 -->
    <div class="listupdate-footer">
      <el-button type="primary" @click="handleSubmit">提交</el-button>
      <el-button @click="handleCancel">取消</el-button>
    </div>
  </div>
</template>

<script>
import BxInputNumber from '../ui/bx-input-number.vue';
import UploadImage from '../ui/upload-image.vue';

export default {
  name: 'ListUpdate',
  components: {
    BxInputNumber,
    UploadImage
  },
  props: {
    dataList: {
      type: Array,
      default: () => [],
      description: '要显示的数据列表，每条记录包含obj_name, status, no, order_no, score等字段'
    },
    // 兼容Dialog组件传递的defaultValues属性
    defaultValues: {
      type: Array,
      default: () => [],
      description: '从Dialog组件传递过来的数据列表'
    },
    // 服务名属性，从父组件传递
    service: {
      type: String,
      default: 'srvedu_rank_score_update',
      description: '服务名称'
    },
    // 主服务名属性
    mainService: {
      type: String,
      default: 'srvedu_rank_score_update',
      description: '主服务名称'
    },
    // 应用名属性
    application: {
      type: String,
      default: '',
      description: '应用名称'
    }
  },
  data() {
    return {
      // 用于编辑的本地数据副本
      editableData: [],
      field:{
        info:{
          editor:'upload-image',
          label:'上传图片',
          type:'Image',
          visible: true,
          name:'image',
          bodyVisible: true,
          srvCol:{
            service_name:'srvedu_sch_order_update',
            columns:'image',
            table_name:'srvedu_sch_order',
            label:'上传图片'
          }
        }
      }
    };
  },
  computed: {
    // 优先使用defaultValues，如果没有则使用dataList
    displayData() {
      // 确保返回的是数组
      if (Array.isArray(this.defaultValues) && this.defaultValues.length > 0) {
        return this.defaultValues;
      }
      return Array.isArray(this.dataList) ? this.dataList : [];
    }
  },
  watch: {
    // 当displayData变化时，同步到editableData
    displayData: {
        handler(newData) {
          // 深拷贝数据，避免直接修改props
          this.editableData = JSON.parse(JSON.stringify(newData));
          // 为每条数据初始化score和remark字段
          this.editableData.forEach(item => {
            if (item.score === undefined || item.score === null) {
              item.score = 0;
            } else {
              item.score = this.parseScore(item.score);
            }
            if (item.remark === undefined || item.remark === null) {
              item.remark = '';
            }
            // 初始化图片字段
            if (item.image === undefined || item.image === null || item.image === '') {
              item.image = [];
            } else if (!Array.isArray(item.image)) {
              item.image = [item.image]; // 转换为数组
            }
          });
        },
        immediate: true,
        deep: true
      }
  },
  methods: {
    // 获取上传组件的field配置
    getUploadField(item) {
        // 创建一个配置对象，支持图片上传和预览
        const field = {
          info: {
            editor: 'upload-image',
            label: '上传图片',
            type: 'Image',
            visible: true,
            name: 'image',
            bodyVisible: true,
            editable: true,
            srvCol: {
              service_name: 'srvedu_sch_order_select',
              columns: 'image',
              table_name: 'bxedu_order_info',
              label: '上传图片'
            },
            moreConfig: {
              fileMaxSize: 10 // 10MB
            }
          },
          // 模拟必要的方法
          getAnyValidateError: function() { return ''; },
          serviceApi: function() {
            // 返回实际的上传下载URL
            return {
              uploadFile: '/file/upload',
              downloadFile: '/file/download?filePath='
            };
          },
          // 添加fileType和fileSize配置
          fileType: "jpg/png/svg/PNG/JPG/JPEG/jpeg/gif/GIF/bmp",
          fileSize: 10 * 1024 ,
          // 添加自定义处理上传成功的逻辑
          handleSuccess: function(response) {
            // 直接使用fileurl构建完整的图片URL
            if (response.fileurl) {
              // 构建完整的图片URL并设置到model中
              const fullUrl = '/file/download?filePath=' + response.fileurl;
            }
            return response.file_no || '';
          }
        };
        
        // 使用Object.defineProperty创建model属性，确保与upload-image组件正确配合
        Object.defineProperty(field, 'model', {
          get: function() {
            // 如果是数组，取第一个元素；否则返回原值
            return Array.isArray(item.image) && item.image.length > 0 ? item.image[0] : '';
          },
          set: function(value) {
            // 确保item.image是数组格式
            if (!item.image || !Array.isArray(item.image)) {
              item.image = [];
            }
            // 如果有值，替换第一个元素；否则清空数组
            if (value) {
              item.image[0] = value;
            } else {
              item.image = [];
            }
          }
        });
        
        return field;
      },
    
    // 处理图片变化事件
    imgChange(value, item) {
        console.log('imgChange4444444', value, item);
          item.image = value;
      },
    
    // 确保score字段转换为数字类型
    parseScore(score) {
      const num = parseInt(score);
      return isNaN(num) ? 0 : Math.max(0, Math.min(5, num));
    },
    
    // 处理评分变化
    onScoreChange(item, value) {
      item.score = this.parseScore(value);
    },
    
    // 提交按钮点击事件
    handleSubmit() {
      // 构建符合要求的提交数据
      const submitData = this.editableData.map(item => ({
        serviceName: this.mainService || 'srvedu_rank_score_update',
        condition: [
          {
            colName: 'id',
            ruleType: 'eq',
            value: item.id || item.obj_id || item.booking_id
          }
        ],
        data: [
          {
            score: item.score,
            remark: item.remark || '',
            image: item.image || [] // 确保是数组类型
          }
        ]
      }));
      
      // 获取服务URL并发送请求
      if (this.getServiceUrl) {
        // 使用组件提供的getServiceUrl方法
        const urlAddress = this.getServiceUrl('update', this.mainService || 'srvedu_rank_score_update', this.application);
        this.$http.post(urlAddress, submitData).then((response) => {
          console.log('评价提交成功', response);
          // 显示成功提示
          if (this.$message) {
            this.$message.success('评价提交成功');
          }
          // 触发提交完成事件，通知父组件
          this.$emit('action-complete', 'submit', submitData);
        }).catch((error) => {
          console.error('评价提交失败', error);
          // 显示错误提示
          if (this.$message) {
            this.$message.error('评价提交失败，请重试');
          }
        });
      } else {
        // 如果没有getServiceUrl方法，回退到事件通知方式
        console.warn('getServiceUrl方法不可用，使用事件通知方式');
        this.$emit('action-complete', 'submit', submitData);
      }
    },
    
    // 取消按钮点击事件
    handleCancel() {
      // 触发取消事件
      this.$emit('action-complete', 'cancel');
    }
  }
};
</script>

<style scoped>
.listupdate-container {
  padding: 20px;
}

.listupdate-item {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.listupdate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e6e6e6;
}

.listupdate-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.status {
  padding: 4px 12px;
  background-color: #f0f9ff;
  color: #36cfc9;
  border-radius: 16px;
  font-size: 12px;
}

.listupdate-content {
  padding: 0 5px;
}

.info-item {
  margin-bottom: 10px;
  line-height: 1.8;
}

.info-item label {
  display: inline-block;
  width: 80px;
  color: #666;
  font-weight: 500;
}

.info-item span {
  color: #333;
}

.listupdate-section {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.listupdate-section label {
  display: inline-block;
  width: 80px;
  color: #666;
  font-weight: 500;
  vertical-align: middle;
}

.listupdate-wrapper {
  display: inline-block;
  width: calc(100% - 80px);
  vertical-align: middle;
}

.listupdate-footer {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e6e6e6;
  text-align: right;
}

.score-max {
  margin-left: 10px;
  color: #999;
  font-size: 14px;
  vertical-align: middle;
}
</style>