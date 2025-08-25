import axios from 'axios'
import type { Product } from '@/stores/productStore'

const ECWID_STORE_ID = import.meta.env.VITE_ECWID_STORE_ID || '101560752'
const ECWID_TOKEN = import.meta.env.VITE_ECWID_PUBLIC_TOKEN || 'public_ie55a1cQU472c1GBmeBqAVpL1ks3LFpu'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

// Create axios instance for Ecwid API
const ecwidApi = axios.create({
  baseURL: `https://app.ecwid.com/api/v3/${ECWID_STORE_ID}`,
  params: {
    token: ECWID_TOKEN,
  },
})

// Create axios instance for our backend API
const backendApi = axios.create({
  baseURL: API_BASE_URL,
})

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    // First, try to get products from our backend (which might have cached/processed data)
    const backendResponse = await backendApi.get('/api/products')
    return backendResponse.data
  } catch (backendError) {
    console.warn('Backend API failed, falling back to direct Ecwid API:', backendError)
    
    // Fallback to direct Ecwid API
    try {
      const response = await ecwidApi.get('/products', {
        params: {
          limit: 100,
          enabled: true,
        },
      })
      
      const ecwidProducts = response.data.items || []
      
      // Transform Ecwid products to our format
      return ecwidProducts.map((product: any): Product => ({
        id: product.id,
        name: product.name || 'Untitled Product',
        sku: product.sku,
        price: product.price,
        quantity: product.quantity,
        enabled: product.enabled,
        image: product.thumbnailUrl || product.originalImageUrl,
        description: product.description,
        url: product.url,
        updated: product.updated,
      }))
    } catch (ecwidError) {
      console.error('Failed to fetch from Ecwid API:', ecwidError)
      throw new Error('Failed to fetch products from both backend and Ecwid API')
    }
  }
}

export const fetchRecentProducts = async (count: number = 6): Promise<Product[]> => {
  try {
    const response = await backendApi.get(`/api/products/recent?count=${count}`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch recent products:', error)
    // Fallback: fetch all products and sort by update date
    const allProducts = await fetchProducts()
    return allProducts
      .filter(p => p.updated)
      .sort((a, b) => new Date(b.updated!).getTime() - new Date(a.updated!).getTime())
      .slice(0, count)
  }
}

export const exportProductsToFile = async (products: Product[], format: 'csv' | 'xlsx'): Promise<void> => {
  try {
    const response = await backendApi.post('/api/products/export', {
      products,
      format,
    }, {
      responseType: 'blob',
    })
    
    // Create download link
    const blob = new Blob([response.data], {
      type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `products.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Export failed:', error)
    throw new Error('Failed to export products')
  }
}

// Function to get store information
export const fetchStoreInfo = async () => {
  try {
    const response = await ecwidApi.get('/profile')
    return response.data
  } catch (error) {
    console.error('Failed to fetch store info:', error)
    throw error
  }
}

// Function to search products with filters
export const searchProducts = async (params: {
  keyword?: string
  category?: number
  priceFrom?: number
  priceTo?: number
  limit?: number
  offset?: number
}) => {
  try {
    const response = await ecwidApi.get('/products', {
      params: {
        ...params,
        enabled: true,
      },
    })
    return response.data
  } catch (error) {
    console.error('Failed to search products:', error)
    throw error
  }
}
