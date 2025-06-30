<template>
  <div v-show="evalVisible()" class="list-comp-wrap">
    <div
      class="chart-box"
      v-if="
        cfgJson &&
        cfgJson.options &&
        cfgJson.options.includes('图表') &&
        cfgJson.chart_json
      "
    >
      <!-- 图表 -->
      <vue-chart :config="cfgJson.chart_json" :data="gridDataRun"></vue-chart>
    </div>
    <el-tabs
      v-if="isDraft"
      v-model="activeTabName"
      @tab-click="onTabshandleClick"
    >
      <el-tab-pane
        v-for="(tabItem, index) in tabsConfig"
        :key="index"
        :label="tabItem.label"
        :name="tabItem.key"
      >
        <span slot="label"> {{ tabItem.label }}({{ tabItem.len }})</span>
      </el-tab-pane>
    </el-tabs>
    <div v-if="searchForm" v-show="selectFormShow">
      <simple-filter
        v-if="srv_cols"
        :srv_cols="srv_cols"
        :defaultValues="setDefaultValue"
        :supportGroup="false"
        v-on:search-clicked="query"
        ref="filter-form"
        @form-loaded="onFilterFormLoaded($refs['filter-form'])"
      >
      </simple-filter>
    </div>

    <div v-if="list_inner_add">
      <add
        name="list-inner-add"
        ref="add-form"
        :service="getAddService"
        :submit2-db="storageType == 'db'"
        @action-complete="onAddFormActionComplete($event)"
        @form-loaded="onAddFormLoaded"
        @submitted2mem="onAdd2MemSubmitted"
      >
      </add>
    </div>
    <!-- <el-row v-if="groupByLayoutRun.length > 0" type="flex" class="row-bg-group-layout" justify="left">
         <el-col :xs="8" :sm="6" :md="4" :lg="3" :xl="1" v-for="(item,index) in groupByLayoutRun" :key="index">
           <div class="grid-content bg-purple group-by-layout">
             {{item.aliasName}}:{{item.value}}{{item.unit}}
           </div>
           </el-col>
    </el-row> -->
    <el-row
      v-show="!hideButtons"
      type="flex"
      class="row-bg"
      justify="space-between"
    >
      <div class="table-head-btns">
        <icon-excel-colorful
          class="svg-icon"
          style="cursor: pointer"
          size="30"
          :colors="['#409eff']"
          :strokeWidth="3"
          title="打开excel进行编辑"
          @click.native="gridButtonClick(excelBtn)"
          v-if="excelBtn"
        ></icon-excel-colorful>
        <!--        <icon-excel class="svg-icon" style="cursor: pointer" size="30" :strokeWidth="3"-->
        <!--                             @click.native="gridButtonClick(excelBtn)"  v-if="excelBtn"></icon-excel>-->
        <!-- <el-button type="primary" size="small"  v-if="(defaultDirtyFlags == 'add' || listType ==  'addchildlist') && batchAddButton && batchAddButton.hasOwnProperty('batchAdd') && batchAddButton.batchAdd.isDisp && selection" @click.stop="onMemBatchUpdateActive">
          批量操作
        </el-button> -->
        <div
          v-if="cfgJson && cfgJson.list_type === '卡片列表' && !childForeignkey"
          class="list-style-switch"
        >
          <icon-list
            :colors="listStyle === 'list' ? ['#fff'] : ['#333']"
            :style="{
              backgroundColor: listStyle === 'list' ? '#1684fc' : '#fff',
            }"
            @click.native="changeListStyle('list')"
          ></icon-list>
          <icon-grid
            :colors="listStyle === 'card' ? ['#fff'] : ['#333']"
            :style="{
              backgroundColor: listStyle === 'card' ? '#1684fc' : '#fff',
            }"
            @click.native="changeListStyle('card')"
          ></icon-grid>
        </div>
        <el-popover
          placement="right"
          popper-class="table-popover"
          width="800"
          v-if="moreConfig && moreConfig.hasOwnProperty('table_explain')"
          trigger="click"
        >
          <div v-html="recoverFileAddress4richText(moreConfig.table_explain.desc)"></div>
          <div slot="reference" style="color: #525252; padding: 2px 10px">
            列表字段说明<i class="el-icon-question"></i>
          </div>
        </el-popover>
      </div>
      <div class="table-head-btns">
        <el-button
          v-if="saveWidthBtn"
          @click="saveColumnWidth"
          type="primary"
          size="small"
          >保存列宽
        </el-button>
        <template v-for="(item, index) in sortedGridButtons">
          <el-button
            :key="index"
            :size="item._moreConfig.size"
            :type="
              selectFormShow && item.button_type === 'select'
                ? 'success'
                : item._moreConfig.type
            "
            :icon="item && (item.button_icon || item._moreConfig.icon)"
            :round="
              item._moreConfig.style !== '' &&
              item._moreConfig.style === 'round'
            "
            :plain="
              item._moreConfig.style !== '' &&
              item._moreConfig.style === 'plain'
            "
            :circle="
              item._moreConfig.style !== '' &&
              item._moreConfig.style === 'circle'
            "
            v-show="item.evalVisible()"
            :disabled="item.evalDisable()"
            v-if="
              (!readOnly &&
                existsGridButton &&
                item.permission &&
                getDispExps(item)) ||
              (!item.permission &&
                item.hasOwnProperty('always_show') &&
                item.always_show === true)
            "
            @click="gridButtonClick(item)"
          >
            {{ getButtonName(item) }}
          </el-button>
        </template>
      </div>

      <!-- <div>
            <el-button  @click="gridButtonClick({'button_type':'export'})">
                导出测试
              </el-button>
          </div> -->
    </el-row>

    <div class="table-list-row">
      <simple-card
        v-if="card_no != undefined && init_card_data"
        name="cardlist"
        ref="cardlist"
        :card_cfg="card_cfg"
        :row_button="rowButton"
        :data_list="gridData"
        @card-loaded="cardLoadinit"
        @card-row-button="rowButtonClick"
      ></simple-card>
      <!--      卡片列表-->

      <card-list
        :grid-data="gridDataRun"
        :read-only="readOnly"
        :cells-layout-json="cfgJson.card_json"
        :row-buttons="sortedRowButtons"
        v-else-if="listStyle === 'card' && cfgJson && cfgJson.card_json"
      >
        <template #footer="{ data }">
          <div class="footer-btn" v-if="readOnly !== true">
            <div
              class="footer-btn-item"
              v-for="(btn, index) in sortedRowButtons"
              :key="index"
            >
              <el-button
                size="mini"
                :type="['detail'].includes(btn.button_type) ? 'primary' : ''"
                @click.stop="rowButtonClick(btn, data)"
                >{{ btn.button_name }}
              </el-button>
            </div>
          </div>
        </template>
      </card-list>
      <el-row
        type="flex"
        class="row-bg"
        justify="center"
        ref="elTableParentDiv"
        v-else
        style="flex: 1; overflow: hidden"
      >
        <el-table
          ref="bx-table-layout"
          :data="gridDataRun"
          stripe
          border
          style="width: 100%"
          :max-height="tableMaxHeight"
          :row-class-name="tableRowClassName"
          row-key="id"
          highlight-current-row
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          lazy
          :load="loadChildData"
          @selection-change="handleSelectionChange"
          @filter-change="filterChange"
          @sort-change="handleSortChange"
          @header-dragend="onColumnWidthChange"
          :span-method="arraySpanMethod"
          @row-dblclick="onRowDbClicked"
        >
          <el-table-column
            type="selection"
            label="全选"
            header-align="left"
            width="50px"
            v-if="selection && !readOnly && !isDemo"
          >
          </el-table-column>
          <!-- :show-summary="sumRowData ? true : false"
            :summary-method="getSummaries" -->
          <!-- v-if="(item.show && (!item.evalVisible || item.evalVisible()))" ---↓-->
          <el-table-column
            v-for="(item, index) in gridHeader"
            :key="index"
            header-align="center"
            v-if="getGridHeaderDispExps(item, listMainFormDatas)"
            :width="
              item.width
                ? item.width
                : getListShowFileList(item)
                ? item.list_min_width
                  ? item.list_min_width
                  : 180
                : ''
            "
            :filter-method="item.filters ? filterHandler : null"
            :prop="item.column"
            :align="item.align"
            :fixed="item.rowFixed ? true : null"
            :show-overflow-tooltip="
              getListShowFileList(item) === true
                ? false
                : !listCellsTextDispWarp
            "
            :label="item.label"
            :min-width="
              getColumnMinWidth(item)
                ? getColumnMinWidth(item)
                : item.list_min_width + 'px'
            "
            :filters="item.filters"
            :column-key="item.column"
            :sortable="item.sortable && !isMem() ? 'custom' : false"
            :cell-style="cellStyle"
          >
            <!-- <template slot="header" slot-scope="scope">
                <div style="display: inline-flex;">
                  <span>
                  {{ item.label }}
                  </span>
                  <div style="display: flex;flex-direction: column;line-height: unset;">
                    <span
                    style="line-height: unset;"
                    v-for="key in Object.keys(item.backgroundMap)"
                    v-if="item.backgroundMap"
                  >
                    <span
                      :style="{
                        background: item.backgroundMap[key],
                        width: '10px',
                        height: '10px',
                        borderRadius: '10px',
                        display: 'inline-block',
                      }"
                    ></span>
                    <span>
                    </span>
                  </span>
                  </div>
                </div>
              </template> -->
            <template slot-scope="scope">
              <template v-if="item._obj_info">
                <file-list
                  v-if="['FileList', 'Image'].includes(item.col_type)"
                  :data="scope.row"
                  :field="item"
                ></file-list>
                <div v-else-if="['User'].includes(item.col_type)">
                  <a
                    v-if="item.linkUrlFunc"
                    v-show="scope.row[item.column]"
                    style="
                      white-space: nowrap;
                      color: dodgerblue;
                      cursor: pointer;
                    "
                    v-for="(tag, tIndex) in getUserTags(item, scope.row)"
                    :key="tIndex"
                    @click="onLinkClicked(scope.row, item)"
                  >
                    {{ tag.user_disp || "--" }}
                  </a>
                  <!-- <el-tag
                      size="mini"
                      style="margin-right: 4px; margin-bottom: 2px"
                      :type="['', 'success', 'warning', 'danger'][tIndex % 4]"
                      v-for="(tag, tIndex) in getUserTags(item, scope.row)"
                      @click="onLinkClicked(scope.row, item)"
                    >
                      {{ tag.user_disp || "--" }}
                    </el-tag> -->
                </div>
              </template>

              <!-- 二进制文件 -->
              <div v-else-if="item.col_type === 'ImgBin'">
                <el-image
                  style="width: 50px; height: 50px"
                  :src="blobToBase64(scope.row[item.column])"
                  fit="cover"
                >
                </el-image>
              </div>
              <!-- 在线url -->
              <div v-else-if="item.col_type === 'ImgUrl'">
                <el-image
                  style="width: 50px; height: 50px"
                  :src="setImgUrl(scope.row[item.column])"
                  fit="cover"
                >
                </el-image>
              </div>
              <div
                v-else-if="
                  item.srvcol &&
                  item.srvcol.subtype &&
                  ['progress', 'rate'].includes(item.srvcol.subtype)
                "
              >
                <el-rate
                  :value="scope.row[item.column]"
                  show-score
                  :disabled="true"
                  text-color="#ff9900"
                  style="width: 100%"
                  v-if="item.srvcol.subtype === 'rate'"
                >
                </el-rate>
                <el-progress
                  :percentage="scope.row[item.column] || 0"
                  :text-inside="true"
                  :stroke-width="18"
                  v-else-if="item.srvcol.subtype === 'progress'"
                ></el-progress>
              </div>
              <div
                v-else-if="
                  canInlineEdit &&
                  onInlineEditing &&
                  inlineEditCols &&
                  item.column &&
                  inlineEditCols[item.column]
                "
              >
                <inline-edit-list
                  :key="item.column"
                  :field="inlineEditCols[item.column]"
                  :ref="'inlineEditor' + item.column"
                  :data="scope.row"
                  @on-change="onInlineChange($event, scope.$index)"
                ></inline-edit-list>
              </div>
              <div
                v-else-if="
                  isInplaceEdit() && findEditField(scope.row, item.column)
                "
                class="is-InplaceEdit"
              >
                <!-- <raw-field-editor :field="findEditField(scope.row, item.column)"
                          @field-value-changed="onCellValueChanged(scope.row, item.column)"
                          @blur="onCellBlur(scope.row, item.column)">
                    </raw-field-editor> -->
                {{ formatValue(scope.row, item) }}
              </div>
              <div v-else-if="item.col_type === 'progress'">
                <el-progress
                  :text-inside="true"
                  :stroke-width="18"
                  :percentage="scope.row[item.column]"
                ></el-progress>
              </div>
              <div
                v-else-if="
                  formatValue(scope.row, item) &&
                  ['Note', 'RichText'].includes(item.col_type)
                "
                v-html="recoverFileAddress4richText(formatValue(scope.row, item))"
                style="max-height: 10vh; overflow: hidden"
                @dblclick="openHtml(formatValue(scope.row, item))"
              ></div>
              <!-- Enum | Dict 根据配置显示图标 -->
              <div
                v-else-if="
                  (item.col_type === 'Enum' || item.col_type === 'Dict') &&
                  item.show_option_icon !== false
                "
              >
                <div
                  v-for="(optionIcon, index) in item.show_option_icon"
                  :key="index"
                  class="row-icons"
                >
                  <img
                    fit="contain"
                    v-if="scope.row[item.column] === optionIcon.value"
                    :src="optionIcon.icon"
                  />
                </div>
              </div>
              <div v-else-if="item.col_type === 'Image'" class="list-image">
                <img
                  v-if="scope.row[item.column]"
                  :src="
                    serviceApi(scope.row[item.column]).downloadFileNo +
                    scope.row[item.column]
                  "
                />
              </div>

              <!-- <div v-else-if="item.col_type === 'FileList'">
                    <upload-file :field="wrapCellIntoField(item.column, scope.row[item.column])"></upload-file>
                  </div> 1116隐藏-->
              <div
                v-else-if="
                  item.col_type === 'FileList' && getListShowFileList(item)
                "
                class="list-image"
              >
                <div
                  style="display: flex; align-items: center"
                  :title="fileItem.src_name"
                  v-for="(fileItem, index) in getListFileDatas(item, scope.row)"
                  :key="index"
                >
                  <i
                    v-show="
                      getFileType(fileItem) === 'img' ||
                      getFileType(fileItem) === 'pdf' ||
                      getFileType(fileItem) === 'ppt'
                    "
                    title="预览"
                    style="cursor: pointer"
                    class="el-icon-view"
                    @click.stop="
                      onPreView(
                        fileItem,
                        index,
                        getListFileDatas(item, scope.row)
                      )
                    "
                  >
                  </i>
                  <el-link
                    @click="getDownloadFile(fileItem)"
                    v-if="getListFileDatas(item, scope.row).length > 0"
                  >
                    <i
                      :class="
                        getFileType(fileItem) === 'img'
                          ? 'el-icon-picture-outline'
                          : getFileType(fileItem) === 'doc'
                          ? 'el-icon-tickets'
                          : getFileType(fileItem) === 'media'
                          ? 'el-icon-picture-outline'
                          : 'el-icon-folder'
                      "
                    ></i>
                    {{ getStrIntercept(fileItem.src_name, 0) }}
                  </el-link>
                  <!-- <span></span> -->
                </div>
              </div>

              <template v-else>
                <div v-if="header_view_model == 'group'" class="group-table">
                  <pre>{{ formatValue(scope.row, item) }}</pre>
                </div>
                <template v-else>
                  <a
                    v-if="item.linkUrlFunc"
                    v-show="scope.row[item.column]"
                    style="
                      white-space: nowrap;
                      color: dodgerblue;
                      cursor: pointer;
                    "
                    @click="onLinkClicked(scope.row, item)"
                  >
                    {{ formatValue(scope.row, item) }}
                  </a>
                  <div
                    style="display: flex; flex-wrap: wrap"
                    v-else-if="isFkJson(scope.row, item)"
                  >
                    <el-tag
                      style="margin-right: 4px; margin-bottom: 2px"
                      size="mini"
                      :type="['', 'success', 'warning', 'danger'][tIndex % 4]"
                      v-for="(tag, tIndex) in getFkJson(scope.row, item)"
                      :key="tIndex"
                      >{{ tag || "" }}
                    </el-tag>
                  </div>

                  <!-- <div v-else-if="item.srvcol.updatable">
                      <el-input-number size="small"
                        v-if="item.col_type === 'Integer' || 'int' || 'Float' || 'money'"
                        v-model="scope.row[item.column]" @change="handleEdit(scope.$index, scope.row)" :min="0"
                        label=""></el-input-number>
                      <el-input size="small" v-else-if="item.col_type === 'String'"
                        v-model="scope.row[item.column]" @change="handleEdit(scope.$index, scope.row)"></el-input>
                    </div> -->
                  <a
                    class="link-to-detail"
                    title="点击查看详情"
                    v-else-if="
                      isDetailLink(item.column, scope.row, scope.$index)
                    "
                    @click="toDetail(item.column, scope.row, scope.$index)"
                    >{{ formatValue(scope.row, item) }}</a
                  >
                  <span
                    v-else
                    :class="{
                      hasBg:
                        (item.backgroundMap &&
                          item.backgroundMap[scope.row[item.column]]) ||
                        item.backgroundMap['_default'],
                    }"
                    :style="setTdStyle(item, scope.row)"
                    >{{ formatValue(scope.row, item) }}</span
                  >
                </template>
              </template>
              <div
                style="float: right"
                v-if="
                  showAddChildBtn(scope.row, scope.$index, item.column, index)
                "
              >
                <el-button
                  type="text"
                  style="padding: 0; margin: 0"
                  :title="
                    getButtonName(
                      showAddChildBtn(scope.row, scope.$index),
                      scope.row
                    )
                  "
                  @click.stop.native="
                    rowButtonClick(
                      showAddChildBtn(scope.row, scope.$index),
                      scope.row
                    )
                  "
                  ><i class="el-icon-plus"></i
                ></el-button>
              </div>
            </template>
          </el-table-column>

          <el-table-column
            label="操作"
            header-align="left"
            width="240"
            fixed="right"
            v-if="
              !readOnly &&
              listType != 'selectlist' &&
              !hideButtons &&
              sortedRowButtons.length > 0
            "
            style="box-sizing: border-box"
          >
            <template slot-scope="scope" v-if="getColumnsShow(scope.row)">
              <!-- <el-button v-for="(button, index) in sortedRowButtons"
                            :key="index"
                            @click="rowButtonClick(button,scope.row)"
                            :size="button._moreConfig.size" 
                            :type="button._moreConfig.type" 
                            :icon="button._moreConfig.icon" 
                            :round="button._moreConfig.style !== '' &&  button._moreConfig.style === 'round'"
                            :plain="button._moreConfig.style !== '' && button._moreConfig.style === 'plain'"
                            :circle="button._moreConfig.style !== '' && button._moreConfig.style === 'circle'"
                            :disabled="button.evalDisable()"
                            v-if="getDispExps(button, scope.row) && button.permission"
                            v-show="isRowButtonVisible(button, scope.row)">
                    {{ getButtonName(button, scope.row) }}
                  </el-button> -->
              <div style="margin-bottom: -5px">
                <div
                  v-for="(button, index) in sortedRowButtons"
                  :key="index"
                  style="
                    margin-right: 5px;
                    margin-bottom: 5px;
                    display: inline-block;
                  "
                  v-if="
                    getDispExps(button, scope.row, scope.$index) &&
                    button.permission
                  "
                  v-show="
                    button.button_type === '_btn_group' ||
                    isRowButtonVisible(button, scope.row, scope.$index)
                  "
                >
                  <!-- <el-button
                    type="text"
                    :title="getButtonName(button, scope.row)"
                    @click.stop.native="rowButtonClick(button, scope.row)"
                    v-if="
                      routeMeta &&
                      routeMeta.isTree === true &&
                      button.button_type == 'addchild' &&
                      getButtonOptSrv(button, scope.row, 'isShow')
                    "
                    ><i class="el-icon-plus"></i
                  ></el-button> -->
                  <el-button
                    @click="rowButtonClick(button, scope.row)"
                    :size="button._moreConfig.size"
                    :type="button._moreConfig.type"
                    :icon="
                      button && (button.button_icon || button._moreConfig.icon)
                    "
                    :round="
                      button._moreConfig.style !== '' &&
                      button._moreConfig.style === 'round'
                    "
                    :plain="
                      button._moreConfig.style !== '' &&
                      button._moreConfig.style === 'plain'
                    "
                    :circle="
                      button._moreConfig.style !== '' &&
                      button._moreConfig.style === 'circle'
                    "
                    :disabled="button.evalDisable()"
                    v-if="
                      button.button_type !== 'addchild' &&
                      button.button_type !== '_btn_group' &&
                      getButtonOptSrv(button, scope.row, 'isShow')
                    "
                  >
                    {{ getButtonName(button, scope.row) }}
                  </el-button>
                  <el-dropdown
                    v-else-if="
                      button.button_type === '_btn_group' &&
                      button.buttons.length > 0 &&
                      getButtonDispExps(button.buttons, scope.row, scope.$index)
                    "
                  >
                    <el-button
                      :type="button.type"
                      :icon="'el-icon-s-operation'"
                      :size="button.size"
                      plain
                    >
                      {{ button.button_name }}
                      <i class="el-icon-arrow-down el-icon--right"></i>
                    </el-button>

                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item
                        v-for="(subBtn, subIndex) in button.buttons"
                        :key="subIndex"
                      >
                        <el-button
                          @click="rowButtonClick(subBtn, scope.row)"
                          :size="subBtn._moreConfig.size"
                          :type="subBtn._moreConfig.type"
                          :icon="
                            subBtn &&
                            (subBtn.button_icon || subBtn._moreConfig.icon)
                          "
                          :round="
                            subBtn._moreConfig.style !== '' &&
                            subBtn._moreConfig.style === 'round'
                          "
                          :plain="
                            subBtn._moreConfig.style !== '' &&
                            subBtn._moreConfig.style === 'plain'
                          "
                          :circle="
                            subBtn._moreConfig.style !== '' &&
                            subBtn._moreConfig.style === 'circle'
                          "
                          :disabled="subBtn.evalDisable()"
                          v-show="
                            subBtn.button_type !== 'addchild' &&
                            isRowButtonVisible(
                              subBtn,
                              scope.row,
                              scope.$index
                            ) &&
                            getDispExps(subBtn, scope.row) &&
                            subBtn.permission &&
                            getButtonOptSrv(subBtn, scope.row, 'isShow')
                          "
                        >
                          {{ subBtn.button_name }}
                        </el-button>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </div>
              </div>

              <!-- <el-badge  class="table-row-badge" 
                      v-if="isMem() && isDirtyRow(scope.row)"
                      :value="getDirtyRowTagText(scope.row)"
                      :type="getDirtyRowTagType(scope.row)"> 
                      -->
              <!-- {{getDirtyRowTagText(scope.row) === '添加' ? 'new' : getDirtyRowTagText(scope.row)}} -->
              <!-- <el-tag v-if="isMem() && isDirtyRow(scope.row)"
                          :type="getDirtyRowTagType(scope.row)">
                    {{getDirtyRowTagText(scope.row) === '添加' ? 'new' : getDirtyRowTagText(scope.row)}}
                  </el-tag> -->

              <!-- </el-badge> -->
            </template>
          </el-table-column>
        </el-table>
      </el-row>

      <!-- <el-row type="flex" class="row-bg" justify="center" v-if="!isMem()" -->
      <el-row
        type="flex"
        class="row-bg py-2"
        justify="center"
        v-if="showPagination && setShowPagination"
        v-show="!hidePagination && gridPage.total > 0 && !isDemo"
      >
        <el-pagination
          background
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
          :current-page="gridPage.currentPage"
          :page-sizes="gridPage.pageSizes"
          :page-size="gridPage.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="gridPage.total"
        >
        </el-pagination>
      </el-row>
    </div>
    <el-dialog
      class="customDialogClass"
      title="添加"
      width="90%"
      :close-on-click-modal="1 == 2"
      append-to-body
      :show-close="true"
      :visible="activeForm == 'add'"
      @close="closeDialog"
    >
      <!-- <template #title>
      <div class="flex justify-between pr-5">
        <div>添加</div>
        <div>

        </div>
      </div>
     </template> -->
      <add
        name="list-add"
        :mainService="mainService"
        ref="add-form"
        v-if="activeForm == 'add'"
        :service="getAddService"
        :submit2-db="storageType == 'db'"
        :defaultCondition="defaultCondition"
        :form-model-decorator="formModelDecorator"
        :haveDraft="isDraft"
        :pageIsDraft="activeTabName"
        :childForeignkey="childForeignkey"
        :parentPageType="listType"
        :parentMainFormDatas="listMainFormDatas"
        @action-complete="onAddFormActionComplete($event)"
        @form-loaded="onAddFormLoaded"
        @submitted2mem="onAdd2MemSubmitted"
        @close-dialog="closeDialog"
      >
        <template #dialog-title>
          <div class="flex justify-between pr-5">
            <div>添加</div>
          </div>
        </template>
      </add>
      <!-- :defaultValues="listMainFormDatas" -->
    </el-dialog>
    <el-dialog
      title="添加下级节点"
      width="90%"
      :close-on-click-modal="1 == 2"
      :visible="activeForm == 'add-child'"
      @close="closeDialog"
      append-to-body
    >
      <add
        :mainService="mainService"
        name="list-add-child"
        ref="add-child-form"
        v-if="activeForm == 'add-child'"
        :service="getAddService"
        :submit2-db="!isMem()"
        :defaultCondition="defaultCondition"
        :form-model-decorator="formModelDecorator"
        :haveDraft="isDraft"
        :pageIsDraft="activeTabName"
        :childForeignkey="childForeignkey"
        :parentPageType="listType"
        :parentMainFormDatas="listMainFormDatas"
        @action-complete="onAddFormActionComplete($event)"
        @form-loaded="onAddChildFormLoaded"
        @executor-complete="onAddChildExecutorComplete($event)"
        @submitted2mem="onAdd2MemSubmitted"
      >
      </add>
    </el-dialog>
    <el-dialog
      class="customDialogClass"
      title="复制"
      width="90%"
      :close-on-click-modal="1 == 2"
      append-to-body
      :visible="activeForm == 'duplicate'"
      @close="closeDialog"
    >
      <simple-add
        name="list-duplicate"
        ref="duplicate-form"
        :pageName="'list-duplicate'"
        v-if="activeForm == 'duplicate'"
        :service="getAddService"
        :default-conditions="getDefaultCondition4Duplicate"
        :submit2-db="storageType == 'db'"
        :parentPageType="listType"
        :defaultValues="activeData"
        :parentMainFormDatas="listMainFormDatas"
        duplicateType="duplicate"
        :duplicateData="
          clickedRow && clickedRow.duplicate ? clickedRow.duplicate : null
        "
        @action-complete="onAddFormActionComplete($event)"
        @form-loaded="onDuplicateFormLoaded"
        @submitted2mem="onAdd2MemSubmitted"
      >
      </simple-add>
    </el-dialog>

    <el-dialog
      class="customDialogClass"
      title="深度复制"
      width="90%"
      :close-on-click-modal="1 == 2"
      append-to-body
      :visible="activeForm == 'duplicatedeep'"
      @close="closeDialog"
    >
      <add
        name="list-duplicatedeep"
        ref="duplicatedeep-form"
        v-if="activeForm == 'duplicatedeep'"
        :service="getAddService"
        :default-conditions="getDefaultCondition4DuplicateDeep"
        :submit2-db="storageType == 'db'"
        :parentPageType="listType"
        :haveDraft="isDraft"
        :pageName="'list-duplicatedeep'"
        :parentMainFormDatas="listMainFormDatas"
        :pageIsDraft="activeTabName"
        :defaultValues="activeData"
        duplicateType="duplicatedeep"
        :duplicateData="
          clickedRow && clickedRow.duplicatedeep
            ? clickedRow.duplicatedeep
            : null
        "
        @action-complete="onAddFormActionComplete($event)"
        @form-loaded="onDuplicateFormLoaded"
        @submitted2mem="onAdd2MemSubmitted"
      >
      </add>
    </el-dialog>

    <el-dialog
      class="customDialogClass"
      title="编辑"
      width="90%"
      :visible="activeForm == 'update'"
      :close-on-click-modal="1 == 2"
      append-to-body
      @close="closeDialog"
    >
      <update
        name="list-update"
        :mainService="mainService"
        ref="update-form"
        v-if="activeForm == 'update'"
        :initOrigin="'dialog'"
        :service="getUpdateService"
        :pk="getClickedRowPk('update')"
        :pkCol="getCustomPkCol"
        :pageIsDraft="activeTabName"
        :initLoad="initLoad"
        :defaultValues="clickedRow['update']"
        :submit2-db="storageType == 'db'"
        :parentPageType="listType"
        :haveDraft="isDraft"
        :parentMainFormDatas="listMainFormDatas"
        :override-data="
          clickedRow.update._dirtyFlags ? clickedRow.update : null
        "
        @action-complete="onUpdateFormActionComplete($event)"
        @form-loaded="onUpdateFormLoaded($refs['update-form'])"
        @submitted2mem="onUpdate2MemSubmitted"
      >
      </update>
      <!-- <simple-update name="list-update" ref="update-form"
                     v-if="activeForm == 'update' " :service="getUpdateService"
                     :pk="getClickedRowPk('update')"
                     :submit2-db="storageType == 'db'"
                     :parentAddMainFormDatas="listMainFormDatas"
                     :override-data="clickedRow.update._dirtyFlags ? clickedRow.update : null"
                     @action-complete="onUpdateFormActionComplete($event)"
                     @form-loaded="onUpdateFormLoaded($refs['update-form'])"
                     @submitted2mem="onUpdate2MemSubmitted">
      </simple-update> -->
    </el-dialog>

    <el-dialog
      class="customDialogClass"
      title="导入"
      width="90%"
      :visible="activeForm == 'import'"
      append-to-body
      @close="closeDialog"
    >
      <import-dialog
        :service="addService"
        :sign-service-name="addService"
        v-if="activeForm == 'import'"
        :button="actionGridButton"
        @close="onImportDialogClosed"
      >
      </import-dialog>
    </el-dialog>
    <el-dialog
      class="customDialogClass"
      title="自定义导入"
      width="90%"
      :visible="activeForm == 'customizeImport'"
      append-to-body
      @close="closeDialog"
    >
      <import-dialog
        :service="importService"
        :sign-service-name="addService"
        :importPageType="'customize'"
        v-if="activeForm == 'customizeImport'"
        :button="actionGridButton"
        @close="onImportDialogClosed"
      >
      </import-dialog>
    </el-dialog>
    <el-dialog
      class="customDialogClass"
      title="导出"
      width="90%"
      :visible="activeForm == 'export'"
      append-to-body
      @close="onExportDialogClosed"
    >
      <exportLayout
        :columns="gridHeader"
        :type="'exprot'"
        @on-export-clicked="onExportClicked($event)"
      ></exportLayout>
    </el-dialog>
    <el-dialog
      class="customDialogClass"
      title="管理子表"
      width="90%"
      :visible="activeForm == 'manageChildList'"
      append-to-body
      @close="closeDialog"
    >
      <popup-mem-list
        list-type="detaillist"
        name="inlinelist"
        v-if="activeForm == 'manageChildList'"
        ref="inlineList"
        :service="props4ActivePopupMemList.inline_list_select_service"
        :foreign-key="props4ActivePopupMemList.foreign_key"
        :read-only="false"
        :search-form="false"
        :is-tree="false"
        :inplace-edit="true"
        :should-load-from-db="false"
        @list-loaded="onPopupMemListLoaded"
        @close-pop="closeDialog"
      >
      </popup-mem-list>
    </el-dialog>
    <el-dialog
      class="customDialogClass"
      ref="batchApprove"
      title="审批"
      width="90%"
      :visible="activeForm == 'batchApprove'"
      append-to-body
      @close="closeDialog"
    >
      <batchApprove
        @action-success="actionSuccess()"
        :approvaList="approvaList"
        :approvalOptions="approvalOptions"
        >测试
      </batchApprove>
    </el-dialog>

    <div>
      <popup-mem-list
        v-show="false"
        v-for="inlineList in inlineLists"
        :key="inlineList.foreign_key.constraint_name"
        ref="inlineLists"
        :service="inlineList.inline_list_select_service"
        :foreign-key="inlineList.foreign_key"
        :read-only="false"
        :search-form="false"
        :is-tree="false"
        :inplace-edit="true"
        :default-inplace-edit-mode="true"
      >
      </popup-mem-list>
    </div>
    <!-- 增加列表可以直接预览文件 -->
    <viewer
      v-show="false"
      :images="imagesListRun"
      ref="viewer"
      clsss="image-list"
    >
      <img
        style="height: 1rem; width: 1rem"
        :class="'image-' + src.id"
        @error="onerror"
        @load="onerror(src.url)"
        :src="src.url"
        v-for="(src, index) in imagesListRun"
        :key="index"
      />
    </viewer>
    <el-dialog
      class="customDialogClass"
      custom-class="preview-dialog"
      :title="
        currentType === 'pdf'
          ? '第' + currentPage + '页/共' + pageCount + '页'
          : '预览'
      "
      :visible.sync="centerDialogVisible"
      width="50%"
      lock-scroll
      center
    >
      <el-row type="flex" align="middle" v-if="currentType === 'pdf'">
        <el-col :span="2" class="grid-content">
          <el-button
            icon="el-icon-arrow-left"
            circle
            :disabled="currentPage === 1"
            @click="changePdfPage('up')"
          ></el-button>
        </el-col>
        <el-col :span="20" style="">
          <div
            style="
              text-align: right;
              display: flex;
              justify-content: space-between;
            "
          >
            <el-button
              icon="el-icon-minus"
              circle
              :disabled="scale === 10"
              @click="scaleX"
            ></el-button>
            <span>当前比例：{{ scale }}%</span>
            <el-button
              icon="el-icon-plus"
              circle
              :disabled="scale === 200"
              @click="scaleD"
            ></el-button>
          </div>
          <div
            style="
              text-align: center;
              overflow: auto;
              border: 1px solid #eee;
              height: 735px;
            "
          >
            <pdf
              ref="wrapper"
              :src="currentUrl"
              :page="currentPage"
              @num-pages="pageCount = $event"
            >
            </pdf>
          </div>
        </el-col>
        <el-col :span="2" class="grid-content" style="text-align: right">
          <el-button
            icon="el-icon-arrow-right"
            circle
            :disabled="currentPage === pageCount"
            @click="changePdfPage('next')"
          ></el-button>
        </el-col>
      </el-row>

      <!-- <el-image v-else  :src="currentUrl" lazy></el-image> -->
    </el-dialog>
    <el-dialog
      class="customDialogClass"
      title="二级密码验证"
      :show-close="false"
      width="40%"
      :close-on-click-modal="1 == 2"
      append-to-body
      :visible="activeForm == 'srv-auth-login'"
      @close="closeDialog"
    >
      <srvAuthLogin
        :serviceName="service"
        @srv-auth-success="srvAuthSuccess"
      ></srvAuthLogin>
    </el-dialog>
