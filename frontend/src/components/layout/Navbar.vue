<template>
  <header class="navbar">
    <nav class="navbar-container">
      <!-- Left: Logo -->
      <div class="logo">
        <router-link to="/" class="logo-link" @click="closeMenu">
          Invisio
        </router-link>
      </div>

      <!-- Hamburger (Mobile only) -->
      <button 
        class="hamburger" 
        @click="toggleMenu"
        :class="{ active: isOpen }"
        aria-label="Toggle navigation menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <!-- Center: Links -->
      <ul class="nav-links" :class="{ open: isOpen }">
        <li>
          <a href="#home" @click.prevent="scrollToSection('home')" :class="{ active: activeSection === 'home' }">
            Home
          </a>
        </li>
        <li>
          <a href="#features" @click.prevent="scrollToSection('features')" :class="{ active: activeSection === 'features' }">
            Features
          </a>
        </li>
        <li>
          <a href="#faq" @click.prevent="scrollToSection('faq')" :class="{ active: activeSection === 'faq' }">
            FAQs
          </a>
        </li>
        <li>
          <a href="#contact" @click.prevent="scrollToSection('contact')" :class="{ active: activeSection === 'contact' }">
            Contact
          </a>
        </li>

        <!-- Authenticated Mobile Links -->
        <template v-if="authStore.isAuthenticated">
          <li class="mobile-only">
            <router-link to="/dashboard" @click="closeMenu" class="dashboard-link">
              Dashboard
            </router-link>
          </li>
          <li class="mobile-only">
            <button @click="handleLogout" class="mobile-auth-link logout">
              Logout
            </button>
          </li>
        </template>

        <!-- Unauthenticated Mobile Links -->
        <template v-else>
          <li class="mobile-only">
            <router-link to="/register" @click="closeMenu" class="mobile-auth-link register">
              Register
            </router-link>
          </li>
          <li class="mobile-only">
            <router-link to="/login" @click="closeMenu" class="mobile-auth-link login">
              Login
            </router-link>
          </li>
        </template>
      </ul>

      <!-- Right: Auth Buttons -->
      <div class="auth-buttons">
        <!-- Authenticated User -->
        <template v-if="authStore.isAuthenticated">
          <router-link to="/dashboard" class="dashboard-btn">
            Dashboard
          </router-link>
          <button @click="handleLogout" class="logout-btn">
            Logout
          </button>
        </template>

        <!-- Unauthenticated User -->
        <template v-else>
          <router-link to="/register" class="register-btn">
            Register
          </router-link>
          <router-link to="/login" class="login-btn">
            Login
          </router-link>
        </template>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isOpen = ref(false)
const activeSection = ref('home')

const toggleMenu = (): void => {
  isOpen.value = !isOpen.value
}

const closeMenu = (): void => {
  isOpen.value = false
}

const handleLogout = async (): Promise<void> => {
  try {
    await authStore.logout()
    closeMenu()
    router.push('/')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

const scrollToSection = (sectionId: string): void => {
  closeMenu()
  
  if (route.path !== '/') {
    // Navigate to home first, then scroll
    router.push('/').then(() => {
      // Wait for DOM to be fully rendered and Vue to update
      setTimeout(() => {
        scrollToElement(sectionId)
      }, 300)
    })
  } else {
    scrollToElement(sectionId)
  }
}

const scrollToElement = (sectionId: string): void => {
  // Find element by ID
  const element = document.getElementById(sectionId)
  
  if (element) {
    const offsetTop = element.offsetTop - 80
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    })
    // Update active section immediately
    activeSection.value = sectionId
  }
}

const updateActiveSection = (): void => {
  if (route.path !== '/') {
    activeSection.value = ''
    return
  }

  const sections = ['home', 'features', 'faq', 'contact']
  const scrollPosition = window.scrollY + 150

  for (let i = sections.length - 1; i >= 0; i--) {
    const element = document.getElementById(sections[i])
    if (element && scrollPosition >= element.offsetTop) {
      activeSection.value = sections[i]
      return
    }
  }
  
  // Default to home if at the top
  activeSection.value = 'home'
}

const handleScroll = (): void => {
  updateActiveSection()
}

const handleClickOutside = (event: Event): void => {
  const navbar = document.querySelector('.navbar')
  if (navbar && !navbar.contains(event.target as Node) && isOpen.value) {
    closeMenu()
  }
}

