<template>
    <div id="pdf-layout">
        <el-button size="mini" type="success" @click="exportPDF">导出pdf</el-button>
        <div>
            <table  class="pdf-review">
                <tr class="pdf-details">
                <!-- 
                可以使用th标签来表示表头中的内容，
                    它的用法和td一样，不同的是它会有一些默认效果
                -->
                    <th >序号</th>

                    <th v-for="(hand,h) in hander">{{hand}}</th>
                </tr>

                <tr  class="pdf-details" v-for="(item,index) in test">
                    <td >{{index+1}}</td>
                    <td v-for="(hand,h) in hander">{{item[hand]}}</td>
                </tr>
                <tr  class="pdf-details" v-for="(item,index) in test">
                    <td >{{index+1}}</td>
                    <td v-for="(hand,h) in hander">{{item[hand]}}</td>
                </tr>
                <tr  class="pdf-details" v-for="(item,index) in test">
                    <td >{{index+1}}</td>
                    <td v-for="(hand,h) in hander">{{item[hand]}}</td>
                </tr>
                <tr  class="pdf-details" v-for="(item,index) in test">
                    <td >{{index+1}}</td>
                    <td v-for="(hand,h) in hander">{{item[hand]}}</td>
                </tr>
                <tr  class="pdf-details" v-for="(item,index) in test">
                    <td >{{index+1}}</td>
                    <td v-for="(hand,h) in hander">{{item[hand]}}</td>
                </tr>
                <tr  class="pdf-details" v-for="(item,index) in test">
                    <td >{{index+1}}</td>
                    <td v-for="(hand,h) in hander">{{item[hand]}}</td>
                </tr>
             </table>
        </div>
    </div>
  </template>
   
  <script>
  import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
   
