<template>
  <div class="settings-page">
    <!-- Header -->
    <header class="header">
      <div class="container">
        <nav class="navbar">
          <div class="logo">
            <h2>Widget Settings</h2>
          </div>
          <div class="nav-links">
            <router-link to="/" class="nav-link">← Back to Store</router-link>
          </div>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <div class="container">
        <!-- Tabs Navigation -->
        <div class="tabs-navigation">
          <button 
            @click="activeTab = 'settings'" 
            :class="{ active: activeTab === 'settings' }"
            class="tab-btn"
          >
            ⚙️ Настройки
          </button>
          <button 
            @click="activeTab = 'analytics'" 
            :class="{ active: activeTab === 'analytics' }"
            class="tab-btn"
          >
            📊 Аналитика
          </button>
        </div>

        <!-- Settings Tab -->
        <div v-if="activeTab === 'settings'" class="tab-content">
        <!-- App Description -->
        <section class="app-description card">
          <div class="card-header">
            <h2 class="card-title">Recently Updated Products Widget</h2>
          </div>
          <div class="description-content">
            <p>
              This widget displays the most recently updated products on your store's cart page. 
              Customers can view product details, add items to their cart, and navigate to product pages directly from the widget.
            </p>
            <div class="features-list">
              <h4>Features:</h4>
              <ul>
                <li>✅ Display N most recently updated products</li>
                <li>✅ Add products to cart with "Buy" buttons</li>
                <li>✅ Click product name/image to view details</li>
                <li>✅ Customizable number of displayed products</li>
                <li>✅ Track widget purchases in order details</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- Widget Toggle -->
        <section class="widget-toggle card">
          <div class="card-header">
            <h3 class="card-title">Widget Status</h3>
          </div>
          <div class="toggle-content">
            <ToggleSwitch
              v-model="settings.enabled"
              @change="updateSettings"
              :description="settings.enabled 
                ? 'The Recently Updated Products widget is currently active on your cart page.' 
                : 'Enable this setting to show the widget on your cart page.'"
            >
              {{ settings.enabled ? 'Widget Enabled' : 'Widget Disabled' }}
            </ToggleSwitch>
          </div>
        </section>

        <!-- Product Count Settings -->
        <section class="product-count card">
          <div class="card-header">
            <h3 class="card-title">Display Settings</h3>
          </div>
          <div class="count-content">
            <div class="form-group">
              <label for="productCount" class="form-label">Default Number of Products</label>
              <select 
                id="productCount" 
                v-model="settings.defaultProductCount" 
                @change="updateSettings"
                class="form-control"
              >
                <option value="3">3 products</option>
                <option value="6">6 products</option>
                <option value="9">9 products</option>
                <option value="12">12 products</option>
                <option value="15">15 products</option>
              </select>
            </div>
            <p class="count-description">
              Set the default number of products to display in the widget. 
              Customers can still change this using the dropdown in the widget.
            </p>
            
            <!-- Sync Settings -->
            <div class="sync-settings">
              <button 
                @click="syncSettings" 
                :disabled="syncing"
                class="btn-primary sync-btn"
              >
                <span v-if="syncing" class="loading"></span>
                <span v-else class="sync-icon">🔄</span>
                {{ syncing ? 'Syncing...' : 'Sync Settings to Widget' }}
              </button>
              <p class="sync-description">
                Force synchronization of settings to all active widgets. 
                Use this if the widget doesn't reflect your changes immediately.
              </p>
            </div>
          </div>
        </section>

        <!-- Export Section -->
        <section class="export-section card">
          <div class="card-header">
            <h3 class="card-title">Export Catalog</h3>
          </div>
          <div class="export-content">
            <p class="export-description">
              Export your product catalog to CSV or XLSX format. Select the products you want to include in the export.
            </p>

            <!-- Export Controls -->
            <div class="export-controls">
              <button 
                @click="loadProducts" 
                :disabled="loading" 
                class="btn-secondary"
              >
                <span v-if="loading" class="loading"></span>
                {{ loading ? 'Loading...' : 'Refresh Products' }}
              </button>
            </div>

            <!-- Export Component -->
            <ExportComponent
              v-if="products.length > 0"
              :products="products"
              v-model:selectedProductIds="selectedProducts"
              @export="exportSelected"
            />

            <!-- Loading State -->
            <div v-else-if="loading" class="loading-state">
              <div class="loading large"></div>
              <p>Loading products...</p>
            </div>

            <!-- Empty State -->
            <div v-else class="empty-state">
              <p>No products found. Click "Refresh Products" to load your catalog.</p>
            </div>
          </div>
        </section>
        </div>

        <!-- Analytics Tab -->
        <div v-if="activeTab === 'analytics'" class="tab-content">
          <AnalyticsComponent />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProductStore } from '@/stores/productStore'
import { useSettingsStore } from '@/stores/settingsStore'
import ToggleSwitch from '@/components/ToggleSwitch.vue'
import ExportComponent from '@/components/ExportComponent.vue'
import AnalyticsComponent from '@/components/AnalyticsComponent.vue'

// Stores
const productStore = useProductStore()
const settingsStore = useSettingsStore()

// Reactive data
const activeTab = ref('settings')
const loading = ref(false)
const syncing = ref(false)
const selectedProducts = ref<number[]>([])

// Computed properties
const products = computed(() => productStore.products)
const settings = computed({
  get: () => settingsStore.settings,
  set: (value) => settingsStore.updateSettings(value)
})