<!-- PC支付-->
    <el-dialog
        class="customDialogClass"
        title="订单支付"
        :visible="activeForm==='pay'"
        @close="closeDialog"
        width="50%"
        append-to-body
        :close-on-click-modal=false
        :destroy-on-close="true"
    >
      <payment-popup :buttonInfo="buttonInfo"  :orders="multipleSelection" @close-dialog="closeDialog" v-if="activeForm ==='pay' && buttonInfo"></payment-popup>
    </el-dialog>
  </div>
</template>

<script>
import simpleFilter from "./simple-filter.vue";
import simpleCard from "./simple-card.vue";
import SimpleAdd from "./simple-add.vue";
import SimpleUpdate from "./simple-update.vue";
import update from "./update.vue";
import ListPopupMixin from "../mixin/list-popup-mixin"; // 弹出列表js
import CustButtonMinx from "../mixin/cust-button-minx"; // 自定义按钮js
import MemListMixin from "../mixin/mem-list-mixin"; // 内存列表js
import FieldRedundantMixin from "../mixin/field-redundant-mixin"; // 字段上下游js
import ListMixin from "../mixin/list-mixin"; // 列表js
import ListCalcMinWidthMixin from "../mixin/list-calc-min-width-mixin"; //保存表格最小列宽

import RawFieldEditor from "../common/raw-field-editor.vue"; // 表单元件
import srvAuthLogin from "../common/srvAuthLogin.vue"; // 服务密码验证
import InlineList from "../common/inline-list.vue"; // 废弃
import ImportDialog from "../ui/import-form.vue"; // 导入ui
import UploadFile from "../ui/upload-file.vue"; // 上传文件
import PopupMemList from "./popup-mem-list"; // 弹出内存列表
import exportLayout from "./export-layout"; // 自定义导出 || 导入
import batchApprove from "../ui/batch-approve.vue"; // 流程审批
// import batchApprove from "../ui/batch-approve.vue";   // 流程审批
import pdf from "vue-pdf";
import CMapReaderFactory from "vue-pdf/src/CMapReaderFactory.js";

