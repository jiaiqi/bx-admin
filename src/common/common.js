// 处理后端返回的样式数据
const formatStyleData = json => {
	const str = JSON.stringify(json)
	if (!isJSON(str)) return ''

	let obj = {}
	for (let key in json) {
		let _key = key.replace('_', '-')
		obj[_key] = json[key]
	}
	if(obj['background-image']){
		obj['background-size'] = '100% 100%'
	}
	return obj
}

const isJSON = str => {
	if (typeof str == 'string') {
		try {
			let obj = JSON.parse(str);
			if (typeof obj == 'object' && obj) {
				return true;
			} else {
				return false;
			}
		} catch (e) {
			console.log('error：' + str + '!' + e);
			return false;
		}
	}
	return false
}

function blobToBase64(blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(blob);
		reader.onload = () => resolve(reader.result);
		reader.onerror = error => reject(error);
	});
}

function fileToBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result);
		reader.onerror = error => reject(error);
	});
}

export function LoadScript(src) {
	const BMap_URL = src
	if (!src) {
		return
	}
	return new Promise((resolve, reject) => {
		// 如果已加载直接返回
		if (typeof BMap !== "undefined") {
			resolve(BMap);
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
			console.log('js资源已加载成功了')
			resolve(BMap);
		}
		// 引入失败
		scriptNode.onerror = function (err) {
			console.log('js资源加载失败了',err)
		}
		document.body.appendChild(scriptNode);
	});
}

export {
	blobToBase64,
	fileToBase64,
	formatStyleData
}