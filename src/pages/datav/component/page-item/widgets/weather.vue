<template>
  <div
    class="weather-widget"
    :class="computedContainerClass"
    :style="computedContainerStyle"
  >
    <!-- 加载状态 -->
    <div
      v-if="isLoading"
      class="loading-indicator"
    >
      <span class="loading-text">获取天气数据中...</span>
    </div>

    <!-- 天气内容 - 默认左右分栏布局 -->
    <template v-else>
      <!-- 左侧区域：城市名称和实时温度 -->
      <div class="weather-left">
        <!-- 城市名称 -->
        <div
          v-if="showOptions.city"
          class="weather-city"
        >
          <span
            v-if="showOptions.province && weatherData.province"
            class="province-name"
          >{{ weatherData.province }}</span>
          {{ formatCity(weatherData.city) }}
        </div>

        <!-- 实时气温大字显示 -->
        <div
          v-if="showOptions.currentTemp"
          class="weather-current"
        >
          <span class="current-temp">{{ weatherData.currentTemp }}℃</span>
        </div>
      </div>

      <!-- 右侧区域：天气描述和温度范围 -->
      <div class="weather-right">
        <!-- 天气描述 -->
        <div
          v-if="showOptions.weather"
          class="weather-desc-only"
        >
          {{ formatWeatherDesc(weatherData.weather) }}
        </div>

        <!-- 今日气温范围 -->
        <div
          v-if="showOptions.todayTemp"
          class="weather-today"
        >
          <span class="temp-range">{{ weatherData.minTemp }} - {{ weatherData.maxTemp }}℃</span>
        </div>
        <!-- 更新时间 -->
        <div
          v-if="showOptions.updateTime && weatherData.reporttime"
          class="update-time"
        >
          更新时间: {{ formatTime(weatherData.reporttime) }}
        </div>
      </div>
    </template>

    <!-- 错误状态 -->
    <div
      v-if="hasError"
      class="error-message"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'WeatherWidget',
  props: {
    // 页面项配置
    pageItem: {
      type: Object,
      default: () => ({})
    },
    // 显示选项配置
    displayOptions: {
      type: Object,
      default: () => ({
        city: true,
        currentTemp: true,
        todayTemp: true,
        weather: true,
        updateTime: false,
        province: false     // 是否显示省份信息
      })
    },
    // 天气数据
    weatherInfo: {
      type: Object,
      default: () => ({})
    },
    // 高德地图API Key
    amapKey: {
      type: String,
      default: '96f176f14e3eb276049d4abc28d39c61'
    },
    // 是否自动获取天气数据
    autoFetch: {
      type: Boolean,
      default: true
    },
    // 数据更新间隔（分钟）
    updateInterval: {
      type: Number,
      default: 30
    },
    // 容器自定义样式
    containerStyle: {
      type: [Object, String],
      default: () => ({})
    },
    // 容器自定义类名
    containerClass: {
      type: [String, Array, Object],
      default: ''
    },
  },
  data() {
    return {
      // 默认天气数据
      defaultWeatherData: {
        city: '延安',
        currentTemp: 28,
        minTemp: 25,
        maxTemp: 32,
        weather: '多云',
        winddirection: '北风',
        windpower: '≤3',
        reporttime: ''
      },
      // 实时天气数据
      realTimeWeatherData: {},
      // 预报天气数据
      forecastWeatherData: {},
      // 位置信息
      locationInfo: {},
      // 加载状态
      isLoading: false,
      // 错误状态
      hasError: false,
      errorMessage: '',
      // 定时器
      updateTimer: null
    }
  },
  computed: {
    // 显示选项
    showOptions() {
      return {
        ...this.displayOptions,
        ...this.pageItem?.widget_json?.displayOptions
      }
    },
    // 天气数据
    weatherData() {
      const baseData = {
        ...this.defaultWeatherData,
        ...this.weatherInfo,
        ...this.pageItem?.widget_json?.weatherData
      }

      // 如果有实时数据，优先使用实时数据
      if (this.realTimeWeatherData && Object.keys(this.realTimeWeatherData).length > 0) {
        const liveData = this.realTimeWeatherData.lives?.[0] || {}
        const forecastData = this.forecastWeatherData.forecasts?.[0]?.casts?.[0] || {}

        return {
          ...baseData,
          city: liveData.city || this.locationInfo.city || baseData.city,
          province: this.locationInfo.province || baseData.province,
          currentTemp: liveData.temperature || baseData.currentTemp,
          weather: liveData.weather || baseData.weather,
          winddirection: liveData.winddirection || baseData.winddirection,
          windpower: liveData.windpower || baseData.windpower,
          reporttime: liveData.reporttime || baseData.reporttime,
          minTemp: forecastData.nighttemp || baseData.minTemp,
          maxTemp: forecastData.daytemp || baseData.maxTemp
        }
      }

      return baseData
    },

    // 容器样式计算
    computedContainerStyle() {
      const baseStyle = {
        display: 'flex'
      }

      // 合并用户自定义样式
      if (typeof this.containerStyle === 'string') {
        return { ...baseStyle, cssText: this.containerStyle }
      }

      return { ...baseStyle, ...this.containerStyle }
    },

    // 容器类名计算
    computedContainerClass() {
      const classes = ['weather-widget']

      // 添加加载状态类名
      if (this.isLoading) {
        classes.push('loading')
      }

      // 添加用户自定义类名
      if (this.containerClass) {
        if (Array.isArray(this.containerClass)) {
          classes.push(...this.containerClass)
        } else if (typeof this.containerClass === 'object') {
          Object.keys(this.containerClass).forEach(key => {
            if (this.containerClass[key]) {
              classes.push(key)
            }
          })
        } else {
          classes.push(this.containerClass)
        }
      }

      return classes
    }
  },
  mounted() {
    if (this.autoFetch) {
      this.initWeatherData()
      this.startAutoUpdate()
    }
  },
  beforeUnmount() {
    this.stopAutoUpdate()
  },
  methods: {
    // 格式化城市名称
    formatCity(city) {
      if (city.includes('市')) {
        return city.replace('市', '')
      }
      return city
    },

    // 初始化天气数据
    async initWeatherData() {
      try {
        this.isLoading = true
        this.hasError = false

        // 获取位置信息
        await this.getLocationInfo()

        // 获取天气数据
        await Promise.all([
          this.fetchRealTimeWeather(),
          this.fetchForecastWeather()
        ])

      } catch (error) {
        console.error('初始化天气数据失败:', error)
        this.handleError('获取天气数据失败，请稍后重试')
      } finally {
        this.isLoading = false
      }
    },

    // 获取位置信息
    async getLocationInfo() {
      try {
        const response = await fetch(`https://restapi.amap.com/v3/ip?key=${this.amapKey}`)
        const data = await response.json()

        if (data.status === '1') {
          this.locationInfo = {
            province: data.province,
            city: data.city,
            adcode: data.adcode
          }
        } else {
          throw new Error(`获取位置信息失败: ${data.info}`)
        }
      } catch (error) {
        console.error('获取位置信息失败:', error)
        // 使用默认位置信息
        this.locationInfo = {
          city: '延安',
          adcode: '610600'
        }
      }
    },

    // 获取实时天气数据
    async fetchRealTimeWeather() {
      try {
        const adcode = this.locationInfo.adcode || '610600'
        const response = await fetch(
          `https://restapi.amap.com/v3/weather/weatherInfo?key=${this.amapKey}&city=${adcode}&extensions=base`
        )
        const data = await response.json()

        if (data.status === '1' && data.lives && data.lives.length > 0) {
          this.realTimeWeatherData = data
        } else {
          throw new Error(`获取实时天气失败: ${data.info}`)
        }
      } catch (error) {
        console.error('获取实时天气数据失败:', error)
        throw error
      }
    },

    // 获取天气预报数据
    async fetchForecastWeather() {
      try {
        const adcode = this.locationInfo.adcode || '610600'
        const response = await fetch(
          `https://restapi.amap.com/v3/weather/weatherInfo?key=${this.amapKey}&city=${adcode}&extensions=all`
        )
        const data = await response.json()

        if (data.status === '1' && data.forecasts && data.forecasts.length > 0) {
          this.forecastWeatherData = data
        } else {
          console.warn('获取天气预报失败:', data.info)
        }
      } catch (error) {
        console.error('获取天气预报数据失败:', error)
        // 预报数据获取失败不影响主要功能
      }
    },

    // 格式化天气描述
    formatWeatherDesc(weather) {
      return weather || ''
    },

    // 格式化时间
    formatTime(timeStr) {
      if (!timeStr) return ''

      try {
        const date = new Date(timeStr)
        return date.toLocaleString('zh-CN', {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        return timeStr
      }
    },

    // 处理错误
    handleError(message) {
      this.hasError = true
      this.errorMessage = message

      // 3秒后隐藏错误信息
      setTimeout(() => {
        this.hasError = false
      }, 3000)
    },

    // 开始自动更新
    startAutoUpdate() {
      if (this.updateInterval > 0) {
        this.updateTimer = setInterval(() => {
          this.initWeatherData()
        }, this.updateInterval * 60 * 1000) // 转换为毫秒
      }
    },

    // 停止自动更新
    stopAutoUpdate() {
      if (this.updateTimer) {
        clearInterval(this.updateTimer)
        this.updateTimer = null
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.weather-widget {
  display: flex;
  gap: 20px;
  align-items: center;
}

.weather-left {
  display: flex;
  font-size: 2.4em;
}

.weather-right {
  font-size: 0.8em;
}
</style>