import inlineEditListMixin from "../mixin/inline-edit-list-mixin"; //行内编辑列表相关逻辑
import inlineEditList from "./inline-edit-list.vue";
import vueChart from "../ui/widget/chart.vue";
import { blobToBase64 } from "../../common/common";
import {
  IconList,
  IconGrid,
  IconExcel,
  IconExcelColorful,
} from "../../components/icon";
import CardList from "../ui/card-list/card-list.vue";
import { $http } from "@/common/http";
import cloneDeep from "lodash/cloneDeep";
import debounce from "lodash/debounce";
import FileList from "../ui/file-list/file-list.vue";
import paymentPopup from "@/components/common/payment/payment-popup.vue";
export default {
  name: "list",
  components: {
    paymentPopup,
    PopupMemList,
    UploadFile,
    ImportDialog,
    SimpleUpdate,
    SimpleAdd,
    simpleFilter,
    simpleCard,
    RawFieldEditor,
    InlineList,
    exportLayout,
    update: () => import("../common/update.vue"),
    Add: () => import("../common/add.vue"),
    batchApprove,
    srvAuthLogin,
    inlineEditList,
    vueChart,
    IconList,
    IconGrid,
    IconExcel,
    IconExcelColorful,
    CardList,
    FileList,
  },
  props: {
    childForeignkey: Object,
    defaultCondition: Array,
    routeMeta: Object,
  },
  watch: {
    gridDataRun: {
      immediate: true,
      deep: true,
      handler(newValue, oldValue) {
        this.$nextTick(() => {
          this.setTableMaxHeight();
        });
      },
    },
  },
  beforeDestroy() {
    // 清理观察者
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },
  mixins: [
    ListPopupMixin,
    CustButtonMinx,
    MemListMixin,
    FieldRedundantMixin,
    ListMixin,
    inlineEditListMixin,
    ListCalcMinWidthMixin,
  ],
  data() {
    return {
      centerDialogVisible: false, // 是否显示预览
      currentUrl: "",
      currentType: "",
      currentPage: 1,
      pageCount: 0,
      scale: 100, //放大系数
      currentUrlLike: "",
      imagesRun: [],
      listStyle: "list",
      tableMaxHeight: 500,
      resizeObserver: null,
    };
  },
  computed: {
    setDefaultValue() {
      if (this.filterCondition?.length) {
        return this.filterCondition.reduce((res, cur) => {
          if (["eq", "in", "inset"].includes(cur.ruleType)) {
            res[cur.colName] = cur.value;
          }
          return res;
        }, {});
      }
    },
    isDemo() {
      return (
        this.$route?.query?.viewMode === "demo" ||
        sessionStorage.getItem("viewMode") === "demo"
      );
    },
    props4ActivePopupMemList() {
      let fk = this.activePopupMemList.foreign_key;
      return {
        inline_list_select_service:
          this.activePopupMemList.inline_list_select_service,
        foreign_key: fk,
      };
    },
    imagesListRun: function () {
      let self = this;
      let list = this.imagesRun.length > 0 ? this.imagesRun : [];
      list = list.filter((item) => {
        if (item.hasOwnProperty("response")) {
          item = Object.assign(item, item.response);
        }
        if (
          item.file_type === "png" ||
          item.file_type === "jpeg" ||
          item.file_type === "jpg" ||
          item.file_type === "gif" ||
          item.file_type === "JPG"
        ) {
          let fileUrl = item.hasOwnProperty("fileurl")
            ? self.serviceApi().downloadFile + item.fileurl
            : self.serviceApi().downloadFile + item.response.fileurl;
          item.url = fileUrl;
          return {
            title: item.name,
            url: fileUrl,
            type: item.file_type,
          };
        }
      });
      return list;
    },
  },

  methods: {
    setTableMaxHeight() {
      if (this.$refs.elTableParentDiv?.$el) {
        const parentEle = this.$refs.elTableParentDiv?.$el;
        let parentHeight = parentEle.offsetHeight;
        const bodyHeight = parentEle?.querySelector(
          ".el-table__body-wrapper"
        )?.scrollHeight;
        const headerHeight = parentEle?.querySelector(
          ".el-table__header-wrapper"
        )?.offsetHeight;
        const tableHeight = bodyHeight + headerHeight;
        console.log("tableHeight", tableHeight, parentHeight);

        if (tableHeight < parentEle.parentElement.offsetHeight - 50) {
          parentEle.parentElement.style.display = "block";
          this.tableMaxHeight = tableHeight;
        } else {
          parentEle.parentElement.style.display = "flex";
          parentEle.parentElement.style.flexDirection = "column";
          this.tableMaxHeight = parentEle.offsetHeight;
        }
        if (this.tableMaxHeight < 500) {
          this.tableMaxHeight = 500;
        }
      }
    },
    showAddChildBtn(row, index, column, columnIndex) {
      if (column) {
        let firstColumn = this.gridHeader.find((item) =>
          this.getGridHeaderDispExps(item, this.listMainFormDatas)
        );
        if (firstColumn?.column !== column) {
          return false;
        }
      }
      const btn = this.sortedRowButtons?.find(
        (button) =>
          button.button_type === "addchild" &&
          this.getButtonOptSrv(button, row, "isShow") &&
          this.getDispExps(button, row, index) &&
          button.permission
      );
      if (btn) {
        const showBtn = this.isRowButtonVisible(btn, row, index);
        return this.routeMeta?.isTree === true && showBtn && btn;
      }
    },
    getUserTags(column, data) {
      let result = [];
      if (["User", "UserList"].includes(column?.col_type)) {
        if (
          column?._obj_info?.a_save_b_obj_col &&
          data[column?._obj_info?.a_save_b_obj_col]
        ) {
          let str = data[column?._obj_info?.a_save_b_obj_col];
          try {
            let arr = JSON.parse(str);
            if (Array.isArray(arr)) {
              result = arr;
            } else {
              result = [arr];
            }
          } catch (error) {
            console.log(error);
          }
        } else if (
          column?._obj_info?.a_save_b_obj_col &&
          !data[column?._obj_info?.a_save_b_obj_col] &&
          data[column.column]
        ) {
          result = [
            {
              user_disp: data[column.column],
            },
          ];
        }
      }
      console.log("result", result);

      return result;
    },
    onAddChildExecutorComplete(response) {
      // 子节点增加
      let list = response.request.data;
      const noCol = this.listV2Data["no_col"];
      const parentCol = this.listV2Data["parent_no_col"];
      let parentKeyVal = list[0][parentCol];
      let keyVal = list[0][noCol];
      // 处理 如果没有 keyval 的情况
      if (
        !keyVal &&
        response.body.state === "SUCCESS" &&
        response.body.response[0] &&
        response.body.response[0].response.effect_data[0]
      ) {
        list = response.body.response[0].response.effect_data[0];
        keyVal = list[noCol];
        let treeData = cloneDeep(this.gridData);
        const setChildData = (data = []) => {
          if (data?.length) {
            data.forEach((item) => {
              if (item[noCol] === parentKeyVal) {
                item._children = [...item._children, ...list];
              } else if (item._children?.length) {
                setChildData(item._children);
              }
            });
          }
        };
      }
    },
    loadChildData(data, treeNode, resolve) {
      console.log("loadChildData", data, treeNode);
      const no_col = this.listV2Data.no_col;
      const req = {
        serviceName: this.service_name,
        colNames: ["*"],
        condition: [
          { colName: "parent_no", value: data[no_col], ruleType: "eq" },
        ],
        page: { pageNo: 1, rownumber: 300 },
        use_type: "treelist",
      };
      const url = `/${this.resolveDefaultSrvApp()}/select/${this.service_name}`;
      $http.post(url, req).then((res) => {
        const resData = res.data.data.map((item) => {
          item.hasChildren = item.is_leaf !== "是";
          if (item.hasChildren === true) {
            item.children = [];
            item.expanded = false;
          }
          return item;
        });
        resolve(resData);
      });
    },
    setTdStyle(column = {}, row = {}) {
      let sty = "";
      if (column?.colorMap) {
        if (!row[column.column] && column.colorMap?._default) {
          sty = `color:${column.colorMap._default}`;
        } else {
          sty = `color:${
            column.colorMap[row[column.column]] ||
            column.colorMap?._default ||
            ""
          }`;
        }
      }
      if (column?.backgroundMap) {
        if (!row[column.column] && column.backgroundMap?._default) {
          sty += `;background-color:${column.backgroundMap._default}`;
        } else {
          sty += `;background-color:${
            column.backgroundMap[row[column.column]] ||
            column.backgroundMap?._default ||
            ""
          }`;
        }
      }
      if (column?.styleMap) {
        if (!row[column.column] && column.styleMap?._default) {
          sty += `;${column.styleMap._default}`;
        } else {
          sty += `;${
            column.styleMap[row[column.column]] ||
            column.styleMap?._default ||
            ""
          }`;
        }
      }
      return sty;
    },
    changeListStyle(type = "list") {
      console.log(type);
      this.listStyle = type;
    },
    buildDivCond() {
      let divCond = null;
      if (this.divCond?.length) {
        divCond = this.divCond;
      } else if (this.listType === "list") {
        if (
          this.$route.query?.divCol &&
          this.$route.query?.divStartVal &&
          this.$route.query?.divEndVal
        ) {
          divCond = [
            {
              colName: this.$route.query.divCol,
              ruleType: "between",
              value: [
                this.$route.query.divStartVal,
                this.$route.query.divEndVal,
              ],
            },
          ];
        }
      } else if (this.listType === "detaillist") {
        // 详情子表
        if (this.childForeignkey?.more_config?.includes("divCond")) {
          divCond = this.buildCustomBtnDivCond(
            this.childForeignkey,
            null,
            this.listMainFormDatas
          );
        }
      }
      console.log("divCond", divCond);

      return divCond;
    },
    openHtml(val) {
      const h = this.$createElement;
      this.$msgbox({
        title: "详情",
        center: true,
        fullscreen: true,
        customClass: "message-box",
        message: h("p", {
          domProps: {
            innerHTML: val,
          },
          style: {
            width: "100%",
          },
        }),
        showCancelButton: false,
        confirmButtonText: "确定",
      });
    },
    closeDialog() {
      this.activeForm = "";
    },
    srvAuthSuccess(e) {
      console.log(e);
      this.activeForm = "xx";
      this.loadTableData(true);
    },
    wrapCellIntoField(column, value) {
      let info = {
        editable: false,
      };
      return {
        model: value,
        info: info,
      };
    },
    moreFileRun: function () {
      let list = this.fileLists;
      list = list.filter((item) => {
        return item;
      });
      return list;
    },
    onerror(e) {
      // console.log("显示失败",e)
    },
    inited(viewer) {
      this.$viewer = viewer;
    },
    show() {
      this.$viewer.show();
    },
    onPreView(file, index, files) {
      let self = this;
      let fileType = file.hasOwnProperty("file_type")
        ? file.file_type
        : file.response.file_type;
      self.imagesRun = files.map((item) => item);
      if (
        fileType === "jpg" ||
        fileType === "png" ||
        fileType === "gif" ||
        fileType === "JPG"
      ) {
        // const viewer = self.$el.$viewer
        const viewer2 = self.$el.querySelector(".image-" + file.id);
        //  view.setdefaults
        // const viewer2 = self.$el.querySelector('.image-list')
        let imgIndex = 0;

        self.imagesListRun.forEach((item, i) => {
          if (item.id == file.id) {
            imgIndex = i;
          }
        });
        const viewer = self.$refs.viewer.$viewer;
        viewer.index = imgIndex;
        //console.log(viewer,imgIndex,viewer2,self.$refs.viewer)
        viewer.show();
      } else if (
        ["pdf", "jpg", "png", "gif", "JPG", "ppt", "pptx"].includes(fileType)
      ) {
        if ((fileType === "pptx" || fileType === "ppt") && file.fileurl) {
          const previewUrl = `/vpages/ppt/index.html?file=${window.backendIpAddr}/file/forward?targetUrl=${file.fileurl}`;
          this.addTabByUrl(previewUrl, "文件预览");
        } else if (fileType === "pdf") {
          self.handlePreview(file);
        } else {
          this.currentUrl = file.url;

          this.centerDialogVisible = true;
        }
        this.currentUrlLike = file.url;
        this.currentType = fileType;
        // console.log(file)
      } else {
        this.$message({
          message:
            "只支持【pdf】/【jpg】/【png】格式预览，其他格式请点击文件名下载查看",
          type: "warning",
        });
      }
    },
    handlePreview(file) {
      //点击文件时触发
      //console.log('handlePreview',file)

      let fileType = file.file_type;
      if (!file.hasOwnProperty("url")) {
        file.url = file.fileurl;
      }
      if (
        top.location.protocol?.includes("https") &&
        file.url?.indexOf("http") === 0 &&
        file.url?.indexOf("https") !== 0
      ) {
        // file.url = file.url.replace("http://",'https://')
        file.url = `${
          window.backendIpAddr
        }/file/forward?targetUrl=${encodeURIComponent(file.url)}`;
      }
      if (fileType === "ppt" && file.url) {
        const previewUrl = `/vpages/ppt/index.html?file=${window.backendIpAddr}/file/forward?targetUrl=${file.url}`;
        this.addTabByUrl(previewUrl, "文件预览");
      } else if (file.url.toLowerCase().endsWith(".pdf")) {
        let url = file.url;
        if (file.url.indexOf("http") !== 0 && file.fileurl) {
          url = this.serviceApi().downloadFile + file.fileurl;
        }
        let currLocation = window.location.href;
        let hashIndex = currLocation.indexOf("#");
        if (hashIndex > 0) {
          let pdfPreviewUrl =
            currLocation.substring(0, hashIndex) +
            "#/viewpdf?pdfsrc=" +
            encodeURIComponent(url);
          // let pdfPreviewUrl = url
          this.addTabByUrl(pdfPreviewUrl, "文件预览");
          return;
        }
      } else if (
        fileType === "jpg" ||
        fileType === "png" ||
        fileType === "gif" ||
        fileType === "JPG"
      ) {
        let fileData = null;
        if (file.hasOwnProperty("response")) {
          fileData = Object.assign(file, file.response);
        } else {
          fileData = file;
        }
        this.onPreView(fileData);
      } else {
        this.download(file.url, file.name);
      }
    },
    //放大
    scaleD() {
      this.scale += 5;
      // this.$refs.wrapper.$el.style.transform = "scale(" + this.scale + ")";
      this.$refs.wrapper.$el.style.width = parseInt(this.scale) + "%";
    },

    //缩小
    scaleX() {
      if (this.scale == 100) {
        return;
      }
      this.scale += -5;
      this.$refs.wrapper.$el.style.width = parseInt(this.scale) + "%";
      // this.$refs.wrapper.$el.style.transform = "scale(" + this.scale + ")";
    },
    // 改变PDF页码,val传过来区分上一页下一页的值,0上一页,1下一页
    changePdfPage(type) {
      this.currentPage;
      // console.log(val)
      if (type === "next") {
        if (this.currentPage < this.pageCount) {
          this.currentPage++;
          // console.log(this.currentPage)
        }
      } else {
        if (this.currentPage > 1) {
          this.currentPage--;
          // console.log(this.currentPage)
        }
      }
    },
    setImgUrl(url) {
      if (url) {
        if (url.indexOf("http") > -1) {
          return url;
        } else {
          return `${window.backendIpAddr}${url}`;
        }
      } else {
        return "";
      }
    },
  },
};
</script>
<style>
.message-box {
  /* width: max(40vw, 500px) !important; */
  width: 100vw !important;
  height: 100vh;
}

