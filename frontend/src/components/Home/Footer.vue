<!-- Footer.vue -->
<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <!-- Brand Section -->
        <div class="footer-section brand-section">
          <div class="logo">
            <i class="fas fa-cube"></i>
            <h3>Invisio</h3>
          </div>
          <p class="brand-description">
            Smart GST Billing Software designed for small businesses in Pakistan. 
            Simplify your business operations with our comprehensive solution.
          </p>
          <div class="social-links">
            <a href="#" class="social-link" aria-label="Facebook" title="Facebook">
              <i class="fab fa-facebook-f"></i>
            </a>
            <a href="#" class="social-link" aria-label="Twitter" title="Twitter">
              <i class="fab fa-twitter"></i>
            </a>
            <a href="#" class="social-link" aria-label="LinkedIn" title="LinkedIn">
              <i class="fab fa-linkedin-in"></i>
            </a>
            <a href="#" class="social-link" aria-label="Instagram" title="Instagram">
              <i class="fab fa-instagram"></i>
            </a>
          </div>
        </div>

        <!-- Product Links -->
        <div class="footer-section">
          <h4><i class="fas fa-cube"></i> Product</h4>
          <ul class="footer-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#templates">Invoice Templates</a></li>
            <li><a href="#integrations">Integrations</a></li>
            <li><a href="#mobile-app">Mobile App</a></li>
          </ul>
        </div>

        <!-- Resources Links -->
        <div class="footer-section">
          <h4><i class="fas fa-book"></i> Resources</h4>
          <ul class="footer-links">
            <li><a href="#blog">Blog</a></li>
            <li><a href="#help-center">Help Center</a></li>
            <li><a href="#tutorials">Tutorials</a></li>
            <li><a href="#gst-guide">GST Guide</a></li>
            <li><a href="#webinars">Webinars</a></li>
          </ul>
        </div>

        <!-- Company Links -->
        <div class="footer-section">
          <h4><i class="fas fa-building"></i> Company</h4>
          <ul class="footer-links">
            <li><a href="#about">About Us</a></li>
            <li><a href="#careers">Careers</a></li>
            <li><a href="#press">Press</a></li>
            <li><a href="#partners">Partners</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div class="footer-section">
          <h4><i class="fas fa-headset"></i> Support</h4>
          <div class="contact-info">
            <div class="contact-item">
              <i class="fas fa-envelope"></i>
              <span>support@invisio.pk</span>
            </div>
            <div class="contact-item">
              <i class="fas fa-phone"></i>
              <span>+92 (300) 123-4567</span>
            </div>
            <div class="contact-item">
              <i class="fas fa-map-marker-alt"></i>
              <span>Gujranwala, Punjab</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Newsletter Subscription -->
      <div class="newsletter-section">
        <div class="newsletter-content">
          <h4>
            <i class="fas fa-bell"></i>
            Stay Updated
          </h4>
          <p>Get the latest updates on GST changes, new features, and business tips.</p>
        </div>
        <form @submit.prevent="subscribeNewsletter" class="newsletter-form">
          <input 
            v-model="email" 
            type="email" 
            placeholder="Enter your email" 
            required
            class="newsletter-input"
          >
          <button type="submit" class="newsletter-btn">
            <i class="fas fa-paper-plane"></i>
            Subscribe
          </button>
        </form>
      </div>

      <!-- Footer Bottom -->
      <div class="footer-bottom">
        <div class="footer-bottom-content">
          <div class="copyright">
            <p>&copy; {{ currentYear }} Invisio. All rights reserved. Made in Pakistan 🇵🇰</p>
          </div>
          <div class="legal-links">
            <a href="#privacy">
              <i class="fas fa-shield-alt"></i>
              Privacy Policy
            </a>
            <a href="#terms">
              <i class="fas fa-file-contract"></i>
              Terms of Service
            </a>
            <a href="#cookies">
              <i class="fas fa-cookie"></i>
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const email = ref<string>('')

const currentYear = computed(() => new Date().getFullYear())

const subscribeNewsletter = (): void => {
  console.log('Newsletter subscription:', email.value)
  email.value = ''
}
</script>

