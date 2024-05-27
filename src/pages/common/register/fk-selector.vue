<script>
import {setRequest} from "./api";

export default {
  name: "fk-selector",
  props: {
    config: {
      type: Object
    },
    value: String
  },
  data() {
    return {
      loading: false,
      options: []
    }
  },
  created() {
    this.getOptions()
  },
  methods: {
    change(value) {
      this.$emit('input', value)
      this.$nextTick(() => {
        this.$emit('change', value)
      })
    },
    getOptions(query = '') {
      const app = this.config.srv_app
      const req = {
        "serviceName": this.config.serviceName,
        "queryMethod": "select",
        "distinct": false,
        "colNames": ["*"],
        "condition": [],
        "page": {"pageNo": 1, "rownumber": 20},
        "relation_condition": {
          "relation": "OR",
          "data": [
            {"colName": this.config.refed_col, "value": query, "ruleType": "[like]"},
            {"colName": this.config.key_disp_col, "value": query, "ruleType": "[like]"}
          ]
        }
      }
      if (this.config?.is_tree) {
        req.treeData = true
        delete req.relation_condition
        delete req.page
      }
      this.loading = true
      setRequest(req, 'select', this.config.serviceName, app).then((res) => {
        this.loading = false
        if (res.state === 'SUCCESS') {
          this.options = res.data.map(item => {
            const obj = {
              ...item,
              label: item[this.config.key_disp_col],
              value: item[this.config.refed_col],
            }
            if (item.children?.length) {
              obj.children = item.children
            }
            return obj
          })
        }
      })
    }
  },
}
</script>

<template>
  <el-cascader
    placeholder="请输入关键词"
    :options="options"
    :props="{
      label:config.key_disp_col,
      value:config.refed_col
    }"
    filterable
    clearable
    change-on-select
    v-if="config&&config.is_tree===true"
    @change="e=>change(e[e.length-1])"
    @clear="change()"
  ></el-cascader>
  <el-select
    :value="value"
    filterable
    clearable
    remote
    placeholder="请输入关键词"
    :remote-method="getOptions"
    @clear="getOptions"
    @change="change"
    :loading="loading"
    v-else>
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value">
    </el-option>
  </el-select>

</template>

<style scoped>

</style>