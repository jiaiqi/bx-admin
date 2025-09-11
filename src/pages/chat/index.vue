<template>
  <div class="container">
    <!-- 客服聊天窗口 -->
    <div class="chat-window">
      <!-- 聊天头部 -->
      <div class="chat-header">
        <div class="avatar">
          <Icon icon="ri:customer-service-2-fill" />
        </div>
        <div class="header-info">
          <div class="header-title">到延安去，智能助手</div>
          <div class="header-subtitle">在线为您服务</div>
        </div>
        <div class="header-actions">
          <button class="clear-btn" @click="clearChat">
            <Icon icon="ri:refresh-line" />
          </button>
        </div>
      </div>
      
      <!-- 聊天内容区域 -->
      <div class="chat-container" ref="chatContainer">
        <!-- 欢迎消息 -->
        <div class="message-wrapper assistant">
          <div class="avatar">
            <Icon icon="ri:robot-2-fill" />
          </div>
          <div class="message-bubble assistant-bubble">
            <div>您好！请问有什么可以帮助您的？</div>
          </div>
        </div>
        
        <!-- 动态消息列表 -->
        <div v-for="(message, index) in messages" :key="'msg-' + index" class="message-wrapper" :class="message.sender" :id="'msg-' + index">
          <div class="avatar" v-if="message.sender === 'assistant'">
            <Icon icon="ri:robot-2-fill" />
          </div>
          <div class="message-bubble" :class="message.sender + '-bubble'">
            <div>{{ message.text }}</div>
          </div>
          <div class="avatar" v-if="message.sender === 'user'">
            <Icon icon="ri:user-line" />
          </div>
        </div>
        
        <!-- 正在输入指示器 -->
        <div v-if="isTyping" class="message-wrapper assistant">
          <div class="avatar">
            <Icon icon="ri:robot-2-fill" />
          </div>
          <div class="message-bubble assistant-bubble">
            <div class="typing-indicator">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 输入区域 -->
      <div class="input-area">
        <div class="input-wrapper">
          <input 
            class="message-input"
            placeholder="请输入您的问题？"
            v-model="inputValue"
            @keypress="handleKeyPress"
            :disabled="isRequesting"
            type="text"
          />
          <button 
            class="send-btn"
            :class="{ disabled: isRequesting }"
            @click="sendMessage"
            :disabled="isRequesting"
          >
            <Icon icon="ri:send-plane-fill" />
          </button>
        </div>
        <div class="quick-questions">
          <span class="quick-label">常见问题：</span>
          <span class="quick-link" @click="fillQuestion('适合年龄')">适合年龄</span>
          <span class="quick-sep"> · </span>
          <span class="quick-link" @click="fillQuestion('行程安排')">行程安排</span>
          <span class="quick-sep"> · </span>
          <span class="quick-link" @click="fillQuestion('预约方式')">预约方式</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 关键配置（已配置API Key和APP ID）
const API_KEY = process.env.VUE_APP_DASHSCOPE_API_KEY || "sk-cc24ecc61a7940d19b9eb90a1becd2e7"; // DashScope API Key
const APP_ID = process.env.VUE_APP_DASHSCOPE_APP_ID || "549e30c3c77648e4a2dff71c434d2647"; // 百炼应用ID（已关联样例库）
const API_URL = `https://dashscope.aliyuncs.com/api/v1/apps/${APP_ID}/completion`;
import { Icon } from "@iconify/vue2";

export default {
  name: 'ChatPage',
  components: {
    Icon
  },
  data() {
    return {
      // 聊天相关数据
      messages: [], // 消息列表
      inputValue: '', // 输入框内容
      isRequesting: false, // 是否正在请求
      isTyping: false, // 是否显示正在输入
      
      // 多轮会话
      sessionId: null, // 会话ID
    }
  },
  
  mounted() {
    console.log('聊天页面加载');
    // 确保输入框可以正常使用
    this.inputValue = '';
  },

  methods: {
    // 发送消息
    async sendMessage() {
      const userText = this.inputValue.trim();
      if (!userText || this.isRequesting) return;

      // 显示用户消息
      this.addMessage(userText, 'user');
      
      // 清空输入框
      this.inputValue = '';
      this.isRequesting = true;
      this.isTyping = true;

      try {
        // 构造请求参数
        const requestBody = {
          input: {
            prompt: userText,
            ...(this.sessionId && { session_id: this.sessionId })
          },
          parameters: {
            max_tokens: 2048,
            temperature: 0.2
          }
        };

        // 调用百炼接口
        console.log('发送请求到:', API_URL);
        console.log('请求参数:', requestBody);
        
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
        
        console.log('接口响应状态:', response.status);

        // 隐藏正在输入状态
        this.isTyping = false;

        if (!response.ok) {
          throw new Error(`接口请求失败 [${response.status}]: 请检查API_KEY和APP_ID是否有效`);
        }

        const result = await response.json();
        console.log('接口响应数据:', result);
        
        // 更新会话ID
        if (result.output?.session_id) {
          this.sessionId = result.output.session_id;
        }

        // 显示客服回复
        const assistantText = result.output?.text || '抱歉，暂时无法回答您的问题，请换个角度提问~';
        this.addMessage(assistantText, 'assistant');

      } catch (error) {
        console.error('多轮会话请求错误:', error);
        
        // 隐藏正在输入状态
        this.isTyping = false;
        
        // 显示错误信息
        this.addMessage(`服务异常：${error.message}`, 'assistant');
      } finally {
        // 重置请求状态
        this.isRequesting = false;
      }
    },

    // 添加消息到聊天列表
    addMessage(text, sender) {
      this.messages.push({
        text: text,
        sender: sender,
        timestamp: Date.now()
      });

      // 滚动到底部
      this.scrollToBottom();
    },

    // 滚动到底部
    scrollToBottom() {
      this.$nextTick(() => {
        this.$refs.chatContainer.scrollTop = this.$refs.chatContainer.scrollHeight;
      });
    },

    // 清空聊天记录
    clearChat() {
      if (confirm('确定要清空所有聊天记录吗？')) {
        this.messages = [];
        this.sessionId = null;
      }
    },

    // 快速填充问题
    fillQuestion(question) {
      this.inputValue = question;
      this.sendMessage();
    },

    // 处理键盘事件
    handleKeyPress(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    }
  }
}
</script>

