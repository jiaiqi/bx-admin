import {FieldInfo} from '../model/FieldInfo'
import {Field} from '../model/Field'
import Vue from 'vue'


export default {
  props: {
    mode: {
      type: String
    },
  },

  data() {
    return {
      activeForm: null,
      clickedRow: {},
    }
  },

  computed: {
    getAddService: function () {
      let addButton = this.gridButton.filter(item => item.button_type === "add");
      if (addButton && addButton.length > 0) {
        return addButton[0].service_name
      } else {
        return this.mainTable && (this.mainTable.replace("bx", "srv") + "_add")
      }
    },
    getImportService(){
      let button = this.gridButton.find(item => item.button_type === "import");
      if (button && button.service_name) {
        return button.service_name
      } else {
        return this.mainTable && (this.mainTable.replace("bx", "srv") + "_add")
      }
    },

    getUpdateService: function(){
      let srv = ""
      if(this.rowButtonActiveServiceName){
        srv = this.rowButtonActiveServiceName
      }else {
        srv = this.mainTable && (this.mainTable.replace("bx", "srv") + "_update")
      }
      return srv
    },

    getDefaultCondition4Duplicate: function () {
      let list = this;
      const colName =  this.pub_field_map?.id || "id"
      let condition = {
        colName,
        ruleType: "eq",
        valueFunc: _ => list.clickedRow["duplicate"][colName],
      }

      return [condition];
    },

    getDefaultCondition4DuplicateDeep: function () {
      let list = this;
      const colName =  this.pub_field_map?.id || "id"
      let condition = {
        colName,
        ruleType: "eq",
        valueFunc: _ => list.clickedRow["duplicatedeep"][colName],
      }

      return [condition];
    },
    getCustomPkCol(){
      return this.pub_field_map?.id || null
    },
  },
  methods: {
    onFilterFormLoaded: function (form) {
     

      this.$emit('filter-form-loaded', form);
    },

    onAddFormLoaded: function (form) {
      
      if (form.actions.submit) {
        form.actions.submit.nav2Location = null;
      }
      if(this.childForeignkey?.referenced_column_name && form.fields[this.childForeignkey.referenced_column_name]){
        const column_name = this.childForeignkey.column_name
        form.fields[this.childForeignkey.referenced_column_name].model = this.listMainFormDatas[column_name];
      }
      this.$emit('add-form-loaded', this.$refs['add-form']);
    },

    onUpdateFormLoaded: function (form) {
      
      if (form.actions.submit) {
        form.actions.submit.nav2Location = null;
      }

      this.$emit('update-form-loaded', this.$refs['update-form']);
    },


    onAddChildFormLoaded() {
      let form = this.$refs['add-child-form'];
      form.actions.submit.nav2Location = null;

      let row = this.clickedRow["add-child"];
      if (row) {
        const parentCol = this.parentCol || this.listV2Data?.["parent_no_col"];
        const noCol = this.noCol || this.listV2Data["no_col"];
        let parentNoField = form.fields[parentCol];
        parentNoField.setSrvVal(row[noCol]);
      }

      // this.$emit('add-child-form-loaded', this.$refs['add-child-form']);
      this.$emit('add-form-loaded', this.$refs['add-child-form']);
    },

    onDuplicateFormLoaded(form) {
      form.actions.submit.nav2Location = null;

      // mask special fields like password:
      Object.values(form.fields).filter( field => field.info.type === "Password").forEach(field => field.setSrvVal(null))

      this.$emit('duplicate-form-loaded', form);
    },

    onAddFormActionComplete(action) {
      console.log('onAddFormActionComplete', action);
      
      if (action == 'submit' || action == 'save_draft') {
        this.activeForm = null;
      }

      if (!this.isMem()) {
        this.loadTableData();
      }
    },

    onUpdateFormActionComplete(action) {
      if (action == 'submit' || action == 'save_draft') {
        this.activeForm = null;
      }

      if (!this.isMem()) {
        this.loadTableData();
      }
    },

    onAddChildFormActionComplete(action) {
      if (action == 'submit' || action == 'save_draft') {
        this.activeForm = null;
      }

      if (!this.isMem()) {
        this.loadTableData();
      }
    },
    getClickedRowPk(type) {
      if (this.clickedRow && this.clickedRow[type] && this.clickedRow[type].id) {
        return this.clickedRow[type].id.toString()
      }else if(this.pub_field_map?.id&&this.clickedRow && this.clickedRow[type] && this.clickedRow[type][this.pub_field_map?.id]) {
        return this.clickedRow[type][this.pub_field_map.id]
      } else {
        return null;
      }
    },

    onAddClicked() {
      this.activeForm = "add";
    },

    onAddListClicked() {
      this.activeForm = "addlist";
    },

    onUpdateClicked(row) {
      
      let self = this
      let type = 'update';
      //  let rowData = {}

      //  this.clickedRow = Object.assign(rowData,row)
      this.$set(this.clickedRow, type, row);
      this.$nextTick(_ => {
        this.activeForm = 'update';
      });
    },
    onCustomizeImport(row,button) {
      let type = 'customizeImport';
      this.$set(this.clickedRow, type, row);
      this.importService = button.operate_service
      this.$nextTick(_ => {
        this.activeForm = 'customizeImport';
        this.importService = button.operate_service
      });
    },
    onAddChildClicked(row) {
      this.$set(this.clickedRow, 'add-child', row);
      this.activeForm = "add-child";
    },

    onDuplicateClicked(row) {
      const data = {...row}
      if(data.id){
        delete data.id
      }
      this.$set(this.clickedRow, 'duplicate', data);
      if (this.inplaceEditMode) {
        this.duplicateRowInplace(data)
      } else {
        this.activeForm = "duplicate";
      }
    },

    onDuplicateDeepClicked(row) {
      const data = {...row}
      if(data.id){
        delete data.id
      }
      this.$set(this.clickedRow, 'duplicatedeep', data);
      this.activeForm = "duplicatedeep";
    },

    onRowDbClicked(row, event) {
      this.$emit('row-dbclick', row, event);
    },

    toggleFilters: function (item) {
      if (this.selectFormShow === true) {
        this.selectFormShow = false;
        item.button_cls = null
      } else {
        this.selectFormShow = true;
        item.button_cls = 'success'
      }
    },


  }
};
