/**
 * @Description:百度地图加载
 * @Author:Eirice
 * @Date: 2025-05-21 10:58:54
 */
export default class MapUtils {
    constructor(options) {
        this.container =document.getElementById(options.container) || undefined;
        this.center = options.center || [];
        this.zoom = options.zoom || 10;
        this._map = null;
    }
    initMap() {
        if (!window.BMap && window.BMapGL) {
            window.BMap = BMapGL
        }
        this._map =  new BMap.Map(this.container);
        if(!this._map) return
        this._map.centerAndZoom(new BMap.Point(this.center[0], this.center[1]), this.zoom);
        this._map.enableScrollWheelZoom(true)
        let scaleCtrl = new BMap.ScaleControl();  // 添加比例尺控件
        this._map.addControl(scaleCtrl);
        this._map.enableScrollWheelZoom(true);
        console.log(this._map)
        return this._map;
    }
    destroyMap() {
        this._map.destroy();
    }
}