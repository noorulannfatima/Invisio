<template>
  <div>
    <section id="home" class="hero">
      <div class="hero-container">
        <div class="hero-content">
          <h1 class="fade-in-up">Manage Your Business<br>Anytime, Anywhere</h1>
          <p class="fade-in-up delay-1">
            Invisio makes your business simple, smart, and stress-free. Easily track sales, 
            manage expenses, maintain ledgers, control inventory & more so you can focus on 
            growing your business.
          </p>
          <button class="cta fade-in-up delay-2" @click="handleGetStarted">
            Get Started
          </button>
        </div>
        
        <div class="hero-image">
          <img 
            src="@/assets/images/home.png" 
            alt="Invisio Dashboard" 
            class="fade-in-up delay-3" 
          />
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <div id="features">
      <Features />
    </div>

    <!-- FAQ Section -->
    <div id="faq">
      <FAQ />
    </div>

    <!-- Contact Section -->
    <div id="contact">
      <Contact />
    </div>

    <!-- Footer Section -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/authStore'
import Contact from '@/components/layout/Contact.vue'
import Features from '@/components/layout/Features.vue'
import Footer from '@/components/layout/Footer.vue'
import FAQ from '@/components/layout/FAQ.vue'

const router = useRouter()
const authStore = useAuthStore()

const handleGetStarted = (): void => {
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
  } else {
    router.push('/register')
  }
}
</script>

<style lang="scss" scoped>
.hero {
  min-height: 100vh;
  background: linear-gradient(135deg, #052f56 0%, #2563eb 50%, #63b3ed 100%);
  color: #fff;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.1) 0%, transparent 50%);
    animation: float 20s ease-in-out infinite;
  }

  .hero-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    min-height: 100vh;
    gap: 4rem;
    position: relative;
    z-index: 2;

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
      gap: 3rem;
      text-align: center;
      padding: 2rem 1rem;
    }
  }

  .hero-content {
    text-align: left;
    
    @media (max-width: 1024px) {
      text-align: center;
    }

    h1 {
      font-size: 3.5rem;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 1.5rem;
      background: linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);

      @media (max-width: 768px) {
        font-size: 2.5rem;
      }

      @media (max-width: 480px) {
        font-size: 2rem;
      }
    }

    p {
      font-size: 1.2rem;
      line-height: 1.8;
      margin-bottom: 2.5rem;
      opacity: 0.95;
      max-width: 520px;
      color: rgba(255, 255, 255, 0.95);

      @media (max-width: 1024px) {
        max-width: 600px;
        margin: 0 auto 2.5rem;
      }

      @media (max-width: 768px) {
        font-size: 1.1rem;
      }
    }

    .cta {
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      color: #052f56;
      padding: 1.1rem 3rem;
      border-radius: 50px;
      font-weight: 700;
      font-size: 1.15rem;
      cursor: pointer;
      border: none;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: 0 10px 35px rgba(0, 0, 0, 0.15);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        transition: left 0.6s;
      }

      &:hover {
        transform: translateY(-4px) scale(1.05);
        box-shadow: 0 18px 45px rgba(0, 0, 0, 0.25);

        &::before {
          left: 100%;
        }
      }

      &:active {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
      }

      @media (max-width: 768px) {
        padding: 1rem 2.5rem;
        font-size: 1.1rem;
      }
    }
  }

  .hero-image {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;

    @media (max-width: 1024px) {
      justify-content: center;
    }

    &::before {
      content: '';
      position: absolute;
      width: 120%;
      height: 120%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
      border-radius: 50%;
      animation: pulse 4s ease-in-out infinite;
      z-index: -1;
    }

    img {
      max-width: 100%;
      height: auto;
      filter: drop-shadow(0 25px 50px rgba(0, 0, 0, 0.2));
      border-radius: 24px;
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.02);
      }

      @media (max-width: 768px) {
        max-width: 90%;
      }
    }
  }
}

@keyframes float {
  0%, 100% { 
    transform: translateY(0px) rotate(0deg); 
  }
  33% { 
    transform: translateY(-30px) rotate(120deg); 
  }
  66% { 
    transform: translateY(-20px) rotate(240deg); 
  }
}

@keyframes pulse {
  0%, 100% { 
    transform: scale(1);
    opacity: 0.3;
  }
  50% { 
    transform: scale(1.1);
    opacity: 0.5;
  }
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

.fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
  opacity: 0;
}

.delay-1 { animation-delay: 0.2s; }
.delay-2 { animation-delay: 0.4s; }
.delay-3 { animation-delay: 0.6s; }
</style>