<template>
  <section class="faq-section">
    <div class="faq-container">
      <div class="faq-header">
        <h2 class="fade-in-up">Frequently Asked Questions</h2>
        <p class="fade-in-up delay-1">Get answers to common questions about Invisio</p>
      </div>

      <div class="faq-grid">
        <div class="faq-list">
          <div 
            v-for="(faq, index) in faqs" 
            :key="index"
            class="faq-item fade-in-up"
            :class="`delay-${Math.min(index + 2, 6)}`"
          >
            <div 
              class="faq-question"
              @click="toggleFaq(index)"
              :class="{ active: activeFaq === index }"
            >
              <h3>{{ faq.question }}</h3>
              <div class="faq-icon">
                <svg 
                  class="chevron"
                  :class="{ rotated: activeFaq === index }"
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  stroke-width="2"
                >
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
              </div>
            </div>
            
            <transition name="slide-fade">
              <div v-if="activeFaq === index" class="faq-answer">
                <p>{{ faq.answer }}</p>
              </div>
            </transition>
          </div>
        </div>

        <div class="faq-image fade-in-up delay-3">
          <div class="image-placeholder">
            <svg width="300" height="300" viewBox="0 0 300 300" class="floating-icon">
              <defs>
                <linearGradient id="questionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#052f56;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
                </linearGradient>
              </defs>
              <circle cx="150" cy="150" r="120" fill="url(#questionGradient)" opacity="0.1"/>
              <circle cx="150" cy="150" r="80" fill="url(#questionGradient)" opacity="0.2"/>
              <text x="150" y="170" text-anchor="middle" font-size="60" fill="url(#questionGradient)" font-weight="bold">?</text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface FAQ {
  question: string
  answer: string
}

const activeFaq = ref<number | null>(null)

const faqs = ref<FAQ[]>([
  {
    question: "What is Invisio?",
    answer: "Invisio is a comprehensive GST billing software designed specifically for small businesses in Pakistan. It helps you track sales, manage inventory, generate invoices, and maintain financial records effortlessly."
  },
  {
    question: "What about data security?",
    answer: "Your data security is our top priority. We use bank-level encryption, secure cloud storage, and regular automated backups to ensure your business data is always safe and accessible."
  },
  {
    question: "Do you provide customer support?",
    answer: "Yes, we provide 24/7 customer support via chat, email, and phone. Our dedicated support team is always ready to help you with any questions or technical issues you might encounter."
  },
  {
    question: "Is there a free trial available?",
    answer: "Yes! We offer a 30-day free trial with full access to all features. No credit card required. You can explore all functionalities and see how Vyapar Clone can benefit your business."
  }
])

const toggleFaq = (index: number): void => {
  activeFaq.value = activeFaq.value === index ? null : index
}
</script>

<style lang="scss" scoped>
.faq-section {
  padding: 6rem 0;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 70% 20%, rgba(37, 99, 235, 0.05) 0%, transparent 50%),
                radial-gradient(circle at 20% 80%, rgba(5, 47, 86, 0.03) 0%, transparent 50%);
    pointer-events: none;
  }
}

.faq-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
}

.faq-header {
  text-align: center;
  margin-bottom: 4rem;

  h2 {
    font-size: 3rem;
    font-weight: 800;
    color: #052f56;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #052f56 0%, #2563eb 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;

    @media (max-width: 768px) {
      font-size: 2.2rem;
    }

    @media (max-width: 480px) {
      font-size: 1.8rem;
    }
  }

  p {
    font-size: 1.2rem;
    color: #64748b;
    max-width: 600px;
    margin: 0 auto;

    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }
}

.faq-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 4rem;
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.faq-item {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    border-color: rgba(37, 99, 235, 0.2);
  }
}

.faq-question {
  padding: 2rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  background: transparent;

  &:hover, &.active {
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(5, 47, 86, 0.02) 100%);
  }

  h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: #052f56;
    margin: 0;
    line-height: 1.4;

    @media (max-width: 768px) {
      font-size: 1.1rem;
    }
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
}

.faq-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb 0%, #052f56 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  .chevron {
    color: white;
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

    &.rotated {
      transform: rotate(180deg);
    }
  }

  .faq-question.active & {
    background: linear-gradient(135deg, #052f56 0%, #2563eb 100%);
    transform: scale(1.1);
  }
}

.faq-answer {
  padding: 0 2rem 2rem 2rem;
  border-top: 1px solid rgba(226, 232, 240, 0.5);
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.5) 0%, rgba(241, 245, 249, 0.3) 100%);

  p {
    color: #64748b;
    line-height: 1.7;
    margin: 1rem 0 0 0;
    font-size: 1rem;
  }

  @media (max-width: 768px) {
    padding: 0 1.5rem 1.5rem 1.5rem;
  }
}

.faq-image {
  display: flex;
  justify-content: center;
  align-items: center;
  position: sticky;
  top: 2rem;

  @media (max-width: 1024px) {
    position: relative;
    top: 0;
  }
}

.image-placeholder {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(5, 47, 86, 0.05) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(from 0deg, transparent, rgba(37, 99, 235, 0.1), transparent);
    animation: rotate 20s linear infinite;
  }

  @media (max-width: 480px) {
    width: 250px;
    height: 250px;
  }
}

.floating-icon {
  position: relative;
  z-index: 2;
  animation: float-gentle 6s ease-in-out infinite;
}

// Slide fade transition
.slide-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0.085, 0.68, 0.53);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-20px);
  max-height: 0;
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 200px;
}

// Keyframe animations
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes float-gentle {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-10px) scale(1.02); }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Animation classes
.fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
  opacity: 0;
}

// Animation delays
.delay-1 { animation-delay: 0.2s; }
.delay-2 { animation-delay: 0.4s; }
.delay-3 { animation-delay: 0.6s; }
.delay-4 { animation-delay: 0.8s; }
.delay-5 { animation-delay: 1s; }
.delay-6 { animation-delay: 1.2s; }
</style>