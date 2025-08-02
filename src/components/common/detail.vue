<template>
  <div
    style="height: 100%"
    v-if="id && id !== 'xxx'"
  >
    <card-detail
      :pk-col="pkCol"
      :pk="id"
      :v2-data="v2Data"
      :div-cond="buildDivCond"
      :default-conditions="custCondition"
      :page-is-draft="pageIsDraft"
      :is-history="isHistory"
      :main-service="service_name"
      :field-child-keys="fieldChildKeys"
      :children-list-loaded="childrenListLoaded"
      :child-list-run="childListRun"
      :field-child-run="fieldChildRun"
      :srvCols="detail_srv_cols"
      :detail-data="detailData"
      :cells-layout-json="cfgJson.detail_card_json"
      @action-complete="initGridData"
      v-if="isCardDetail && cfgJson && cfgJson.detail_card_json"
    >
    </card-detail>
    <el-card
      class="box-card detail-box-card"
      v-else
      :shadow="isPlatChildForm == true ? 'never' : 'always '"
    >
      <div
        v-if="Array.isArray(detailChartDatas) && detailChartDatas.length > 0"
        class="detail-steps"
      >
        <el-steps align-center>
          <el-step
            :title="step.step_name"
            :status="step.status"
            v-for="(step, index) in detailChartDatas"
            :key="index"
          ></el-step>
        </el-steps>
      </div>
      <template v-if="!hasVisibleChildListTab() && detailshow">
        <template v-if="isPlatChildForm !== true">
          <div
            slot="header"
            class="clearfix"
            v-show="is_view_title"
          >
            <span>{{ tab_view_name }}</span>
          </div>
        </template>

        <div
          class="text item detail-card"
          v-if="initLoad"
        >
          <simple-detail
            :divCond="buildDivCond"
            :mainService="mainService"
            :isHistory="isHistory"
            :childrenLists="child_service"
            :pageIsDraft="pageIsDraft"
            :approvalFormMode="approvalFormMode"
            :form-type="formType"
            ref="simple-detail"
            :service="service"
            :default-conditions="custCondition"
            :srvval-form-model-decorator="srvvalFormModelDecorator"
            :pk-col="pkCol"
            :pk="id"
            :detail-data="detailData"
            @form-loaded="$emit('form-loaded', $event)"
            @action-complete="refreshChildList"
            :isPlatChildForm="isPlatChildForm"
          >
            <div
              slot="field-form-prepend"
              v-if="childrenListLoaded && childListRun.form.prepend.length > 0"
            >
              <el-collapse
                v-model="buildCollapsedRun['form_prepend']"
                v-if="hasVisibleChildListCollapse()"
              >
                <template v-for="(item, index) in childListRun.form.prepend">
                  <el-collapse-item
                    :title="item.foreign_key.section_name"
                    v-show="showChildList(item, detailData) && !isTabsModel(item)
                      "
                    :key="index"
                    :name="'form_prepend_' + index"
                  >
                    <simple-detail
                      :isHistory="isHistory"
                      v-if="item.foreign_key.view_model == 'detail'"
                      form-type="detail"
                      ref="child-simple-detail"
                      :service="item.service_name"
                      :default-condition="getChildListDefaultCondition(item)"
                    ></simple-detail>
                    <child-list
                      :mainService="service_name"
                      v-else
                      :isTree="item.table_type === '树形表'"
                      :isProc="item.table_type === '流程表'"
                      :name="item.service_name"
                      :childListConfig="item"
                      @detailOnLoaded="refreshDetail"
                      :pageIsDraft="pageIsDraft"
                      :list-type="formType == 'procdetail'
                        ? 'procdetaillist'
                        : 'detaillist'
                        "
                      :key="index"
                      ref="childrenList"
                      :$srv-app="item.srv_app"
                      :service="item.service_name"
                      :foreign-key="item.foreign_key"
                      :read-only="childListReadonly ||
                        item.foreign_key.child_table_readonly == '是'
                        "
                      :default-condition="getChildListDefaultCondition(item)"
                      :search-form="searchForm"
                      :is-tree="!!item.parent_no_col"
                      :mainFormDatas="detailData"
                      :inplace-edit="true"
                      @list-loaded="$emit('list-loaded', $event)"
                      @update-form-loaded="$emit('update-form-loaded', $event)"
                      @add-form-loaded="$emit('add-form-loaded', $event)"
                      @suffix-actions-complete="suffixActionsComplete"
                      @form-action-complete="formActionComplete"
                    >
                    </child-list>
                  </el-collapse-item>
                </template>
              </el-collapse>
            </div>
            <div
              slot="field-form-append"
              v-if="childrenListLoaded && childListRun.form.append.length > 0"
            >
              <el-collapse
                v-model="buildCollapsedRun['form_append']"
                v-if="hasVisibleChildListCollapse()"
              >
                <template v-for="(item, index) in childListRun.form.append">
                  <el-collapse-item
                    :title="item.foreign_key.section_name"
                    v-show="showChildList(item, detailData) && !isTabsModel(item)
                      "
                    :key="index"
                    :name="'form_append_' + index"
                  >
                    <simple-detail
                      :divCond="buildDivCond"
                      :isHistory="isHistory"
                      :pageIsDraft="pageIsDraft"
                      v-if="item.foreign_key.view_model == 'detail'"
                      form-type="detail"
                      ref="child-simple-detail"
                      :service="item.service_name"
                      :default-condition="getChildListDefaultCondition(item)"
                    ></simple-detail>
                    <child-list
                      :mainService="service_name"
                      v-else
                      :isTree="item.table_type === '树形表'"
                      :isProc="item.table_type === '流程表'"
                      :name="item.service_name"
                      :pageIsDraft="pageIsDraft"
                      :childListConfig="item"
                      @detailOnLoaded="refreshDetail"
                      :list-type="formType == 'procdetail'
                        ? 'procdetaillist'
                        : 'detaillist'
                        "
                      :key="index"
                      ref="childrenList"
                      :$srv-app="item.srv_app"
                      :service="item.service_name"
                      :foreign-key="item.foreign_key"
                      :read-only="childListReadonly ||
                        item.foreign_key.child_table_readonly == '是'
                        "
                      :default-condition="getChildListDefaultCondition(item)"
                      :search-form="searchForm"
                      :is-tree="!!item.parent_no_col"
                      :mainFormDatas="detailData"
                      :inplace-edit="true"
                      @list-loaded="$emit('list-loaded', $event)"
                      @update-form-loaded="$emit('update-form-loaded', $event)"
                      @add-form-loaded="$emit('add-form-loaded', $event)"
                      @suffix-actions-complete="suffixActionsComplete"
                      @form-action-complete="formActionComplete"
                    >
                    </child-list>
                  </el-collapse-item>
                </template>
              </el-collapse>
            </div>
            <div
              :slot="col + '-child-prepend'"
              class="text item field-child-prepend-list"
              v-for="(col, colIndex) in fieldChildKeys"
              :key="colIndex"
              v-if="childrenListLoaded && fieldChildKeys.length > 0"
            >
              <el-collapse
                v-model="buildCollapsedRun[col + '_prepend']"
                v-if="hasVisibleChildListCollapse()"
              >
                <template v-for="(item, index) in fieldChildRun[col].prepend">
                  <el-collapse-item
                    :title="item.foreign_key.section_name"
                    v-show="showChildList(item, detailData) && !isTabsModel(item)
                      "
                    :key="index"
                    :name="col + '_prepend_' + index"
                  >
                    <!-- <simple-detail v-if="item.foreign_key.view_model=='detail'" form-type="detail" ref="child-simple-detail" :service="item.service_name" :default-condition="getChildListDefaultCondition(item)"></simple-detail> -->
                    <child-list
                      :mainService="service_name"
                      :isTree="item.table_type === '树形表'"
                      :isProc="item.table_type === '流程表'"
                      :list-type="formType == 'procdetail'
                        ? 'procdetaillist'
                        : 'detaillist'
                        "
                      :childListConfig="item"
                      @detailOnLoaded="refreshDetail"
                      :pageIsDraft="pageIsDraft"
                      :key="index"
                      ref="childrenList"
                      :$srv-app="item.srv_app"
                      :service="item.service_name"
                      :foreign-key="item.foreign_key"
                      :read-only="childListReadonly ||
                        item.foreign_key.child_table_readonly == '是'
                        "
                      :default-condition="getChildListDefaultCondition(item)"
                      :search-form="searchForm"
                      :is-tree="!!item.parent_no_col"
                      :mainFormDatas="detailData"
                      :inplace-edit="true"
                      @list-loaded="$emit('list-loaded', $event)"
                      @update-form-loaded="$emit('update-form-loaded', $event)"
                      @add-form-loaded="$emit('add-form-loaded', $event)"
                      @suffix-actions-complete="suffixActionsComplete"
                      @form-action-complete="formActionComplete"
                    >
                    </child-list>
                  </el-collapse-item>
                </template>
              </el-collapse>
            </div>
            <div
              :slot="col + '-child-append'"
              class="text item field-child-append-list"
              v-for="(col, colIndex) in fieldChildKeys"
              :key="colIndex"
              v-if="childrenListLoaded && fieldChildKeys.length > 0"
            >
              <el-collapse
                v-model="buildCollapsedRun[col + '_append']"
                v-if="hasVisibleChildListCollapse()"
              >
                <template v-for="(item, index) in fieldChildRun[col].append">
                  <el-collapse-item
                    :title="item.foreign_key.section_name"
                    v-show="showChildList(item, detailData) && !isTabsModel(item)
                      "
                    :key="index"
                    :name="col + '_append_' + index"
                  >
                    <!-- <simple-detail v-if="item.foreign_key.view_model=='detail'" form-type="detail" ref="child-simple-detail" :service="item.service_name" :default-condition="getChildListDefaultCondition(item)"></simple-detail> -->
                    <child-list
                      :mainService="service_name"
                      :isTree="item.table_type === '树形表'"
                      :isProc="item.table_type === '流程表'"
                      :list-type="formType == 'procdetail'
                        ? 'procdetaillist'
                        : 'detaillist'
                        "
                      :childListConfig="item"
                      @detailOnLoaded="refreshDetail"
                      :pageIsDraft="pageIsDraft"
                      :key="index"
                      ref="childrenList"
                      :$srv-app="item.srv_app"
                      :service="item.service_name"
                      :foreign-key="item.foreign_key"
                      :read-only="childListReadonly ||
                        item.foreign_key.child_table_readonly == '是'
                        "
                      :default-condition="getChildListDefaultCondition(item)"
                      :search-form="searchForm"
                      :is-tree="!!item.parent_no_col"
                      :mainFormDatas="detailData"
                      :inplace-edit="true"
                      @list-loaded="$emit('list-loaded', $event)"
                      @update-form-loaded="$emit('update-form-loaded', $event)"
                      @add-form-loaded="$emit('add-form-loaded', $event)"
                      @suffix-actions-complete="suffixActionsComplete"
                      @form-action-complete="formActionComplete"
                    >
                    </child-list>
                  </el-collapse-item>
                </template>
              </el-collapse>
            </div>
          </simple-detail>
        </div>
      </template>

      <el-tabs
        v-if="hasVisibleChildListTab()"
        style="height: 100%"
      >
        <el-tab-pane :label="tab_view_name">
          <!-- <simple-detail :isHistory="isHistory" :pageIsDraft="pageIsDraft" :form-type="formType" ref="simple-detail" :service="service" :default-conditions="custCondition" :srvval-form-model-decorator="srvvalFormModelDecorator" pk-col="id" :pk="id" @form-loaded="$emit('form-loaded', $event)">
                </simple-detail> -->
          <simple-detail
            style="height: calc(100% - 50px); overflow: auto"
            :divCond="buildDivCond"
            :mainService="mainService"
            :isHistory="isHistory"
            :childrenLists="child_service"
            :pageIsDraft="pageIsDraft"
            :approvalFormMode="approvalFormMode"
            :form-type="formType"
            ref="simple-detail"
            :service="service"
            :default-conditions="custCondition"
            :srvval-form-model-decorator="srvvalFormModelDecorator"
            :pk-col="pkCol"
            :pk="id"
            @form-loaded="$emit('form-loaded', $event)"
            :isPlatChildForm="isPlatChildForm"
          >
            <div
              slot="field-form-prepend"
              v-if="childrenListLoaded && childListRun.form.prepend.length > 0"
            >
              <el-collapse
                v-model="buildCollapsedRun['form_prepend']"
                v-if="hasVisibleChildListCollapse()"
              >
                <template v-for="(item, index) in childListRun.form.prepend">
                  <el-collapse-item
                    :title="item.foreign_key.section_name"
                    v-show="showChildList(item, detailData) && !isTabsModel(item)
                      "
                    :key="index"
                    :name="'form_prepend_' + index"
                  >
                    <simple-detail
                      :divCond="buildDivCond"
                      :isHistory="isHistory"
                      v-if="item.foreign_key.view_model == 'detail'"
                      form-type="detail"
                      ref="child-simple-detail"
                      :service="item.service_name"
                      :default-condition="getChildListDefaultCondition(item)"
                    ></simple-detail>
                    <child-list
                      :divCond="buildDivCond"
                      :mainService="service_name"
                      v-else
                      :isTree="item.table_type === '树形表'"
                      :isProc="item.table_type === '流程表'"
                      :name="item.service_name"
                      :childListConfig="item"
                      @detailOnLoaded="refreshDetail"
                      :pageIsDraft="pageIsDraft"
                      :list-type="formType == 'procdetail'
                        ? 'procdetaillist'
                        : 'detaillist'
                        "
                      :key="index"
                      ref="childrenList"
                      :$srv-app="item.srv_app"
                      :service="item.service_name"
                      :foreign-key="item.foreign_key"
                      :read-only="childListReadonly ||
                        item.foreign_key.child_table_readonly == '是'
                        "
                      :default-condition="getChildListDefaultCondition(item)"
                      :search-form="searchForm"
                      :is-tree="!!item.parent_no_col"
                      :mainFormDatas="detailData"
                      :inplace-edit="true"
                      @list-loaded="$emit('list-loaded', $event)"
                      @update-form-loaded="$emit('update-form-loaded', $event)"
                      @add-form-loaded="$emit('add-form-loaded', $event)"
                      @suffix-actions-complete="suffixActionsComplete"
                      @form-action-complete="formActionComplete"
                    >
                    </child-list>
                  </el-collapse-item>
                </template>
              </el-collapse>
            </div>
            <div
              slot="field-form-append"
              v-if="childrenListLoaded && childListRun.form.append.length > 0"
            >
              <el-collapse
                v-model="buildCollapsedRun['form_append']"
                v-if="hasVisibleChildListCollapse()"
              >
                <template v-for="(item, index) in childListRun.form.append">
                  <el-collapse-item
                    :title="item.foreign_key.section_name"
                    v-show="showChildList(item, detailData) && !isTabsModel(item)
                      "
                    :key="index"
                    :name="'form_append_' + index"
                  >
                    <simple-detail
                      :divCond="buildDivCond"
                      :isHistory="isHistory"
                      :pageIsDraft="pageIsDraft"
                      v-if="item.foreign_key.view_model == 'detail'"
                      form-type="detail"
                      ref="child-simple-detail"
                      :service="item.service_name"
                      :default-condition="getChildListDefaultCondition(item)"
                    ></simple-detail>
                    <child-list
                      :divCond="buildDivCond"
                      :mainService="service_name"
                      v-else
                      :isTree="item.table_type === '树形表'"
                      :isProc="item.table_type === '流程表'"
                      :name="item.service_name"
                      :pageIsDraft="pageIsDraft"
                      :childListConfig="item"
                      @detailOnLoaded="refreshDetail"
                      :list-type="formType == 'procdetail'
                        ? 'procdetaillist'
                        : 'detaillist'
                        "
                      :key="index"
                      ref="childrenList"
                      :$srv-app="item.srv_app"
                      :service="item.service_name"
                      :foreign-key="item.foreign_key"
                      :read-only="childListReadonly ||
                        item.foreign_key.child_table_readonly == '是'
                        "
                      :default-condition="getChildListDefaultCondition(item)"
                      :search-form="searchForm"
                      :is-tree="!!item.parent_no_col"
                      :mainFormDatas="detailData"
                      :inplace-edit="true"
                      @list-loaded="$emit('list-loaded', $event)"
                      @update-form-loaded="$emit('update-form-loaded', $event)"
                      @add-form-loaded="$emit('add-form-loaded', $event)"
                      @suffix-actions-complete="suffixActionsComplete"
                      @form-action-complete="formActionComplete"
                    >
                    </child-list>
                  </el-collapse-item>
                </template>
              </el-collapse>
            </div>
            <div
              :slot="col + '-child-prepend'"
              class="text item"
              v-for="(col, colIndex) in fieldChildKeys"
              :key="colIndex"
              v-if="childrenListLoaded && fieldChildKeys.length > 0"
            >
              <el-collapse
                v-model="buildCollapsedRun[col + '_prepend']"
                v-if="hasVisibleChildListCollapse()"
              >
                <template v-for="(item, index) in fieldChildRun[col].prepend">
                  <el-collapse-item
                    :title="item.foreign_key.section_name"
                    v-show="showChildList(item, detailData) && !isTabsModel(item)
                      "
                    :key="index"
                    :name="col + '_prepend_' + index"
                  >
                    <!-- <simple-detail v-if="item.foreign_key.view_model=='detail'" form-type="detail" ref="child-simple-detail" :service="item.service_name" :default-condition="getChildListDefaultCondition(item)"></simple-detail> -->
                    <child-list
                      :divCond="buildDivCond"
                      :mainService="service_name"
                      :isTree="item.table_type === '树形表'"
                      :isProc="item.table_type === '流程表'"
                      :list-type="formType == 'procdetail'
                        ? 'procdetaillist'
                        : 'detaillist'
                        "
                      :childListConfig="item"
                      @detailOnLoaded="refreshDetail"
                      :pageIsDraft="pageIsDraft"
                      :key="index"
                      ref="childrenList"
                      :$srv-app="item.srv_app"
                      :service="item.service_name"
                      :foreign-key="item.foreign_key"
                      :read-only="childListReadonly ||
                        item.foreign_key.child_table_readonly == '是'
                        "
                      :default-condition="getChildListDefaultCondition(item)"
                      :search-form="searchForm"
                      :is-tree="!!item.parent_no_col"
                      :mainFormDatas="detailData"
                      :inplace-edit="true"
                      @list-loaded="$emit('list-loaded', $event)"
                      @update-form-loaded="$emit('update-form-loaded', $event)"
                      @add-form-loaded="$emit('add-form-loaded', $event)"
                      @suffix-actions-complete="suffixActionsComplete"
                      @form-action-complete="formActionComplete"
                    >
                    </child-list>
                  </el-collapse-item>
                </template>
              </el-collapse>
            </div>
            <div
              :slot="col + '-child-append'"
              class="text item"
              v-for="(col, colIndex) in fieldChildKeys"
              :key="colIndex"
              v-if="childrenListLoaded && fieldChildKeys.length > 0"
            >
              <el-collapse
                v-model="buildCollapsedRun[col + '_append']"
                v-if="hasVisibleChildListCollapse()"
              >
                <template v-for="(item, index) in fieldChildRun[col].append">
                  <el-collapse-item
                    :title="item.foreign_key.section_name"
                    v-show="showChildList(item, detailData) && !isTabsModel(item)
                      "
                    :key="index"
                    :name="col + '_append_' + index"
                  >
                    <!-- <simple-detail v-if="item.foreign_key.view_model=='detail'" form-type="detail" ref="child-simple-detail" :service="item.service_name" :default-condition="getChildListDefaultCondition(item)"></simple-detail> -->
                    <child-list
                      :divCond="buildDivCond"
                      :mainService="service_name"
                      :isTree="item.table_type === '树形表'"
                      :isProc="item.table_type === '流程表'"
                      :list-type="formType == 'procdetail'
                        ? 'procdetaillist'
                        : 'detaillist'
                        "
                      :childListConfig="item"
                      @detailOnLoaded="refreshDetail"
                      :pageIsDraft="pageIsDraft"
                      :key="index"
                      ref="childrenList"
                      :$srv-app="item.srv_app"
                      :service="item.service_name"
                      :foreign-key="item.foreign_key"
                      :read-only="childListReadonly ||
                        item.foreign_key.child_table_readonly == '是'
                        "
                      :default-condition="getChildListDefaultCondition(item)"
                      :search-form="searchForm"
                      :is-tree="!!item.parent_no_col"
                      :mainFormDatas="detailData"
                      :inplace-edit="true"
                      @list-loaded="$emit('list-loaded', $event)"
                      @update-form-loaded="$emit('update-form-loaded', $event)"
                      @add-form-loaded="$emit('add-form-loaded', $event)"
                      @suffix-actions-complete="suffixActionsComplete"
                      @form-action-complete="formActionComplete"
                    >
                    </child-list>
                  </el-collapse-item>
                </template>
              </el-collapse>
            </div>
          </simple-detail>
        </el-tab-pane>

        <template v-for="(item, index) in childTabShowList">
          <el-tab-pane
            :lazy="1 == 1"
            :label="item.foreign_key.section_name"
            v-if="
              showChildList(item, detailData) && isTabsModel(item) && item.show
            "
            :key="index"
          >
            <simple-detail
              style="height: calc(100% - 50px); overflow: auto"
              :divCond="buildDivCond"
              :isHistory="isHistory"
              :pageIsDraft="pageIsDraft"
              v-if="item.foreign_key.view_model == 'detail'"
              @form-load-nodata="noDataHand(item)"
              form-type="detail"
              ref="child-simple-detail"
              :service="item.service_name"
              :default-conditions="getChildListDefaultCondition(item)"
              :isPlatChildForm="isPlatChildForm"
            ></simple-detail>

            <child-list
              style="height: calc(100% - 50px); overflow: auto"
              :divCond="buildDivCond"
              :mainService="service_name"
              v-else
              :isTree="item.table_type === '树形表'"
              :isProc="item.table_type === '流程表'"
              :list-type="formType == 'procdetail' ? 'procdetaillist' : 'detaillist'
                "
              :childListConfig="item"
              :pageIsDraft="pageIsDraft"
              :key="index"
              :name="item.service_name"
              ref="childrenList"
              :$srv-app="item.srv_app"
              :service="item.service_name"
              :foreign-key="item.foreign_key"
              :read-only="item.foreign_key.child_table_readonly == '是'"
              :default-condition="getChildListDefaultCondition(item)"
              :search-form="searchForm"
              :mainFormDatas="detailData"
              :is-tree="!!item.parent_no_col"
              :inplace-edit="true"
              @list-loaded="$emit('list-loaded', $event)"
              @update-form-loaded="$emit('update-form-loaded', $event)"
              @add-form-loaded="$emit('add-form-loaded', $event)"
              @suffix-actions-complete="suffixActionsComplete"
              @form-action-complete="formActionComplete"
            >
            </child-list>
          </el-tab-pane>
        </template>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import ChildList from "./child-list.vue";
