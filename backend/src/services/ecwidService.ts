import axios, { AxiosResponse } from 'axios';
import NodeCache from 'node-cache';

interface EcwidProduct {
  id: number;
  name: string;
  description?: string;
  price: number;
  compareToPrice?: number;
  sku?: string;
  thumbnailUrl?: string;
  url?: string;
  created?: string;
  updated?: string;
  enabled?: boolean;
  inStock?: boolean;
  categoryIds?: number[];
}

interface EcwidProductsResponse {
  total: number;
  count: number;
  offset: number;
  limit: number;
  items: EcwidProduct[];
}

class EcwidService {
  private cache: NodeCache;
  private storeId: string;
  private publicToken: string;
  private baseURL: string;

  constructor() {
    this.cache = new NodeCache({ stdTTL: 300 }); // 5 минут кэш
    this.storeId = process.env['ECWID_STORE_ID'] || '101560752';
    this.publicToken = process.env['ECWID_PUBLIC_TOKEN'] || 'public_ie55a1cQU472c1GBmeBqAVpL1ks3LFpu';
    this.baseURL = `https://app.ecwid.com/api/v3/${this.storeId}`;
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axios.get(`${this.baseURL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${this.publicToken}`
        },
        params: {
          ...params,
          enabled: true
        },
        timeout: 10000
      });

      return response.data;
    } catch (error: any) {
      console.error(`Failed to fetch from Ecwid API: ${endpoint}`, error.response?.data || error.message);
      throw new Error(`Failed to fetch data from Ecwid API`);
    }
  }

  async getProducts(limit: number = 100, offset: number = 0): Promise<EcwidProduct[]> {
    const cacheKey = `products_${limit}_${offset}`;
    const cached = this.cache.get<EcwidProduct[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await this.makeRequest<EcwidProductsResponse>('/products', {
        limit,
        offset
      });

      const products = response.items || [];
      this.cache.set(cacheKey, products);
      return products;
    } catch (error) {
      console.error('Failed to get products:', error);
      throw error;
    }
  }

  async getRecentProducts(count: number = 6): Promise<EcwidProduct[]> {
    const cacheKey = `recent_products_${count}`;
    const cached = this.cache.get<EcwidProduct[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const products = await this.getProducts(100);
      
      // Фильтруем и сортируем продукты по дате обновления
      const validProducts = products.filter(product => 
        product && 
        product.enabled !== false && 
        (product.updated || product.created)
      );

      const sortedProducts = validProducts.sort((a, b) => {
        const dateA = new Date(a.updated || a.created || '1970-01-01').getTime();
        const dateB = new Date(b.updated || b.created || '1970-01-01').getTime();
        return dateB - dateA;
      });

      const recentProducts = sortedProducts.slice(0, count);
      this.cache.set(cacheKey, recentProducts);
      return recentProducts;
    } catch (error) {
      console.error('Failed to get recent products:', error);
      throw error;
    }
  }

  async getProduct(id: number): Promise<EcwidProduct | null> {
    const cacheKey = `product_${id}`;
    const cached = this.cache.get<EcwidProduct>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const product = await this.makeRequest<EcwidProduct>(`/products/${id}`);
      this.cache.set(cacheKey, product);
      return product;
    } catch (error) {
      console.error(`Failed to get product ${id}:`, error);
      return null;
    }
  }

  clearCache(): void {
    this.cache.flushAll();
  }
}

export { EcwidService, EcwidProduct };
