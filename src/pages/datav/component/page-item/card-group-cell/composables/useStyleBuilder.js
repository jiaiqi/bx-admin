import { formatStyleData } from '@/pages/datav/common'

/**
 * 样式构建组合式函数
 * @returns {Object} 返回样式构建相关的方法
 */
export function useStyleBuilder() {
  /**
   * 构建列样式 JSON
   * @param {Object} styleJson - 样式 JSON 对象
   * @param {Array} cssArr - CSS 数组（暂未使用）
   * @param {Object} cellLayoutJson - 单元格布局 JSON
   * @param {string} column - 指定列名
   * @returns {Object|string} 返回样式对象或指定列的样式值
   */
  const buildColStyleJson = (styleJson, cssArr, cellLayoutJson, column) => {
    try {
      let style = {}

      if (styleJson) {
        style = formatStyleData(styleJson)
      }

      const bgImg =
        styleJson?.background_image || cellLayoutJson?.background_image || ''

      if (bgImg) {
        // 背景图样式处理
        Object.assign(style, {
          'background-image': `url(${getImagePath(bgImg)})`,
          'background-size': '100% 100%',
          'background-repeat': 'no-repeat',
        })

        // 设置最小高度
        if (cellLayoutJson && !style.hasOwnProperty('min-height')) {
          style['min-height'] = '60px'
        }
      }

      return column ? style[column] || '' : style
    } catch (error) {
      console.warn('样式构建失败:', error)
      return column ? '' : {}
    }
  }

  /**
   * 图片路径处理函数
   * @param {string} imagePath - 图片路径
   * @returns {string} 处理后的图片路径
   */
  const getImagePath = (imagePath) => {
    // 这里可以根据实际项目的图片处理逻辑来实现
    // 例如：添加 CDN 前缀、处理相对路径等
    return imagePath
  }

  /**
   * 构建动态类名
   * @param {Object} props - 组件 props
   * @param {Object} computed - 计算属性对象
   * @returns {Object} 返回类名对象
   */
  const buildDynamicClasses = (props, computed) => {
    return {
      checked:
        props.pageItem &&
        props.pageItem._refedCol &&
        props.currentRadio === props.cellItemData[props.pageItem._refedCol],
      'is-link': props.cellLayoutJson && props.cellLayoutJson.jump_json,
      'list-item': props.inList,
      'accordion-mode': computed.isAccordionMode?.value || false,
    }
  }

  /**
   * 构建动态样式
   * @param {Object} props - 组件 props
   * @returns {Array} 返回样式数组
   */
  const buildDynamicStyles = (props) => {
    return [
      props.cellLayoutJson.style_json
        ? buildColStyleJson(props.cellLayoutJson.style_json, null, props.cellLayoutJson)
        : buildColStyleJson(null, null, props.cellLayoutJson),
    ]
  }

  return {
    buildColStyleJson,
    getImagePath,
    buildDynamicClasses,
    buildDynamicStyles
  }
}