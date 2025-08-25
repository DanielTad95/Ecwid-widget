/**
 * Widget Core Module
 * Main coordination and initialization logic
 */

(function() {
  'use strict';

  // Prevent multiple initializations
  if (window.EcwidRecentlyUpdatedWidget) {
    console.log('🔄 Recently Updated Widget already initialized, skipping...');
    return;
  }
  window.EcwidRecentlyUpdatedWidget = true;

  window.WidgetCore = {
    // State
    isEnabled: true,
    productCount: 6,
    products: [],
    isInitialized: false,

    /**
     * Initialize the widget
     */
    async init() {
      if (this.isInitialized) {
        window.WidgetLogger.warn('Widget already initialized');
        return;
      }

      window.WidgetLogger.log("🎯 Initializing Recently Updated Widget");

      try {
        // Initialize modules
        window.WidgetTracking.init();
        
        // Load CSS
        await this.loadCSS();
        
        // Load initial settings
        await this.loadSettings();
        
        this.isInitialized = true;
        window.WidgetLogger.log("✅ Widget initialized successfully");
        
        // Set up polling for settings
        this.startSettingsPolling();
        
        // Set up global debug functions
        this.setupDebugFunctions();
        
      } catch (error) {
        window.WidgetLogger.error("❌ Widget initialization failed:", error);
      }
    },

    /**
     * Load CSS styles
     */
    async loadCSS() {
      // Check if CSS already loaded
      if (document.getElementById('widget-styles')) {
        window.WidgetLogger.log('Widget CSS already loaded');
        return;
      }

      return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.id = 'widget-styles';
        link.rel = 'stylesheet';
        link.href = window.WidgetConfig.CSS_URL;
        
        link.onload = () => {
          window.WidgetLogger.log('Widget CSS loaded successfully');
          resolve();
        };
        
        link.onerror = () => {
          window.WidgetLogger.warn('Failed to load widget CSS');
          resolve(); // Don't fail completely if CSS fails
        };
        
        document.head.appendChild(link);
      });
    },

    /**
     * Load widget settings
     */
    async loadSettings() {
      try {
        const settings = await window.WidgetAPI.loadSettings();
        
        const oldEnabled = this.isEnabled;
        const oldCount = this.productCount;
        
        this.isEnabled = settings.enabled;
        this.productCount = settings.defaultProductCount || window.WidgetConfig.DEFAULT_PRODUCT_COUNT;
        
        // Refresh widget if settings changed
        if (oldEnabled !== this.isEnabled || oldCount !== this.productCount) {
          window.WidgetLogger.log('🔄 Settings changed, refreshing widget...');
          await this.refresh();
        }
        
        return settings;
      } catch (error) {
        window.WidgetLogger.warn('Failed to load settings:', error);
        return null;
      }
    },

    /**
     * Check if we're on the cart page
     */
    isCartPage() {
      // Check for Ecwid cart page hash
      const hash = window.location.hash;
      const isEcwidCart = hash.includes('#!/~/cart') || hash.includes('#/cart');
      
      // Also check for cart DOM elements as fallback
      const hasCartDOM = document.querySelector('.ec-cart') !== null;
      
      window.WidgetLogger.debug('Cart page check:', {
        hash: hash,
        isEcwidCart: isEcwidCart,
        hasCartDOM: hasCartDOM,
        url: window.location.href
      });
      
      return isEcwidCart || hasCartDOM;
    },

    /**
     * Insert widget with retry mechanism for better placement - EXACTLY like legacy
     */
    async insertWidgetWithRetry(retryCount = 0, maxRetries = 5) {
      const MAX_RETRIES = maxRetries;
      const RETRY_DELAY = 1000; // 1 second between retries
      
      window.WidgetLogger.log(`🔄 Attempting widget insertion (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);
      
      // Check current DOM state - EXACTLY like legacy
      const cartElements = document.querySelectorAll('.ec-cart');
      const footerElements = document.querySelectorAll('.ec-footer');
      const notranslateElements = document.querySelectorAll('.notranslate');
      
      window.WidgetLogger.log('📊 DOM state check:', {
        cartElements: cartElements.length,
        footerElements: footerElements.length,
        notranslateElements: notranslateElements.length
      });
      
      // If we have both cart and footer elements, proceed with insertion
      if (cartElements.length > 0 && footerElements.length > 0) {
        window.WidgetLogger.log('✅ Both cart and footer elements found, inserting widget');
        await this.insertWidget();
        return;
      }
      
      // If we have cart but no footer, and it's not the first attempt, proceed anyway
      if (cartElements.length > 0 && retryCount >= 2) {
        window.WidgetLogger.log('⚠️ Cart found but no footer after retries, inserting widget anyway');
        await this.insertWidget();
        return;
      }
      
      // If we haven't reached max retries, try again
      if (retryCount < MAX_RETRIES) {
        window.WidgetLogger.log(`⏳ Retrying in ${RETRY_DELAY}ms... (missing elements)`);
        setTimeout(() => {
          this.insertWidgetWithRetry(retryCount + 1, maxRetries);
        }, RETRY_DELAY);
      } else {
        window.WidgetLogger.warn('❌ Max retries reached, inserting widget with current DOM state');
        await this.insertWidget();
      }
    },

    /**
     * Insert or refresh the widget
     */
    async insertWidget() {
      if (!this.isEnabled) {
        window.WidgetLogger.log('❌ Widget disabled, removing if exists');
        window.WidgetDOM.removeExistingWidget();
        return;
      }

      if (!this.isCartPage()) {
        window.WidgetLogger.log('❌ Not on cart page, removing widget');
        window.WidgetDOM.removeExistingWidget();
        return;
      }

      window.WidgetLogger.log('🚀 Inserting recently updated products widget');

      // Check DOM readiness
      if (!window.WidgetDOM.isDOMReady()) {
        window.WidgetLogger.log('⏳ DOM not ready, will retry...');
        setTimeout(() => this.insertWidget(), window.WidgetConfig.RETRY_DELAY);
        return;
      }

      try {
        // Remove existing widget
        window.WidgetDOM.removeExistingWidget();

        // Show loading state
        const container = window.WidgetDOM.createWidgetContainer();
        const loadingHTML = window.WidgetUI.generateLoadingHTML();
        
        if (!window.WidgetDOM.insertWidget(container, loadingHTML)) {
          throw new Error('Failed to insert loading widget');
        }

        // Load products
        const products = await window.WidgetAPI.loadRecentProducts(this.productCount);
        this.products = products;

        if (products.length === 0) {
          const emptyHTML = window.WidgetUI.generateWidgetHTML([]);
          container.innerHTML = emptyHTML;
          return;
        }

        // Generate and insert final widget
        const widgetHTML = window.WidgetUI.generateWidgetHTML(products);
        container.innerHTML = widgetHTML;

        // Attach event listeners
        this.attachEventListeners(container);

        // Track widget view
        window.WidgetTracking.trackWidgetView();

        window.WidgetLogger.log('✅ Widget inserted successfully with', products.length, 'products');

      } catch (error) {
        window.WidgetLogger.error('❌ Failed to insert widget:', error);
        
        // Show error state
        const container = window.WidgetDOM.getElement('widget');
        if (container) {
          const errorHTML = window.WidgetUI.generateErrorHTML(error.message);
          container.innerHTML = errorHTML;
        }
      }
    },

    /**
     * Attach event listeners to widget elements
     */
    attachEventListeners(container) {
      // Add to cart buttons
      const addToCartButtons = container.querySelectorAll('.add-to-cart-btn');
      addToCartButtons.forEach(button => {
        button.addEventListener('click', this.handleAddToCart.bind(this));
      });

      // Product links for navigation
      const productLinks = container.querySelectorAll('.grid-product__image, .grid-product__title');
      productLinks.forEach(link => {
        link.addEventListener('click', this.handleProductClick.bind(this));
      });

      window.WidgetLogger.log(`📎 Attached event listeners to ${addToCartButtons.length} buttons and ${productLinks.length} links`);
    },

    /**
     * Handle add to cart button click
     */
    async handleAddToCart(event) {
      event.preventDefault();
      event.stopPropagation();

      const productId = parseInt(event.target.getAttribute('data-product-id'));
      const button = event.target;
      const originalText = button.textContent;

      window.WidgetLogger.log('Adding product to cart:', productId);

      // Disable button temporarily
      button.disabled = true;
      button.textContent = 'Adding...';

      try {
        // Wait for Ecwid to be ready
        if (!window.Ecwid || !window.Ecwid.Cart || typeof window.Ecwid.Cart.addProduct !== 'function') {
          throw new Error('Ecwid Cart API not available');
        }

        // Add product to cart
        const product = {
          id: productId,
          quantity: 1,
          callback: (success, product, cart, error) => {
            button.disabled = false;
            
            if (success) {
              button.textContent = '✓ Added';
              setTimeout(() => {
                button.textContent = originalText;
              }, 2000);
              
              // Track the action
              const productData = this.products.find(p => p.id === productId);
              window.WidgetTracking.trackAddToCart(
                productId, 
                productData?.name || '', 
                productData?.sku || ''
              );
              
              window.WidgetLogger.log('Product added to cart successfully');
            } else {
              button.textContent = 'Try Again';
              setTimeout(() => {
                button.textContent = originalText;
              }, 2000);
              
              window.WidgetLogger.error('Failed to add product to cart:', error);
            }
          }
        };

        window.Ecwid.Cart.addProduct(product);

      } catch (error) {
        window.WidgetLogger.warn('Cart operation failed, offering fallback:', error);
        
        button.disabled = false;
        button.textContent = 'View Product';
        
        // Fallback: navigate to product page
        setTimeout(() => {
          if (window.Ecwid && window.Ecwid.openPage) {
            window.Ecwid.openPage('product', { id: productId });
          }
          button.textContent = originalText;
        }, 2000);
      }
    },

    /**
     * Handle product click for navigation
     */
    handleProductClick(event) {
      event.preventDefault();
      
      const productId = parseInt(event.target.closest('[data-product-id]').getAttribute('data-product-id'));
      
      window.WidgetLogger.log('Navigating to product:', productId);
      
      // Navigate using Ecwid API
      if (window.Ecwid && window.Ecwid.openPage) {
        window.Ecwid.openPage('product', { id: productId });
      }
      
      // Track the view
      const productData = this.products.find(p => p.id === productId);
      window.WidgetTracking.trackProductView(productId, productData?.name || '');
    },

    /**
     * Refresh the widget
     */
    async refresh() {
      window.WidgetLogger.log('🔄 Refreshing widget...');
      await this.loadSettings();
      await this.insertWidget();
    },

    /**
     * Start polling for settings changes
     */
    startSettingsPolling() {
      setInterval(() => {
        this.loadSettings();
      }, window.WidgetConfig.SETTINGS_POLL_INTERVAL);
    },

    /**
     * Setup debug functions for development
     */
    setupDebugFunctions() {
      if (window.WidgetConfig.IS_DEVELOPMENT) {
        window.widgetDebug = {
          refresh: () => this.refresh(),
          getState: () => ({
            isEnabled: this.isEnabled,
            productCount: this.productCount,
            products: this.products,
            tracking: window.WidgetTracking.getTrackingSummary()
          }),
          clearTracking: () => window.WidgetTracking.clearTracking(),
          insertWidget: () => this.insertWidget()
        };
        
        window.WidgetLogger.log('🛠️ Debug functions available at window.widgetDebug');
      }
    }
  };

  // Initialize when Ecwid API is ready - EXACTLY like legacy version
  function initializeWidget() {
    if (window.Ecwid && window.Ecwid.OnAPILoaded) {
      window.Ecwid.OnAPILoaded.add(async function() {
        window.WidgetLogger.log("🎯 Ecwid JS API is loaded - Recently Updated Widget ready");
        
        // Initialize exactly like legacy
        window.WidgetTracking.init();
        await window.WidgetCore.loadCSS();
        await window.WidgetCore.loadSettings();
        window.WidgetCore.startSettingsPolling();
        window.WidgetCore.setupDebugFunctions();
        
        // Track storefront events - page loaded - EXACTLY like legacy
        window.Ecwid.OnPageLoaded.add(function(page) {
          window.WidgetLogger.log('� Page loaded:', page.type);
          window.WidgetLogger.log('📄 Full page details:', JSON.stringify(page));
          
          // Only show widget on cart page (as per documentation) - EXACTLY like legacy
          if (page.type === "CART" && window.WidgetCore.isEnabled) {
            window.WidgetLogger.log('🛒 On CART page, loading widget...');
            // Get cart details and insert widget with a small delay - EXACTLY like legacy
            window.Ecwid.Cart.get(function(cart) {
              window.WidgetLogger.log('🛍️ Cart details:', cart);
              // Add delay to ensure DOM is fully loaded and wait for elements - EXACTLY like legacy
              setTimeout(function() {
                window.WidgetLogger.log('⏱️ Starting widget insertion after delay...');
                window.WidgetCore.insertWidgetWithRetry();
              }, 2000); // Increased delay to 2 seconds - EXACTLY like legacy
            });
          } else {
            window.WidgetLogger.log('❌ Not on CART page or widget disabled, removing widget');
            // Remove widget on other pages - EXACTLY like legacy
            window.WidgetDOM.removeExistingWidget();
          }
        });
      });
    } else {
      window.WidgetLogger.warn('Ecwid API not available, will retry...');
      setTimeout(initializeWidget, 1000);
    }
  }

  // Export already done above
  // window.WidgetCore already defined
  
  // Auto-initialize if this module is loaded directly
  if (typeof window !== 'undefined') {
    initializeWidget();
  }

})();
