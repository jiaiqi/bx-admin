export const handleFilterCols = (list, col) => {
    if (!list || list.length === 0) return {};
    const resInfo = {};
    list.forEach(item => {
        if (item[col]) {
            resInfo[item[col]] = '';
        }
    });
    return resInfo;
}
//数据过滤
export const handleFilterParams = (key, list, symbol) => {
  if (!list) return;
  return list.map(item => item[key]).join(symbol);
}