<style lang="scss" scoped>
.footer {
  background: linear-gradient(180deg, #1a202c 0%, #0f1419 100%);
  color: #cbd5e0;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .footer-content {
    display: grid;
    grid-template-columns: 2fr repeat(4, 1fr);
    gap: 3rem;
    padding: 4rem 0 2rem;

    @media (max-width: 1024px) {
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
    }

    @media (max-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
      gap: 2rem;
    }

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
  }

  .footer-section {
    &.brand-section {
      @media (max-width: 1024px) {
        grid-column: 1 / -1;
        margin-bottom: 1rem;
      }

      @media (max-width: 768px) {
        grid-column: 1 / -1;
      }

      .logo {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1rem;

        i {
          font-size: 1.8rem;
          color: #667eea;
        }

        h3 {
          color: #fff;
          font-size: 1.6rem;
          font-weight: 700;
          margin: 0;
        }
      }

      .brand-description {
        line-height: 1.6;
        margin-bottom: 1.5rem;
        color: #a0aec0;
        font-size: 0.95rem;
      }

      .social-links {
        display: flex;
        gap: 1rem;

        .social-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(102, 126, 234, 0.15);
          border: 1px solid rgba(102, 126, 234, 0.3);
          border-radius: 50%;
          text-decoration: none;
          font-size: 1.1rem;
          color: #667eea;
          transition: all 0.3s ease;

          &:hover {
            background: #667eea;
            color: #fff;
            transform: translateY(-3px);
            border-color: #667eea;
          }
        }
      }
    }

    h4 {
      color: #fff;
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      i {
        color: #667eea;
        font-size: 0.95rem;
      }

      @media (max-width: 480px) {
        font-size: 0.95rem;
      }
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        margin-bottom: 0.8rem;

        a {
          color: #a0aec0;
          text-decoration: none;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;

          &:hover {
            color: #667eea;
            transform: translateX(4px);
          }
        }
      }
    }

    .contact-info {
      .contact-item {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        margin-bottom: 1rem;
        color: #a0aec0;
        font-size: 0.9rem;

        i {
          color: #667eea;
          width: 20px;
          text-align: center;
        }

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  .newsletter-section {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    border: 1px solid rgba(102, 126, 234, 0.2);
    border-radius: 12px;
    padding: 2rem;
    margin: 2rem 0;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 2rem;
    align-items: center;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 1.5rem;
      text-align: center;
      padding: 1.5rem;
    }

    .newsletter-content {
      h4 {
        color: #fff;
        font-size: 1.2rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;

        @media (max-width: 768px) {
          justify-content: center;
        }
      }

      p {
        color: #a0aec0;
        margin: 0;
        font-size: 0.9rem;
      }
    }

    .newsletter-form {
      display: flex;
      gap: 0.8rem;
      min-width: 350px;

      @media (max-width: 1024px) {
        min-width: 300px;
      }

      @media (max-width: 768px) {
        min-width: auto;
        width: 100%;
      }

      @media (max-width: 480px) {
        flex-direction: column;
        gap: 0.75rem;
      }

      .newsletter-input {
        flex: 1;
        padding: 0.8rem 1rem;
        border: 1px solid rgba(102, 126, 234, 0.3);
        border-radius: 8px;
        background: rgba(26, 32, 44, 0.8);
        color: #fff;
        font-size: 0.9rem;
        transition: all 0.3s ease;

        &:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          background: rgba(26, 32, 44, 1);
        }

        &::placeholder {
          color: #718096;
        }
      }

      .newsletter-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
        padding: 0.8rem 1.5rem;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        white-space: nowrap;

        @media (max-width: 480px) {
          justify-content: center;
          width: 100%;
        }

        &:hover {
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }

        &:active {
          transform: translateY(0);
        }

        i {
          font-size: 0.85rem;
        }
      }
    }
  }

  .footer-bottom {
    border-top: 1px solid rgba(102, 126, 234, 0.2);
    padding: 1.5rem 0;

    .footer-bottom-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;

      @media (max-width: 768px) {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .copyright {
        p {
          margin: 0;
          color: #718096;
          font-size: 0.9rem;

          @media (max-width: 480px) {
            font-size: 0.85rem;
          }
        }
      }

      .legal-links {
        display: flex;
        gap: 2rem;

        @media (max-width: 768px) {
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        @media (max-width: 480px) {
          gap: 0.75rem;
          flex-direction: column;
        }

        a {
          color: #718096;
          text-decoration: none;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;

          i {
            font-size: 0.85rem;
          }

          &:hover {
            color: #667eea;
            transform: translateX(2px);
          }

          @media (max-width: 480px) {
            font-size: 0.85rem;
          }
        }
      }
    }
  }
}
</style>