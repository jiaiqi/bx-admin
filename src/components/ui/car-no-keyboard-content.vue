<template>
  <div class="keybord-wrap" :class="{ slide: keyboardStyle === 'slide' }">
    <header class="keybord-header" v-if="keyboardStyle === 'slide'">
      <span @click.stop="cancel()" class="cursor-pointer">取消</span>
      <span v-if="previewOnKeyboard" :class="['preview', { 'new-energy': newEnergy }]">{{ inputValue.join('')
      }}</span>
      <span :class="[{ gray: inputValue.length < 7, 'cursor-pointer': inputValue.length >= 7 }]"
        @click.stop="submit()">完成</span>
    </header>

    <div class="keybord-keys">
      <ul class="keybord-keys-word-wrap" v-if="keybordType === '字'">
        <li @click.stop="inputWord(item)" class="button" v-for="item in wordList.slice(0, 30)" :key="item">
          {{ item }}
        </li>
      </ul>
      <div v-else>
        <ul class="keybord-keys-abc-wrap">
          <li @click.stop="inputWord(item)" class="button" v-for="item in abcList.slice(0, 10)" :key="item">
            {{ item }}
          </li>
        </ul>
        <ul class="keybord-keys-abc-wrap">
          <li @click.stop="inputWord(item)" class="button" v-for="item in abcList.slice(10, 20)" :key="item">
            {{ item }}
          </li>
        </ul>
        <ul class="keybord-keys-abc-wrap-short">
          <li @click.stop="inputWord(item)" class="button" v-for="item in abcList.slice(20, 29)" :key="item">
            {{ item }}
          </li>
        </ul>
      </div>

      <div class="keybord-keys-bottom">
        <div @click.stop="toggle()" class="button bg-blue">
          <!-- {{ keybordType }} -->
          <i class="el-icon-sort" style="transform: rotate(90deg);"></i>
        </div>
        <ul class="keybord-keys-bottom-line" :class="{ 'col-count-8': keybordType === '字' }">
          <li @click.stop="inputWord(item)" class="button" v-for="item in judgeList" :key="item">
            {{ item }}
          </li>
        </ul>
        <div @click.stop="deleteOne()" class="button bg-red">
          <slot name="backspace">
            <span class="icon-delete">
              <!-- ⇦ -->
              <i class="el-icon-delete"></i>
            </span>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'car-no-keyboard-content',
  props: {
    keyboardStyle: String,
    openKeyboardOnInit: {
      type: Boolean,
      default: false
    },
    closeOnClickOverlay: {
      type: Boolean,
      default: true
    },
    overlay: {
      type: Boolean,
      default: true
    },
    previewOnKeyboard: {
      type: Boolean,
      default: true
    },
    checkInputBlocked: {
      type: Boolean,
      default: false
    },
    allowSwitch: { //是否允许切换键盘
      type: Boolean,
      default: true
    },
    inputValue: Array
  },
  data: function () {
    return {
      keybordType: '字',
      wordList: [
        '京',
        '津',
        '渝',
        '沪',
        '冀',
        '晋',
        '辽',
        '吉',
        '黑',
        '苏',
        '浙',
        '皖',
        '闽',
        '赣',
        '鲁',
        '豫',
        '鄂',
        '湘',
        '粤',
        '琼',
        '川',
        '贵',
        '云',
        '陕',
        '甘',
        '青',
        '蒙',
        '桂',
        '宁',
        '新',
        '藏',
        '使',
        '领',
        '警',
        '学',
        '挂',
        '港',
        '澳'
      ],
      abcList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Z', 'X', 'C', 'V', 'B', 'N', 'M']
    }
  },
  computed: {
    _overlay() {
      return this.visible && this.overlay
    },
    judgeList() {
      if (this.keybordType === 'ABC') {
        return this.abcList.slice(29, 36)
      } else {
        return this.wordList.slice(30, 38)
      }
    },
    newEnergy() {
      return this.inputValue.length === 8
    }
  },
  methods: {
    // 键盘类型切换
    toggle() {
      if (this.allowSwitch) {
        this.keybordType = this.keybordType === 'ABC' ? '字' : 'ABC'
        return
      }
      if (this.inputValue.length === 0 || (this.inputValue.length > 0 && this.inputValue.length <= 8)) return
      this.keybordType = this.keybordType === 'ABC' ? '字' : 'ABC'
    },
    // 文字输入
    inputWord(word) {
      this.$emit('inputWord', word)
    },
    // 删除一个字符
    deleteOne() {
      this.$emit('deleteOne')
    },
    closeByClickOverlay() {
      if (!this.closeOnClickOverlay) return
      this.cancel()
    },
    // 取消
    cancel() {
      this.$emit('cancel')
    },
    // 完成
    submit() {
      this.$emit('submit')
    },
  },
  watch: {
    inputValue(key) {
      if (this.inputValue.length === 0) this.keybordType = '字'
      if (this.inputValue.length > 0 && this.inputValue.length <= 7) this.keybordType = 'ABC'
    },
  },
}
</script>

