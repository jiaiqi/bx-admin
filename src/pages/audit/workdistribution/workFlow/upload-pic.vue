<template>
  <div class="up_mod">
    <el-dialog title="图片上传" :visible.sync="upVisible" :destroy-on-close="true" :close-on-click-modal="false" @closed="setListInfo">
          <el-form :model="picForm" :rules="rules"  ref="picForm" label-width="auto" class="demo-ruleForm">
<!--            <el-form-item label="证据说明" prop="icon_title" style="margin:0.9375rem 0">-->
<!--              <el-input v-model="picForm.icon_title"></el-input>-->
<!--            </el-form-item>-->
            <el-form-item label="证据图片" prop="icon_att" style="margin:0.9375rem 0">
              <div class="img_list" v-if="fileLists&&fileLists.length>0">
            <!-- 使用element-ui自带样式 -->
            <ul class="el-upload-list el-upload-list--picture-card">
              <transition-group style="display: flex; flex-wrap: wrap">
                <li
                    v-for="(item, index) in fileLists"
                    :key="item.fileurl"
                    class="el-upload-list__item is-success animated"
                    style="position: relative"
                >
                  <el-image
                      class="el-upload-list__item-thumbnail pre_pic"
                      :src="item.url"
                      :preview-src-list="preList"
                     >
                  </el-image>
              <div class="img_bts">
                <span
                    class="el-upload-list__item-preview"
                    title="下载"
                    @click="dowmlaodUrl(item.url)"
                >
                  <i class="el-icon-download"></i>
                </span>
                <span
                    class="el-upload-list__item-preview"
                    title="删除"
                    @click="handleRemoveFileDetail(item, fileLists,index)"
                >
                  <i class="el-icon-delete"></i>
                </span>
              </div>
                </li>
              </transition-group>
            </ul>
          </div>
          <el-upload
              ref="upload"
              class="upload-demo"
              :action="url"
              :with-credentials="true"
              :headers="getHeaders()"
              :on-preview="handlePreview"
              :before-upload="beforeAvatarUpload"
              :on-success="handleSuccess"
              :on-remove="handleRemove"
              :before-remove="beforeRemove"
              :file-list="fileLists"
              :data="uploadParams"
              clearable
              :show-file-list="false"
              list-type="picture-card"
          >
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
          <div class="el-upload__tip w-full" style="margin-top: 0">
            {{ setFileDesc }}
          </div>
        </el-form-item>
            <el-row>
              <el-col :span="24" style="display: flex;justify-content: center" class="cl_bts">
                <el-button type="primary" icon="el-icon-check" size="mini" @click="handleSubmitPic">提交</el-button>
                <el-button type="primary" icon="el-icon-refresh-left" size="mini" @click="resetForm">取消</el-button>
              </el-col>
            </el-row>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import OrderApi from "@/pages/audit/api/order";
