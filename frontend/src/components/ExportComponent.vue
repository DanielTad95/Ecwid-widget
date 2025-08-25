<template>
  <div class="export-component">
    <div class="export-header">
      <h3>Export Products</h3>
      <p>Select products to export and choose your preferred format.</p>
    </div>

    <div class="export-controls">
      <div class="selection-summary">
        <span class="selection-count">
          {{ selectedCount }} of {{ totalCount }} products selected
        </span>
        <button @click="toggleSelectAll" class="btn-link">
          {{ allSelected ? 'Deselect All' : 'Select All' }}
        </button>
      </div>

      <div class="export-actions">
        <button 
          @click="exportProducts('csv')" 
          :disabled="!hasSelection || isExporting"
          class="btn-secondary"
        >
          <span v-if="isExporting && exportFormat === 'csv'" class="loading"></span>
          Export CSV
        </button>
        <button 
          @click="exportProducts('xlsx')" 
          :disabled="!hasSelection || isExporting"
          class="btn-primary"
        >
          <span v-if="isExporting && exportFormat === 'xlsx'" class="loading"></span>
          Export XLSX
        </button>
      </div>
    </div>

    <div class="products-table-wrapper">
      <table class="products-table">
        <thead>
          <tr>
            <th class="checkbox-column">
              <input 
                type="checkbox" 
                :checked="allSelected"
                @change="toggleSelectAll"
                :indeterminate="someSelected"
              >
            </th>
            <th>Image</th>
            <th>Name</th>
            <th>SKU</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="product in products" 
            :key="product.id"
            :class="{ 'selected': isSelected(product.id) }"
          >
            <td class="checkbox-column">
              <input 
                type="checkbox" 
                :value="product.id"
                :checked="isSelected(product.id)"
                @change="toggleProduct(product.id)"
              >
            </td>
            <td class="image-column">
              <img 
                v-if="product.image" 
                :src="product.image" 
                :alt="product.name"
                class="product-thumbnail"
                loading="lazy"
              >
              <div v-else class="no-image">No Image</div>
            </td>
            <td class="name-column">
              <div class="product-name" :title="product.name">
                {{ product.name }}
              </div>
            </td>
            <td class="sku-column">
              <span class="sku">{{ product.sku || '-' }}</span>
            </td>
            <td class="price-column">
              <span class="price">${{ formatPrice(product.price) }}</span>
            </td>
            <td class="stock-column">
              <span class="stock">{{ product.quantity || 0 }}</span>
            </td>
            <td class="status-column">
              <span :class="['status', product.enabled ? 'enabled' : 'disabled']">
                {{ product.enabled ? 'Enabled' : 'Disabled' }}
              </span>
            </td>
            <td class="updated-column">
              <span class="updated-date">{{ formatDate(product.updated) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Export Status -->
    <div v-if="exportMessage" class="export-status" :class="exportStatus">
      {{ exportMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue'
import type { Product } from '@/stores/productStore'

interface Props {
  products: Product[]
  selectedProductIds: number[]
}

interface Emits {
  (e: 'update:selectedProductIds', value: number[]): void
  (e: 'export', productIds: number[], format: 'csv' | 'xlsx'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Reactive state
const isExporting = ref(false)
const exportFormat = ref<'csv' | 'xlsx' | null>(null)
const exportMessage = ref('')
const exportStatus = ref<'success' | 'error' | ''>('')

// Computed properties
const selectedCount = computed(() => props.selectedProductIds.length)
const totalCount = computed(() => props.products.length)
const hasSelection = computed(() => selectedCount.value > 0)
const allSelected = computed(() => 
  totalCount.value > 0 && selectedCount.value === totalCount.value
)
const someSelected = computed(() => 
  selectedCount.value > 0 && selectedCount.value < totalCount.value
)

// Methods
const isSelected = (productId: number): boolean => {
  return props.selectedProductIds.includes(productId)
}

const toggleProduct = (productId: number) => {
  const currentSelection = [...props.selectedProductIds]
  const index = currentSelection.indexOf(productId)
  
  if (index > -1) {
    currentSelection.splice(index, 1)
  } else {
    currentSelection.push(productId)
  }
  
  emit('update:selectedProductIds', currentSelection)
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    emit('update:selectedProductIds', [])
  } else {
    emit('update:selectedProductIds', props.products.map(p => p.id))
  }
}

const exportProducts = async (format: 'csv' | 'xlsx') => {
  if (!hasSelection.value || isExporting.value) return
  
  isExporting.value = true
  exportFormat.value = format
  exportMessage.value = `Exporting ${selectedCount.value} products to ${format.toUpperCase()}...`
  exportStatus.value = ''
  
  try {
    emit('export', props.selectedProductIds, format)
    
    // Simulate export delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    exportMessage.value = `Successfully exported ${selectedCount.value} products!`
    exportStatus.value = 'success'
    
    setTimeout(() => {
      exportMessage.value = ''
      exportStatus.value = ''
    }, 3000)
  } catch (error) {
    exportMessage.value = 'Export failed. Please try again.'
    exportStatus.value = 'error'
    
    setTimeout(() => {
      exportMessage.value = ''
      exportStatus.value = ''
    }, 5000)
  } finally {
    isExporting.value = false
    exportFormat.value = null
  }
}

const formatPrice = (price?: number): string => {
  return price?.toFixed(2) || '0.00'
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return '-'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  } catch {
    return '-'
  }
}
</script>

<style scoped>
.export-component {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.export-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.export-header h3 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 600;
}

.export-header p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.export-controls {
  padding: 1rem 1.5rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.selection-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.selection-count {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}

.btn-link {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

.btn-link:hover {
  color: #1d4ed8;
}

.export-actions {
  display: flex;
  gap: 0.75rem;
}

.products-table-wrapper {
  overflow-x: auto;
  max-height: 60vh;
  overflow-y: auto;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.products-table th {
  background: #f9fafb;
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.products-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.products-table tbody tr:hover {
  background: #f9fafb;
}

.products-table tbody tr.selected {
  background: #eff6ff;
}

.checkbox-column {
  width: 40px;
  text-align: center;
}

.image-column {
  width: 60px;
}

.product-thumbnail {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.no-image {
  width: 40px;
  height: 40px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  color: #9ca3af;
  text-align: center;
  line-height: 1.2;
}

.name-column {
  min-width: 200px;
  max-width: 300px;
}

.product-name {
  font-weight: 500;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sku-column {
  width: 100px;
}

.sku {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  color: #6b7280;
}

.price-column {
  width: 80px;
}

.price {
  font-weight: 600;
  color: #059669;
}

.stock-column {
  width: 60px;
  text-align: center;
}

.stock {
  color: #374151;
}

.status-column {
  width: 80px;
}

.status {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status.enabled {
  background: #d1fae5;
  color: #065f46;
}

.status.disabled {
  background: #fee2e2;
  color: #991b1b;
}

.updated-column {
  width: 100px;
}

.updated-date {
  color: #6b7280;
  font-size: 0.75rem;
}

.export-status {
  padding: 1rem 1.5rem;
  font-weight: 500;
}

.export-status.success {
  background: #d1fae5;
  color: #065f46;
  border-top: 1px solid #a7f3d0;
}

.export-status.error {
  background: #fee2e2;
  color: #991b1b;
  border-top: 1px solid #fca5a5;
}

/* Responsive design */
@media (max-width: 768px) {
  .export-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .selection-summary {
    justify-content: space-between;
  }

  .export-actions {
    width: 100%;
  }

  .export-actions button {
    flex: 1;
  }

  .products-table {
    font-size: 0.75rem;
  }

  .products-table th,
  .products-table td {
    padding: 0.5rem;
  }

  .product-thumbnail,
  .no-image {
    width: 30px;
    height: 30px;
  }
}
</style>
