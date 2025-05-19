<template>
  <div>
    <div v-html="recoverFileAddress4richText(render(pageContent, print_para.para))"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      pageContent: '',
      "print_para": {
        "mapp": "srv",
        "print_col": '',
        "tmpl_no": 'TM0000001',
        "para": {
          "name": '张三',
          "age": '90后',
          col1: '我的表头1',
          row1: '我是第一行文字',
          row2: '我是第二行文字',
          //插入表格标识
          "insert_table": [
            {
              header: [],
              data: []
            },
            {
              header: [],
              data: []
            },
          ]
          // "para8": {
          //   "data_type": "table",
          //   "table_data": [
          //     {},
          //     {}
          //   ]
          // },
          // "para9": {
          //   "data_type": "table",
          //   "table_data": [
          //     {},
          //     {}
          //   ]
          // }
        },
      }
    }
  },
  created() {
    this.initPage()
  },
  methods: {
    initPage() {
      let condition = [{ colName: "id", ruleType: "eq", value: "12" }]

      this.select(
        'srvpark_message_info_select',
        condition,
      ).then(response => {
        this.pageContent = response.body.data[0].content

        console.log(this.getStringArr(this.pageContent, '<table', '</table>'))
      });
    },
    render(template, context) {
      // template为模板字符串，match为匹配结果
      if (context.hasOwnProperty('insert_table')) {
        // todo
      } else {
        return template.replace(/\{\{(.*?)\}\}/g, (match, key) => context[key.trim()])
      }
    },
    getStringArr(str, startStr, endStr) {
      let resultArr = []
      let startIndex = 0
      let endIndex = 0
      while (startIndex < str.length) {
        startIndex = str.indexOf(startStr, endIndex)
        endIndex = str.indexOf(endStr, startIndex)
        if (startIndex !== -1 && endIndex !== -1) {
          resultArr.push(str.substring(startIndex, endIndex + endStr.length))
        } else {
          break
        }
      } 
      return resultArr
    }
  },
}
</script>