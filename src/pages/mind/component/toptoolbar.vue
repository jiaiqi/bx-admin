<template>
  <div class="top-tool-bar">
    <div
      v-for="(bars, index) in toolsBuild"
      class="tool-bar-group"
    >
      <div class="bar-group">
        <div class="bar-group-title">
          {{ bars.name }}
        </div>
        <div class="bar-group-tools">
          <template v-for="(tool, index) in bars.tools">
            <!-- <el-button class="tool-bar" v-if="tool.key !== 'color'" :icon="tool.icon" :title="tool.name" :disabled="Array.isArray(activeNodes) && activeNodes.length ==0" size="mini" @click="onClick(tool)"></el-button> -->
            <div
              class="tool-bar "
              v-if="tool.key == 'color'"
            >
              <div class="tool-bar-group border">
                <svg
                  :style="`border-bottom:2px solid ${tool.value};`"
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="currentColor"
                  class="bi bi-type"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="m2.244 13.081.943-2.803H6.66l.944 2.803H8.86L5.54 3.75H4.322L1 13.081h1.244zm2.7-7.923L6.34 9.314H3.51l1.4-4.156h.034zm9.146 7.027h.035v.896h1.128V8.125c0-1.51-1.114-2.345-2.646-2.345-1.736 0-2.59.916-2.666 2.174h1.108c.068-.718.595-1.19 1.517-1.19.971 0 1.518.52 1.518 1.464v.731H12.19c-1.647.007-2.522.8-2.522 2.058 0 1.319.957 2.18 2.345 2.18 1.06 0 1.716-.43 2.078-1.011zm-1.763.035c-.752 0-1.456-.397-1.456-1.244 0-.65.424-1.115 1.408-1.115h1.805v.834c0 .896-.752 1.525-1.757 1.525z"
                  />
                </svg>
                <el-tooltip
                  class="item"
                  effect="dark"
                  :content="tool.name"
                  placement="bottom"
                >
                  <el-color-picker
                    :disabled="Array.isArray(activeNodes) && activeNodes.length == 0"
                    v-model="tool.value"
                    @change="setColor"
                    size="small "
                    :predefine="tool.predefineColors"
                  >


                  </el-color-picker>

                </el-tooltip>
              </div>

            </div>
            <div
              class="tool-bar"
              v-if="tool.key == 'borderColor'"
            >
              <div class="tool-bar-group border">
                <svg
                  :style="`border-bottom:2px solid ${tool.value};`"
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="currentColor"
                  class="bi bi-type"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="m2.244 13.081.943-2.803H6.66l.944 2.803H8.86L5.54 3.75H4.322L1 13.081h1.244zm2.7-7.923L6.34 9.314H3.51l1.4-4.156h.034zm9.146 7.027h.035v.896h1.128V8.125c0-1.51-1.114-2.345-2.646-2.345-1.736 0-2.59.916-2.666 2.174h1.108c.068-.718.595-1.19 1.517-1.19.971 0 1.518.52 1.518 1.464v.731H12.19c-1.647.007-2.522.8-2.522 2.058 0 1.319.957 2.18 2.345 2.18 1.06 0 1.716-.43 2.078-1.011zm-1.763.035c-.752 0-1.456-.397-1.456-1.244 0-.65.424-1.115 1.408-1.115h1.805v.834c0 .896-.752 1.525-1.757 1.525z"
                  />
                </svg>
                <el-tooltip
                  class="item"
                  effect="dark"
                  :content="tool.name"
                  placement="bottom"
                >
                  <el-color-picker
                    :disabled="Array.isArray(activeNodes) && activeNodes.length == 0"
                    v-model="tool.value"
                    @change="borderColor"
                    size="small "
                    :predefine="tool.predefineColors"
                  >
                  </el-color-picker>

                </el-tooltip>
              </div>

            </div>
            <div
              class="tool-bar"
              v-if="tool.key == 'fillColor'"
            >
              <div class="tool-bar-group border">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  :style="`background-color:${tool.value};padding:2px;color:#f2f2f2`"
                  width="18"
                  height="18"
                  fill="currentColor"
                  class="bi bi-subtract"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M0 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2H2a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2z"
                  />
                </svg>
                <el-tooltip
                  class="item"
                  effect="dark"
                  :content="tool.name"
                  placement="bottom"
                >
                  <el-color-picker
                    :disabled="Array.isArray(activeNodes) && activeNodes.length == 0"
                    v-model="tool.value"
                    @change="fillColor"
                    size="small "
                    :predefine="tool.predefineColors"
                  >
                  </el-color-picker>

                </el-tooltip>
              </div>

            </div>
            <div
              class="tool-bar "
              v-if="tool.key == 'fontWeight'"
            >
              <el-tooltip
                class="item"
                effect="dark"
                :content="tool.name"
                placement="bottom"
              >
                <el-button
                  class="tool-bar"
                  v-if="tool.key === 'fontWeight'"
                  :title="tool.name"
                  :disabled="Array.isArray(activeNodes) && activeNodes.length == 0"
                  size="mini"
                  @click="setFontWeight"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="currentColor"
                    class="bi bi-type-bold"
                    viewBox="0 0 16 16"
                  >
                    <path
                      d="M8.21 13c2.106 0 3.412-1.087 3.412-2.823 0-1.306-.984-2.283-2.324-2.386v-.055a2.176 2.176 0 0 0 1.852-2.14c0-1.51-1.162-2.46-3.014-2.46H3.843V13H8.21zM5.908 4.674h1.696c.963 0 1.517.451 1.517 1.244 0 .834-.629 1.32-1.73 1.32H5.908V4.673zm0 6.788V8.598h1.73c1.217 0 1.88.492 1.88 1.415 0 .943-.643 1.449-1.832 1.449H5.907z"
                    />
                  </svg>
                </el-button>
              </el-tooltip>
            </div>
            <div
              class="tool-bar "
              v-if="tool.key == 'textDecoration'"
            >
              <el-tooltip
                class="item"
                effect="dark"
                :content="tool.name"
                placement="bottom"
              >
                <el-button
                  class="tool-bar"
                  v-if="tool.key === 'textDecoration'"
                  :title="tool.name"
                  :disabled="Array.isArray(activeNodes) && activeNodes.length == 0"
                  size="mini"
                  @click="setTextDecoration"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="currentColor"
                    class="bi bi-type-strikethrough"
                    viewBox="0 0 16 16"
                  >
                    <path
                      d="M6.333 5.686c0 .31.083.581.27.814H5.166a2.776 2.776 0 0 1-.099-.76c0-1.627 1.436-2.768 3.48-2.768 1.969 0 3.39 1.175 3.445 2.85h-1.23c-.11-1.08-.964-1.743-2.25-1.743-1.23 0-2.18.602-2.18 1.607zm2.194 7.478c-2.153 0-3.589-1.107-3.705-2.81h1.23c.144 1.06 1.129 1.703 2.544 1.703 1.34 0 2.31-.705 2.31-1.675 0-.827-.547-1.374-1.914-1.675L8.046 8.5H1v-1h14v1h-3.504c.468.437.675.994.675 1.697 0 1.826-1.436 2.967-3.644 2.967z"
                    />
                  </svg>
                </el-button>
              </el-tooltip>
            </div>
            <div
              class="tool-bar "
              v-if="tool.key == 'fontFamily'"
            >


              <el-dropdown
                trigger="click"
                v-if="tool.key === 'fontFamily'"
                @command="setFontFamily"
              >

                <el-tooltip
                  class="item"
                  effect="dark"
                  :content="tool.name"
                  placement="bottom"
                >
                  <el-button
                    :disabled="Array.isArray(activeNodes) && activeNodes.length == 0"
                    class="tool-bar"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      fill="currentColor"
                      class="bi bi-type"
                      viewBox="0 0 16 16"
                    >
                      <path
                        d="m2.244 13.081.943-2.803H6.66l.944 2.803H8.86L5.54 3.75H4.322L1 13.081h1.244zm2.7-7.923L6.34 9.314H3.51l1.4-4.156h.034zm9.146 7.027h.035v.896h1.128V8.125c0-1.51-1.114-2.345-2.646-2.345-1.736 0-2.59.916-2.666 2.174h1.108c.068-.718.595-1.19 1.517-1.19.971 0 1.518.52 1.518 1.464v.731H12.19c-1.647.007-2.522.8-2.522 2.058 0 1.319.957 2.18 2.345 2.18 1.06 0 1.716-.43 2.078-1.011zm-1.763.035c-.752 0-1.456-.397-1.456-1.244 0-.65.424-1.115 1.408-1.115h1.805v.834c0 .896-.752 1.525-1.757 1.525z"
                      />
                    </svg>
                    <span style="font-size:14px;">
                      {{tool.value && tool.predefineFonts.filter(item => item.en == tool.value).length == 1 ?
                        tool.predefineFonts.filter(item => item.en == tool.value)[0].ch : '字体'}}
                    </span>

                  </el-button>
                </el-tooltip>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    :style="`font-family:${font.ch};`"
                    v-for="(font, f) in tool.predefineFonts"
                    :key="f"
                    :command="font.en"
                    :icon="tool.value == font.en ? 'el-icon-check' : ''"
                  >
                    {{ font.ch }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
            <div
              class="tool-bar "
              v-if="tool.key == 'fontSize'"
            >


              <el-dropdown
                trigger="click"
                v-if="tool.key === 'fontSize'"
                @command="setFontSize"
              >

                <el-tooltip
                  class="item"
                  effect="dark"
                  :content="tool.name"
                  placement="bottom"
                >
                  <el-button
                    :disabled="Array.isArray(activeNodes) && activeNodes.length == 0"
                    class="tool-bar"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      fill="currentColor"
                      class="bi bi-textarea-t"
                      viewBox="0 0 16 16"
                    >
                      <path
                        d="M1.5 2.5A1.5 1.5 0 0 1 3 1h10a1.5 1.5 0 0 1 1.5 1.5v3.563a2 2 0 0 1 0 3.874V13.5A1.5 1.5 0 0 1 13 15H3a1.5 1.5 0 0 1-1.5-1.5V9.937a2 2 0 0 1 0-3.874V2.5zm1 3.563a2 2 0 0 1 0 3.874V13.5a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V9.937a2 2 0 0 1 0-3.874V2.5A.5.5 0 0 0 13 2H3a.5.5 0 0 0-.5.5v3.563zM2 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm12 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"
                      />
                      <path
                        d="M11.434 4H4.566L4.5 5.994h.386c.21-1.252.612-1.446 2.173-1.495l.343-.011v6.343c0 .537-.116.665-1.049.748V12h3.294v-.421c-.938-.083-1.054-.21-1.054-.748V4.488l.348.01c1.56.05 1.963.244 2.173 1.496h.386L11.434 4z"
                      />
                    </svg>
                    <span style="font-size:14px;">
                      {{tool.value && tool.predefineFonts.filter(item => item.value == tool.value).length == 1 ?
                        tool.predefineFonts.filter(item => item.value == tool.value)[0].name : '字号'}}
                    </span>


                  </el-button>
                </el-tooltip>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    :style="`font-size:${font.value};`"
                    v-for="(font, f) in tool.predefineFonts"
                    :key="f"
                    :command="font.value"
                    :icon="tool.value == font.value ? 'el-icon-check' : ''"
                  >
                    {{ font.name }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
            <div
              class="tool-bar "
              v-if="tool.key == 'shape'"
            >


              <el-dropdown
                trigger="click"
                v-if="tool.key === 'shape'"
                @command="setShape"
              >

                <el-tooltip
                  class="item"
                  effect="dark"
                  :content="tool.name"
                  placement="bottom"
                >
                  <el-button
                    :disabled="Array.isArray(activeNodes) && activeNodes.length == 0"
                    class="tool-bar"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      fill="currentColor"
                      class="bi bi-square"
                      viewBox="0 0 16 16"
                    >
                      <path
                        d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"
                      />
                    </svg>
                    <span style="font-size:14px;">
                      {{tool.value && tool.predefineShapes.filter(item => item.value == tool.value).length == 1 ?
                        tool.predefineShapes.filter(item => item.value == tool.value)[0].name : '形状'}}
                    </span>


                  </el-button>
                </el-tooltip>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    :style="`font-size:${font.value};`"
                    v-for="(font, f) in tool.predefineShapes"
                    :key="f"
                    :command="font.value"
                    :icon="tool.value == font.value ? 'el-icon-check' : ''"
                  >
                    {{ font.name }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
            <div
              class="tool-bar "
              v-if="tool.key == 'setImage'"
            >

              <el-tooltip
                class="item"
                effect="dark"
                :content="tool.name"
                placement="bottom"
              >
                <el-button
                  class="tool-bar"
                  v-if="tool.key === 'setImage'"
                  :title="tool.name"
                  :disabled="Array.isArray(activeNodes) && activeNodes.length == 0"
                  size="mini"
                >
                  <!-- <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-card-image" viewBox="0 0 16 16">
                                    <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                                    <path d="M1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13zm13 1a.5.5 0 0 1 .5.5v6l-3.775-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12v.54A.505.505 0 0 1 1 12.5v-9a.5.5 0 0 1 .5-.5h13z"/>
                                    </svg> -->
                  <el-upload
                    :disabled="Array.isArray(activeNodes) && activeNodes.length == 0"
                    class="avatar-uploader"
                    :headers="getHeaders()"
                    :action="uploadFile"
                    :show-file-list="false"
                    :data="imgReqModel"
                    :on-success="handleAvatarSuccess"
                    :before-upload="beforeAvatarUpload"
                  >
                    <img
                      v-if="imageUrl"
                      :src="imageUrl"
                      class="avatar"
                    >
                    <i
                      v-else
                      class="el-icon-plus avatar-uploader-icon"
                    ></i>
                  </el-upload>
                </el-button>
              </el-tooltip>
              <div>

              </div>
            </div>

          </template>
        </div>
      </div>
    </div>

  </div>
</template>
<script>
import { walk } from 'simple-mind-map/src/utils'
import { loadImage } from 'simple-mind-map/src/utils'
export default {
  name: 'top-tool-bar',
  props: {
    activeNodes: {
      type: Array,
      default() {
        return []
      }
    },
    tools: {
      type: Array,
      default() {
        return [{
          name: '文字样式',
          tools: [{
            name: '字体',
            key: 'fontFamily',
            icon: 'el-icon-bottom-right',
            disabled: false,
            options: [],
            value: '',
            predefineFonts: [{
              ch: '宋体',
              en: 'SimSun'
            }, {
              ch: '黑体',
              en: 'SimHei'
            }, {
              ch: '微软雅黑',
              en: 'Microsoft Yahei'
            }, {
              ch: '微软正黑体',
              en: 'Microsoft JhengHei'
            }, {
              ch: '楷体',
              en: 'KaiTi'
            }, {
              ch: '新宋体',
              en: 'NSimSun'
            }, {
              ch: '仿宋',
              en: 'FangSong'
            }],
          }, {
            name: '字号',
            key: 'fontSize',
            icon: 'el-icon-bottom-right',
            disabled: false,
            options: [],
            value: '',
            predefineFonts: [{
              name: 'H1',
              value: '2em'
            }, {
              name: 'H2',
              value: '1.5em'
            }, {
              name: 'H3',
              value: '1.17em'
            }, {
              name: 'H4',
              value: '14px'
            }, {
              name: 'H5',
              value: '0.83em'
            }, {
              name: '正文',
              value: '12px'
            }],
          }, {
            name: '加粗',
            key: 'fontWeight',
            icon: 'el-icon-bottom-right',
            disabled: false,
            options: [],
            value: '',
          }, {
            name: '删除线',
            key: 'textDecoration',
            icon: 'el-icon-bottom-right',
            disabled: false,
            options: [],
            value: '',
          }, {
            name: '文字颜色',
            key: 'color',
            icon: 'el-icon-bottom-right',
            disabled: false,
            options: [],
            value: '',
            predefineColors: [
              // 预置颜色
              '#ff4500',
              '#ff8c00',
              '#ffd700',
              '#90ee90',
              '#00ced1',
              '#1e90ff',
              '#c71585',
              'rgba(255, 69, 0, 0.68)',
              'rgb(255, 120, 0)',
              'hsv(51, 100, 98)',
              'hsva(120, 40, 94, 0.5)',
              'hsl(181, 100%, 37%)',
              'hsla(209, 100%, 56%, 0.73)',
              '#c7158577'
            ],
          }]
        }, {
          name: '节点样式',
          tools: [{
            name: '边框颜色',
            key: 'borderColor',
            icon: 'el-icon-bottom-right',
            disabled: false,
            options: [],
            value: '',
            predefineColors: [
              // 预置颜色
              '#ff4500',
              '#ff8c00',
              '#ffd700',
              '#90ee90',
              '#00ced1',
              '#1e90ff',
              '#c71585',
              'rgba(255, 69, 0, 0.68)',
              'rgb(255, 120, 0)',
              'hsv(51, 100, 98)',
              'hsva(120, 40, 94, 0.5)',
              'hsl(181, 100%, 37%)',
              'hsla(209, 100%, 56%, 0.73)',
              '#c7158577'
            ],
          }, {
            name: '背景颜色',
            key: 'fillColor',
            icon: 'el-icon-bottom-right',
            disabled: false,
            options: [],
            value: '',
            predefineColors: [
              // 预置颜色
              '#ff4500',
              '#ff8c00',
              '#ffd700',
              '#90ee90',
              '#00ced1',
              '#1e90ff',
              '#c71585',
              'rgba(255, 69, 0, 0.68)',
              'rgb(255, 120, 0)',
              'hsv(51, 100, 98)',
              'hsva(120, 40, 94, 0.5)',
              'hsl(181, 100%, 37%)',
              'hsla(209, 100%, 56%, 0.73)',
              '#c7158577'
            ],
          }, {
            name: '节点形状',
            key: 'shape',
            icon: 'el-icon-bottom-right',
            disabled: false,
            options: [],
            value: '',
            predefineShapes: [
              {
                name: '矩形',
                value: 'rectangle'
              },
              {
                name: '菱形',
                value: 'diamond'
              },
              {
                name: '平行四边形',
                value: 'parallelogram'
              },
              {
                name: '圆角矩形',
                value: 'roundedRectangle'
              },
              {
                name: '八角矩形',
                value: 'octagonalRectangle'
              },
              {
                name: '外三角矩形',
                value: 'outerTriangularRectangle'
              },
              {
                name: '内三角矩形',
                value: 'innerTriangularRectangle'
              },
              {
                name: '椭圆',
                value: 'ellipse'
              },
              {
                name: '圆',
                value: 'circle'
              }
            ],
          }]
        }, {
          name: '节点内容',
          tools: [{
            name: '插入图片',
            key: 'setImage',
            icon: 'el-icon-bottom-right',
            disabled: false,
            options: [],
            value: '',
            predefineColors: [
            ],
          }]
        }]
      }
    }
  },
  data() {
    return {
      fileType: 'jpg/png/svg/PNG/JPG/JPEG/jpeg/gif/GIF/bmp/tif/tiff',
      imageMode: {
        serviceName: 'srv_bxfile_service',
        interfaceName: 'add',
        app_no: 'config',
        table_name: 'bxtools_mind_map_node',
        thumbnailType: 'fwsu_100',
        columns: 'image',
      },
      uploadFile: this.serviceApi().uploadFile,
      // tools:[{
      //     name:'文字样式',
      //     tools:[{
      //         name:'字体',
      //         key:'fontFamily',
      //         icon:'el-icon-bottom-right',
      //         disabled:false,
      //         options:[],
      //         value:'',
      //         predefineFonts: [{
      //             ch: '宋体',
      //             en: 'SimSun'
      //         }, {
      //             ch: '黑体',
      //             en: 'SimHei'
      //         }, {
      //             ch: '微软雅黑',
      //             en: 'Microsoft Yahei'
      //         }, {
      //             ch: '微软正黑体',
      //             en: 'Microsoft JhengHei'
      //         }, {
      //             ch: '楷体',
      //             en: 'KaiTi'
      //         }, {
      //             ch: '新宋体',
      //             en: 'NSimSun'
      //         }, {
      //             ch: '仿宋',
      //             en: 'FangSong'
      //         }],
      //     },{
      //         name:'字号',
      //         key:'fontSize',
      //         icon:'el-icon-bottom-right',
      //         disabled:false,
      //         options:[],
      //         value:'',
      //         predefineFonts: [{
      //             name: 'H1',
      //             value: '2em'
      //         },{
      //             name: 'H2',
      //             value: '1.5em'
      //         },{
      //             name: 'H3',
      //             value: '1.17em'
      //         },{
      //             name: 'H4',
      //             value: '14px'
      //         },{
      //             name: 'H5',
      //             value: '0.83em'
      //         },{
      //             name: '正文',
      //             value: '12px'
      //         }],
      //     },{
      //         name:'加粗',
      //         key:'fontWeight',
      //         icon:'el-icon-bottom-right',
      //         disabled:false,
      //         options:[],
      //         value:'',
      //     },{
      //         name:'删除线',
      //         key:'textDecoration',
      //         icon:'el-icon-bottom-right',
      //         disabled:false,
      //         options:[],
      //         value:'',
      //     },{
      //         name:'文字颜色',
      //         key:'color',
      //         icon:'el-icon-bottom-right',
      //         disabled:false,
      //         options:[],
      //         value:'',
      //         predefineColors: [
      //             // 预置颜色
      //             '#ff4500',
      //             '#ff8c00',
      //             '#ffd700',
      //             '#90ee90',
      //             '#00ced1',
      //             '#1e90ff',
      //             '#c71585',
      //             'rgba(255, 69, 0, 0.68)',
      //             'rgb(255, 120, 0)',
      //             'hsv(51, 100, 98)',
      //             'hsva(120, 40, 94, 0.5)',
      //             'hsl(181, 100%, 37%)',
      //             'hsla(209, 100%, 56%, 0.73)',
      //             '#c7158577'
      //         ],
      //     }]
      // },{
      //     name:'节点样式',
      //     tools:[{
      //         name:'边框颜色',
      //         key:'borderColor',
      //         icon:'el-icon-bottom-right',
      //         disabled:false,
      //         options:[],
      //         value:'',
      //         predefineColors: [
      //             // 预置颜色
      //             '#ff4500',
      //             '#ff8c00',
      //             '#ffd700',
      //             '#90ee90',
      //             '#00ced1',
      //             '#1e90ff',
      //             '#c71585',
      //             'rgba(255, 69, 0, 0.68)',
      //             'rgb(255, 120, 0)',
      //             'hsv(51, 100, 98)',
      //             'hsva(120, 40, 94, 0.5)',
      //             'hsl(181, 100%, 37%)',
      //             'hsla(209, 100%, 56%, 0.73)',
      //             '#c7158577'
      //         ],
      //     },{
      //         name:'背景颜色',
      //         key:'fillColor',
      //         icon:'el-icon-bottom-right',
      //         disabled:false,
      //         options:[],
      //         value:'',
      //         predefineColors: [
      //             // 预置颜色
      //             '#ff4500',
      //             '#ff8c00',
      //             '#ffd700',
      //             '#90ee90',
      //             '#00ced1',
      //             '#1e90ff',
      //             '#c71585',
      //             'rgba(255, 69, 0, 0.68)',
      //             'rgb(255, 120, 0)',
      //             'hsv(51, 100, 98)',
      //             'hsva(120, 40, 94, 0.5)',
      //             'hsl(181, 100%, 37%)',
      //             'hsla(209, 100%, 56%, 0.73)',
      //             '#c7158577'
      //         ],
      //     },{
      //         name:'节点形状',
      //         key:'shape',
      //         icon:'el-icon-bottom-right',
      //         disabled:false,
      //         options:[],
      //         value:'',
      //         predefineShapes: [
      //             {
      //                 name: '矩形',
      //                 value: 'rectangle'
      //             },
      //             {
      //                 name: '菱形',
      //                 value: 'diamond'
      //             },
      //             {
      //                 name: '平行四边形',
      //                 value: 'parallelogram'
      //             },
      //             {
      //                 name: '圆角矩形',
      //                 value: 'roundedRectangle'
      //             },
      //             {
      //                 name: '八角矩形',
      //                 value: 'octagonalRectangle'
      //             },
      //             {
      //                 name: '外三角矩形',
      //                 value: 'outerTriangularRectangle'
      //             },
      //             {
      //                 name: '内三角矩形',
      //                 value: 'innerTriangularRectangle'
      //             },
      //             {
      //                 name: '椭圆',
      //                 value: 'ellipse'
      //             },
      //             {
      //                 name: '圆',
      //                 value: 'circle'
      //             }
      //             ],
      //     }]
      // }],
      nodeStyle: {
        color: ''
      },
      imageUrl: '',
      fileSize: 20 * 1024,
      imageSize: null

    }
  },

  computed: {
    imgReqModel() {
      let model = this.bxDeepClone(this.imageMode)
      model['app_no'] = this.resolveDefaultSrvApp()
      return model
    },
    imageAction() {
      let url = ''

      return url
    },
    toolsBuild() {
      let tools = this.bxDeepClone(this.tools)
      let nodeData = this.activeNodes.length > 0 ? this.activeNodes[0] : null
      if (nodeData) {
        // 获取节点原始样式
        nodeData = nodeData.nodeData.data
        for (let bars of tools) {
          for (let tool of bars.tools) {
            for (let key in nodeData) {
              if (key == tool.key) {
                tool['value'] = nodeData[key]
              }
            }
          }
        }
      }

      return tools
    },
    fontWeight() {
      let fontWeight = 'bold'
      for (let node of this.activeNodes) {
        let style = node.getStyle()
        if (style.hasOwnProperty('fontWeight')) {
          fontWeight = style.fontWeight
        } else {
          fontWeight = 'none'
        }
        console.log('fontWeight', node.getStyle())
      }
      return fontWeight
    },
    textDecoration() {
      let textDecoration = ''
      for (let node of this.activeNodes) {
        let style = node.getStyle()
        if (style.hasOwnProperty('textDecoration')) {
          textDecoration = style.textDecoration
        } else {
          textDecoration = ''
        }
        console.log('textDecoration', node.getStyle())
      }
      return textDecoration
    }
  },
  methods: {
    getHeaders() {
      let bx_auth_ticket = sessionStorage.getItem("bx_auth_ticket");
      return {
        bx_auth_ticket: bx_auth_ticket,
        "bx-auth-ticket": bx_auth_ticket,
      };
    },
    onClick(e) {
      console.log(e)
      this.$emit('set-node-tool', e)
    },
    setColor(e) {
      console.log(e)
      let obj = {
        execCommand: 'setStyle',
        style: {}
      }
      obj['style']['color'] = e
      this.$emit('set-node-tool', obj)
    },
    setFontWeight() {
      let obj = {
        execCommand: 'setStyle',
        style: {}
      }
      obj['style']['fontWeight'] = this.fontWeight == 'bold' ? 'none' : 'bold'
      this.$emit('set-node-tool', obj)
    },
    setTextDecoration() {
      let obj = {
        execCommand: 'setStyle',
        style: {}
      }
      obj['style']['textDecoration'] = this.textDecoration == 'line-through' ? '' : 'line-through'
      this.$emit('set-node-tool', obj)
    },
    setFontFamily(e) {
      console.log(e)
      let obj = {
        execCommand: 'setStyle',
        style: {}
      }
      obj['style']['fontFamily'] = e
      this.$emit('set-node-tool', obj)
    },
    setFontSize(e) {
      console.log(e)
      let obj = {
        execCommand: 'setStyle',
        style: {}
      }
      obj['style']['fontSize'] = e
      this.$emit('set-node-tool', obj)
    },
    setShape(e) {
      console.log(e)
      let obj = {
        execCommand: 'setStyle',
        style: {}
      }
      obj['style']['shape'] = e
      this.$emit('set-node-tool', obj)
    },

    borderColor(e) {
      console.log(e)
      let obj = {
        execCommand: 'setStyle',
        style: {}
      }
      obj['style']['borderColor'] = e
      this.$emit('set-node-tool', obj)

    },
    fillColor(e) {
      console.log(e)
      let obj = {
        execCommand: 'setStyle',
        style: {}
      }
      obj['style']['fillColor'] = e
      this.$emit('set-node-tool', obj)
    },
    setImage(e) {

      console.log(e)
      let obj = {
        execCommand: 'setImage',
        style: {}
      }
      obj['style']['imageNo'] = e
      if (e) {
        this.$emit('set-node-tool', obj)
      }


    },
    handleAvatarSuccess(res, file) {
      let self = this
      console.log('handleAvatarSuccess', res)
      if (res.file_no) {
        self.imageUrl = res.file_no;
        self.setImage({
          no: res.file_no,
          size: this.imageSize
        })
      }

    },
    beforeAvatarUpload(file) {
      // console.log('file',file,getImageSize(file))

      let flag = false
      loadImage(file).then((i) => {
        console.log('getImageSize', i)
        this.$set(this, 'imageSize', i.size)
        if (file.size / 1024 > this.fileSize) {
          this.$message.error('文件大小不能超过' + this.fileSize + 'kb');
          return false
        }
        for (let i in this.fileType.split('/')) {
          if (file.name.split('.')[1] === this.fileType.split('/')[i]) {
            flag = true
            break
          }
        }
        if (!flag) {
          this.$message.error('只能上传' + this.fileType + '文件!');
          return false
        }
      })


      // const isJPG = file.type === 'image/jpeg';
      // const isLt2M = file.size / 1024 / 1024 < 2;

      // if (!isJPG) {
      // this.$message.error('上传头像图片只能是 JPG 格式!');
      // }
      // if (!isLt2M) {
      // this.$message.error('上传头像图片大小不能超过 2MB!');
      // }
      // return isJPG && isLt2M;
    }






  }

};
</script>
<style lang="scss">
.top-tool-bar {
  background: #fff;
  padding: 5px;
  // position: fixed;
  right: 20px;
  display: flex;
  align-items: center;

  &>div {
    margin-right: 5px;
  }

  .tool-bar-group {

    .bar-group {
      display: flex;
      align-items: center;
      border-right: 1px solid #eee;
      margin-right: 5px;
      padding-right: 5px;
      flex-direction: column;

      .bar-group-title {
        font-size: 8px;
      }

      .bar-group-tools {
        display: flex;
        align-items: center;
        margin-right: 5px;
        padding-right: 5px;

        .tool-bar {
          padding: 4px 4px;
          font-size: 18px;
          display: flex;
          align-items: center;

          &>div {
            height: 100%;
            display: flex;
          }

          .tool-bar-group {
            border-radius: 3px;
            display: flex;
            padding-left: 4px;
            align-items: center;

          }

          .el-color-picker.el-color-picker--small {
            height: 28px;
            width: 28px;

            .el-color-picker__trigger {
              // padding:2px;
              border: 0;
              height: 28px;
              width: 28px;

              .el-color-picker__color {
                border: 0;
                padding: 2px;
              }
            }
          }

        }
      }
    }
  }

}
</style>