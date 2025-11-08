
/**
 * 获取路由模式配置
 * 来源于环境变量 `VUE_APP_ROUTE_MODE`，可能为 `'hash'` 或 `'history'`。
 */
export function getRouteMode() {
  return process.env.VUE_APP_ROUTE_MODE || 'hash'
}
/**
 * 获取应用基础地址（不含路由片段）
 * 来源于环境变量 `VUE_APP_BASE_URL`，通常为站点根路径或部署子路径。
 * 例如：`https://example.com/app` 或 `/`。
 */
export function getBaseUrl() {
  return process.env.VUE_APP_BASE_URL || ''
}
/**
 * 获取完整基础地址（根据路由模式拼接）
 * - 当为 `hash` 模式时，需在基础地址后拼接 `/#`，以使后续路由以哈希片段形式工作。
 * - 当为 `history` 模式时，直接返回基础地址。
 */
export function getFullBaseUrl() {
  if (getRouteMode() === 'hash') {
    return `${getBaseUrl()}/#`
  } else {
    return `${getBaseUrl()}`
  }
}

/**
 * 获取应用公共路径（根据路由模式拼接）
 * - 当有 `VUE_APP_BASE_URL` 时，公共路径为 `VUE_APP_BASE_URL/`。
 * - 当无 `VUE_APP_BASE_URL` 且路由模式为 `history` 时，公共路径为 `/`。
 * - 否则，公共路径为 `./`。
 */
export function getPublicPath() {
  return process.env.VUE_APP_BASE_URL ? process.env.VUE_APP_BASE_URL + "/" : process.env.VUE_APP_ROUTE_MODE === 'history' ? '/' : "./"
}

/**
 * 获取应用输出目录
 * 来源于环境变量 `VUE_APP_OUTPUT_DIR`，默认值为 `vpages`。
 */
export function getOutputDir() {
  return process.env.VUE_APP_OUTPUT_DIR || 'vpages'
}

/**
 * 获取应用资源目录
 * 来源于环境变量 `VUE_APP_ASSETS_DIR`，默认值为 `assets`。
 */
export function getAssetsDir() {
  return process.env.VUE_APP_ASSETS_DIR || 'assets'
}