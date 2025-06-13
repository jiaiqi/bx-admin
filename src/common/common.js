/**
 * 检查字符串是否为有效的JSON格式
 * @description 尝试解析字符串为JSON对象，判断是否为有效的JSON格式
 * @param {string} str - 需要检查的字符串
 * @returns {boolean} 如果是有效JSON返回true，否则返回false
 * @example
 * // 有效JSON
 * isJSON('{"name": "test"}'); // 返回: true
 * 
 * @example
 * // 无效JSON
 * isJSON('invalid json'); // 返回: false
 * 
 * @since 1.0.0
 */
export const isJSON = (str) => {
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

/**
 * 将Blob对象转换为Base64字符串
 * @description 使用FileReader将Blob对象异步转换为Base64编码的数据URL
 * @param {Blob} blob - 需要转换的Blob对象
 * @returns {Promise<string>} 返回Promise，resolve时包含Base64编码的数据URL字符串
 * @throws {Error} 当读取失败时reject错误信息
 * @example
 * // 转换Blob为Base64
 * const blob = new Blob(['Hello World'], { type: 'text/plain' });
 * blobToBase64(blob).then(base64 => {
 *   console.log(base64); // 输出: data:text/plain;base64,SGVsbG8gV29ybGQ=
 * });
 * 
 * @since 1.0.0
 */
export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * 将File对象转换为Base64字符串
 * @description 使用FileReader将File对象异步转换为Base64编码的数据URL
 * @param {File} file - 需要转换的File对象
 * @returns {Promise<string>} 返回Promise，resolve时包含Base64编码的数据URL字符串
 * @throws {Error} 当读取失败时reject错误信息
 * @example
 * // 转换文件为Base64
 * const fileInput = document.querySelector('input[type="file"]');
 * const file = fileInput.files[0];
 * fileToBase64(file).then(base64 => {
 *   console.log(base64); // 输出Base64编码的文件内容
 * });
 * 
 * @since 1.0.0
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * 动态加载外部JavaScript脚本
 * @description 动态创建script标签加载外部JS资源，主要用于加载百度地图等第三方库
 * @param {string} src - 脚本文件的URL地址
 * @returns {Promise<void>} 返回Promise，脚本加载成功时resolve
 * @throws {Error} 当脚本加载失败时reject
 * @example
 * // 加载百度地图脚本
 * LoadScript('https://api.map.baidu.com/api?v=3.0&ak=your_ak')
 *   .then(() => {
 *     console.log('百度地图脚本加载成功');
 *     // 可以使用BMap对象
 *   })
 *   .catch(err => {
 *     console.error('脚本加载失败', err);
 *   });
 * 
 * @since 1.0.0
 */
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
 * Cookie操作工具对象
 * @description 提供完整的Cookie操作方法，包括获取、设置、删除、检查存在性等功能
 * @namespace docCookies
 * @since 1.0.0
 */
export const docCookies = {
  /**
   * 获取指定名称的Cookie值
   * @description 根据Cookie名称获取对应的值，自动进行URL解码
   * @param {string} sKey - Cookie的名称
   * @returns {string|null} Cookie的值，如果不存在则返回null
   * @example
   * // 获取名为'username'的Cookie
   * const username = docCookies.getItem('username');
   * console.log(username); // 输出Cookie值或null
   * 
   * @memberof docCookies
   */
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
  /**
   * 设置Cookie
   * @description 设置Cookie的名称、值及各种属性
   * @param {string} sKey - Cookie的名称
   * @param {string} sValue - Cookie的值
   * @param {number|string|Date} [vEnd] - 过期时间，可以是秒数、日期字符串或Date对象
   * @param {string} [sPath] - Cookie的路径
   * @param {string} [sDomain] - Cookie的域名
   * @param {boolean} [bSecure] - 是否只在HTTPS下传输
   * @returns {boolean} 设置成功返回true，失败返回false
   * @example
   * // 设置基本Cookie
   * docCookies.setItem('username', 'john', 3600); // 1小时后过期
   * 
   * @example
   * // 设置带路径和域名的Cookie
   * docCookies.setItem('token', 'abc123', new Date('2024-12-31'), '/', '.example.com', true);
   * 
   * @memberof docCookies
   */
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
  /**
   * 删除指定的Cookie
   * @description 通过设置过期时间为过去时间来删除Cookie
   * @param {string} sKey - 要删除的Cookie名称
   * @param {string} [sPath] - Cookie的路径
   * @param {string} [sDomain] - Cookie的域名
   * @returns {boolean} 删除成功返回true，Cookie不存在返回false
   * @example
   * // 删除Cookie
   * docCookies.removeItem('username');
   * 
   * @example
   * // 删除指定路径的Cookie
   * docCookies.removeItem('token', '/', '.example.com');
   * 
   * @memberof docCookies
   */
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
  /**
   * 检查指定名称的Cookie是否存在
   * @description 使用正则表达式检查Cookie是否存在
   * @param {string} sKey - 要检查的Cookie名称
   * @returns {boolean} 存在返回true，不存在返回false
   * @example
   * // 检查Cookie是否存在
   * if (docCookies.hasItem('username')) {
   *   console.log('用户已登录');
   * }
   * 
   * @memberof docCookies
   */
  hasItem: function (sKey) {
    return new RegExp(
      "(?:^|;\\s*)" +
      encodeURIComponent(sKey).replace(/[-.+*]/g, "\\$&") +
      "\\s*\\="
    ).test(document.cookie);
  },
  /**
   * 获取所有Cookie的名称数组
   * @description 解析document.cookie获取所有Cookie的名称
   * @returns {string[]} 包含所有Cookie名称的数组
   * @example
   * // 获取所有Cookie名称
   * const cookieNames = docCookies.keys();
   * console.log(cookieNames); // ['username', 'token', 'theme']
   * 
   * @memberof docCookies
   */
  keys: function () {
    var aKeys = document.cookie
      .replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "")
      .split(/\s*(?:\=[^;]*)?;\s*/);
    for (var nIdx = 0; nIdx < aKeys.length; nIdx++) {
      aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
    }
    return aKeys;
  },
  /**
   * 清除所有Cookie
   * @description 获取所有Cookie名称并逐一删除
   * @returns {void}
   * @example
   * // 清除所有Cookie
   * docCookies.clear();
   * console.log('所有Cookie已清除');
   * 
   * @memberof docCookies
   */
  clear: function () {
    var aKeys = this.keys();
    for (var nIdx = 0; nIdx < aKeys.length; nIdx++) {
      this.removeItem(aKeys[nIdx], "/");
      this.removeItem(aKeys[nIdx]);
    }
  },
};

