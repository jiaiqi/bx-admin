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

export {
	blobToBase64,
	fileToBase64,
	formatStyleData
}