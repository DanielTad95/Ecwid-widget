/**
 * Widget API Module
 * Handles all API communications
 */

(function() {
  'use strict';

  window.WidgetAPI = {
    
    /**
     * Load widget settings from backend
     */
    async loadSettings() {
      try {
        const response = await fetch(`${window.WidgetConfig.API_BASE_URL}/api/settings`);
        if (response.ok) {
          const settings = await response.json();
          window.WidgetLogger.log('Widget settings loaded:', settings);
          return settings;
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        window.WidgetLogger.warn('Failed to load widget settings, using defaults:', error);
        return {
          enabled: true,
          defaultProductCount: window.WidgetConfig.DEFAULT_PRODUCT_COUNT
        };
      }
    },

    /**
     * Load recent products from backend
     */
    async loadRecentProducts(count) {
      try {
        const response = await fetch(`${window.WidgetConfig.API_BASE_URL}/api/products/recent?count=${count}`);
        if (response.ok) {
          const products = await response.json();
          window.WidgetLogger.log(`Loaded ${products.length} recent products`);
          return products;
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        window.WidgetLogger.error('Failed to load recent products:', error);
        return [];
      }
    },

    /**
     * Send analytics data to backend
     */
    async sendAnalytics(action, productId, productName = '', productSku = '') {
      try {
        const payload = {
          productId,
          productName,
          productSku,
          timestamp: new Date().toISOString(),
          widget: window.WidgetConfig.WIDGET_SOURCE_LABEL
        };

        let endpoint;
        switch (action) {
          case 'add_to_cart':
            endpoint = '/api/analytics/widget-analytics/add-to-cart';
            break;
          case 'view':
            endpoint = '/api/analytics/widget-analytics/view';
            break;
          default:
            window.WidgetLogger.warn('Unknown analytics action:', action);
            return;
        }

        const response = await fetch(`${window.WidgetConfig.API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          window.WidgetLogger.log(`Analytics sent for ${action}:`, payload);
        }
      } catch (error) {
        window.WidgetLogger.warn('Failed to send analytics data:', error);
      }
    }
  };

})();
