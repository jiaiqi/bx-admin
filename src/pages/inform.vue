<template>
  <div class="page-wrap">
    <div class="title" v-if="content">
      {{ content.title || "" }}
    </div>
    <div class="content" v-html="recoverFileAddress4richText(content.context || content.content)"></div>
    <div class="attachment" v-if="attachmentList && attachmentList.length">
      <div>附件：</div>
      <div class="attachment-item" v-for="item in attachmentList">
        <a :href="serviceApi().downloadFile + item.fileurl">{{ item.src_name }}</a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      id: "",
      content: "",
      serviceName: '',
      srvApp: '',
      fileCol: 'attachment',
      // fileCol: 'attachment',
      attachmentList: [],
    };
  },
  methods: {
    getContent() {
      const url = `/${this.srvApp}/select/${this.serviceName}`;
      const req = {
        serviceName: this.serviceName,
        colNames: ["*"],
        page: {pageNo: 1, rownumber: 1},
      };
      if (this.id) {
        req.condition = [{colName: "id", ruleType: "eq", value: this.id}]
      }
      this.select(
        this.serviceName,
        req.condition,
        null,
        null,
        null,
        null,
        this.srvApp,
        null,
        req.colNames,
        null
      ).then((res) => {
        if (res.data.state === "SUCCESS") {
          if (Array.isArray(res.data.data) && res.data.data.length) {
            this.content = res.data.data[0];
            if (this.content.attachment || this.content.file) {
              this.getattachmentList();
            }
          }
        }
      });
    },
    getattachmentList() {
      const req = {
        serviceName: "srvfile_attachment_select",
        colNames: ["*"],
        condition: [
          {colName: "file_no", value: this.content.attachment || this.content.file, ruleType: "eq"},
          {colName: "is_delete", value: "1", ruleType: "eq"},
        ],
      };
      this.select(
        "srvfile_attachment_select",
        req.condition,
        null,
        null,
        null,
        null,
        "file",
        null,
        req.colNames,
        null
      ).then((res) => {
        if (res.data.state === "SUCCESS") {
          if (Array.isArray(res.data.data)) {
            this.attachmentList = res.data.data;

          }
        }
      });
    },
  },
  created() {
    this.id = this.$route.query.id;
    this.srvApp = this.$route.query.srvApp || 'xsyx';
    this.serviceName = this.$route.query.serviceName || 'srvyxjdsb_apply_notice_select';
    this.getContent();
  },
};
</script>

<style lang="scss" scoped>
.page-wrap {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  padding: 71px 46px;
  background-image: url("../assets/img/article_bg.jpg");
  background-size: 100% 100%;
  background-repeat: no-repeat;

  .title {
    font-size: 36px;
    font-weight: 700;
    color: #000;
    padding: 70px 0 0 145px;
    position: relative;
    display: inline-block;
    z-index: 1;

    &::before {
      content: "";
      width: 30px;
      height: 30px;
      border-radius: 50%;
      left: 70px;
      bottom: -10px;
      background-color: #64d2fe;
      position: absolute;
    }

    &::after {
      content: "";
      width: calc(100% - 90px);
      height: 40px;
      border-radius: 30px;
      left: 120px;
      bottom: -10px;
      background-color: #64d2fe;
      position: absolute;
      z-index: -1;
    }
  }

  .content {
    padding: 46px 79px;
    max-height: 60vh;
    overflow: auto;
  }

  .attachment {
    padding: 0 75px 20px;
  }
}
</style>