<style scoped>
/* 页面容器 */
.container {
  background-color: #f9fafb;
  min-height: 100vh;
  padding: 32px;
  box-sizing: border-box;
  max-width: 1400px;
  margin: 0 auto;
}

/* 聊天窗口 */
.chat-window {
  background-color: white;
  border-radius: 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #f3f4f6;
}

/* 聊天头部 */
.chat-header {
  background-color: #FD6E58;
  color: white;
  padding: 32px;
  display: flex;
  align-items: center;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24px;
  flex-shrink: 0;
}

.avatar .iconify {
  font-size: 32px;
}

.header-info {
  flex: 1;
}

.header-title {
  font-weight: 600;
  font-size: 32px;
  display: block;
  margin: 0;
}

.header-subtitle {
  font-size: 24px;
  opacity: 0.8;
  display: block;
  margin-top: 4px;
  margin: 0;
}

.header-actions {
  margin-left: auto;
}

.clear-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  padding: 16px;
  border-radius: 50%;
  transition: all 0.3s;
  cursor: pointer;
}

.clear-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.clear-btn .iconify {
  font-size: 32px;
}

/* 聊天内容区域 */
.chat-container {
  height: 55vh;
  padding: 32px;
  box-sizing: border-box;
  overflow-y: auto;
}

.chat-container::-webkit-scrollbar {
  display: none;
}

.message-wrapper {
  display: flex;
  align-items: flex-start;
  margin-bottom: 48px;
}

.message-wrapper.user {
  justify-content: flex-end;
}

.message-wrapper.user .avatar {
  order: 2;
  margin-right: 0;
  margin-left: 24px;
  background-color: #e5e7eb;
  color: #6b7280;
}

.message-wrapper.assistant .avatar {
  background-color: rgba(201, 33, 39, 0.1);
  color: #FD6E58;
}

.message-bubble {
  max-width: 80%;
  padding: 32px;
  border-radius: 36px;
  word-wrap: break-word;
  line-height: 1.5;
}

.assistant-bubble {
  background-color: #f5f5f5;
  border-radius: 36px 36px 36px 0;
  color: #2c3e50;
}

.user-bubble {
  background-color: #FD6E58;
  color: white;
  border-radius: 36px 36px 0 36px;
}

/* 正在输入指示器 */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 16px;
  height: 16px;
  background-color: #6b7280;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) {
  animation-delay: 0s;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0% { transform: translateY(0px); }
  28% { transform: translateY(-10px); }
  44% { transform: translateY(0px); }
}

/* 输入区域 */
.input-area {
  border-top: 1px solid #f3f4f6;
  padding: 32px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.message-input {
  flex: 1;
  padding: 32px;
  border-radius: 50px;
  border: 1px solid #e5e7eb;
  font-size: 28px;
  background-color: #f9fafb;
  min-height: 120px;
  box-sizing: border-box;
  outline: none;
}

.message-input:focus {
  border-color: #FD6E58;
  background-color: white;
}

.send-btn {
  background-color: #FD6E58;
  color: white;
  padding: 24px;
  border-radius: 50%;
  border: none;
  transition: all 0.3s;
  min-width: 96px;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.send-btn:hover:not(.disabled) {
  background-color: #a01e22;
  transform: scale(0.95);
}

.send-btn.disabled {
  background-color: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
}

.send-btn .iconify {
  font-size: 32px;
}

.quick-questions {
  margin-top: 16px;
  font-size: 24px;
  color: #9ca3af;
}

.quick-label {
  color: #6b7280;
}

.quick-link {
  color: #FD6E58;
  text-decoration: underline;
  cursor: pointer;
}

.quick-link:hover {
  opacity: 0.7;
}

.quick-sep {
  color: #d1d5db;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 16px;
  }
  
  .chat-container {
    height: 50vh;
    padding: 16px;
  }
  
  .message-bubble {
    max-width: 85%;
    padding: 24px;
  }
  
  .avatar {
    width: 60px;
    height: 60px;
  }
  
  .avatar .iconify {
    font-size: 24px;
  }
  
  .header-title {
    font-size: 24px;
  }
  
  .header-subtitle {
    font-size: 18px;
  }
  
  .message-input {
    font-size: 24px;
    padding: 24px;
    min-height: 80px;
  }
  
  .send-btn {
    min-width: 80px;
    height: 80px;
  }
  
  .send-btn .iconify {
    font-size: 24px;
  }
}
</style>