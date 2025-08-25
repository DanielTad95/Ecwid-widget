/**
 * Widget Tracking Module
 * Analytics and order tracking functionality
 */

(function() {
  'use strict';

  window.WidgetTracking = {
    // Local tracking storage
    addedProducts: [],

    /**
     * Initialize order tracking
     */
    init() {
      window.WidgetLogger.log('🔍 Initializing order tracking for widget products');
      
      // Load existing tracking data
      this.loadTrackingData();
      
      // Set up order tracking field if possible
      this.setupOrderField();
    },

    /**
     * Load tracking data from localStorage
     */
    loadTrackingData() {
      try {
        const stored = localStorage.getItem('ecwid_widget_tracking');
        if (stored) {
          this.addedProducts = JSON.parse(stored);
          window.WidgetLogger.log(`Loaded ${this.addedProducts.length} tracked products`);
        }
      } catch (error) {
        window.WidgetLogger.warn('Failed to load tracking data:', error);
        this.addedProducts = [];
      }
    },

    /**
     * Save tracking data to localStorage
     */
    saveTrackingData() {
      try {
        localStorage.setItem('ecwid_widget_tracking', JSON.stringify(this.addedProducts));
        window.WidgetLogger.log('💾 Saved widget tracking data to localStorage');
      } catch (error) {
        window.WidgetLogger.warn('Failed to save tracking data:', error);
      }
    },

    /**
     * Setup order tracking field
     */
    setupOrderField() {
      if (window.Ecwid && window.Ecwid.Cart) {
        try {
          // Check if field already exists
          const fieldExists = document.querySelector('[data-field-key="widget_products"]');
          
          if (!fieldExists) {
            window.WidgetLogger.log('📝 Setting up widget tracking field for orders');
            this.updateOrderField();
          }
        } catch (error) {
          window.WidgetLogger.warn('Could not set up order tracking field:', error);
        }
      }
    },

    /**
     * Update order field with current tracking data
     */
    updateOrderField() {
      if (this.addedProducts.length > 0) {
        const trackingData = this.addedProducts.map(item => 
          `Product ID: ${item.productId}, Added: ${item.timestamp}, Action: ${item.action}`
        ).join('; ');
        
        window.WidgetLogger.log('📋 Widget tracking data:', trackingData);
        this.saveTrackingData();
      }
    },

    /**
     * Track widget usage
     */
    track(action, productId, productName = '', productSku = '') {
      const timestamp = new Date().toISOString();
      
      // Add to local tracking
      const trackingItem = {
        productId: parseInt(productId),
        productName,
        productSku,
        action,
        timestamp,
        widget: window.WidgetConfig.WIDGET_SOURCE_LABEL
      };

      // Local storage tracking
      this.addedProducts.push(trackingItem);
      
      // Keep only last 100 items to prevent memory bloat
      if (this.addedProducts.length > 100) {
        this.addedProducts = this.addedProducts.slice(-100);
      }
      
      this.saveTrackingData();
      this.updateOrderField();

      // Send to analytics API
      window.WidgetAPI.sendAnalytics(action, productId, productName, productSku);

      window.WidgetLogger.log(`📊 Tracked ${action} for product ${productId}`, trackingItem);
    },

    /**
     * Track add to cart action
     */
    trackAddToCart(productId, productName = '', productSku = '') {
      this.track('add_to_cart', productId, productName, productSku);
    },

    /**
     * Track product view action
     */
    trackProductView(productId, productName = '') {
      this.track('view_product', productId, productName);
    },

    /**
     * Track widget view
     */
    trackWidgetView() {
      this.track('view', 'widget', 'Recently Updated Widget');
    },

    /**
     * Get tracking summary
     */
    getTrackingSummary() {
      return {
        totalTracked: this.addedProducts.length,
        addToCartCount: this.addedProducts.filter(item => item.action === 'add_to_cart').length,
        viewCount: this.addedProducts.filter(item => item.action === 'view_product').length,
        lastActivity: this.addedProducts.length > 0 ? this.addedProducts[this.addedProducts.length - 1].timestamp : null
      };
    },

    /**
     * Clear tracking data
     */
    clearTracking() {
      this.addedProducts = [];
      this.saveTrackingData();
      window.WidgetLogger.log('🗑️ Cleared all tracking data');
    }
  };

})();