/**
 * 根据动画配置生成CSS动画类名
 * @description 基于animate.css库生成进入动画的CSS类名，支持多种动画类型和方向
 * @param {Object} config - 动画配置对象
 * @param {string} config.use_enter_animation - 是否使用进入动画，值为"是"时启用动画
 * @param {string} config.enter_animation_type - 动画类型，可选值："淡入"、"弹入"、"划入"、"旋转"、"缩放"、"缩放划入"
 * @param {string} config.enter_direction - 动画方向，可选值："由左往右"、"由右往左"、"由上至下"、"由下至上"、"左下"、"右下"、"左上"、"右上"
 * @param {number} [config.enter_delay] - 动画延迟时间（秒），可选参数
 * @returns {string|undefined} 返回生成的CSS类名字符串，如果不启用动画则返回undefined
 * @example
 * // 基本用法
 * const className = enterAnimationClass({
 *   use_enter_animation: "是",
 *   enter_animation_type: "淡入",
 *   enter_direction: "由左往右",
 *   enter_delay: 1
 * });
 * // 返回: "animate__animated animate__delay-1s animate__fadeInLeft"
 * 
 * @example
 * // 不使用动画
 * const className = enterAnimationClass({
 *   use_enter_animation: "否"
 * });
 * // 返回: undefined
 */
export function setEnterAnimationClass(params = {}) {
  const { use_enter_animation, enter_animation_type, enter_direction } = params

  if (use_enter_animation === "是") {
    // let className = "animate__animated animate__delay-1s ";
    let className = "animate__animated ";
    function buildClass(direction) {
      switch (direction) {
        case "由左往右":
          return "Left";
        case "由右往左":
          return "Right";
        case "由上至下":
          return "Down";
        case "由下至上":
          return "Up";
        /** 淡入可用 start*/
        case "左上渐显":
          return "TopLeft";
        case "右上渐显":
          return "TopRight";
        case "左下渐显":
          return "BottomLeft";
        case "右下渐显":
          return "BottomRight";
        /** 淡入可用 end*/
        /** 仅旋转可用 start*/
        case "向下左旋":
          return "DownLeft";
        case "向下右旋":
          return "DownRight";
        case "向上左旋":
          return "UpLeft";
        case "向上右旋":
          return "UpRight";
        /** 仅旋转可用 end*/
      }
      return ''
    }

    switch (enter_animation_type) {
      case "淡入":
        className += `animate__fadeIn${buildClass(enter_direction)}`;
        break;
      case "弹入":
      case "弹跳进入":
        className += `animate__bounceIn${buildClass(enter_direction)}`;
        break;
      case "划入":
      case "滑入":
        className += `animate__slideIn${buildClass(enter_direction)}`;
        break;
      case "旋转":
        className += `animate__rotateIn${buildClass(enter_direction)}`;
        break;
      case "缩放":
      case "放大":
        className += `animate__zoomIn${buildClass(enter_direction)}`;
        break;
      case "缩放划入":
        className += `animate__backIn${buildClass(enter_direction)}`;
        break;
      case "弹跳":
        className += `animate__bounce`;
        break;
      case "闪烁":
        className += `animate__flash`;
        break;
      case "脉冲":
        className += `animate__pulse`;
        break;
      case "橡皮圈":
        className += `animate__rubberBand`;
        break;
      case "横向晃动":
        className += `animate__shakeX`;
        break;
      case "纵向晃动":
        className += `animate__shakeY`;
        break;
      case "摇头":
        className += `animate__headShake`;
        break;
      case "摆动":
        className += `animate__swing`;
        break;
      case "颤动":
        className += `animate__tada`;
        break;
      case "果冻":
        className += `animate__jello`;
        break;
      case "心跳":
        className += `animate__heartBeat`;
        break;
      case "渐显":
        className += `animate__fadeIn`;
        break;
      case "翻转":
        className += `animate__flip`;
        break;
      case "铰链":
        className += `animate__hinge`;
        break;
      case "滚入":
        className += `animate__rollIn`;
        break;
      default:
        className += `animate__fadeIn${buildClass(enter_direction)}`;
        break;
    }
    return className;
  }
}

export function setEnterAnimationVariables(params = {}) {
  const {
    use_enter_animation,
    enter_animation_delay: delay,
    enter_animation_duration: duration,
    enter_animation_repeat: repeat } = params
  const style = {}
  if (use_enter_animation === "是") {
    if (delay) {
      style["--animate-delay"] = `${delay}s`
    }
    if (duration) {
      style["--animate-duration"] = `${duration}s`
    }
    if (repeat) {
      style["--animate-repeat"] = `${repeat}`
    } else if (repeat === 0) {
      style["--animate-repeat"] = `infinite`
    }
  }
  return style
}
