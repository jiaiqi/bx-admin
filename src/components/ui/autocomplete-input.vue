/* */
<template>
  <!-- <el-radio-group v-model="field.model" @change="$emit('field-value-changed', field.info.name, field)">
    <el-radio v-for="(option, index) in getOptions" :label="option.value" :key="option.value" :disabled="!field.info.editable">
      {{option.label}}
    </el-radio>
  </el-radio-group> -->
  
  <el-autocomplete
      class="inline-input"
      v-model="field.model"
      clearable
      :trigger-on-focus="false"
      :fetch-suggestions="querySearch"
      placeholder="请输入内容"
      value-key="label"
      @select="handleSelect"
    ></el-autocomplete>
</template>

<script>
  export default {
    components: {},

    props: {
      field: Object,
    },
    mounted(){
        console.log('mounted',this.field.info.name,this.field.info.label,item[valColumn])
    },
    computed: {
      modelValue(){
         let value =  this.field.model
         return value
      },
      modelType(){
         let type = 'string'

         return type
      },
      optionsV2List(){
        let optionsV2 = this.field.autocompleteFunc()
        return optionsV2
      },
      optionsReq() {
        let optionsV2 = this.field.autocompleteFunc()
        let refedCol = this.field.info.redundant.refedCol
        let req = {
            "serviceName": optionsV2.serviceName,
            "srvApp":optionsV2.srv_app || null,
            "colNames": [
                "*"
            ],
            "condition": [{
                "colName":refedCol,
                "ruleType":"[like]",
                "value": this.modelValue
            }],
            "page": {
                "pageNo": 1,
                "rownumber": 999
            },
            "relation_condition": {}
        }
        return req;
      }
    },
    data() {
      return {}
    },

    methods: {
        handleSelect(item) {
            console.log(item);
            let dependField = this.field.form.fields[this.field.info.redundant.dependField]
            let dependType = dependField.info.editor
            switch (dependType) {
                case 'finder':
                    dependField.model = item.option
                    dependField.finderSelected = item.value
                    this.$set(dependField,'model',item.option)
                    // this.$emit('field-value-changed', dependField.info.name, dependField)
                    this.$emit('change', dependField);
                    break;
            
                default:
                    break;
            }
            
        },
        querySearch(queryString, cb) {
            var restaurants = this.restaurants;
            let req = this.bxDeepClone(this.optionsReq) 
            req['condition'][0].value = queryString
            let valColumn = req['condition'][0].colName
            let results = []
             this.selectList(req,req.srvApp).then(response => {
                    if (response && response.data && response.data.data) {
                        let options = response.data.data;
                        console.log(options)
                        results = options.map(item =>{
                            let result = {
                                option:item,
                                value:item[valColumn] + '',
                                label:item[this.optionsV2List['refed_col']] + '/' + item[this.optionsV2List['key_disp_col']]
                            }
                            console.log(this.field.info.name,this.field.info.label,item[valColumn])
                            return result
                        })
                       
                    }
                    cb(results);
            });
            // 调用 callback 返回建议列表的数据
            
        },
    },

    created: function () {
    },

    mounted: function () {
    }
  }
</script>

