<template>
  <div style="" v-loading="loading" class="retail-tree">
    <!-- <button @click="onClick">刷新</button> -->
    <el-form
      :model="roleModel"
      :rules="rules"
      ref="roleForm"
      label-width="100px"
      class="demo-ruleForm"
    >
      <el-form-item label="角色名称" prop="role_name">
        <el-input
          :disabled="pageType == 'detail'"
          v-model="roleModel.role_name"
          placeholder="请输入角色名称"
        ></el-input>
      </el-form-item>
      <el-form-item label="角色描述" prop="remark">
        <el-input
          :disabled="pageType == 'detail'"
          type="textarea"
          v-model="roleModel.remark"
          placeholder="请输入角色描述"
        ></el-input>
      </el-form-item>
      <el-form-item label="权限类型" prop="auth_type">
        <el-checkbox-group v-model="roleModel.auth_type">
          <el-checkbox lable="自定义" true-label="自定义">自定义</el-checkbox>
          <el-checkbox lable="所有ALL" true-label="所有ALL"
            >所有ALL</el-checkbox
          >
        </el-checkbox-group>
      </el-form-item>
    </el-form>
    <el-form
      ref="form"
      :model="terminalTypeModel"
      label-width="100px"
      v-if="roleModel.auth_type === '自定义'"
    >
      <el-form-item
        :label="
          item.terminal_type == '一体机' ? '台式收银机' : item.terminal_type
        "
        v-for="(item, index) in terminalType"
        :key="index"
      >
        <el-checkbox
          v-model="cfg.checked"
          v-if="pageType !== 'detail'"
          v-for="(cfg, n) in item.checkCfg"
          :key="n"
          @change="checkChange(cfg, item, index)"
          >{{ cfg.label }}</el-checkbox
        >
        <!-- <el-checkbox-group v-model="item.value" @change="handleCheckedCitiesChange">
          <el-checkbox :label="cfg.label" :name="cfg.value" v-for="(cfg,n) in item.checkCfg" :key="n">{{cfg.label}}</el-checkbox>
        </el-checkbox-group> -->
        <!-- !getUserChecked(item.checkCfg,'cascade') -->
        <el-tree
          :ref="'tree' + index"
          :data="item._treeData"
          show-checkbox
          :node-key="nodeKey"
          :default-expand-all="getUserChecked(item.checkCfg, 'expand')"
          :check-strictly="false"
          :default-checked-keys="item.checkedKeys"
          @current-change="currentChange"
          @check="treeCurrentChange"
          :props="defaultProps"
        >
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <span>{{ node.label }}</span>
            <!-- <span>
              <el-button
                type="text"
                size="mini"
                @click="() => append(data)">
                Append
              </el-button>
              <el-button
                type="text"
                size="mini"
                @click="() => remove(node, data)">
                Delete
              </el-button>
            </span> -->
          </span>
        </el-tree>
      </el-form-item>
    </el-form>
    <el-row
      v-if="pageType !== 'detail'"
      type="flex"
      class="row-bg"
      justify="center"
    >
      <el-button type="primary" @click="onSubmit">{{
        showLogs.buttonName
      }}</el-button>
    </el-row>
  </div>
</template>

