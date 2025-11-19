<template>
  <div class="brain">
    <h1 class="brain__title">Your business brain — powered by AI.</h1>

    <div class="brain__chat-box">
      <div
        v-for="(msg, i) in messages"
        :key="i"
        :class="['brain__message', msg.sender === 'You' ? 'user' : 'ai']"
      >
        <strong>{{ msg.sender }}:</strong>
        <span>{{ msg.text }}</span>
      </div>
    </div>

    <form class="brain__form" @submit.prevent="sendMessage">
      <input
        v-model="userMessage"
        placeholder="Ask something..."
        class="brain__input"
      />
      <button type="submit" class="brain__btn">Send</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

interface Message {
  sender: string;
  text: string;
}

export default defineComponent({
  name: "Brain",
  setup() {
    const userMessage = ref<string>("");
    const messages = ref<Message[]>([]);

    const sendMessage = async () => {
      if (!userMessage.value.trim()) return;

      const userMsg = userMessage.value;
      messages.value.push({ sender: "You", text: userMsg });
      userMessage.value = "";

      try {
        const res = await fetch("http://localhost:3000/api/ai/chat", {
          method: "POST",
          body: JSON.stringify({ message: userMsg }),
        });

        const data = await res.json();
        messages.value.push({ sender: "AI", text: data.reply });
      } catch (err) {
        console.error("AI Error:", err);
        messages.value.push({ sender: "AI", text: "Error getting response." });
      }
    };

    return { userMessage, messages, sendMessage };
  },
});
</script>

<style lang="scss" scoped>
.brain {
  max-width: 700px;
  margin-left: 260px;
  margin-top: 70px;
  margin-right: auto;
  text-align: center;
  font-family: "Inter", sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: calc(100% - 260px);
  box-sizing: border-box;

  @media (max-width: 1024px) {
    margin-left: 80px;
    width: calc(100% - 80px);
  }

  @media (max-width: 768px) {
    margin-left: 80px;
    width: calc(100% - 80px);
    padding: 1.5rem;
  }

  @media (max-width: 480px) {
    margin-left: 70px;
    width: calc(100% - 70px);
    padding: 1rem;
  }

  &__title {
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #2c3e50;
  }

  &__chat-box {
    background: #f7f9fc;
    padding: 1rem;
    border-radius: 12px;
    width: 100%;
    height: 400px;
    overflow-y: auto;
    margin-bottom: 1rem;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  }

  &__message {
    margin: 0.5rem 0;
    text-align: left;
    padding: 0.6rem 0.8rem;
    border-radius: 8px;
    display: inline-block;
    max-width: 80%;
    word-wrap: break-word;

    &.user {
      background-color: #d1ecf1;
      align-self: flex-end;
      margin-left: auto;
      color: #0c5460;
    }

    &.ai {
      background-color: #e2e3e5;
      color: #383d41;
      align-self: flex-start;
      margin-right: auto;
    }
  }

  &__form {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  &__input {
    flex: 1;
    padding: 0.6rem;
    border-radius: 8px;
    border: 1px solid #ccc;
    font-size: 1rem;
    outline: none;

    &:focus {
      border-color: #3498db;
    }
  }

  &__btn {
    padding: 0.6rem 1.2rem;
    margin-left: 0.5rem;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.3s;

    &:hover {
      background-color: #2980b9;
    }
  }
}
</style>
