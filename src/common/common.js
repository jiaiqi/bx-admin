// 处理后端返回的样式数据

const formatStyleData = (val) => {
  let json = val;
  if (typeof json === 'string') {
    try {
      json = JSON.parse(json);
    } catch (error) {
      console.error("error：" + str + "!" + e);
    }
  }
  let str = JSON.stringify(json);
  if (!isJSON(str)) return {};

  let obj = {};
  let themeVariableKeys = [
    "primary-color",
    "text-color",
    "header-bg-color",
    "header-text-color",
    "footer-bg-color",
    "footer-text-color",
    "menu-bg-color",
    "menu-text-color",
    "menu-active-bg-color",
    "menu-hover-bg-color",
    "menu-active-text-color",
    "menu-hover-text-color",
  ];
  for (let key in json) {
    let _key = key.replaceAll("_", "-");
    obj[_key] = json[key];
    // 处理样式变量
    if (themeVariableKeys.includes(json[key])) {
      obj[_key] = `var(--${json[key]})`;
      if (json[key]?.includes('text')) {
        obj[_key] = `var(--${json[key]}, #fff)`;
      }
      if (json[key]?.includes('bg')) {
        obj[_key] = `var(--${json[key]}, #409EFF)`;
      }
    }
    if (json[key]?.includes('bg-color')) {
      obj[_key] = `var(--${json[key]}, #409EFF)`;
    }
    if (json[key]?.includes('text-color')) {
      obj[_key] = `var(--${json[key]}, #fff)`;
    }
    if (_key === "background-image") {
      obj[_key] = `url(${getImagePath(json[key])})`;
    }
    if (typeof obj[_key] === 'string' && obj[_key].includes('rpx')) {
      obj[_key] = rpx2px(obj[_key]);
    }
  }
  if (obj["background-image"]) {
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

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

export function LoadScript(src) {
  const BMap_URL = src;
  if (!src) {
    return;
  }
  return new Promise((resolve, reject) => {
    // 如果已加载直接返回
    if (typeof BMap !== "undefined") {
      resolve(BMap);
      return true;
    }
    if (typeof BMapGL !== "undefined") {
      resolve(BMapGL);
      return true;
    }
    // // 百度地图异步加载回调处理
    // window.onBMapCallback = function () {
    //   console.log("百度地图脚本初始化成功...");
    //   resolve(BMap);
    // };
    // 插入script脚本
    let scriptNode = document.createElement("script");
    scriptNode.setAttribute("type", "text/javascript");
    scriptNode.setAttribute("src", BMap_URL);
    // 引入成功
    scriptNode.onload = function () {
      console.log("js资源已加载成功了");
      resolve();
    };
    // 引入失败
    scriptNode.onerror = function (err) {
      console.log("js资源加载失败了", err);
    };
    document.body.appendChild(scriptNode);
  });
}

/**
 * 操作cookie
 */
export const docCookies = {
  getItem: function (sKey) {
    return (
      decodeURIComponent(
        document.cookie.replace(
          new RegExp(
            "(?:(?:^|.*;)\\s*" +
            encodeURIComponent(sKey).replace(/[-.+*]/g, "\\$&") +
            "\\s*\\=\\s*([^;]*).*$)|^.*$"
          ),
          "$1"
        )
      ) || null
    );
  },
  setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
      return false;
    }
    var sExpires = "";
    if (vEnd) {
      switch (vEnd.constructor) {
        case Number:
          sExpires =
            vEnd === Infinity
              ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT"
              : "; max-age=" + vEnd;
          break;
        case String:
          sExpires = "; expires=" + vEnd;
          break;
        case Date:
          sExpires = "; expires=" + vEnd.toUTCString();
          break;
      }
    }
    document.cookie =
      encodeURIComponent(sKey) +
      "=" +
      encodeURIComponent(sValue) +
      sExpires +
      (sDomain ? "; domain=" + sDomain : "") +
      (sPath ? "; path=" + sPath : "") +
      (bSecure ? "; secure" : "");
    return true;
  },
  removeItem: function (sKey, sPath, sDomain) {
    if (!sKey || !this.hasItem(sKey)) {
      return false;
    }
    document.cookie =
      encodeURIComponent(sKey) +
      "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" +
      (sDomain ? "; domain=" + sDomain : "") +
      (sPath ? "; path=" + sPath : "");
    return true;
  },
  hasItem: function (sKey) {
    return new RegExp(
      "(?:^|;\\s*)" +
      encodeURIComponent(sKey).replace(/[-.+*]/g, "\\$&") +
      "\\s*\\="
    ).test(document.cookie);
  },
  keys: function () {
    var aKeys = document.cookie
      .replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "")
      .split(/\s*(?:\=[^;]*)?;\s*/);
    for (var nIdx = 0; nIdx < aKeys.length; nIdx++) {
      aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
    }
    return aKeys;
  },
  clear: function () {
    var aKeys = this.keys();
    for (var nIdx = 0; nIdx < aKeys.length; nIdx++) {
      this.removeItem(aKeys[nIdx], "/");
      this.removeItem(aKeys[nIdx]);
    }
  },
};

export { blobToBase64, fileToBase64, formatStyleData };
