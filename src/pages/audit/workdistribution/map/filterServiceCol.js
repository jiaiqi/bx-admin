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