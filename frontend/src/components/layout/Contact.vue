<!-- Contact.vue -->
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
            <div class="icon">
              <i class="fas fa-envelope"></i>
            </div>
            <div class="info-text">
              <h3>Email</h3>
              <p>support@invisio.pk</p>
            </div>
          </div>
          
          <div class="info-item">
            <div class="icon">
              <i class="fas fa-phone"></i>
            </div>
            <div class="info-text">
              <h3>Phone</h3>
              <p>+92 (300) 123-4567</p>
            </div>
          </div>
          
          <div class="info-item">
            <div class="icon">
              <i class="fas fa-map-marker-alt"></i>
            </div>
            <div class="info-text">
              <h3>Address</h3>
              <p>Gujranwala, Punjab, Pakistan</p>
            </div>
          </div>

          <div class="info-item">
            <div class="icon">
              <i class="fas fa-clock"></i>
            </div>
            <div class="info-text">
              <h3>Business Hours</h3>
              <p>Mon - Fri: 9:00 AM - 6:00 PM</p>
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

            <div v-if="submitMessage" :class="['submit-message', { success: submitSuccess }]">
              {{ submitMessage }}
            </div>
            
            <button type="submit" class="submit-btn" :disabled="isSubmitting">
              <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
              <span>{{ isSubmitting ? 'Sending...' : 'Send Message' }}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const form = reactive<ContactForm>({
  name: '',
  email: '',
  phone: '',
  message: ''
})

const isSubmitting = ref(false)
const submitMessage = ref('')
const submitSuccess = ref(false)

const handleSubmit = async (): Promise<void> => {
  isSubmitting.value = true
  submitMessage.value = ''
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    console.log('Form submitted:', form)
    submitSuccess.value = true
    submitMessage.value = 'Thank you! We will contact you soon.'
    
    Object.assign(form, { name: '', email: '', phone: '', message: '' })
    
    setTimeout(() => {
      submitMessage.value = ''
    }, 3000)
  } catch (error) {
    submitSuccess.value = false
    submitMessage.value = 'Error sending message. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.contact {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  padding: 6rem 2rem;

  @media (max-width: 768px) {
    padding: 4rem 1.5rem;
  }

  @media (max-width: 480px) {
    padding: 3rem 1rem;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .contact-header {
    text-align: center;
    margin-bottom: 4rem;

    h2 {
      font-size: 2.5rem;
      font-weight: 800;
      color: #2d3748;
      margin-bottom: 1rem;

      @media (max-width: 768px) {
        font-size: 2rem;
      }

      @media (max-width: 480px) {
        font-size: 1.5rem;
      }
    }

    p {
      font-size: 1.2rem;
      color: #718096;
      max-width: 600px;
      margin: 0 auto;

      @media (max-width: 768px) {
        font-size: 1rem;
      }

      @media (max-width: 480px) {
        font-size: 0.9rem;
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

    @media (max-width: 480px) {
      gap: 2rem;
    }
  }

  .contact-info {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    .info-item {
      display: flex;
      align-items: flex-start;
      gap: 1.5rem;
      padding: 2rem;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
      transition: all 0.3s ease;

      @media (max-width: 480px) {
        padding: 1.5rem;
        gap: 1rem;
      }

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 30px rgba(102, 126, 234, 0.12);
        border-color: #667eea;
      }

      .icon {
        font-size: 1.8rem;
        color: #667eea;
        flex-shrink: 0;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        @media (max-width: 480px) {
          width: 40px;
          height: 40px;
          font-size: 1.4rem;
        }
      }

      .info-text {
        flex: 1;

        h3 {
          font-size: 1.2rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 0.5rem;

          @media (max-width: 480px) {
            font-size: 1rem;
          }
        }

        p {
          color: #718096;
          margin: 0;
          font-size: 0.95rem;

          @media (max-width: 480px) {
            font-size: 0.85rem;
          }
        }
      }
    }
  }

  .contact-form {
    background: #fff;
    padding: 2.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    border: 1px solid #e2e8f0;

    @media (max-width: 768px) {
      padding: 2rem;
    }

    @media (max-width: 480px) {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;

      @media (max-width: 480px) {
        margin-bottom: 1rem;
      }

      input,
      textarea {
        width: 100%;
        padding: 1rem 1.2rem;
        border: 2px solid #e2e8f0;
        border-radius: 10px;
        font-size: 1rem;
        transition: all 0.3s ease;
        font-family: inherit;

        @media (max-width: 480px) {
          padding: 0.85rem 1rem;
          font-size: 0.95rem;
        }

        &:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        &::placeholder {
          color: #a0aec0;
        }
      }

      textarea {
        resize: vertical;
        min-height: 140px;

        @media (max-width: 480px) {
          min-height: 120px;
        }
      }
    }

    .submit-message {
      margin-bottom: 1rem;
      padding: 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
      text-align: center;

      &.success {
        background: #c6f6d5;
        color: #22543d;
        border: 1px solid #9ae6b4;
      }

      &:not(.success) {
        background: #fed7d7;
        color: #742a2a;
        border: 1px solid #fc8181;
      }
    }

    .submit-btn {
      width: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      padding: 1.1rem 2rem;
      border: none;
      border-radius: 10px;
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;

      @media (max-width: 480px) {
        padding: 0.9rem 1.5rem;
        font-size: 1rem;
      }

      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      i {
        font-size: 1rem;
      }
    }
  }
}
</style>