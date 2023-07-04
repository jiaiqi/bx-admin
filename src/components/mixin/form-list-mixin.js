// 专门 用于  waybill.vue 页面  form-list.vue 组件的 表单处理程序
// import {FieldInfo} from '../model/FieldInfo'
// import {Field} from '../model/Field'
// import Vue from 'vue'


export default {
  props: {
    // mode: {
    //   type: String
    // },
  },

  data() {
    return {
    
    }
  },

  computed: {
    

  },
  methods: {
    srvValFormModel(){
        return {}
    },
    fieldValueChange(colName,value,row){
        console.log('form list item change',colName,value,row)
        let type = row.row[colName].type
        switch (type) {
          case "Integer"://Money Float
                if(row.row[colName].value < 0){
                  row.row[colName].value = null
                }
            break;
          case "Money"://Money Float
              if(row.row[colName].value < 0){
                row.row[colName].value = null
              }
            
            break;
          case "Float"://Money Float
            
          if(row.row[colName].value < 0){
            row.row[colName].value = null
          }
            break;
        
          default:
            break;
        }
        
    },
    getSummaries(param) {
        const { columns, data } = param;
        const sums = [];
        columns.forEach((column, index) => {
        //   if (index === 0) {
        //     sums[index] = '总价';
        //     return;
        //   }
        console.log(data)
          const values = data.map(item => Number(item[column.property]));
          if (!values.every(value => isNaN(value))) {
            sums[index] = values.reduce((prev, curr) => {
              const value = Number(curr);
              if (!isNaN(value)) {
                return prev + curr;
              } else {
                return prev;
              }
            }, 0);
            sums[index] += '';
          } else {
            sums[index] = '';
          }
        });

        return sums;
    }
  }
};
