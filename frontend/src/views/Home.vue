<template>
  <div>
    <section id="home" class="hero">
      <div class="hero-container">
        <div class="hero-content">
          <h1 class="fade-in-up">Manage Your Business
Anytime, Anywhere
</h1>
          <p class="fade-in-up delay-1">Invisio makes your business simple, smart, and stress-free. Easily track sales, manage expenses, maintain ledgers, control inventory & more so you can focus on growing your business.</p>
          <button class="cta fade-in-up delay-2">Get Started</button>
        </div>
        
        <div class="hero-cards">
          <div class="card bounce-in delay-3">📊 Track Sales</div>
          <div class="card bounce-in delay-4">📦 Manage Inventory</div>
          <div class="card bounce-in delay-5">💰 GST Reports</div>
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
import Contact from '@/components/layout/Contact.vue'
import Features from '@/components/layout/Features.vue'
import Footer from '@/components/layout/Footer.vue'
import FAQ from '@/components/layout/FAQ.vue'
</script>

<style lang="scss" scoped>
.hero {
  min-height: 100vh;
  background: linear-gradient(135deg, #052f56 0%, #2563eb 50%, #63b3ed 100%);
  color: #fff;
  position: relative;
  overflow: hidden;
  
  // Add floating particles background
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
      font-size: 3.0rem;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 1.5rem;
      background: linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;

      @media (max-width: 768px) {
        font-size: 2.5rem;
      }

      @media (max-width: 480px) {
        font-size: 2rem;
      }
    }

    p {
      font-size: 1.3rem;
      line-height: 1.6;
      margin-bottom: 2rem;
      opacity: 0.9;
      max-width: 500px;

      @media (max-width: 1024px) {
        max-width: 600px;
        margin: 0 auto 2rem;
      }

      @media (max-width: 768px) {
        font-size: 1.1rem;
      }
    }

    .cta {
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      color: #052f56;
      padding: 1rem 2.5rem;
      border-radius: 50px;
      font-weight: 700;
      font-size: 1.1rem;
      cursor: pointer;
      border: none;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
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
        transform: translateY(-3px) scale(1.05);
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);

        &::before {
          left: 100%;
        }
      }

      &:active {
        transform: translateY(-1px) scale(1.02);
      }
    }
  }

  .hero-cards {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: flex-end;

    @media (max-width: 1024px) {
      flex-direction: row;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
    }

    @media (max-width: 640px) {
      flex-direction: column;
      align-items: center;
    }

    .card {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 1.8rem 2.2rem;
      border-radius: 20px;
      font-size: 1.1rem;
      font-weight: 600;
      color: #fff;
      text-align: center;
      min-width: 220px;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      &:nth-child(1) {
        transform: translateX(20px);
      }

      &:nth-child(2) {
        transform: translateX(10px);
      }

      &:nth-child(3) {
        transform: translateX(0px);
      }

      &:hover {
        transform: translateY(-8px) translateX(0) scale(1.05);
        background: rgba(255, 255, 255, 0.25);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);

        &::before {
          opacity: 1;
        }
      }

      @media (max-width: 1024px) {
        &:nth-child(1),
        &:nth-child(2),
        &:nth-child(3) {
          transform: none;
        }
      }

      @media (max-width: 480px) {
        padding: 1.5rem;
        font-size: 1rem;
        min-width: 200px;
      }
    }
  }
}

// Keyframe animations
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-30px) rotate(120deg); }
  66% { transform: translateY(-20px) rotate(240deg); }
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

@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(50px);
  }
  50% {
    opacity: 1;
    transform: scale(1.1) translateY(-10px);
  }
  70% {
    transform: scale(0.9) translateY(5px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

// Animation classes
.fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
  opacity: 0;
}

.bounce-in {
  animation: bounce-in 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  opacity: 0;
}

// Animation delays
.delay-1 { animation-delay: 0.2s; }
.delay-2 { animation-delay: 0.4s; }
.delay-3 { animation-delay: 0.6s; }
.delay-4 { animation-delay: 0.8s; }
.delay-5 { animation-delay: 1s; }
</style>