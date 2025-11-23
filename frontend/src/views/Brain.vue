<template>
  <div class="brain-container">
    <div class="brain">
      <header class="brain__header">
        <h1 class="brain__title">Invisio Brain</h1>
        <p class="brain__subtitle">Your AI-powered business assistant</p>
      </header>

      <div class="brain__chat-area" ref="chatContainer">
        <div
          v-for="(msg, i) in messages"
          :key="i"
          :class="['brain__message', msg.sender === 'You' ? 'user' : 'ai']"
        >
          <div class="brain__message-content">
            <strong class="brain__sender">{{ msg.sender }}</strong>
            <span class="brain__text" v-html="formatMessage(msg.text)"></span>
          </div>
        </div>
        <div v-if="isLoading" class="brain__message ai loading">
          <div class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>

      <div class="brain__input-area">
        <form class="brain__form" @submit.prevent="sendMessage">
          <input
            v-model="userMessage"
            placeholder="Ask anything about your business..."
            class="brain__input"
            :disabled="isLoading"
          />
          <button type="submit" class="brain__btn" :disabled="isLoading || !userMessage.trim()">
            <span v-if="!isLoading">Send</span>
            <span v-else>...</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, nextTick, watch } from "vue";

interface Message {
  sender: string;
  text: string;
}

export default defineComponent({
  name: "Brain",
  setup() {
    const userMessage = ref<string>("");
    const messages = ref<Message[]>([]);
    const isLoading = ref(false);
    const chatContainer = ref<HTMLElement | null>(null);

    const scrollToBottom = async () => {
      await nextTick();
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
      }
    };

    // Simple formatter to handle newlines
    const formatMessage = (text: string) => {
      return text.replace(/\n/g, '<br>');
    };

    const sendMessage = async () => {
      if (!userMessage.value.trim() || isLoading.value) return;

      const userMsg = userMessage.value;
      messages.value.push({ sender: "You", text: userMsg });
      userMessage.value = "";
      isLoading.value = true;
      scrollToBottom();

      try {
        const res = await fetch("http://localhost:3000/api/ai/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: userMsg }),
        });

        const data = await res.json();
        if (data.error) {
           messages.value.push({ sender: "AI", text: `Error: ${data.error}` });
        } else {
           messages.value.push({ sender: "AI", text: data.reply });
        }
      } catch (err) {
        console.error("AI Error:", err);
        messages.value.push({ sender: "AI", text: "Sorry, I encountered an error connecting to the server." });
      } finally {
        isLoading.value = false;
        scrollToBottom();
      }
    };

    return { userMessage, messages, sendMessage, isLoading, chatContainer, formatMessage };
  },
});
</script>

<style lang="scss" scoped>
.brain-container {
  display: flex;
  justify-content: center;
  background-color: #121212; /* Dark background */
  min-height: 100vh;
  // width: 100%; // Removed to prevent overflow with margin-left
  margin-left: 260px; /* Sidebar width */
  padding-left: 0;
  box-sizing: border-box;
  color: #e0e0e0;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 1024px) {
    margin-left: 80px;
  }
  
  @media (max-width: 768px) {
    margin-left: 80px;
    padding: 1.5rem;
  }
  @media (max-width: 480px) {
    margin-left: 70px;
    padding: 1rem;
    margin-top: 40px;
  }
}

.brain {
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;

  &__header {
    padding: 2rem 1rem 1rem;
    text-align: center;
    border-bottom: 1px solid #333;
  }

  &__title {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  &__subtitle {
    color: #888;
    margin-top: 0.5rem;
    font-size: 0.9rem;
  }

  &__chat-area {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    scroll-behavior: smooth;

    /* Custom Scrollbar */
    &::-webkit-scrollbar {
      width: 8px;
    }
    &::-webkit-scrollbar-track {
      background: #1e1e1e;
    }
    &::-webkit-scrollbar-thumb {
      background: #444;
      border-radius: 4px;
    }
  }

  &__message {
    display: flex;
    flex-direction: column;
    max-width: 80%;
    animation: fadeIn 0.3s ease;

    &.user {
      align-self: flex-end;
      align-items: flex-end;

      .brain__message-content {
        background: linear-gradient(135deg, #0061ff 0%, #60efff 100%);
        color: #000;
        border-bottom-right-radius: 2px;
      }
      
      .brain__sender {
        display: none;
      }
    }

    &.ai {
      align-self: flex-start;
      align-items: flex-start;

      .brain__message-content {
        background-color: #2c2c2c;
        color: #e0e0e0;
        border-bottom-left-radius: 2px;
        border: 1px solid #333;
      }
      
      .brain__sender {
        color: #4facfe;
        margin-bottom: 4px;
        display: block;
        font-size: 0.8rem;
      }
    }
  }

  &__message-content {
    padding: 12px 16px;
    border-radius: 18px;
    font-size: 1rem;
    line-height: 1.5;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    word-wrap: break-word;
  }

  &__input-area {
    padding: 1.5rem;
    background-color: #121212;
    border-top: 1px solid #333;
  }

  &__form {
    display: flex;
    gap: 10px;
    background: #1e1e1e;
    padding: 8px;
    border-radius: 30px;
    border: 1px solid #333;
    transition: border-color 0.3s;

    &:focus-within {
      border-color: #4facfe;
    }
  }

  &__input {
    flex: 1;
    background: transparent;
    border: none;
    color: #fff;
    padding: 10px 15px;
    font-size: 1rem;
    outline: none;

    &::placeholder {
      color: #666;
    }
  }

  &__btn {
    background: #4facfe;
    color: #000;
    border: none;
    padding: 10px 24px;
    border-radius: 24px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, opacity 0.2s;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      background: #00f2fe;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 4px 8px;
  
  span {
    width: 6px;
    height: 6px;
    background: #888;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;
    
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
  }
}

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
