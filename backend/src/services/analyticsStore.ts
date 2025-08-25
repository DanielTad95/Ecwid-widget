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
  private data: AnalyticsData = {
    totalViews: 0,
    addedToCart: 0,
    lastUpdated: new Date().toISOString(),
    products: new Map()
  };

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
