<template>
  <section class="features">
    <div class="container">
      <div class="features-header">
        <h2 class="fade-in-scroll">Powerful Features for Your Business</h2>
        <p class="fade-in-scroll" style="animation-delay: 0.2s">Everything you need to manage your business efficiently and grow faster</p>
      </div>

      <div class="features-grid">
        <div 
          v-for="(feature, index) in features" 
          :key="feature.id" 
          class="feature-card"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="feature-icon">{{ feature.icon }}</div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
          <ul class="feature-benefits">
            <li v-for="benefit in feature.benefits" :key="benefit">
              ✓ {{ benefit }}
            </li>
          </ul>
        </div>
      </div>

      <div class="features-cta fade-in-scroll" style="animation-delay: 0.3s">
        <h3>Ready to transform your business?</h3>
        <p>Join thousands of businesses already using our platform</p>
        <button class="cta-button">Start Free Trial</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Feature {
  id: number
  icon: string
  title: string
  description: string
  benefits: string[]
}

const features = ref<Feature[]>([
  {
    id: 1,
    icon: '🧾',
    title: 'GST Invoicing',
    description: 'Create professional GST compliant invoices in seconds',
    benefits: [
      'Auto GST calculations',
      'Multiple invoice formats',
      'Digital signatures',
      'Email & WhatsApp sharing'
    ]
  },
  {
    id: 2,
    icon: '📊',
    title: 'Business Reports',
    description: 'Comprehensive reports to track your business performance',
    benefits: [
      'Sales & profit reports',
      'Tax summary reports',
      'Customer analytics',
      'Export to Excel/PDF'
    ]
  },
  {
    id: 3,
    icon: '📦',
    title: 'Inventory Management',
    description: 'Keep track of your stock levels and never run out',
    benefits: [
      'Real-time stock updates',
      'Low stock alerts',
      'Product categorization',
      'Barcode scanning'
    ]
  },
  {
    id: 4,
    icon: '💰',
    title: 'Payment Tracking',
    description: 'Monitor all payments and outstanding amounts',
    benefits: [
      'Payment reminders',
      'Multiple payment modes',
      'Due date tracking',
      'Bank reconciliation'
    ]
  },
  {
    id: 5,
    icon: '👥',
    title: 'Customer Management',
    description: 'Maintain detailed customer profiles and history',
    benefits: [
      'Customer database',
      'Purchase history',
      'Credit limit tracking',
      'Communication logs'
    ]
  },
  {
    id: 6,
    icon: '📱',
    title: 'Mobile Access',
    description: 'Access your business data anywhere, anytime',
    benefits: [
      'Mobile responsive',
      'Offline capability',
      'Cloud sync',
      'Multi-device support'
    ]
  }
])

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view')
        observer.unobserve(entry.target)
      }
    })
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  })

  document.querySelectorAll('.feature-card, .fade-in-scroll').forEach((el) => {
    observer.observe(el)
  })
})
</script>

<style lang="scss" scoped>
.features {
  padding: 5rem 0;
  background: #fff;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .features-header {
    text-align: center;
    margin-bottom: 4rem;

    h2 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 1rem;
    }

    p {
      font-size: 1.1rem;
      color: #718096;
      max-width: 600px;
      margin: 0 auto;
    }
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
    margin-bottom: 4rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }

  .feature-card {
    background: #f8fafc;
    padding: 2rem;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    opacity: 0;
    transform: translateY(30px);

    &.in-view {
      animation: slide-up 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      border-color: #3182ce;

      .feature-icon {
        transform: scale(1.1) rotateZ(5deg);
      }
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      display: block;
      transition: transform 0.3s ease;
    }

    h3 {
      font-size: 1.4rem;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 0.8rem;
    }

    p {
      color: #718096;
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }

    .feature-benefits {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        color: #4a5568;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        opacity: 0;
        animation: fade-in-benefits 0.5s ease-out forwards;

        &:nth-child(1) { animation-delay: 0.1s; }
        &:nth-child(2) { animation-delay: 0.2s; }
        &:nth-child(3) { animation-delay: 0.3s; }
        &:nth-child(4) { animation-delay: 0.4s; }

        &::before {
          content: '✓';
          color: #38a169;
          font-weight: bold;
          margin-right: 0.5rem;
        }
      }
    }

    // Add subtle background pattern
    &::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, rgba(49, 130, 206, 0.03) 0%, transparent 70%);
      pointer-events: none;
    }
  }

  .fade-in-scroll {
    opacity: 0;
    transform: translateY(30px);

    &.in-view {
      animation: slide-up 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
  }

  .features-cta {
    text-align: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 3rem 2rem;
    border-radius: 16px;
    color: #fff;

    h3 {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    p {
      font-size: 1.1rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }

    .cta-button {
      background: #fff;
      color: #667eea;
      padding: 1rem 2rem;
      border: none;
      border-radius: 50px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        background: #f8fafc;
      }

      &:active {
        transform: translateY(0);
      }
    }
  }
}

// Keyframe animations
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in-benefits {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>