<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <!-- Brand Section -->
        <div class="footer-section brand-section">
          <div class="logo">
            <h3>Vyapar Clone</h3>
          </div>
          <p class="brand-description">
            Smart GST Billing Software designed specifically for small businesses in India. 
            Simplify your business operations with our comprehensive solution.
          </p>
          <div class="social-links">
            <a href="#" class="social-link" aria-label="Facebook">📘</a>
            <a href="#" class="social-link" aria-label="Twitter">🐦</a>
            <a href="#" class="social-link" aria-label="LinkedIn">💼</a>
            <a href="#" class="social-link" aria-label="Instagram">📷</a>
          </div>
        </div>

        <!-- Product Links -->
        <div class="footer-section">
          <h4>Product</h4>
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
          <h4>Resources</h4>
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
          <h4>Company</h4>
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
          <h4>Get in Touch</h4>
          <div class="contact-info">
            <div class="contact-item">
              <span class="contact-icon">📧</span>
              <span>support@vyaparclone.com</span>
            </div>
            <div class="contact-item">
              <span class="contact-icon">📞</span>
              <span>+91 98765 43210</span>
            </div>
            <div class="contact-item">
              <span class="contact-icon">📍</span>
              <span>Mumbai, Maharashtra, India</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Newsletter Subscription -->
      <div class="newsletter-section">
        <div class="newsletter-content">
          <h4>Stay Updated</h4>
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
          <button type="submit" class="newsletter-btn">Subscribe</button>
        </form>
      </div>

      <!-- Footer Bottom -->
      <div class="footer-bottom">
        <div class="footer-bottom-content">
          <div class="copyright">
            <p>&copy; {{ currentYear }} Vyapar Clone. All rights reserved.</p>
          </div>
          <div class="legal-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#cookies">Cookie Policy</a>
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
  // Handle newsletter subscription logic here
  console.log('Newsletter subscription:', email.value)
  // Reset email after subscription
  email.value = ''
  // You could show a success message here
}
</script>

<style lang="scss" scoped>
.footer {
  background: #1a202c;
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
    }

    .logo h3 {
      color: #63b3ed;
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }

    .brand-description {
      line-height: 1.6;
      margin-bottom: 1.5rem;
      color: #a0aec0;
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
        background: #2d3748;
        border-radius: 50%;
        text-decoration: none;
        font-size: 1.2rem;
        transition: all 0.3s ease;

        &:hover {
          background: #63b3ed;
          transform: translateY(-2px);
        }
      }
    }

    h4 {
      color: #fff;
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 1rem;
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
          transition: color 0.3s ease;

          &:hover {
            color: #63b3ed;
          }
        }
      }
    }

    .contact-info {
      .contact-item {
        display: flex;
        align-items: center;
        margin-bottom: 1rem;
        color: #a0aec0;

        .contact-icon {
          margin-right: 0.8rem;
          font-size: 1.1rem;
        }
      }
    }
  }

  .newsletter-section {
    background: #2d3748;
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
    }

    .newsletter-content {
      h4 {
        color: #fff;
        font-size: 1.3rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
      }

      p {
        color: #a0aec0;
        margin: 0;
      }
    }

    .newsletter-form {
      display: flex;
      gap: 1rem;
      min-width: 300px;

      @media (max-width: 768px) {
        min-width: auto;
        width: 100%;
      }

      @media (max-width: 480px) {
        flex-direction: column;
        gap: 0.8rem;
      }

      .newsletter-input {
        flex: 1;
        padding: 0.8rem 1rem;
        border: 1px solid #4a5568;
        border-radius: 8px;
        background: #1a202c;
        color: #fff;
        font-size: 0.9rem;

        &:focus {
          outline: none;
          border-color: #63b3ed;
          box-shadow: 0 0 0 3px rgba(99, 179, 237, 0.1);
        }

        &::placeholder {
          color: #718096;
        }
      }

      .newsletter-btn {
        background: #63b3ed;
        color: #fff;
        padding: 0.8rem 1.5rem;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        white-space: nowrap;

        &:hover {
          background: #3182ce;
          transform: translateY(-1px);
        }
      }
    }
  }

  .footer-bottom {
    border-top: 1px solid #2d3748;
    padding: 1.5rem 0;

    .footer-bottom-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      @media (max-width: 768px) {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .copyright p {
        margin: 0;
        color: #718096;
        font-size: 0.9rem;
      }

      .legal-links {
        display: flex;
        gap: 2rem;

        @media (max-width: 480px) {
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        a {
          color: #718096;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.3s ease;

          &:hover {
            color: #63b3ed;
          }
        }
      }
    }
  }
}
</style>