.message-box .el-message-box__content {
  min-height: max(300px, 30vh);
  max-height: 90vh;
  overflow-y: auto !important;
}
</style>
<style lang="scss">
#app {
  > div {
    > .el-row {
      > .isFixed.el-table {
        > .el-table__header-wrapper {
          position: fixed;
          top: 0;
          z-index: 3;
        }

        .el-table__fixed-header-wrapper {
          top: 0;
          position: fixed;
          // padding: 12px 0;
          z-index: 4;
          // overflow: hidden;
          right: 0.5rem;

          > table {
            > thead {
              tr {
                background-color: transparent;

                th {
                  background-color: transparent;
                  opacity: 0;
                  // display: none;
                }

                th:last-child {
                  background-color: #fff;
                  opacity: 1;
                  padding: 12px 0;
                }
              }
            }

            > tbody {
            }
          }
        }
      }
    }
  }

  .el-table td .cell {
    display: block;
    line-height: 23px;
  }

  .el-table__expand-icon > .el-icon {
    position: inherit;
    margin-left: 0;
    margin-top: 0;
    left: 0;
    top: 0;
  }
  .cell.el-tooltip {
  }
  .el-table td.is-right,
  .el-table th.is-right {
    .cell.el-tooltip {
      justify-content: flex-end;
      width: 100% !important;
      .el-progress-bar {
        min-width: 50px;
      }
    }
  }
}