import SimpleDetail from "./simple-detail.vue";
import ParentChildMixin from "../mixin/parent-child-mixin";
import cardDetail from "../ui/card-detail/card-detail.vue";

/**
 * 带子表的详情页面
 */
export default {
  name: "detail",
  components: {
    ChildList,
    SimpleDetail,
    cardDetail,
  },
  mixins: [ParentChildMixin],
  props: {
    service: {
      type: String,
    },
    formType: {
      type: String,
      default: function () {
        return "detail";
      },
    },
    is_view_title: {
      type: Boolean,
      default: function () {
        return true;
      },
    },
    pkid: {
      type: String,
    },

    defaultConditions: {
      type: Array,
    },

    childListReadonly: {
      type: Boolean,
      default: false,
    },
    detailshow: {
      type: Boolean,
      default: true,
    },
    mainService: {
      type: String,
      default: "",
    },
    //  child_service:{
    //   type:Array,
    // },
  },
  watch: {
    pkid: {
      immediate: true,
      handler(val) {
        if (val) {
          this.id = val;
          this.$refs?.["simple-detail"]?.initDetail().then((event) => {
            console.log(event);
            this.$nextTick(() => {
              if (event?.data?.length) {
                this.detailData = event.data[0];
                this.mainFormDatas = event.data[0];
                if (this.$refs?.["childrenList"]?.length) {
                  this.$refs.childrenList.forEach((vm) => {
                    vm?.$refs?.list?.initGridData?.() ||
                      vm?.getInnerList?.()?.initGridData?.();
                  });
                }
              }
            });
          });
        }
      },
    },
  },
  computed: {
    isCardDetail() {
      // 展示为卡片详情
      return this.$route?.name?.indexOf("cardDetail") === 0;
    },
    cfgJson() {
      if (this.v2Data?.cfg_json) {
        try {
          return JSON.parse(this.v2Data.cfg_json);
        } catch (e) {
          console.error(e);
        }
      }
    },
    pageIsDraft: function () {
      if (
        this.$route.query.hasOwnProperty("isdraft") &&
        this.$route.query.isdraft === "true"
      ) {
        return "draft";
      } else {
        return "norm";
      }
    },
    // url传过来的分表参数
    buildDivCond() {
      if (
        this.$route.query?.divCol &&
        this.$route.query?.divStartVal &&
        this.$route.query?.divEndVal
      ) {
        return [
          {
            colName: this.$route.query.divCol,
            ruleType: "between",
            value: [this.$route.query.divStartVal, this.$route.query.divEndVal],
          },
        ];
      } else if (this.$route.query.divCond) {
        return JSON.parse(this.$route.query.divCond);
      }
    },
    getChildListDefaultCondition() {
      return (child) => this._getChildListDefaultCondition(child);
    },
  },
  data() {
    return {
      activeName: 1,
      id: this.pkid || this.isPlatChildForm ? null : this.$route.params.id,
      condcol: this.$route.params.condcol,
      condvalue: this.$route.params.condvalue,
      service_name: this.service || this.$route.params.service_name,
      detailData: {},
      custService: "",
      custCondition: [],
      detail_srv_cols: [],
      child_service: [],
      tab_view_name: "",
      searchForm: false,
      initLoad: false,
      mainFormDatas: null,
      isHistory: false,
      srvAuthLogin: false,
      detailChartDatas: [],
      pkCol: "id",
      v2Data: null,
    };
  },
  methods: {
    formActionComplete(action){
      console.log('formActionComplete:', action);
      
    },
    suffixActionsComplete(event) {
      console.log('suffixActionsComplete:', event);
      if (event?.actionInfo?.button_type == "customize") {
        // 子表静默操作完成，刷新主表数据
        this.$refs["simple-detail"]?.initDetail?.();
      }
    },
    refreshChildList() {
      // 详情弹窗提交 更新子表数据
      if (this.$refs?.["childrenList"]?.length) {
        this.$refs.childrenList.forEach((vm) => {
          vm?.getInnerList?.()?.initGridData?.();
        });
      }
    },
    _getChildListDefaultCondition(child) {
      const detailData = this.mainFormDatas;
      let foreign_key = child.foreign_key;
      let defaultCondition = [];
      if (child.srv_cols) {
        // intra-app fk
        let referenced_column_name = foreign_key.referenced_column_name;
        defaultCondition = [
          {
            colName: foreign_key.column_name,
            ruleType: "eq",
            value: detailData[referenced_column_name],
          },
        ];
      } else {
        // inter-app fk
        let referenced_column_name = foreign_key.refed_service_column;
        defaultCondition = [
          {
            colName: foreign_key.ref_service_column,
            ruleType: "eq",
            value: detailData[referenced_column_name],
          },
        ];
      }
      return defaultCondition;
    },
    hasVisibleChildListTab() {
      return (
        this.child_service &&
        !this.hideChildrenLists &&
        this.child_service.filter(
          (child) =>
            this.showChildList(child, this.detailData) &&
            this.isTabsModel(child)
        ).length > 0
      );
    },
    hasVisibleChildListCollapse() {
      return (
        this.child_service &&
        !this.hideChildrenLists &&
        this.child_service.filter(
          (child) =>
            this.showChildList(child, this.detailData) &&
            !this.isTabsModel(child)
        ).length > 0
      );
    },

    noDataHand(item) {
      item.show = false;
    },

    /**
     * DO NOT REMOVE THIS !!! ref name is diff
     * @returns {*}
     */
    srvValFormModel() {
      let basicForm = this.$refs["simple-detail"];
      return basicForm ? basicForm.srvValFormModel() : null;
    },
    async refreshDetail() {
      // console.log('refreshDetail')
      var condition = [];
      var me = this;
      if (this.custService != "") {
        this.service_name = this.custService;
        condition = this.custCondition;
      } else {
        if (this.id != undefined) {
          condition = [{ colName: "id", value: this.id, ruleType: "eq" }];
        }
        if (this.condcol != undefined && this.condvalue != undefined) {
          condition = [
            { colName: this.condcol, value: this.condvalue, ruleType: "eq" },
          ];
        }

        if (this.custCondition.length > 0) {
          condition = condition.concat(this.custCondition);
        }
      }

      let detailData = null;
      let srvAuthKey = `bx_srv_auth_ticket-${this.resolveDefaultSrvApp()}-${this.service_name
        }`;
      console.log(
        "srvAuthKey",
        srvAuthKey,
        this.$route.query.hasOwnProperty(srvAuthKey)
      );
      await this.selectOne(
        this.service_name,
        condition,
        this.$route.query.isdraft,
        this.srvAuthLogin,
        null,
        null,
        this.buildDivCond || this.$route.query.divCond
      ).then((response) => {
        detailData = response.body;
        this.detailData = response.body;
        this.mainFormDatas = response.body;
      });
    },
    async initGridData() {
      var condition = [];
      var me = this;
      if (this.custService != "") {
        this.service_name = this.custService;
        condition = this.custCondition;
      } else {
        if (this.id != undefined) {
          condition = [{ colName: "id", value: this.id, ruleType: "eq" }];
        }

        if (this.condcol != undefined && this.condvalue != undefined) {
          condition = [
            { colName: this.condcol, value: this.condvalue, ruleType: "eq" },
          ];
        }
        if (this.custCondition.length > 0) {
          condition = condition.concat(this.custCondition);
        }
      }
      let childList = [];
      const response = await this.loadColsV2(
        this.service_name,
        "detail",
        null,
        this.service_name
      );
      this.detail_srv_cols = response.body.data["srv_cols"];
      childList = response.body.data["child_service"];
      var temp = response.body.data["service_view_name"];
      let v2Data = response.body.data;
      this.v2Data = v2Data;
      if (v2Data.hasOwnProperty("his_version")) {
        this.isHistory = v2Data.his_version;
      }
      if (v2Data?.pub_field_map?.id) {
        this.pkCol = v2Data.pub_field_map?.id;
        if (condition?.length) {
          condition.forEach((item) => {
            if (item.colName == "id") {
              // id 字段映射
              item.colName = v2Data.pub_field_map.id;
            }
          });
        }
      }
      if (
        response.body.data["cfg_json"] &&
        response.body.data["cfg_json"].indexOf("page_title") > -1
      ) {
        // 使用配置的标题
        const cfg_json = JSON.parse(response.body.data.cfg_json);
        if (cfg_json?.page_title) {
          this.tab_view_name = cfg_json?.page_title;
        }
      } else if (temp.endsWith("查询")) {
        this.tab_view_name = temp.substr(0, temp.length - 2) + "详情";
      } else {
        this.tab_view_name = response.body.data["service_view_name"] + "详情";
      }
      let detailData = null;
      let srvAuthKey = `bx_srv_auth_ticket-${this.resolveDefaultSrvApp()}-${this.service_name
        }`;
      console.log(
        "srvAuthKey",
        srvAuthKey,
        this.$route.query.hasOwnProperty(srvAuthKey)
      );
      const dataResp = await this.selectOne(
        this.service_name,
        condition,
        this.$route.query.isdraft,
        this.isHistory,
        srvAuthKey && this.$route.query.hasOwnProperty(srvAuthKey)
          ? true
          : false,
        "detail_page",
        this.buildDivCond || this.$route.query.divCond
      );
      // console.log('srvAuthKey',srvAuthKey,response.body)
      if (dataResp.body.resultCode == "0111") {
        console.error("this.service_name", dataResp.body);
        console.log("dataResp.body", dataResp.body);
        this.srvAuthLogin = true;
        this.$message({
          message: dataResp.data.resultMessage,
          type: "error",
        });
      } else {
        console.error("this.service_name2", dataResp.body, dataResp.response);
        detailData = dataResp.body;
        this.detailData = dataResp.body;
        this.mainFormDatas = dataResp.body;
        this.id = this.detailData[this.pkCol];
        if (
          dataResp?.response?.hasOwnProperty("chart_data") &&
          Array.isArray(dataResp.response.chart_data)
        ) {
          this.detailChartDatas = dataResp.response.chart_data.map((item) => {
            item["status"] =
              item["state"] == "1"
                ? "success"
                : item["state"] == "0"
                  ? "process"
                  : "wait"; //success
            return item;
          });
          console.log("response.body222", dataResp);
        }
      }
      for (var item of childList) {
        item.show = true;
        let foreign_key = item.foreign_key;
        if (item.srv_cols) {
          // intra-app fk
          let referenced_column_name = foreign_key.referenced_column_name;
          item.defaultCondition = [
            {
              colName: foreign_key.column_name,
              ruleType: "eq",
              value: detailData[referenced_column_name],
            },
          ];
        } else {
          // inter-app fk
          let referenced_column_name = foreign_key.refed_service_column;
          item.defaultCondition = [
            {
              colName: foreign_key.ref_service_column,
              ruleType: "eq",
              value: detailData[referenced_column_name],
            },
          ];
        }

        this.child_service.push(item);
      }
    },

    isTabsModel(item) {
      if ("tabs" == item.foreign_key.show_ui_model) {
        return true;
      } else {
        return false;
      }
    },
  },
  created: function () {
    var operate_params = this.getOperateParams();
    if (operate_params) {
      var operate_Object = JSON.parse(operate_params);
      this.custService = operate_Object["serviceName"];
      if (operate_Object["condition"]) {
        this.custCondition = operate_Object["condition"];
      }
    }

    if (this.condcol != undefined && this.condvalue != undefined) {
      this.custCondition = this.custCondition.concat([
        { colName: this.condcol, value: this.condvalue, ruleType: "eq" },
      ]);
    }

    if (this.defaultConditions != undefined) {
      this.custCondition = this.custCondition.concat(this.defaultConditions);
    }

    this.initLoad = true;

    this.emitEvent("initLoad", this);

    this.initGridData();
  },
};
</script>
<style lang="scss">
.detail-steps {
  .el-step__head.is-process {
    color: #e96a02;
    border-color: #e96a02;
  }

  .el-step__title.is-process {
    color: #e96a02;
  }
}

.field-child-prepend-list,
.field-child-append-list {
  width: 100%;
  //padding: 10px 0;
  overflow: hidden;
  margin-bottom: 10px;
}

.el-collapse-item:first-child {
  margin-bottom: unset !important;
}

.box-card {
  height: 100%;

  &.detail-box-card {
    display: flex;
    flex-direction: column;

    .el-card__body {
      flex: 1;

      .detail-card {
        height: calc(100% - 60px);
        overflow: auto;
      }
    }
  }

  .el-tabs__content {
    height: 100%;

    .el-tab-pane {
      height: 100%;
    }
  }

  .text.item {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
}
</style>