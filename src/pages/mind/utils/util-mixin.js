
import { themeList } from 'simple-mind-map/src/constants/constant'  // 皮肤
export default {
    data() {
        return {
            // 移植参数相关
            // myMindMap:null,
            defaultTheme:'',
            loadPageMata: null, // 页面元数据
            pageParams: null,
            pageParamsModel: null,
           // 小地图容器的宽高
           containerWidth: 100,
           containerHeight:50,
           rightMousedown:{
//                // 当前右键点击的类型
// const type = ref('')
// // 如果点击的节点，那么代表被点击的节点
// const currentNode = shallowRef(null)
// // 菜单显示的位置
// const left = ref(0)
// const top = ref(0)
// // 是否显示菜单
// const show = ref(false)
// // 记录鼠标右键按下的位置
// const mousedownX = ref(0)
// const mousedownY = ref(0)
// const isMousedown = ref(false)
// // 保存复制/剪切的节点的数据，后续可以原来粘贴
// let copyData = null
                type:'',
                currentNode:null,
                left:0,
                top:0,
                show:false,
                mousedownX:0,
                mousedownY:0,
                isMousedown:0,
                copyData:0,
           },
           showToolbar:{
                show:false,
                left:0,
                top:0,
                currentFormatInfo:{}
           }
        }
    },
    computed: {
        themeListDefault(){
            let list = themeList
            return list
        },
        activeTheme(){
            let t = null
            t = this.themeListDefault.filter(item => item.value == this.defaultTheme)
            if(Array.isArray(t) && t.length > 0){
                t = t[0]
            }else{
                t = null
            }
            return t
        }
    },
    methods: {
        
        async getFullData(mindMap) {
            return await new Promise(function (resolve, reject) {
                if (mindMap) {
                    let data = mindMap.getData(true)
                    console.log('full data:', data)
                    resolve(data)
                } else {
                    resolve(false)
                }
            })
        },
        exportFile(type){
            // mindMap.export('png', true, '文件名')
            let self = this
            let exportType = type || 'pdf'
            if(exportType && self.mindMapModel.export){
                self.mindMapModel.export(exportType, true, '文件名')
            }
            
        },
        
        setTheme(theme){
            // 动态设置主题
            console.log(theme)
            let currentTheme = theme || 'classic'
            this.mindMapModel.setTheme(currentTheme)
            this.defaultTheme = this.mindMapModel.getTheme()
        },
        // 注册并使用新主题
        defineTheme(){
            MindMap.defineTheme('redSpirit', {
                // 背景颜色
                backgroundColor: 'rgb(255, 238, 228)',
                // 连线的颜色
                lineColor: 'rgb(230, 138, 131)',
                lineWidth: 3,
                // 概要连线的粗细
                generalizationLineWidth: 3,
                // 概要连线的颜色
                generalizationLineColor: 'rgb(222, 101, 85)',
                // 根节点样式
                root: {
                    fillColor: 'rgb(207, 44, 44)',
                    color: 'rgb(255, 233, 157)',
                    borderColor: '',
                    borderWidth: 0,
                    fontSize: 24,
                    active: {
                    borderColor: 'rgb(255, 233, 157)',
                    borderWidth: 3,
                    }
                },
                // 二级节点样式
                second: {
                    fillColor: 'rgb(255, 255, 255)',
                    color: 'rgb(211, 58, 21)',
                    borderColor: 'rgb(222, 101, 85)',
                    borderWidth: 2,
                    fontSize: 18,
                    active: {
                    borderColor: 'rgb(255, 233, 157)',
                    }
                },
                // 三级及以下节点样式
                node: {
                    fontSize: 14,
                    color: 'rgb(144, 71, 43)',
                    active: {
                    borderColor: 'rgb(255, 233, 157)'
                    }
                },
                // 概要节点样式
                generalization: {
                    fontSize: 14,
                    fillColor: 'rgb(255, 247, 211)',
                    borderColor: 'rgb(255, 202, 162)',
                    borderWidth: 2,
                    color: 'rgb(187, 101, 69)',
                    active: {
                    borderColor: 'rgb(222, 101, 85)'
                    }
                }
            })
        },
         onMousedown(e){
            this.mindMapModel.miniMap.onMousedown(e)
          },
          
           onMousemove(e){
            this.mindMapModel.miniMap.onMousemove(e)
          },
          
          onMouseup(e){
            this.mindMapModel.miniMap.onMouseup(e)
          },
          copy(){
            this.rightMousedown.copyData = this.mindMapModel.renderer.copyNode()
        },
        cut(){
            this.mindMapModel.execCommand('CUT_NODE', _copyData => {
                this.rightMousedown.copyData = _copyData
            })
        },
        paste(){
            this.mindMapModel.execCommand('PASTE_NODE', this.rightMousedown.copyData)
        },
        toggleBold(){
            let mindMap = this.mindMapModel
            let showToolbar = this.showToolbar
            showToolbar.currentFormatInfo.bold = !showToolbar.currentFormatInfo.bold
            mindMap.richText.formatText({
                bold: showToolbar.currentFormatInfo.bold
            })
        },
        toggleUnderline(){
            let mindMap = this.mindMapModel
            let showToolbar = this.showToolbar
            showToolbar.currentFormatInfo.underline = !showToolbar.currentFormatInfo.underline
            mindMap.richText.formatText({
                underline: showToolbar.currentFormatInfo.underline
            })
        },
        changeColor(){
            let mindMap = this.mindMapModel
            let showToolbar = this.showToolbar
            showToolbar.currentFormatInfo.color = 'red'
            mindMap.richText.formatText({
                color: 'red'
            })
        }
          




    }

};