watch(() => route.path, () => {
  closeMenu()
  if (route.path === '/') {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      updateActiveSection()
    }, 100)
  } else {
    activeSection.value = ''
  }
})

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('click', handleClickOutside)
  
  // Initial update with delay to ensure DOM is ready
  setTimeout(() => {
    updateActiveSection()
  }, 100)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="scss">
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.3);
  z-index: 1000;
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
    z-index: -1;
  }

  .navbar-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;

    @media (max-width: 768px) {
      padding: 1rem;
    }
  }

  .logo {
    cursor: pointer;
    
    .logo-link {
      font-size: 1.8rem;
      font-weight: 800;
      background: linear-gradient(135deg, #052f56 0%, #2563eb 100%);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-decoration: none;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.05);
      }

      @media (max-width: 768px) {
        font-size: 1.5rem;
      }
    }
  }

  .nav-links {
    display: flex;
    gap: 2.5rem;
    list-style: none;
    margin: 0;
    padding: 0;
    align-items: center;

    @media (max-width: 768px) {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      flex-direction: column;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px);
      padding: 2rem 0;
      gap: 1.5rem;
      text-align: center;
      transform: translateY(-100%);
      opacity: 0;
      visibility: hidden;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border-top: 1px solid rgba(226, 232, 240, 0.3);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);

      &.open {
        transform: translateY(0);
        opacity: 1;
        visibility: visible;
      }
    }

    li {
      position: relative;

      a {
        text-decoration: none;
        color: #64748b;
        font-weight: 600;
        font-size: 1rem;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        position: relative;
        display: block;
        cursor: pointer;

        &::before {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          width: 0;
          height: 2px;
          background: linear-gradient(135deg, #052f56 0%, #2563eb 100%);
          transform: translateX(-50%);
          transition: width 0.3s ease;
        }

        &:hover, &.active {
          color: #052f56;
          background: rgba(37, 99, 235, 0.08);
          transform: translateY(-1px);

          &::before {
            width: 60%;
          }
        }

        &.active {
          color: #2563eb;
          font-weight: 700;
        }

        @media (max-width: 768px) {
          padding: 1rem 2rem;
          font-size: 1.1rem;
        }
      }

      .dashboard-link, .mobile-auth-link {
        border-radius: 12px;
        padding: 0.8rem 1.5rem !important;
        font-weight: 600;
        font-size: 1rem;
        
        &::before {
          display: none;
        }
      }

      .dashboard-link {
        background: linear-gradient(135deg, #2563eb 0%, #052f56 100%);
        color: white !important;
        
        &:hover {
          background: linear-gradient(135deg, #052f56 0%, #2563eb 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
        }
      }

      .mobile-auth-link {
        border: none;
        background: none;
        cursor: pointer;
        width: 100%;
        
        &.register {
          background: transparent;
          border: 2px solid #2563eb;
          color: #2563eb !important;
          
          &:hover {
            background: #2563eb;
            color: white !important;
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
          }
        }
        
        &.login {
          background: linear-gradient(135deg, #2563eb 0%, #052f56 100%);
          color: white !important;
          
          &:hover {
            background: linear-gradient(135deg, #052f56 0%, #2563eb 100%);
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
          }
        }

        &.logout {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white !important;
          
          &:hover {
            background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
          }
        }
      }

      &.mobile-only {
        display: none;
        
        @media (max-width: 768px) {
          display: block;
          width: 80%;
          margin: 0 auto;
        }
      }
    }
  }

  .auth-buttons {
    display: flex;
    align-items: center;
    gap: 1rem;

    @media (max-width: 768px) {
      display: none;
    }

    .register-btn, .login-btn, .dashboard-btn, .logout-btn {
      padding: 0.6rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      text-decoration: none;
      display: inline-block;
      border: none;
      font-size: 1rem;
    }

    .register-btn {
      background: transparent;
      border: 2px solid #2563eb;
      color: #2563eb;

      &:hover {
        background: #2563eb;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
      }
    }

    .login-btn, .dashboard-btn {
      background: linear-gradient(135deg, #2563eb 0%, #052f56 100%);
      color: white;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.6s;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);

        &::before {
          left: 100%;
        }
      }

      &:active {
        transform: translateY(0);
      }
    }

    .logout-btn {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.6s;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);

        &::before {
          left: 100%;
        }
      }

      &:active {
        transform: translateY(0);
      }
    }
  }

  .hamburger {
    display: none;
    flex-direction: column;
    justify-content: space-around;
    width: 32px;
    height: 32px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 4px;
    z-index: 1001;

    @media (max-width: 768px) {
      display: flex;
    }

    span {
      width: 24px;
      height: 3px;
      background: #052f56;
      border-radius: 2px;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      transform-origin: center;
    }

    &.active {
      span:nth-child(1) {
        transform: rotate(45deg) translate(6px, 6px);
      }

      span:nth-child(2) {
        opacity: 0;
        transform: scale(0);
      }

      span:nth-child(3) {
        transform: rotate(-45deg) translate(6px, -6px);
      }
    }

    &:hover span {
      background: #2563eb;
    }
  }
}

:global(body) {
  padding-top: 80px;
}

:global(html) {
  scroll-behavior: smooth;
}
</style>