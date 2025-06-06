/**
 * 根据选项过滤列表
 * @param {Array} list - 源数据列表
 * @param {Object} toList - 目标对象
 * @returns {Object} 处理后的目标对象
 */
export const filterListByOption = (list, toList) => {
    // 参数验证
    if (!Array.isArray(list)) {
        console.warn('filterListByOption: list 参数必须是数组');
        return toList;
    }
    
    if (!toList || typeof toList !== 'object') {
        console.warn('filterListByOption: toList 参数必须是对象');
        return {};
    }

    // 创建一个新对象，避免直接修改原对象
    const result = { ...toList };

    // 遍历源数据列表
    list.forEach(item => {
        // 如果源对象和目标对象都有相同的 key
        if (item?.columns && result.hasOwnProperty(item.columns)) {
            // 将源对象的值赋给目标对象
            result[item.columns] = item.option_list_v2 || [];
        }
    });

    return result;
}
export const formDataByInitText=(form,list,typeKey)=>{
    if (!list) return  form
    const result = {...form};
    list.forEach(item => {
        if(item?.columns && result.hasOwnProperty(item.columns)&&item?.init_expr &&item.columns!=='user_no') {
            result[item.columns] = removeQuotes(item[typeKey]) || '';
        }
    })
    return result;
}
const  removeQuotes=(str)=> {
    // 去除单引号
    return str.replace(/^['"]|['"]$/g, '');
}
/**
 * @Description:将回填数据对象与表单对应
 * @Author:Eirice
 * @Date: 2025-05-23 14:51:54
 */
export const formDataByGetInfo = (form, info) => {
    // 参数验证
    if(info && typeof info !== 'object') {
        JSON.parse(info);
    }
    if (!form || typeof form !== 'object') {
        console.warn('formDataByGetInfo: form 参数必须是对象');
        return {};
    }
    
    if (!info || typeof info !== 'object') {
        console.warn('formDataByGetInfo: info 参数必须是对象');
        return form;
    }

    // 创建一个新对象，避免直接修改原对象
    const result = { ...form };
    // 遍历源对象的所有属性
    Object.keys(info).forEach(key => {
        // 如果目标对象中存在相同的 key
        if (result.hasOwnProperty(key)) {
            // 将源对象的值赋给目标对象
            result[key] = info[key].toString();
        }
    });

    return result;
}
//嫌疑流水表头
export const SuspectedColumn= () => {
      return [
          {
              title: '车牌号',
              prop: 'vehicleplate_no',
          },
          {
              title: '车型',
              prop: '_vehicletype_disp'
          },
          {
              title: '入口名称',
              prop: 'enstationname'
          },
          {
              title: '入站时间',
              prop: 'entime',
          },
          {
              title: '出口名称',
              prop: 'exstationname',
          },
          {
              title: '出站时间',
              prop: 'extime',
          }
      ]
}