.table-row-badge {
  .el-badge__content.is-fixed {
    position: relative;
    top: 5px;
    right: 5px;
  }
}

.el-table th.gutter {
  display: table-cell !important;
}

.el-table td,
.el-table th {
  padding: 2px !important;

  div.row-icons {
    // max-height: 1rem;
    text-align: center;

    img {
      max-height: auto;
      max-width: 1.6rem;
    }
  }

  .list-image {
    img {
      max-height: 2rem;
      max-width: 2rem;
    }
  }
}

.el-table .cell > div.list-image {
  text-overflow: -o-ellipsis-lastline;
  /* overflow: hidden; */
  /* text-overflow: ellipsis; */
  display: table-cell;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
}

.el-popper[x-placement^="right"] .popper__arrow::after {
  bottom: -6px;
  left: 1px;
  border-right-color: #3c3c3c;
  border-left-width: 0;
}

.table-popover.el-popover {
  background: rgba(64, 64, 64, 0.9411764705882353);
  color: #fff;
}

.list-style-switch {
  border: 1px solid #e7e7e7;
  border-radius: 8px;
  overflow: hidden;
  //margin: 0 14px;

  .svg-icon {
    width: 44px;
    height: 32px;
    padding: 6px 10px;
    cursor: pointer;
  }
}

.link-to-detail {
  &:hover {
    color: #409eff;
    cursor: pointer;
  }
}

.hasBg {
  display: inline-block;
  box-sizing: border-box;
  padding: 2px 5px;
  color: #fff;
  border-radius: 2px;
}
</style>