import htmlPdf from './pdf.js';
  export default {
    computed:{
        hander(){
            let handers = []
            let data = this.bxDeepClone(this.test)
            if(Array.isArray(data) && data.length > 0){
                handers = Object.keys(data[0])
            }
            return handers
        }
    },
    data(){
        return {
            test:[
    {
        "del_flag": "否",
        "practice_no": "JD202311170003",
        "create_time": "2023-11-24 16:24:33",
        "modify_user_disp": null,
        "practice_name": "首阳山研学基地",
        "object_type": "基地",
        "modify_user": null,
        "create_user_disp": "武浩/wuhao",
        "modify_time": "2023-11-24 16:24:33",
        "practice_file": null,
        "examiner": "STF231121110023",
        "school_name": null,
        "estimate_no": "EST2311240003",
        "result": null,
        "_buttons": [
            1,
            1,
            0,
            1,
            0,
            0,
            1
        ],
        "tmpl_src_no": null,
        "estimate_explain": null,
        "total_score": null,
        "estimate_state": "待下载",
        "id": 19,
        "examiner_name": "武浩9",
        "create_user": "wuhao",
        "school_no": null,
        "object": null
    },
    {
        "del_flag": "否",
        "practice_no": null,
        "create_time": "2023-11-24 14:28:27",
        "modify_user_disp": null,
        "practice_name": null,
        "object_type": "学校",
        "modify_user": null,
        "create_user_disp": "武浩/wuhao",
        "modify_time": "2023-11-24 14:28:27",
        "practice_file": null,
        "examiner": "STF231124140024",
        "school_name": "镇中心测试学校",
        "estimate_no": "EST2311240002",
        "result": null,
        "_buttons": [
            1,
            1,
            0,
            1,
            0,
            0,
            1
        ],
        "tmpl_src_no": null,
        "estimate_explain": null,
        "total_score": null,
        "estimate_state": "待下载",
        "id": 18,
        "examiner_name": "贺局",
        "create_user": "wuhao",
        "school_no": "SH0129",
        "object": null
    },
    {
        "del_flag": "否",
        "practice_no": null,
        "create_time": "2023-11-24 09:23:57",
        "modify_user_disp": "罗强/231026SUJU",
        "practice_name": null,
        "object_type": "学校",
        "modify_user": "231026SUJU",
        "create_user_disp": "罗强/231026SUJU",
        "modify_time": "2023-11-24 09:24:20",
        "practice_file": null,
        "examiner": "STF231121110023",
        "school_name": "镇中心测试学校",
        "estimate_no": "EST2311240001",
        "result": null,
        "_buttons": [
            1,
            0,
            1,
            1,
            0,
            0,
            1
        ],
        "tmpl_src_no": "SR202310290001",
        "estimate_explain": null,
        "total_score": null,
        "estimate_state": "待评估",
        "id": 17,
        "examiner_name": "武浩",
        "create_user": "231026SUJU",
        "school_no": "SH0129",
        "object": null
    },
    {
        "del_flag": "否",
        "practice_no": null,
        "create_time": "2023-11-23 09:51:44",
        "modify_user_disp": "刘老师/liuxj",
        "practice_name": null,
        "object_type": "学校",
        "modify_user": "liuxj",
        "create_user_disp": "刘老师/liuxj",
        "modify_time": "2023-11-23 09:51:59",
        "practice_file": null,
        "examiner": "STF231121110023",
        "school_name": "镇中心测试学校",
        "estimate_no": "EST2311230001",
        "result": null,
        "_buttons": [
            1,
            0,
            1,
            1,
            0,
            0,
            1
        ],
        "tmpl_src_no": "SR202310290001",
        "estimate_explain": null,
        "total_score": null,
        "estimate_state": "待评估",
        "id": 16,
        "examiner_name": "武浩",
        "create_user": "liuxj",
        "school_no": "SH0129",
        "object": null
    },
    {
        "del_flag": "否",
        "practice_no": "JD202311170003",
        "create_time": "2023-11-20 16:55:58",
        "modify_user_disp": "贺老师7/231113MBW7",
        "practice_name": "首阳山研学基地",
        "object_type": "基地",
        "modify_user": "231113MBW7",
        "create_user_disp": "贺老师7/231113MBW7",
        "modify_time": "2023-11-20 16:56:25",
        "practice_file": null,
        "examiner": "STF231025140010",
        "school_name": null,
        "estimate_no": "EST2311200011",
        "result": "不合格",
        "_buttons": [
            1,
            0,
            0,
            1,
            0,
            0,
            1
        ],
        "tmpl_src_no": "SR202310290001",
        "estimate_explain": null,
        "total_score": 44,
        "estimate_state": "已完成",
        "id": 15,
        "examiner_name": "贺瑶婷",
        "create_user": "231113MBW7",
        "school_no": null,
        "object": null
    },
    {
        "del_flag": "否",
        "practice_no": null,
        "create_time": "2023-11-20 16:55:13",
        "modify_user_disp": "贺老师7/231113MBW7",
        "practice_name": null,
        "object_type": "学校",
        "modify_user": "231113MBW7",
        "create_user_disp": "贺老师7/231113MBW7",
        "modify_time": "2023-11-20 16:55:44",
        "practice_file": null,
        "examiner": "STF231025140010",
        "school_name": "西乡县第四中学",
        "estimate_no": "EST2311200010",
        "result": "合格",
        "_buttons": [
            1,
            0,
            0,
            1,
            0,
            0,
            1
        ],
        "tmpl_src_no": "SR202310290001",
        "estimate_explain": null,
        "total_score": 88,
        "estimate_state": "已完成",
        "id": 14,
        "examiner_name": "贺瑶婷",
        "create_user": "231113MBW7",
        "school_no": "SH0094",
        "object": null
    },
    {
        "del_flag": "否",
        "practice_no": null,
        "create_time": "2023-11-20 16:49:36",
        "modify_user_disp": "刘老师/liuxj",
        "practice_name": null,
        "object_type": "学校",
        "modify_user": "liuxj",
        "create_user_disp": "刘老师/liuxj",
        "modify_time": "2023-11-20 16:55:01",
        "practice_file": null,
        "examiner": "STF231031160015",
        "school_name": "镇中心测试学校",
        "estimate_no": "EST2311200008",
        "result": null,
        "_buttons": [
            1,
            0,
            1,
            1,
            0,
            0,
            1
        ],
        "tmpl_src_no": "SR202310290001",
        "estimate_explain": null,
        "total_score": null,
        "estimate_state": "待评估",
        "id": 12,
        "examiner_name": "刘锋",
        "create_user": "liuxj",
        "school_no": "SH0129",
        "object": null
    },
    {
        "del_flag": "否",
        "practice_no": "JD202311170002",
        "create_time": "2023-11-20 16:50:00",
        "modify_user_disp": "刘老师/liuxj",
        "practice_name": "终南山测试1",
        "object_type": "基地",
        "modify_user": "liuxj",
        "create_user_disp": "刘老师/liuxj",
        "modify_time": "2023-11-20 16:54:20",
        "practice_file": "20231120165229970100",
        "examiner": "STF231031160015",
        "school_name": null,
        "estimate_no": "EST2311200009",
        "result": "不合格",
        "_buttons": [
            1,
            0,
            0,
            1,
            0,
            0,
            1
        ],
        "tmpl_src_no": "SR202310290001",
        "estimate_explain": null,
        "total_score": 40,
        "estimate_state": "已完成",
        "id": 13,
        "examiner_name": "刘锋",
        "create_user": "liuxj",
        "school_no": null,
        "object": null
    },
    {
        "del_flag": "否",
        "practice_no": null,
        "create_time": "2023-11-20 16:38:21",
        "modify_user_disp": null,
        "practice_name": null,
        "object_type": "学校",
        "modify_user": null,
        "create_user_disp": "刘老师/liuxj",
        "modify_time": "2023-11-20 16:38:21",
        "practice_file": null,
        "examiner": "STF231107140019",
        "school_name": "镇中心测试学校",
        "estimate_no": "EST2311200007",
        "result": null,
        "_buttons": [
            1,
            1,
            0,
            1,
            0,
            0,
            1
        ],
        "tmpl_src_no": null,
        "estimate_explain": null,
        "total_score": null,
        "estimate_state": "待下载",
        "id": 11,
        "examiner_name": "文浩",
        "create_user": "liuxj",
        "school_no": "SH0129",
        "object": null
    },
    {
        "del_flag": "否",
        "practice_no": null,
        "create_time": "2023-11-20 16:00:46",
        "modify_user_disp": null,
        "practice_name": null,
        "object_type": "学校",
        "modify_user": null,
        "create_user_disp": "刘峰/liuf",
        "modify_time": "2023-11-20 16:00:46",
        "practice_file": null,
        "examiner": "STF231107150020",
        "school_name": "镇中心测试学校",
        "estimate_no": "EST2311200006",
        "result": null,
        "_buttons": [
            1,
            1,
            0,
            1,
            0,
            0,
            1
        ],
        "tmpl_src_no": null,
        "estimate_explain": null,
        "total_score": null,
        "estimate_state": "待下载",
        "id": 10,
        "examiner_name": "定位",
        "create_user": "liuf",
        "school_no": "SH0129",
        "object": null
    }
]
        }
    },
    methods: {
        async exportPDF() {
        // 获取要导出的Vue组件
            const vueComponent = document.querySelector('.pdf-review')
            // 使用html2canvas将Vue组件渲染为图片
            const canvas = await html2canvas(vueComponent)
            // 创建新的jsPDF文档
            const pdf = new jsPDF('p', 'mm', 'a4')
            // 将渲染的图片添加到PDF文档中
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 211, 298)
            // 下载PDF文件
            pdf.save('my-pdf-document.pdf')

            // var TypeName = '生成的PDF';
            // const lableList = document.getElementsByClassName('pdf-details');   // 注意这一句
            // htmlPdf(TypeName, document.querySelector('#pdf-layout'), lableList);
  
        }
    }
  }
  </script>
    <style lang="css">
    .pdf-review{
        width: 1080px; 
        height:auto;
        min-height:100vh;
        /* background-color:#eeeeee; */
        margin:0 auto;
    }
    @media print {
        
    }

    table {
        border-spacing: 0px;
        /* width: 300px; */
        /*居中*/
        max-width:100%;
        margin: 0 auto;
        /*边框*/
        /* border: 1px solid black; */

        border-collapse: collapse;
        /*设置背景颜色*/
        /* background-color: #bfa; */
      }

      /*
       * 设置边框
       */
      td,
      th {
        width:auto;
        overflow-wrap: anywhere;
        /* overflow-wrap: */
        border: 1px solid black;
        padding:12px 6px ;
        color:#000;
      }

      tr:hover {
        /* background-color: #ff0; */
      }
      </style>
 