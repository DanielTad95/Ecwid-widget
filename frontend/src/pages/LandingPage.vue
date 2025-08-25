<template>
  <div class="landing-page">
    <!-- Header -->
    <header class="header">
      <div class="container">
        <nav class="navbar">
          <div class="logo">
            <h2>My Ecwid Store</h2>
          </div>
          <div class="nav-links">
            <router-link to="/settings" class="nav-link">Settings</router-link>
          </div>
        </nav>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1>Welcome to Our Amazing Store</h1>
          <p>Discover the best products with our custom Ecwid integration</p>
          <button @click="scrollToStore" class="btn-primary btn-large">
            Shop Now
          </button>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <h2 class="section-title">Why Choose Us</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🛍️</div>
            <h3>Easy Shopping</h3>
            <p>Browse and purchase products with our intuitive interface</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🚀</div>
            <h3>Fast Delivery</h3>
            <p>Quick and reliable shipping to your doorstep</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💰</div>
            <h3>Best Prices</h3>
            <p>Competitive pricing on all our products</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Ecwid Store Section -->
    <section id="store-section" class="store-section">
      <div class="container">
        <h2 class="section-title">Our Products</h2>
        <div class="store-container">
          <!-- Ecwid Store will be embedded here -->
          <div id="my-store-101560752"></div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h4>About Us</h4>
            <p>We are a demo store showcasing Ecwid custom widget functionality.</p>
          </div>
          <div class="footer-section">
            <h4>Contact</h4>
            <p>Email: info@example.com</p>
            <p>Phone: +1 (555) 123-4567</p>
          </div>
          <div class="footer-section">
            <h4>Follow Us</h4>
            <div class="social-links">
              <a href="#" class="social-link">Facebook</a>
              <a href="#" class="social-link">Twitter</a>
              <a href="#" class="social-link">Instagram</a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2025 My Ecwid Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

// Initialize Ecwid store when component mounts
onMounted(() => {
  // Initialize Ecwid store
  if (typeof window !== 'undefined' && (window as any).xProductBrowser) {
    (window as any).xProductBrowser("id=my-store-101560752")
  }
  
  // Load the custom widget script
  loadCustomWidget()
})

const scrollToStore = () => {
  const storeSection = document.getElementById('store-section')
  if (storeSection) {
    storeSection.scrollIntoView({ behavior: 'smooth' })
  }
}

const loadCustomWidget = () => {
  // Load custom widget script according to Ecwid documentation
  // Step 2: Connect a self-hosted JS file with the app
  const script = document.createElement('script')
  script.src = 'http://localhost:3002/recently-updated.js'
  script.async = true
  script.onload = () => {
    console.log('Recently Updated Widget script loaded successfully')
  }
  script.onerror = () => {
    console.error('Failed to load Recently Updated Widget script')
  }
  document.head.appendChild(script)
}
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
}

.header {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
}

.logo h2 {
  color: #4a90e2;
  font-weight: 700;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: #495057;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #4a90e2;
}

.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 100px 0;
  text-align: center;
}

.hero-content h1 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.hero-content p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.btn-large {
  padding: 16px 32px;
  font-size: 18px;
}

.features {
  padding: 80px 0;
  background: #f8f9fa;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 3rem;
  color: #212529;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #212529;
}

.feature-card p {
  color: #6c757d;
  line-height: 1.6;
}

.store-section {
  padding: 80px 0;
  background: white;
}

.store-container {
  margin-top: 2rem;
}

.footer {
  background: #212529;
  color: white;
  padding: 60px 0 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h4 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.footer-section p {
  color: #adb5bd;
  margin-bottom: 0.5rem;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  color: #adb5bd;
  text-decoration: none;
  transition: color 0.2s;
}

.social-link:hover {
  color: white;
}

.footer-bottom {
  border-top: 1px solid #495057;
  padding-top: 1rem;
  text-align: center;
  color: #adb5bd;
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2rem;
  }
  
  .hero-content p {
    font-size: 1rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .navbar {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
