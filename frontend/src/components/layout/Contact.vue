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
              <p>support@invisio.com</p>
            </div>
          </div>
          
          <div class="info-item">
            <div class="icon">📞</div>
            <div>
              <h3>Phone</h3>
              <p>+92 300 1234567</p>
            </div>
          </div>
          
          <div class="info-item">
            <div class="icon">📍</div>
            <div>
              <h3>Address</h3>
              <p>Gujranwala, Punjab, Pakistan</p>
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
  alert('Thank you for contacting Invisio! We will get back to you soon.')
  // Reset form after submission
  Object.assign(form, { name: '', email: '', phone: '', message: '' })
}
</script>

<style lang="scss" scoped>
.contact {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  padding: 6rem 0;

  @media (max-width: 768px) {
    padding: 4rem 0;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .contact-header {
    text-align: center;
    margin-bottom: 4rem;

    h2 {
      font-size: 2.5rem;
      font-weight: 800;
      color: #052f56;
      margin-bottom: 1rem;

      @media (max-width: 768px) {
        font-size: 2rem;
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

  .contact-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: start;

    @media (max-width: 968px) {
      grid-template-columns: 1fr;
      gap: 3rem;
    }
  }

  .contact-info {
    .info-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 2rem;
      padding: 2rem;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 30px rgba(37, 99, 235, 0.12);
        border-color: #2563eb;
      }

      .icon {
        font-size: 2.5rem;
        margin-right: 1.5rem;
        margin-top: 0.2rem;
      }

      h3 {
        font-size: 1.3rem;
        font-weight: 700;
        color: #052f56;
        margin-bottom: 0.5rem;
      }

      p {
        color: #64748b;
        margin: 0;
        font-size: 1rem;
      }
    }
  }

  .contact-form {
    background: #fff;
    padding: 2.5rem;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid #e2e8f0;

    @media (max-width: 768px) {
      padding: 2rem;
    }

    .form-group {
      margin-bottom: 1.5rem;

      input, textarea {
        width: 100%;
        padding: 1rem 1.2rem;
        border: 2px solid #e2e8f0;
        border-radius: 10px;
        font-size: 1rem;
        transition: all 0.3s ease;
        font-family: inherit;

        &:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }

        &::placeholder {
          color: #94a3b8;
        }
      }

      textarea {
        resize: vertical;
        min-height: 140px;
      }
    }

    .submit-btn {
      width: 100%;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #fff;
      padding: 1.1rem 2rem;
      border: none;
      border-radius: 10px;
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);

      &:hover {
        background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }
}
</style>