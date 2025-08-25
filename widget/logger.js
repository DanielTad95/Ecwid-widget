/**
 * Widget Logger Module
 * Centralized logging with environment-aware output
 */

(function() {
  'use strict';

  window.WidgetLogger = {
    log: function(message, ...args) {
      if (!window.WidgetConfig || window.WidgetConfig.IS_DEVELOPMENT) {
        console.log(`[Widget] ${message}`, ...args);
      }
    },
    
    warn: function(message, ...args) {
      if (!window.WidgetConfig || window.WidgetConfig.IS_DEVELOPMENT) {
        console.warn(`[Widget] ${message}`, ...args);
      }
    },
    
    error: function(message, ...args) {
      // Errors always shown
      console.error(`[Widget] ${message}`, ...args);
    },
    
    info: function(message, ...args) {
      if (!window.WidgetConfig || window.WidgetConfig.IS_DEVELOPMENT) {
        console.info(`[Widget] ℹ️ ${message}`, ...args);
      }
    },
    
    debug: function(message, ...args) {
      if (window.WidgetConfig && window.WidgetConfig.IS_DEVELOPMENT && window.WidgetConfig.DEBUG) {
        console.debug(`[Widget] 🔍 ${message}`, ...args);
      }
    }
  };
  
})();
