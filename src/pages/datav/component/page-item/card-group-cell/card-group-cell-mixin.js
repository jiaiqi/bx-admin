// import paramsModelsMixin from '@/common/paramsModelsMixin.js';
export default {
  data() {
    return {
      
    };
  },
  mixins: [],
  components: {},
  props: {
    

  },

  computed: {
    
  },

  methods: {
    
    partsShow(item, map, itemData) {
        let show = true
        // console.log('dispValue', item, map, itemData)
        if (item && itemData) {
          if (item.disp_flag == '显示' && item.disp_variable && map.hasOwnProperty(item.disp_variable)) {
            show = false
            let val = itemData[map[item.disp_variable]] || this.queryOptions[map[item.disp_variable]] || null
            let dispValue = item.disp_compare_value || null // 显示值
            if (dispValue && val) {
              dispValue = dispValue.split(',')
              // console.log('dispValue1',dispValue,val,itemData.target_name)
              if (dispValue.indexOf(val) !== -1) {
                show = true
              }
            }
  
          } else if (item.disp_flag == '隐藏' && item.disp_variable && map.hasOwnProperty(item.disp_variable)) {
            show = true
            let val = itemData[map[item.disp_variable]] || this.queryOptions[map[item.disp_variable]] || null
            let dispValue = item.disp_compare_value || null // 隐藏值
            if (dispValue && val) {
              dispValue = dispValue.split(',')
              // console.log('dispValue',dispValue,val,itemData,itemData.target_name)
              if (dispValue.indexOf(val) !== -1) {
                show = false
              }
  
            }
          }
  
        }
        // console.log('dispValue2',itemData.rent_type,itemData.rent_status,show)
        if (!show) {
          console.log('dispValue2', itemData.rent_type, itemData.rent_status, show)
        }
        return show
      }
  },
  mounted() {
    
  },

  watch: {
    
  }
};