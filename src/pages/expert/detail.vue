<template>
  <div class="detail-container">
    <table border="1">
      <tr>
        <td>姓名</td>
        <td>{{ data.name || "" }}</td>
        <td>性别</td>
        <td>{{ data.sex || "" }}</td>
        <td>出生年月</td>
        <td>{{ data.birthday || "" }}</td>
        <td rowspan="3" colspan="1" style="text-align: center">
          <img
            :src="getImagePath(data.personal_img)"
            alt="Photo"
            style="width: 100%"
            v-if="data.personal_img"
          />
        </td>
      </tr>
      <tr>
        <td>参加工作时间</td>
        <td>{{ data.service_years || "" }}</td>
        <td>政治面貌</td>
        <td>{{ data.political_outlook || "" }}</td>
        <td>民族</td>
        <td>{{ data._nation_disp || "" }}</td>
      </tr>
      <tr>
        <td>职务/职称</td>
        <td>{{ data.position || "" }}</td>
        <td>工作单位</td>
        <td colspan="3">{{ data.work_unit || "" }}</td>
      </tr>
      <tr>
        <td>专业领域</td>
        <td colspan="2">{{ data._appointment_time_disp || "" }}</td>
        <td>研究方向</td>
        <td colspan="3">{{ data.profession || "" }}</td>
      </tr>
      <tr>
        <td>学历/学位</td>
        <td colspan="2">{{ data._highest_degree_disp || "" }}</td>
        <td>毕业院校</td>
        <td colspan="3">{{ data.graduation_institution || "" }}</td>
      </tr>
      <tr>
        <td>通讯地址</td>
        <td colspan="6">{{ data.mail_address || "" }}</td>
      </tr>
      <tr>
        <td>专家联系方式</td>
        <td colspan="2">{{ data.tel_num || "" }}</td>
        <td>电子邮箱</td>
        <td colspan="3">{{ data.email || "" }}</td>
      </tr>
      <tr>
        <td colspan="3">
          工作单位科普主管部门（如党办、宣传处、科教、办公室、疾控处等）
        </td>
        <td colspan="4">{{ data.department_name || "" }}</td>
      </tr>
      <tr>
        <td>联系人</td>
        <td>{{ data.organ_level || "" }}</td>
        <td>联系电话</td>
        <td colspan="2">{{ data.office_phone || "" }}</td>
        <td>联系人座机</td>
        <td colspan="1"></td>
      </tr>
      <tr>
        <td colspan="2">专家信息文件PDF</td>
        <td colspan="5">
          <el-button type="text" @click="previewPDF(data.highest_education_level,'专家信息文件')"
            >预览</el-button
          >
          <el-button type="text" @click="downloadPDF(data.highest_education_level,'专家信息文件')"
            >下载</el-button
          >
        </td>
      </tr>
      <tr>
        <td colspan="2">单位公示文件PDF</td>
        <td colspan="5">
          <el-button type="text" @click="previewPDF(data.notice_file,'单位公示文件')">预览</el-button>
          <el-button type="text" @click="downloadPDF(data.notice_file,'单位公示文件')">下载</el-button>
        </td>
      </tr>
      <tr>
        <td>擅长</td>
        <td colspan="6">
          {{ data.be_good_at || "" }}
        </td>
      </tr>
      <tr>
        <td>简介</td>
        <td colspan="6">
          {{ data.brief_introduction || "" }}
        </td>
      </tr>
      <tr>
        <td>状态</td>
        <td colspan="2">{{ data.status || "" }}</td>
        <td>是否开放</td>
        <td colspan="3">{{ data.opened || "" }}</td>
      </tr>
      <tr>
        <td>等级</td>
        <td colspan="2">{{ data.dependency || "" }}</td>
        <td>审批状态</td>
        <td colspan="3">{{ data.proc_status || "" }}</td>
      </tr>
      <tr>
        <td>创建时间</td>
        <td colspan="2">
          {{ data.create_time || "" }}
        </td>
        <td colspan="4"></td>
      </tr>
    </table>
    <div class="my-4">
      <el-button type="primary" v-if="editButton" @click="activeForm = 'update'"
        >编辑</el-button
      >
    </div>
    <el-dialog
      title="编辑"
      width="90%"
      class="customDialogClass"
      :close-on-click-modal="1 == 2"
      :visible="activeForm == 'update'"
      append-to-body
      @close="activeForm = 'xx'"
    >
      <update
        name="detail-update"
        ref="update-form"
        v-if="activeForm == 'update' && data"
        :pk="data.id"
        pkCol="id"
        :service="updateService"
        :nav-after-submit="false"
        :parentPageType="'detail'"
        @executor-complete="onSubmit"
      >
      </update>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "ExpertDetail",
  components: {
    update: () => import("@/components/common/update.vue"),
  },
  data() {
    return {
      data: {},
      activeForm: null,
      formButton: null,
    };
  },
  computed: {
    editButton() {
      return this.formButton?.find(
        (item) => item.button_type === "edit" && item.permission === true
      );
    },
    updateService() {
      return this.editButton?.service_name;
    },
  },
  methods: {
    previewPDF(url,type){
      this.addTabByUrl(`/vpages/#/viewpdf2?pdfsrc=${encodeURIComponent(url)}`,type)
      // window.open(`/vpages/#/viewpdf2?pdfsrc=${encodeURIComponent(url)}`)
    },
    downloadPDF(url,type){
      // 创建a标签下载
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}.pdf`;
      a.click();
      a.remove();
    },
    onSubmit(event) {
      console.log("executor-complete:", event);
      if (event?.data?.state == "SUCCESS") {
        this.activeForm = null;
        this.getData();
      }
    },
    async getV2() {
      const url = `/hsprl/select/srvsys_service_columnex_v2_select`;
      const req = {
        serviceName: "srvsys_service_columnex_v2_select",
        colNames: ["*"],
        condition: [
          {
            colName: "service_name",
            value: "srvjk_expert_info_approved_select",
            ruleType: "eq",
          },
          { colName: "use_type", value: "detail", ruleType: "eq" },
          {
            colName: "main_srv",
            value: "srvjk_expert_info_approved_select",
            ruleType: "eq",
          },
        ],
        order: [{ colName: "seq", orderType: "asc" }],
      };
      const res = await this.$http.post(url, req);
      if (res?.data?.state == "SUCCESS") {
        if (res.data.data?.formButton) {
          this.formButton = res.data.data.formButton;
        }
      }
    },
    async getData() {
      const url = `/hsprl/select/srvjk_expert_info_approved_select?srvjk_expert_info_approved_select`;
      const req = {
        serviceName: "srvjk_expert_info_approved_select",
        colNames: ["*"],
        condition: [
          {
            colName: "id",
            ruleType: "eq",
            value: this.$route.params.id,
          },
        ],
        page: { pageNo: 1, rownumber: 1 },
      };
      const res = await this.$http.post(url, req);
      console.log(res);
      if (res?.data?.state == "SUCCESS") {
        if (res.data.data.length > 0) {
          this.data = res.data.data[0];
        }
      }
    },
  },
  mounted() {
    if (this.$route.params.id) {
      this.getV2();
      this.getData();
    }
  },
  created() {},
};
</script>

<style scoped lang="scss">
.detail-container {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 20px;
  flex-direction: column;
}

table {
  border-collapse: collapse;
}

td {
  padding: 8px;
  text-align: center;
  width: 130px;
  height: 60px;
  border-color: #555;
}
</style>