<style scoped lang="less">
@backBordZIndex: 980511;
.cursor-pointer{
  cursor: pointer;
}
.gray {
  color: rgb(173, 171, 171);
}

.keybord-wrap {
  z-index: @backBordZIndex + 1;

  width: 100%;
  // height: 210px;
  background: #e7e8eb;

  &.slide {
    position: fixed;
    height: 250px;
    bottom: 0;
    left: 0;

    .keybord-keys {
      padding-bottom: 15px;
    }

    .bg-blue,
    .bg-red {
      width: 15vw;
    }
  }

  .keybord-header {
    padding: 0 15px;
    height: 40px;
    line-height: 40px;
    display: flex;
    justify-content: space-between;
    background: #f0f0f0;

    .preview {
      color: #409eff;
    }

    .new-energy {
      color: #67c23a;
    }
  }

  .keybord-keys {
    padding: 5px;
    box-sizing: border-box;

    .keybord-keys-word-wrap {
      list-style: none;
      padding: 0;
      margin: 0;
      column-count: 10;
      column-gap: 5px;
    }

    .keybord-keys-abc-wrap {
      list-style: none;
      padding: 0;
      margin: 0;
      column-count: 10;
      column-gap: 5px;
    }

    .keybord-keys-abc-wrap-short {
      list-style: none;
      padding: 0;
      margin: 0;
      column-count: 9;
      column-gap: 5px;
      padding: 0 13px;
    }

    .keybord-keys-bottom {
      display: flex;
      justify-content: space-between;

      .keybord-keys-bottom-line {
        width: 100%;
        margin: 0;
        padding: 0 5px;
        list-style: none;
        column-count: 7;
        column-gap: 5px;

        &.col-count-8 {
          column-count: 8;
        }
      }
    }
  }
}

.button {
  user-select: none;
  cursor: pointer;

  &:active {
    background: #bbbbbb;
  }

  text-align: center;
  line-height: 40px;
  height: 40px;
  border-radius: 5px;
  background: #fff;
  color: black;
  margin-bottom: 7px;
}

.bg-blue {
  color: #fff;
  background: #1989fa;
  width: 50px;

  &:active {
    background: #177ce2;
  }
}

.bg-red {
  background-color: #f56c6c;
  width: 50px;
  color: #fff;

  &:active {
    background: #f77575;
  }
}

.big-button {
  &:active {
    background: #177ce2;
  }

  width: 15vw;
  height: 40px;
  background: #1989fa;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  color: white;

  .icon-delete {
    font-size: 20px;
  }
}

.keybordSlide-enter-active,
.keybordSlide-leave-active {
  transition: all 0.2s linear;
  transform: translateY(0px);
}

.keybordSlide-enter,
.keybordSlide-leave-to {
  transform: translateY(250px);
}</style>