const OrderUtil= new OrderApi();
export default {
  name: "upload-pic",
  data(){
    return{
      preList:[],
      setFileDesc:'请上传jpg/png格式的图片,大小不超过2MB',
      rules: {
        // icon_title: [
        //   { required: true, message: '证据说明不能为空', trigger: 'blur' },
        // ],
        icon_att: [
          { required: true, message: '证据图片不能为空', trigger: 'blur' },
        ],
      },
      picForm:{
        icon_type: "图片",
        icon_att:'',  //上传成功后返回的file_no
        icon_title:'占位图', //图片说明
        serviceName: "srvfile_icon_db_add"
      },
      fileLength:0,
      url:'',
      uploadParams: {
        serviceName: "srv_bxfile_service",
        interfaceName: "add",
        app_no:'file',
        table_name: "bxfile_icon_db",
        thumbnailType: "fwsu_100",
        columns: "icon_att",
      },
      fileType: "jpg/png/svg/PNG/JPG/JPEG/jpeg/gif/GIF/bmp/tif/tiff/webp",
      fileSize:2,
      limit:8,
      fileLists: [],
      prUrl:'',
      initFileList:[],
      infoId:'',
    }
  },
  props: {
    objId:{
      type:String,
      default:''
    },
    picVisible: {
      type: Boolean,
      default: false
    },
    files:{
      type: Array,
      default: () => []
    }
  },
  watch: {
    upVisible: {
      handler(newVal) {
        this.fileLists = JSON.parse(JSON.stringify(this.files))
        this.handleFilterUrl()
        if(this.objId&&this.objId.length>0){
          // this.initPicByIds()
        }
      },
      immediate: true,
    }
  },
  computed: {
    upVisible: {
      get() {
        if(this.picVisible){
          this.getInitList()
        }
        return this.picVisible;
      },
      set(val) {
        this.$emit('update:picVisible', val);
      }
    }
  },
  created(){
   this.url= window.APP_CONFIG.API_URL+'/file/upload'
   this.prUrl=OrderUtil.dowPicInfoUrl();

  },
  methods:{
    //初始单条化图片信息使用
     initPicByIds(){
       let _this= this;
       let info={
         condition:[{colName: "id", value:this.objId, ruleType: "eq"}]
       }
       OrderUtil.getPicInfoById(info).then(res=>{
        if(res.data.state!=='SUCCESS') return;
        let ls=res.data.data[0];
         _this.infoId=ls.id;
         _this.picForm.icon_title=ls.icon_title
       }).catch(err=>{
      })
     },
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择 ${this.limit}个文件`);
    },
    //保存判断有数据id时使用数据id更新保存不走新增
    handleUpdateById(){
     let obj={
       condition:[{colName: "id", ruleType: "eq", value: this.objId}],
       regInfo:[{icon_title: this.picForm.icon_title}]
     }
      OrderUtil.updatePicInfo(obj).then(res=>{
         if(res.data.state!=='SUCCESS') return;
        this.$message.success("保存成功！");
        let info=res.data.response[0]?.response;
        this.$emit("getSavePicInfo",info);
        this.setListInfo()
      }).catch(err=>{

      })
    },
    //上传成功使用
    async handleSuccess(response, file, fileList) {
      if (response.fileurl?.startsWith("http")) {
        // 返回的http链接 查询上传状态 上传成功后再继续后面操作 避免未成功上传到华为云就显示在页面上导致显示的图片加载失败
        this.loading = true;
        if (response?.file_no) {
          // 查询文件上传状态
          await this.checkUploadStatus(response.file_no);
        }
        // await new Promise((resolve) => setTimeout(resolve, 500));
        this.loading = false;
      }
      if (response.state === undefined) {
        this.$message.info("上传成功！");

        this.uploadParams.file_no = response.file_no;
        response.url = this.prUrl + response.fileurl;
        if (response.fileurl?.indexOf("http") === 0) {
          response.url = this.prUrl+response.fileurl;
        }
        this.fileLists.push(response);
        if (response.fileurl?.indexOf("http") === 0) {
          // this.field.model = response.fileurl;
        }
        // this.$emit("change", this.field.model);
        // this.setObjInfo(fileList);
      } else {
        this.$message.error("上传失败！");
        this.fileLists.splice(this.fileLists.length - 1, 1);
      }
      this.fileLength = fileList.length;
      this.loading = false;
      this.handleFilterUrl();
    },
     //删除前调用
    async beforeRemove(file, fileList) {
      if (file?.file_no) {
        file.status = "success";
      }
      if (file && file.status === "success") {
        //删除
        let fileurl;
        if (file?.file_no && !file.response) {
          file.response = { ...file };
        }
        if (file.response) {
          fileurl = file.response.fileurl;
        } else {
          fileurl = file.url.split("filePath=")[1];
        }
        let params = {
          fileurl: fileurl,
        };
        const response = await OrderUtil.deletePicInfo(params);
        this.fileLength = fileList.length - 1;
        // this.$emit("change", this.field.model);
        if (response && response.body.resultCode === "SUCCESS") {
          this.$message.info(response.body.state);
          return true;
        } else {
          this.$message.info(response.body.state);
          return false;
        }
      } else if (typeof file === "string" && file.indexOf("http") === 0) {
        // this.field.model = "";
        // this.$emit("change", this.field.model);
        return true;
      }
    },
    //删除使用
    handleRemove(file, fileList) {
      // this.setObjInfo(fileList);
      // if (fileList.length === 0) {
      //   this.field.model = "";
      // }
    },
    //点击文件列表中已上传的文件
    handlePreview(file) {
      if (file.url == null) {
        //如果是新上传的文件需要获取url
        file.url =this.prUrl + file.response.fileurl;
      }
      window.open(file.url);
    },
    //设置请求头
    getHeaders() {
      let bx_auth_ticket = sessionStorage.getItem("bx_auth_ticket");
      return {
        bx_auth_ticket: bx_auth_ticket,
      };
    },
    beforeAvatarUpload(file) {
      const isLt2M = file.size / 1024 / 1024 < 2;
      let   type = file.name.slice(file.name.lastIndexOf(".") + 1).toLowerCase();
      let flag = false;
      if (!isLt2M) {
        this.$message.error('上传文件大小不能超过 2MB!');
        return false; // 阻止文件上传
      }
      if (this.fileType.includes(type)) {
        flag = true;
      }
      if (!flag) {
        this.$message.error("只能上传" + this.fileType + "文件!");
        return false;
      }
    },
    //获取原始传入的数据
    getInitList(){
      this.initFileList=[];
      if(this.fileLists&&this.fileLists.length>0){
        this.uploadParams.table_name = this.fileLists[0].table_name || "";
        this.uploadParams.columns = this.fileLists[0].columns || "";
        this.picForm.icon_att=this.fileLists[0].file_no;
        this.uploadParams.file_no=this.fileLists[0].file_no
      }
    },
    //将上传的图片列表暴露
    setListInfo(){
     this.fileLists=[];
     this.handleFilterUrl()
     this.upVisible=false;
    },
    //新增保存使用
    saveByNoIdInfo(){
     let params = {
       icon_att: this.picForm.icon_att,
       icon_title:this.picForm.icon_title,
       icon_type: "图片",
     }
     OrderUtil.savePicInfo([params]).then(res => {
       if(res.data.state!=="SUCCESS") return;
       this.$message.success("保存成功！");
       let info=res.data.response[0]?.response;
       this.$emit("getSavePicInfo",info);
       this.setListInfo()
     }).catch(err => {})
    },
    //执行提交信息
    handleSubmitPic(){
      let _this = this;
      _this.$refs.picForm.validate((valid) => {
        if (valid) {
          if(this.objId&&this.objId.length>0){
            _this.handleUpdateById()
          }else {
            _this.saveByNoIdInfo()
          }
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    //重置
    resetForm(formName) {
      this.upVisible=false;
    },
    //过滤获取图片地址作为预览使用
    handleFilterUrl(){
      if(this.fileLists.length>0){
        this.picForm.icon_att=this.fileLists[0].file_no;
        this.fileLists.map(item=>{this.preList.push(item.url)})
      }else {
        this.preList=[]
        this.picForm.icon_att=''
      }
    },
    //下载
    dowmlaodUrl(item) {
      window.open(item);
    },
    // 删除
    async handleRemoveFileDetail(file, fileList, index) {
      const isDelete = await this.beforeRemove(file, fileList);
      if (isDelete) {
        this.fileLists.splice(index, 1);
        console.log(this.fileLists,'2121');
        this.handleFilterUrl()
        this.handleRemove(file, fileList);
      }
    },
  },
  mounted() {
    console.log(OrderUtil.dowPicInfoUrl());
  }
}
</script>

<style >
.el-upload-list{
  border:none !important;
}
.el-upload-list__item:hover{
  .img_bts{
   display: flex;
   transition: all .3s;
  }
}
.img_bts{
  transition:all .3s;
  opacity: 0;
  display: none;
  width: 100%;
  height:2.1875rem;
  position: absolute;
  z-index:20;
  background: #212122;
  top: 75%;
  opacity: .5;
  color: #fff;
  font-size: 1.125rem;
  padding:0 0.625rem;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  >span{
    margin:0 0.5rem;
  }
}
</style>