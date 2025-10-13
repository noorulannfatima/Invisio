<template>
  <section class="contact">
    <div class="container">
      <div class="contact-header">
        <h2>Get in Touch</h2>
        <p>Ready to streamline your business? Contact us today!</p>
      </div>
      
      <div class="contact-content">
        <div class="contact-info">
          <div class="info-item">
            <div class="icon">📧</div>
            <div>
              <h3>Email</h3>
              <p>support@vyaparclone.com</p>
            </div>
          </div>
          
          <div class="info-item">
            <div class="icon">📞</div>
            <div>
              <h3>Phone</h3>
              <p>+91 98765 43210</p>
            </div>
          </div>
          
          <div class="info-item">
            <div class="icon">📍</div>
            <div>
              <h3>Address</h3>
              <p>Mumbai, Maharashtra, India</p>
            </div>
          </div>
        </div>
        
        <div class="contact-form">
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <input 
                v-model="form.name" 
                type="text" 
                placeholder="Your Name" 
                required
              >
            </div>
            
            <div class="form-group">
              <input 
                v-model="form.email" 
                type="email" 
                placeholder="Your Email" 
                required
              >
            </div>
            
            <div class="form-group">
              <input 
                v-model="form.phone" 
                type="tel" 
                placeholder="Phone Number"
              >
            </div>
            
            <div class="form-group">
              <textarea 
                v-model="form.message" 
                placeholder="Your Message" 
                rows="5" 
                required
              ></textarea>
            </div>
            
            <button type="submit" class="submit-btn">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

interface ContactForm {
  name: string
  email: string
  phone: string
  message: string
}

const form = reactive<ContactForm>({
  name: '',
  email: '',
  phone: '',
  message: ''
})

const handleSubmit = (): void => {
  // Handle form submission logic here
  console.log('Form submitted:', form)
  // Reset form after submission
  Object.assign(form, { name: '', email: '', phone: '', message: '' })
}
</script>

<style lang="scss" scoped>
.contact {
  background: #f8fafc;
  padding: 5rem 0;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .contact-header {
    text-align: center;
    margin-bottom: 3rem;

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

  .contact-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: start;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 3rem;
    }
  }

  .contact-info {
    .info-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);

      .icon {
        font-size: 2rem;
        margin-right: 1rem;
        margin-top: 0.2rem;
      }

      h3 {
        font-size: 1.2rem;
        font-weight: 600;
        color: #2d3748;
        margin-bottom: 0.5rem;
      }

      p {
        color: #718096;
        margin: 0;
      }
    }
  }

  .contact-form {
    background: #fff;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);

    .form-group {
      margin-bottom: 1.5rem;

      input, textarea {
        width: 100%;
        padding: 1rem;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        font-size: 1rem;
        transition: all 0.2s ease;

        &:focus {
          outline: none;
          border-color: #3182ce;
          box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
        }

        &::placeholder {
          color: #a0aec0;
        }
      }

      textarea {
        resize: vertical;
        min-height: 120px;
      }
    }

    .submit-btn {
      width: 100%;
      background: #3182ce;
      color: #fff;
      padding: 1rem 2rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: #2c5aa0;
        transform: translateY(-1px);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }
}
</style>