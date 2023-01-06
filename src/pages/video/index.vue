<template>
  <div class="content">
    <div class="preview" id="video-container"></div>
  </div>
</template>

<script module="ezuikit" lang="renderjs">
	import EZUIKit from 'ezuikit-js'
	window.EZUIKit = EZUIKit
	var player = null;

	export default {
		data() {
			return {
				background: {
					backgroundColor: '#ffffff',
				},
				accessToken: '',
				url: '',
				option: {}
			}
		},
		created() {
			this.option = this.$route.query
		},
		mounted() {
			this.getVideoUrl()
		},
		methods: {
			getVideoUrl() {
        let condition = [{
							"colName": "sn",
							"ruleType": "eq",
							// "value": 'F97911722'
							"value": this.option.sn || ''
						},
						{
							"colName": "channel_no",
							"ruleType": "eq",
							// "value": '1'
							"value": this.option.channel_no || ''
						},
						{
							"colName": "vcode",
							"ruleType": "eq",
							// "value": 'UVLYDZ'
							"value": this.option.vcode || ''
						},
					]
        this.select("srvliot_play_address_select", condition,null,null,null,null,'liot').then(response => {
        if (response.body.state == "SUCCESS") {
          const data = response.body.data[0]
					this.accessToken = data.accessToken
					this.url = data.url

					if (typeof window.EZUIKit !== 'undefined') {
						console.log('defined EZUIKit...');
						this.initPlayer();
					} else {
						console.log('undefined EZUIKit...');
						// 动态引入较大类库避免影响页面展示
						const script = document.createElement('script')
						// view 层的页面运行在 www 根目录，其相对路径相对于 www 计算
						script.src = 'https://login.100xsys.cn:1443/h5/static/js/ezuikit.js'
						script.onload = this.initPlayer.bind(this)
						document.head.appendChild(script)
					}
        }
      });
			},
			initPlayer() {
        const windowWidth = document.documentElement.clientWidth - 360
        const windowHeight = document.documentElement.clientHeight
				console.log('initPlayer...');
				
				player = new EZUIKit.EZUIKitPlayer({
					id: 'video-container', // 视频容器ID
					accessToken: this.accessToken,
					url: this.url,
					// simple - 极简版; pcLive-pc直播；pcRec-pc回放；mobileLive-移动端直播；mobileRec-移动端回放;security - 安防版;voice-语音版;
					//template: 'simple',
					plugin: ['talk'], // 加载插件，talk-对讲
					width: windowWidth,
					height: windowWidth * 2 / 3,
				});
				window.player = player;
			},
			play() {
				var playPromise = player.play();
				playPromise.then((data) => {
					console.log("promise 获取 数据", data)
				})
			},
			stop() {
				var stopPromise = player.stop();
				stopPromise.then((data) => {
					console.log("promise 获取 数据", data)
				})
			},
			getOSDTime() {
				var getOSDTimePromise = player.getOSDTime();
				getOSDTimePromise.then((data) => {
					console.log("promise 获取 数据", data)
				})
			},
			capturePicture() {
				var capturePicturePromise = player.capturePicture(`${new Date().getTime()}`);
				capturePicturePromise.then((data) => {
					console.log("promise 获取 数据", data)
				})
			},
			openSound() {
				var openSoundPromise = player.openSound();
				openSoundPromise.then((data) => {
					console.log("promise 获取 数据", data)
				})
			},
			closeSound() {
				var openSoundPromise = player.closeSound();
				openSoundPromise.then((data) => {
					console.log("promise 获取 数据", data)
				})
			},
			startSave() {
				var startSavePromise = player.startSave(`${new Date().getTime()}`);
				startSavePromise.then((data) => {
					console.log("promise 获取 数据", data)
				})
			},
			stopSave() {
				var stopSavePromise = player.stopSave();
				stopSavePromise.then((data) => {
					console.log("promise 获取 数据", data)
				})
			},
			ezopenStartTalk() {
				player.startTalk();
			},
			ezopenStopTalk() {
				player.stopTalk();
			},
			fullScreen() {
				player.fullScreen();
			},
			destroy() {
				var destroyPromise = player.destroy();
				destroyPromise.then((data) => {
					console.log("promise 获取 数据", data)
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.preview {
  background-color: black;
}
</style>
