// 构建门架图片地址的通用方法，兼容不同字段命名
export function buildGantryImageUrl(baseUrl, item, options = {}) {
  const { imgType = 'car', enexType = '' } = options
  const passid = item.passid || item.pass_id || item.passId
  const grantryType = item.grantry_type || item.type
  const transtime = item.transtime || item.trans_time || item.time
  const vehicleid = item.vehicleid || item.vehicle_id || item.vehicleId
  const gantryId =
    item.tollgrantry_id ||
    item.tradenodeid ||
    item.gantryid ||
    item.grantry_id ||
    item.gantry_id

  let url = `${baseUrl}/aud/get/gantry/img?passid=${encodeURIComponent(passid)}&gantryid=${encodeURIComponent(
    gantryId
  )}&transtime=${encodeURIComponent(transtime)}&type=${encodeURIComponent(grantryType)}&vehicleid=${encodeURIComponent(
    vehicleid
  )}`
  if (enexType) {
    url += `&enextype=${encodeURIComponent(enexType)}`
  }
  if (imgType) {
    url += `&imgtype=${encodeURIComponent(imgType)}`
  }
  return url
}