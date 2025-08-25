/**
 * Widget DOM Utilities Module
 * DOM manipulation and caching utilities
 */

(function() {
  'use strict';

  window.WidgetDOM = {
    // DOM Cache for performance
    cache: {
      cart: null,
      footer: null,
      widget: null,
      lastUpdate: 0
    },

    /**
     * Refresh DOM cache
     */
    refreshCache() {
      this.cache.cart = document.querySelector(window.WidgetConfig.SELECTORS.CART);
      this.cache.footer = document.querySelector(window.WidgetConfig.SELECTORS.FOOTER);
      this.cache.widget = document.getElementById(window.WidgetConfig.WIDGET_CONTAINER_ID);
      this.cache.lastUpdate = Date.now();
      
      window.WidgetLogger.debug('DOM cache refreshed', {
        cart: !!this.cache.cart,
        footer: !!this.cache.footer,
        widget: !!this.cache.widget
      });
    },

    /**
     * Get cached or fresh DOM element
     */
    getElement(type) {
      // Refresh cache if older than 5 seconds
      if (Date.now() - this.cache.lastUpdate > 5000) {
        this.refreshCache();
      }
      
      return this.cache[type];
    },

    /**
     * Check if DOM is ready for widget insertion
     */
    isDOMReady() {
      this.refreshCache();
      return !!(this.cache.cart && this.cache.footer);
    },

    /**
     * Find optimal insertion point for widget
     */
    findInsertionPoint() {
      window.WidgetLogger.log('🔍 Looking for optimal widget insertion point...');
      
      const cartElement = this.getElement('cart');
      const footerElement = this.getElement('footer');
      
      window.WidgetLogger.debug('DOM elements found:', {
        cart: !!cartElement,
        footer: !!footerElement
      });
      
      if (!cartElement || !footerElement) {
        window.WidgetLogger.warn('⚠️ DOM not ready yet - missing critical elements');
        return null;
      }

      // Widget should be inserted before footer
      return footerElement;
    },

    /**
     * Remove existing widget instances
     */
    removeExistingWidget() {
      const existingWidgets = document.querySelectorAll(window.WidgetConfig.SELECTORS.EXISTING_WIDGET);
      existingWidgets.forEach(widget => {
        window.WidgetLogger.log('🗑️ Removing existing widget instance');
        widget.remove();
      });
      
      // Clear cache
      this.cache.widget = null;
    },

    /**
     * Create widget container element
     */
    createWidgetContainer() {
      const container = document.createElement('div');
      container.id = window.WidgetConfig.WIDGET_CONTAINER_ID;
      container.className = 'recently-updated-widget';
      container.setAttribute('data-widget-version', '2.0');
      
      return container;
    },

    /**
     * Safely insert widget into DOM
     */
    insertWidget(container, content) {
      const insertionPoint = this.findInsertionPoint();
      
      if (!insertionPoint) {
        return false;
      }

      try {
        container.innerHTML = content;
        insertionPoint.parentNode.insertBefore(container, insertionPoint);
        
        // Update cache
        this.cache.widget = container;
        
        window.WidgetLogger.log('✅ Widget inserted successfully');
        return true;
      } catch (error) {
        window.WidgetLogger.error('❌ Failed to insert widget:', error);
        return false;
      }
    }
  };

})();
