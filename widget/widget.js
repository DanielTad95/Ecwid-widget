/**
 * Ecwid Recently Updated Products Widget v2.0
 * Modular architecture with improved performance and maintainability
 */

(function() {
  'use strict';

  // Module loading configuration
  const WIDGET_MODULES = [
    'config.js',
    'logger.js', 
    'api.js',
    'dom.js',
    'ui.js',
    'tracking.js',
    'core.js'
  ];

  const WIDGET_BASE_URL = 'http://localhost:3002';

  /**
   * Load a single module
   */
  function loadModule(moduleFile) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `${WIDGET_BASE_URL}/${moduleFile}`;
      script.async = false; // Preserve order
      
      script.onload = () => {
        console.log(`[Widget] ✅ Loaded module: ${moduleFile}`);
        resolve();
      };
      
      script.onerror = () => {
        console.error(`[Widget] ❌ Failed to load module: ${moduleFile}`);
        reject(new Error(`Failed to load ${moduleFile}`));
      };
      
      document.head.appendChild(script);
    });
  }

  /**
   * Load all modules sequentially
   */
  async function loadAllModules() {
    console.log('[Widget] 🚀 Loading widget modules...');
    
    try {
      for (const module of WIDGET_MODULES) {
        await loadModule(module);
      }
      
      console.log('[Widget] ✅ All modules loaded successfully');
      console.log('[Widget] 🎯 Widget will initialize when Ecwid API is ready');
      
    } catch (error) {
      console.error('[Widget] ❌ Failed to load widget modules:', error);
      
      // Fallback: try to load the old monolithic widget
      console.log('[Widget] 🔄 Falling back to legacy widget...');
      await loadModule('recently-updated-legacy.js');
    }
  }

  /**
   * Initialize widget loading
   */
  function initWidget() {
    // Prevent multiple initializations
    if (window.WidgetLoader) {
      console.log('[Widget] 🔄 Widget loader already initialized');
      return;
    }
    window.WidgetLoader = true;

    // Start loading modules
    loadAllModules();
  }

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

})();
