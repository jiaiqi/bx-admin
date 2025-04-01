import { getImagePath } from "./http";

// 处理后端返回的样式数据
const formatStyleData = (val) => {
  let json = val;
  if(typeof json==='string'){
    try {
      json = JSON.parse(json);
    } catch (error) {
      console.error("error：" + str + "!" + e);
    }
  }
  let str = JSON.stringify(json);
  if (!isJSON(str)) return {};
  let obj = {};
  for (let key in json) {
    let _key = key.replace("_", "-");
    obj[_key] = json[key];
    if (_key === "background-image") {
      obj[_key] = `url(${getImagePath(json[key])})`;
    }
    if(typeof obj[_key]==='string' && obj[_key].includes('rpx')){
      obj[_key] = rpx2px(obj[_key]);
    }
  }
  if (obj["background-image"] && !obj["background-size"]) {
    obj["background-size"] = "100% 100%";
  }
  return obj;
};

const isJSON = (str) => {
  if (typeof str == "string") {
    try {
      let obj = JSON.parse(str);
      if (typeof obj == "object" && obj) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.log("error：" + str + "!" + e);
      return false;
    }
  }
  return false;
};

 function rpx2px(str) {
  if(!str) return str;
  return str.replace(/(\d+)rpx/g, (match, p1) => {
    return `${parseInt(p1) / 2}px`;
  });
}
export { formatStyleData, rpx2px };