// Methods
const loadProducts = async () => {
  loading.value = true
  try {
    await productStore.fetchProducts()
  } catch (error) {
    console.error('Failed to load products:', error)
  } finally {
    loading.value = false
  }
}

const updateSettings = async () => {
  try {
    // Ensure correct data types before saving
    const settingsToSave = {
      enabled: Boolean(settings.value.enabled),
      defaultProductCount: Number(settings.value.defaultProductCount)
    }
    
    console.log('Saving settings:', settingsToSave)
    
    // Update the store with correct types
    settingsStore.updateSettings(settingsToSave)
    
    // Save to backend
    await settingsStore.saveSettings()
    
    console.log('Settings saved successfully')
  } catch (error) {
    console.error('Failed to update settings:', error)
  }
}

const syncSettings = async () => {
  syncing.value = true
  try {
    // First save current settings
    await settingsStore.saveSettings()
    
    // Force reload settings from server
    await settingsStore.loadSettings()
    
    // Simple approach: trigger global refresh
    const event = new CustomEvent('widget-settings-updated', {
      detail: settingsStore.settings
    })
    window.dispatchEvent(event)
    
    // Also try calling global sync function if available
    if ((window as any).recentlyUpdatedWidgetSync) {
      (window as any).recentlyUpdatedWidgetSync()
    }
    
    console.log('Settings synchronized successfully')
    alert('Settings synchronized successfully! The widget should update within 30 seconds or immediately if the page is refreshed.')
    
  } catch (error) {
    console.error('Failed to sync settings:', error)
    alert('Failed to sync settings. Please try again.')
  } finally {
    syncing.value = false
  }
}

const exportSelected = async (productIds: number[], format: 'csv' | 'xlsx') => {
  try {
    await productStore.exportProducts(productIds, format)
  } catch (error) {
    console.error('Export failed:', error)
  }
}

// Initialize
onMounted(async () => {
  await settingsStore.loadSettings()
  await loadProducts()
})
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
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

.nav-link {
  text-decoration: none;
  color: #495057;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #4a90e2;
}

.main-content {
  padding: 2rem 0;
}

/* App Description */
.app-description {
  margin-bottom: 2rem;
}

.description-content p {
  font-size: 16px;
  line-height: 1.6;
  color: #495057;
  margin-bottom: 1.5rem;
}

.features-list h4 {
  margin-bottom: 1rem;
  color: #212529;
}

.features-list ul {
  list-style: none;
  padding: 0;
}

.features-list li {
  padding: 0.5rem 0;
  color: #495057;
}

/* Widget Toggle */
.toggle-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  font-weight: 500;
}

.toggle-input {
  display: none;
}

.toggle-slider {
  position: relative;
  width: 50px;
  height: 26px;
  background: #ccc;
  border-radius: 26px;
  transition: background 0.2s;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
}

.toggle-input:checked + .toggle-slider {
  background: #4a90e2;
}

.toggle-input:checked + .toggle-slider::before {
  transform: translateX(24px);
}

.toggle-description {
  color: #6c757d;
  font-size: 14px;
}

/* Product Count */
.count-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.count-description {
  color: #6c757d;
  font-size: 14px;
}

/* Export Section */
.export-description {
  margin-bottom: 2rem;
  color: #495057;
  line-height: 1.6;
}

.export-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.export-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.export-buttons {
  display: flex;
  gap: 0.5rem;
}

.selection-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 14px;
  color: #495057;
}

.btn-link {
  background: none;
  border: none;
  color: #4a90e2;
  cursor: pointer;
  font-size: 14px;
  text-decoration: underline;
}

.btn-link:hover {
  color: #357abd;
}

/* Products Table */
.products-table-container {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.products-table {
  margin-bottom: 0;
}

.products-table th {
  background: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
  white-space: nowrap;
}

.products-table td {
  vertical-align: middle;
}

.product-thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.no-image {
  width: 50px;
  height: 50px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #6c757d;
  border-radius: 4px;
}

.product-name {
  font-weight: 500;
  color: #212529;
}

.product-price {
  font-weight: 600;
  color: #28a745;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status.enabled {
  background: #d4edda;
  color: #155724;
}

.status.disabled {
  background: #f8d7da;
  color: #721c24;
}

/* Loading and Empty States */
.loading-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.loading.large {
  width: 40px;
  height: 40px;
  border-width: 4px;
  margin-bottom: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .export-controls {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .export-actions {
    flex-direction: column;
  }
  
  .export-buttons {
    width: 100%;
  }
  
  .export-buttons button {
    flex: 1;
  }
  
  .products-table-container {
    font-size: 14px;
  }
  
  .product-thumbnail,
  .no-image {
    width: 40px;
    height: 40px;
  }
}

/* Sync Settings */
.sync-settings {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e0e0;
}

.sync-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 0.75rem;
}

.sync-btn:hover:not(:disabled) {
  background: #357abd;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.3);
}

.sync-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.sync-icon {
  font-size: 1.1em;
  animation: rotate 2s linear infinite;
}

.sync-btn:not(:disabled):hover .sync-icon {
  animation-duration: 0.5s;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.sync-description {
  font-size: 0.875rem;
  color: #6c757d;
  margin: 0;
  line-height: 1.4;
}

/* Tabs Styling */
.tabs-navigation {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0;
}

.tab-btn {
  background: none;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  color: #6c757d;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  position: relative;
  bottom: -2px;
}

.tab-btn:hover {
  color: #007bff;
  background: #f8f9fa;
}

.tab-btn.active {
  color: #007bff;
  border-bottom-color: #007bff;
  background: #f8f9fa;
}

.tab-content {
  min-height: 400px;
}
</style>