<script>
export default {
  name: "authority",
  components: {},

  props: {
    propsData: {
      type: Object,
      default: function () {
        return {};
      },
    },
    formModel: {
      type: Object,
      default: function () {
        return {};
      },
    },
    nodeKey: {
      type: String,
      default: function () {
        return "fun_no";
      },
    },
    nodeLabel: {
      type: String,
      default: function () {
        return "fun_name";
      },
    },
  },

  data() {
    return {
      num: 0,
      loading: false,
      roleModel: {
        remark: "",
        role_name: "",
        auth_type: "自定义",
      },
      showLogs: {
        buttonName: "提交",
        type: "", // success  error
        title: "",
        isShow: false,
      },
      rules: {
        auth_type: [
          { required: true, message: "请选择角色类型", trigger: "change" },
        ],
        role_name: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          { min: 1, max: 10, message: "长度在1 到 10 个字", trigger: "blur" },
        ],
      },
      roleData: null, // 回显角色信息
      roleFunData: null, // 默认角色权限合计。
      treeData: [],
      defaultExpandAll: true,
      defaultProps: {
        disabled: function (data, node) {
          console.log(data, node);
          if (
            (data.is_require_srv == "是" &&
              node.hasOwnProperty("parent") &&
              node.parent.hasOwnProperty("checked") &&
              node.parent.checked == true &&
              node.checked == true) ||
            data.disabled
          ) {
            return true;
          } else {
            return false;
          }
        },
      },
      checkedKeys: [],
      expandedKeys: [],
      terminalType: [],
      buildData: [],
      terminalTypeModel: null,
      data: [
        {
          role_name: "内部角色1",
          type: "add",
          role_no: "角色编号",
          remark: "说明",
          menus: ["test_menu"],
          funs: ["001", "002"],
          srvs: [
            {
              service: "srvtest_table_select",
              operate_type: "select",
            },
          ],
        },
      ],
      authFunListdata: [],
      checkedNodes: [],
      req: {
        role_name: "内部角色1",
        type: "add",
        role_no: "角色编号",
        remark: "说明",
        menus: ["test_menu"],
        funs: ["001", "002"],
        srvs: [
          {
            service: "srvtest_table_select",
            operate_type: "select",
          },
        ],
      },
    };
  },
  computed: {
    pageType: function () {
      return this.$route.query.type || this.$route.params.type || "detail";
    },
    roleNo: function () {
      return (
        this.$route.query.role_no ||
        this.$route.params.role_no ||
        "RL_202210270003"
      );
    },
  },
  methods: {
    onSubmit() {
      this.loading = true;
      if (this.pageType == "update") {
        this.setRoleAuth();
      } else if (this.pageType == "add") {
        this.setRoleAuth();
      } else if (this.pageType == "detail") {
        this.loadUpdateDefaultData();
      }
    },
    reqRun() {
      // let nodes = this.checkedNodes
      let self = this;
      let req = {
        role_name: this.roleModel.role_name,
        type: this.pageType,
        remark: this.roleModel.remark,
        auth_type: this.roleModel.auth_type,
        menus: [],
        funs: [],
        srvs: [],
      };
      let checkedNodes = [];
      let trees = this.terminalType;

      if (this.roleModel.auth_type == "自定义") {
        for (let node in trees) {
          let nodes = [];
          let treemode = "tree" + node;
          nodes = self.$refs[treemode][0].store._getAllNodes();
          //  checkedNodes = nodes.filter((item) => item.checked == true)
          for (let nl of nodes) {
            if (nl.checked == true) {
              checkedNodes.push(nl);
            }
          }
          //  checkedNodes = checkedNodes.concat(nodes)
        }
        for (let n in checkedNodes) {
          if (checkedNodes[n].data.relate_menu_no) {
            req.menus.push(checkedNodes[n].data.relate_menu_no);
          }
          if (checkedNodes[n].data.fun_no) {
            req.funs.push(checkedNodes[n].data.fun_no);
          }
          let srv = {
            service: "srvtest_table_select",
            operate_type: "select",
          };
          if (checkedNodes[n].data.relate_srv) {
            srv = {
              service: checkedNodes[n].data.relate_srv,
              operate_type: checkedNodes[n].data.srv_type,
            };
            req.srvs.push(JSON.stringify(srv));
          }
        }
      }
      req.funs = Array.from(new Set(req.funs));
      req.menus = Array.from(new Set(req.menus));
      req.srvs = Array.from(new Set(req.srvs));
      let arr = req.srvs;
      req.srvs = arr.map((item) => JSON.parse(item));
      // let srvsStr = JSON.stringify(req.srvs)

      if (this.pageType == "update") {
        req.role_no = this.roleNo;
      }

      return [
        {
          serviceName: "srvsys_set_app_role_auth",
          srvApp: sessionStorage.getItem("current_app") || "hsprl",
          data: [req],
        },
      ];
    },
    checkChange(e, item, index) {
      let self = this;
      let tree = "tree" + index;
      let allKeys = self.authFunListdata.map((item) => {
        return item[self.nodeKey];
      });
      let allNodes = self.$refs[tree][0].store._getAllNodes();
      if (e.value == "checked") {
        if (e.checked) {
          this.$refs[tree][0].setCheckedKeys(allKeys);
          self.checkedNodes = allNodes.map((item) => item.data);
        } else {
          this.$refs[tree][0].setCheckedKeys([]);
          let checkNodes = [];
          self.checkedNodes = checkNodes.map((item) => item);
        }
      }
      // if(index === 0){
      //     if(e.value == 'checked'){
      //       if(e.checked){
      //         this.$refs.tree0[0].setCheckedKeys(allKeys)
      //         self.checkedNodes = allNodes.map((item) => item.data)
      //       }else{
      //         this.$refs.tree0[0].setCheckedKeys([])
      //         let checkNodes = []
      //         self.checkedNodes = checkNodes.map((item) => item)
      //       }
      //     }
      // }else if(index === 1){
      //     if(e.value == 'checked'){
      //       if(e.checked){
      //         this.$refs.tree1[0].setCheckedKeys(allKeys)
      //       }else{
      //         this.$refs.tree1[0].setCheckedKeys([])
      //       }
      //     }
      // }

      if (e.value == "expand") {
        let isExpand = e.checked;
        console.log(allNodes, this.$refs[tree][0]);
        allNodes = allNodes.map((item) => {
          item["expanded"] = isExpand;
          return item;
        });
      }
      // let ref = this.$refs[tree]
      // item._treeData = item._treeData.map((item) => item)
      self.$forceUpdate();
    },
    treeCurrentChange(checkedNodes, checkedKeys) {
      let self = this;
      let nodes = checkedKeys.checkedNodes;
      this.checkedNodes = nodes.map((item) => item);
      let type = checkedNodes.terminal_type;
      let ref = "tree";
      for (let i = 0; i < self.terminalType.length; i++) {
        if (self.terminalType[i].terminal_type == type) {
          ref = ref + i;
        }
      }
      let allNodes = self.$refs[ref][0].store._getAllNodes(); // copy 当前所有节点
      console.log(allNodes);
      let allKeys = [];
      let checked = false;
      let requirechild = [];
      for (let node of allNodes) {
        if (node.data[self.nodeKey] == checkedNodes[self.nodeKey]) {
          checked = node.checked;
          let childNodes = node.childNodes;
          for (let child of childNodes) {
            if (child.data.is_require_srv == "是") {
              console.log(
                "child.data.is_require_srv",
                child.data.is_require_srv,
                child.data.fun_name
              );
              requirechild.push(child.data[self.nodeKey]);
              if (child.childNodes.length > 0) {
                let chrs = this.treeCurrentChangeChildNodes(child.childNodes);
                requirechild = requirechild.concat(chrs);
              }
            }
          }
        }
      }
      checked = false;
      console.log("requirechild", requirechild);
      for (let node of allNodes) {
        // checked = node.checked ? node.checked : node.indeterminate
        checked = node.checked;
        let childNodes = node.childNodes;
        // allKeys.push(node.data[self.nodeKey])

        if (node.checked) {
          console.log(node.data.fun_name, node.checked);
          // allKeys.push(node.data[self.nodeKey])
        }
        if (checked) {
          allKeys.push(node.data[self.nodeKey]);
          for (let child of childNodes) {
            allKeys.push(child.data[self.nodeKey]);
          }
        }

        // if(requirechild.indexOf(node.data[this.nodeKey]) !== -1){
        //     if(checked){
        //       allKeys.push(node.data[self.nodeKey])
        //     }
        // }else{
        //     if(node.checked){
        //         allKeys.push(node.data[self.nodeKey])
        //     }
        // }
      }
      this.$refs[ref][0].setCheckedKeys(allKeys);

      console.log(
        "treeCurrentChange",
        type,
        ref,
        checkedNodes,
        checkedKeys,
        allKeys,
        checked
      );
    },
    treeCurrentChangeChildNodes(childNodes) {
      let self = this;
      let keysarr = [];
      let childs = [];
      for (let child of childNodes) {
        if (child.data.is_require_srv == "是") {
          keysarr.push(child.data[self.nodeKey]);
          childs = child.childNodes;
        }
      }
      if (childs.length > 0) {
        const childks = self.treeCurrentChangeChildNodes(childs);
        keysarr = keysarr.concat(childks);
      }
      return keysarr;
    },
    currentChange(data, node) {
      console.log("currentChange", data, node);
    },
    loadUpdateDefaultData() {
      let self = this;
      let req = {
        serviceName: "srvsys_app_role_fun_select",
        colNames: ["*"],
        condition: [
          {
            colName: "role_no",
            ruleType: "in",
            value: this.roleNo,
          },
        ],
      };
      self.getRoleDetail();
      self
        .select("srvsys_app_role_fun_select", req.condition, null, null)
        .then((res) => {
          console.log("loadUpdateDefaultData", res.data);
          //
          self.roleFunData = res.data.data;
        });
    },
    getRoleDetail() {
      let self = this;
      let req = {
        serviceName: "srvsys_app_role_select",
        colNames: ["*"],
        condition: [
          {
            colName: "role_no",
            ruleType: "in",
            value: this.roleNo,
          },
        ],
      };
      self
        .select("srvsys_app_role_select", req.condition, null, null)
        .then((res) => {
          console.log("getRoleDetail", res.data);
          //
          self.roleData = res.data.data;
          self.roleModel.role_name =
            self.roleData && self.roleData.length > 0
              ? self.roleData[0].role_name
              : "";
          self.roleModel.remark =
            self.roleData && self.roleData.length > 0
              ? self.roleData[0].remark
              : "";
        });
    },
    setRoleAuth() {
      // 保存权限设置请求
      let self = this;

      let req = self.reqRun();
      console.log("setRoleAuth", req);
      this.operate(req).then((res) => {
        console.log("setRoleAuth", res);
        this.loading = false;
        if (res.data.state == "SUCCESS" && res.data.resultCode == "SUCCESS") {
          self.$message({
            message: res.data.response[0].response.msg,
            type: "success",
          });
          let role_no = res.data.response[0].response.role_no;
          if (self.pageType == "add") {
            self.$set(this, "roleModel", {
              remark: "",
              role_name: "",
            });
            self.getDefaultTreeData();
          } else if (self.pageType == "update") {
            self.loadUpdateDefaultData();
          }
        } else {
          self.$message({
            message: res.data.resultMessage,
            type: "error",
          });
        }
      });
    },
    handleCheckedCitiesChange(e) {
      console.log("handleCheckedCitiesChange", e);
    },
    onClick(e) {
      this.getDefaultTreeData();
    },
    getTreeData() {
      let self = this;
      let serviceName = "srvsys_fun_auth_def_select";
      let cond = [];
      self.select(serviceName, cond, null, null).then((res) => {
        console.log(res.data);
        self.authFunListdata = res.data.data;
        self.generateOptions(self.authFunListdata);
      });
    },
    getUserChecked(cfg, key) {
      let isChecked = false;
      for (let val of cfg) {
        if (val.value == key) {
          isChecked = val.checked;
        }
      }
      return isChecked;
    },
    getNodeDisabled: function (data, node) {
      console.log(data, node);
      if (
        data.is_require_srv == "是" &&
        node.hasOwnProperty("parent") &&
        node.parent.hasOwnProperty("checked") &&
        node.parent.checked == true
      ) {
        return true;
      } else {
        return false;
      }
    },
    // 开始递归方法
    generateOptions(params, checked, expand) {
      let self = this;

      let type = this.terminalType;

      for (let t of type) {
        var result = [];
        let list = params;
        // let list = params.filter(item => item.terminal_type == t.terminal_type)
        for (const param of list) {
          if (
            param.parent_no == null ||
            param.parent_no == "" ||
            param.parent_no == undefined
          ) {
            // 判断是否为顶层节点
            let children = self.bxDeepClone(param);
            children["label"] = children[self.nodeLabel];
            children["children"] = self.getchilds(children[self.nodeKey], list); // 获取子节点
            // children['disabled'] = param.is_require_srv == '是' ? true : false

            if (self.pageType == "detail") {
              param["disabled"] = true;
              children["disabled"] = true;
            }
            result.push(children);
          }
        }
        self.$set(
          t,
          "_treeData",
          result.map((item) => item)
        );
        //t['_treeData'] = result.map((item) => item)
        t["expandedKeys"] = [];
        t["checkStrictly"] = false;
        t["checkedKeys"] = [];
        // update 根据编号递归 特类型的选中项
        if (self.pageType == "update" || self.pageType == "detail") {
          for (let funCol of self.authFunListdata) {
            // 全部权限
            for (let checkNode of self.roleFunData) {
              // 用户已有权限
              // 所有子项选中的节点才可选中
              // t.
              if (
                funCol[self.nodeKey] == checkNode[self.nodeKey] &&
                t.terminal_type == funCol["terminal_type"]
              ) {
                t.checkedKeys.push(checkNode[self.nodeKey]);
              }
            }
          }
        }
      }

      this.loading = false;
      // console.log("treeDataRun",result)
      // self.buildData =  result
      // return result
    },

    getchilds(nodeKey, array) {
      let self = this;
      const childs = [];
      for (const arr of array) {
        // 循环获取子节点
        if (arr["parent_no"] === nodeKey) {
          childs.push(self.bxDeepClone(arr));
        }
      }
      for (const child of childs) {
        // 获取子节点的子节点
        const childscopy = self.getchilds(child[self.nodeKey], array); // 递归获取子节点

        child["label"] = child[self.nodeLabel];
        child["children"] = childscopy;
        // child['disabled'] = child.is_require_srv == '是' ? true : false

        if (self.pageType == "detail") {
          child["disabled"] = true;
        }
      }
      return childs;
    },

    getDefaultTreeData() {
      this.loading = true;
      let self = this;
      let serviceName = "srvsys_fun_auth_def_select";
      // serviceName = 'srvsys_app_role_menu_select'
      let cond = [];
      let group = [
        {
          colName: "terminal_type",
          type: "by",
        },
      ];
      this.select(serviceName, cond, null, null, group).then((res) => {
        console.log(res.data);
        let types = res.data.data;

        this.terminalType = types.map((item) => {
          item["value"] = [];
          //折叠/展开"  全选/全不选  父子联动
          item["checkCfg"] = [
            {
              label: "折叠/展开",
              value: "expand",
              checked: true,
            },
            {
              label: "全选/全不选",
              value: "checked",
              checked: false,
            },
            // ,
            // {
            //    label:"父子联动",
            //    value:"cascade",
            //    checked:false
            // }
          ];
          return item;
        });
        if (res.data.data.length === 0) {
          this.terminalType = [
            {
              terminal_type: "PC",
              value: [],
              checkCfg: [
                {
                  label: "折叠/展开",
                  value: "expand",
                  checked: true,
                },
                {
                  label: "全选/全不选",
                  value: "checked",
                  checked: false,
                },
              ],
            },
          ];
        }
        self.getTreeData();
        this.loading = false;
      });
    },
  },
  created: function () {},
  mounted: function () {
    this.loading = true;
    if (this.pageType == "update") {
      this.loadUpdateDefaultData();
    } else if (this.pageType == "add") {
    } else if (this.pageType == "detail") {
      this.loadUpdateDefaultData();
    }
    this.getDefaultTreeData();
  },
  watch: {
    // formModel:{
    //     handler:function(nV,oV){
    //         // console.log("form更新了--",nv)
    //     },
    //     deep:true
    // }
  },
};
</script>
<style lang="less">
.retail-tree {
  .el-tree {
    min-height: 100px;
    border: 1px solid #f2f2f2;
  }

  .el-textarea.is-disabled .el-textarea__inner {
    background-color: #ffffff !important;
    border-color: #ffffff !important;
  }

  .el-tree .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner {
    background-color: #409eff;
    border-color: #409eff !important;
  }

  .el-tree
    .el-checkbox__input.is-disabled.is-checked
    .el-checkbox__inner::after {
    border-color: #ffffff !important;
  }
}
</style>
