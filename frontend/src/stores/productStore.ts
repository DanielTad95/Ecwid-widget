import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchProducts, exportProductsToFile } from '@/utils/ecwidApi'

export interface Product {
  id: number
  name: string
  sku?: string
  price?: number
  quantity?: number
  enabled: boolean
  image?: string
  description?: string
  url?: string
  updated?: string
}

export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchProductsData = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await fetchProducts()
      products.value = data
    } catch (err) {
      error.value = 'Failed to fetch products'
      console.error('Error fetching products:', err)
    } finally {
      loading.value = false
    }
  }

  const exportProducts = async (productIds: number[], format: 'csv' | 'xlsx') => {
    try {
      const selectedProducts = products.value.filter(p => productIds.includes(p.id))
      await exportProductsToFile(selectedProducts, format)
    } catch (err) {
      error.value = 'Failed to export products'
      console.error('Error exporting products:', err)
      throw err
    }
  }

  const getRecentProducts = (count: number = 6): Product[] => {
    return [...products.value]
      .sort((a, b) => {
        if (!a.updated || !b.updated) return 0
        return new Date(b.updated).getTime() - new Date(a.updated).getTime()
      })
      .slice(0, count)
  }

  return {
    products,
    loading,
    error,
    fetchProducts: fetchProductsData,
    exportProducts,
    getRecentProducts,
  }
})
