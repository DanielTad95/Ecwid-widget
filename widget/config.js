/**
 * Widget Configuration Module
 * Centralized configuration and constants
 */

(function() {
  'use strict';

  // Widget Configuration
  window.WidgetConfig = {
    STORE_ID: '101560752',
    API_BASE_URL: 'http://localhost:3001',
    WIDGET_CONTAINER_ID: 'recently-updated-products-widget',
    DEFAULT_PRODUCT_COUNT: 6,
    WIDGET_SOURCE_LABEL: 'recently-updated-widget',
    CSS_URL: 'http://localhost:3002/styles.css',
    
    // Performance settings
    RETRY_DELAY: 1000,
    MAX_RETRIES: 5,
    SETTINGS_POLL_INTERVAL: 30000,
    
    // DOM selectors
    SELECTORS: {
      CART: '.ec-cart.notranslate, .ec-cart',
      FOOTER: '.ec-footer',
      EXISTING_WIDGET: '.recently-updated-widget'
    }
  };

  // Environment detection
  window.WidgetConfig.IS_DEVELOPMENT = window.location.hostname === 'localhost';
  window.WidgetConfig.DEBUG = true; // Enable debug logging
  
})();
