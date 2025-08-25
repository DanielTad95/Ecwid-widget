interface AnalyticsData {
  totalViews: number;
  addedToCart: number;
  lastUpdated: string;
  products: Map<number, {
    id: number;
    name: string;
    sku: string;
    addedToCart: number;
    lastAdded: string;
  }>;
}

class AnalyticsStore {
  // Memory leak protection constants
  private readonly MAX_PRODUCTS = 100; // Reduced for testing
  private readonly MAX_AGE_DAYS = 30;
  private readonly CLEANUP_INTERVAL = 3600000; // 1 hour in ms
  
  private data: AnalyticsData = {
    totalViews: 0,
    addedToCart: 0,
    lastUpdated: new Date().toISOString(),
    products: new Map()
  };

  constructor() {
    // Start automatic cleanup
    setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL);
  }

  getAnalytics() {
    return {
      totalViews: this.data.totalViews,
      addedToCart: this.data.addedToCart,
      lastUpdated: this.data.lastUpdated,
      products: Array.from(this.data.products.values())
    };
  }

  addToCart(productId: number, productName: string = '', productSku: string = '') {
    this.data.addedToCart++;
    this.data.lastUpdated = new Date().toISOString();

    if (this.data.products.has(productId)) {
      const product = this.data.products.get(productId)!;
      product.addedToCart++;
      product.lastAdded = new Date().toISOString();
      if (productName) product.name = productName;
      if (productSku) product.sku = productSku;
    } else {
      this.data.products.set(productId, {
        id: productId,
        name: productName || `Product ${productId}`,
        sku: productSku || '',
        addedToCart: 1,
        lastAdded: new Date().toISOString()
      });
    }
  }

  /**
   * Add a product to analytics (for testing and manual product additions)
   */
  addProduct(product: { id: string; name: string; price: number; lastAdded: string }) {
    const productId = parseInt(product.id.replace(/\D/g, '')) || Math.floor(Math.random() * 100000);
    
    this.data.products.set(productId, {
      id: productId,
      name: product.name,
      sku: product.id,
      addedToCart: 0,
      lastAdded: product.lastAdded
    });
    
    this.data.lastUpdated = new Date().toISOString();
  }

  addView() {
    this.data.totalViews++;
    this.data.lastUpdated = new Date().toISOString();
  }

  getProductAnalytics(productId: number) {
    const product = this.data.products.get(productId);
    if (!product) {
      return {
        productId,
        addedToCart: 0,
        views: 0,
        conversionRate: 0,
        lastAdded: null,
        addedDates: []
      };
    }

    return {
      productId,
      addedToCart: product.addedToCart,
      views: 0, // Можно добавить отдельный учет просмотров
      conversionRate: 0,
      lastAdded: product.lastAdded,
      addedDates: [product.lastAdded] // Можно расширить для хранения всех дат
    };
  }

  /**
   * Clean up old data to prevent memory leaks
   */
  private cleanup() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.MAX_AGE_DAYS);
    
    // Remove old product data
    let removedCount = 0;
    for (const [productId, product] of this.data.products) {
      if (new Date(product.lastAdded) < cutoffDate) {
        this.data.products.delete(productId);
        removedCount++;
      }
    }
    
    // If still too many products, remove oldest ones
    if (this.data.products.size > this.MAX_PRODUCTS) {
      const sortedProducts = Array.from(this.data.products.entries())
        .sort((a, b) => new Date(a[1].lastAdded).getTime() - new Date(b[1].lastAdded).getTime());
      
      const toRemove = this.data.products.size - this.MAX_PRODUCTS;
      for (let i = 0; i < toRemove && i < sortedProducts.length; i++) {
        const entry = sortedProducts[i];
        if (entry) {
          this.data.products.delete(entry[0]);
          removedCount++;
        }
      }
    }
    
    if (removedCount > 0) {
      console.log(`Analytics cleanup: removed ${removedCount} old products. Current size: ${this.data.products.size}`);
      this.data.lastUpdated = new Date().toISOString();
    }
  }

  /**
   * Force immediate cleanup - useful for testing and manual cleanup
   */
  public forceCleanup(): void {
    this.cleanup();
  }

  reset() {
    this.data = {
      totalViews: 0,
      addedToCart: 0,
      lastUpdated: new Date().toISOString(),
      products: new Map()
    };
  }
}

export const analyticsStore = new AnalyticsStore();
