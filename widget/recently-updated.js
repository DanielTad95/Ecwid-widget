/**
 * Ecwid Recently Updated Products Widget
 * Integration with Ecwid JS API according to documentation
 */

(function() {
  'use strict';

  // Prevent multiple initializations
  if (window.EcwidRecentlyUpdatedWidget) {
    console.log('🔄 Recently Updated Widget already initialized, skipping...');
    return;
  }
  window.EcwidRecentlyUpdatedWidget = true;

  // Configuration
  const CONFIG = {
    STORE_ID: '101560752',
    API_BASE_URL: 'http://localhost:3001',
    WIDGET_CONTAINER_ID: 'recently-updated-products-widget',
    DEFAULT_PRODUCT_COUNT: 6,
    WIDGET_SOURCE_LABEL: 'recently-updated-widget',
    CSS_URL: 'http://localhost:3002/styles.css'
  };

  // Widget state
  let isWidgetEnabled = true;
  let currentProductCount = CONFIG.DEFAULT_PRODUCT_COUNT;
  let products = [];
  let widgetContainer = null;

  // Order tracking for widget usage
  let widgetAddedProducts = [];

  /**
   * Add widget order tracking functionality
   */
  function initOrderTracking() {
    console.log('🔍 Initializing order tracking for widget products');

    // Create hidden checkout extra field for tracking widget products
    if (window.Ecwid && window.Ecwid.Cart) {
      try {
        // Check if field already exists
        const fieldExists = window.document.querySelector('[data-field-key="widget_products"]');
        
        if (!fieldExists) {
          // Create hidden field to track products added via widget
          const widgetTrackingField = {
            id: 'widget_products',
            title: 'Products from Recently Updated Widget',
            type: 'text',
            value: '',
            orderDetailsDisplaySection: 'shipping_address', // Show in order details
            showInInvoice: true,
            showInNotifications: true,
            required: false,
            placeholder: 'Widget product tracking data'
          };

          console.log('📝 Creating widget tracking field for order');
          
          // Note: In a real implementation, this would be set up via REST API
          // For demo purposes, we'll track in localStorage and show in console
          updateWidgetTrackingField();
        }
      } catch (error) {
        console.warn('Could not set up order tracking field:', error);
      }
    }
  }

  /**
   * Update widget tracking field with current products
   */
  function updateWidgetTrackingField() {
    if (widgetAddedProducts.length > 0) {
      const trackingData = widgetAddedProducts.map(item => 
        `Product ID: ${item.productId}, Added: ${item.timestamp}, Action: ${item.action}`
      ).join('; ');
      
      console.log('📋 Widget tracking data:', trackingData);
      
      // Store in localStorage for persistence
      localStorage.setItem('ecwid_widget_tracking', JSON.stringify(widgetAddedProducts));
      
      // In a real implementation, this would update the checkout field
      console.log('💾 Saved widget tracking data to localStorage');
    }
  }

  /**
   * Alternative cart addition method with safer DOM handling
   */
  function addToCartSafely(productId, button, originalText) {
    console.log('Attempting safe cart addition for product:', productId);
    
    // Wait for DOM to be stable
    const waitForStableDOM = () => {
      return new Promise((resolve) => {
        // Wait for any pending DOM operations to complete
        if (document.readyState === 'complete') {
          setTimeout(resolve, 100);
        } else {
          document.addEventListener('DOMContentLoaded', () => {
            setTimeout(resolve, 100);
          });
        }
      });
    };

    waitForStableDOM().then(() => {
      try {
        const product = { id: productId, quantity: 1 };
        
        window.Ecwid.Cart.addProduct(product, function(success, product, cart, error) {
          if (success) {
            button.textContent = '✓ Added';
            console.log('Product successfully added to cart');
            
            // Instead of full page refresh, just update cart icon if possible
            setTimeout(() => {
              // Try to find and update cart counter without full refresh
              const cartCounters = document.querySelectorAll('.ec-cart-widget, .ec-minicart__counter, [data-ec-cart-counter]');
              if (cartCounters.length > 0) {
                console.log('Cart counters found, triggering soft update');
                // Trigger a soft cart update by getting current cart state
                if (window.Ecwid && window.Ecwid.Cart && window.Ecwid.Cart.get) {
                  window.Ecwid.Cart.get(function() {
                    console.log('Cart state refreshed');
                  });
                }
              }
            }, 200);
            
            trackWidgetUsage('add_to_cart', productId);
          } else {
            console.warn('Failed to add product to cart:', error);
            button.textContent = 'Try Again';
            button.disabled = false;
          }
        });
      } catch (error) {
        console.error('Error in safe cart addition:', error);
        button.textContent = 'Error';
        button.disabled = false;
      }
    });
  }

  /**
   * Load CSS styles for the widget
   */
  function loadWidgetCSS() {
    // Check if CSS is already loaded
    if (document.querySelector(`link[href="${CONFIG.CSS_URL}"]`)) {
      console.log('Widget CSS already loaded');
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = CONFIG.CSS_URL;
    link.onload = function() {
      console.log('Widget CSS loaded successfully');
    };
    link.onerror = function() {
      console.warn('Failed to load widget CSS');
    };
    
    document.head.appendChild(link);
  }

  /**
   * Initialize according to Ecwid documentation
   * Step 3: Initialize Ecwid JS API in the file
   */
  Ecwid.OnAPILoaded.add(function() {
    console.log("🎯 Ecwid JS API is loaded - Recently Updated Widget ready");
    
    // Initialize order tracking
    initOrderTracking();
    
    // Load CSS styles
    loadWidgetCSS();
    
    // Load widget settings
    loadWidgetSettings();
    
    // Wait for page to be fully loaded before adding cart functionality
    Ecwid.OnPageLoaded.add(function(page) {
      console.log('📄 Page loaded:', page.type);
      
      // Ensure cart functionality is ready
      if (page.type === 'CART' || page.type === 'CATEGORY' || page.type === 'MAIN') {
        setTimeout(() => {
          console.log('🛒 Ensuring cart API is ready after page load');
          // Test cart availability
          if (window.Ecwid && window.Ecwid.Cart) {
            try {
              window.Ecwid.Cart.get(function(cart) {
                console.log('✅ Cart API confirmed ready:', cart ? 'Cart exists' : 'Empty cart');
              });
            } catch (error) {
              console.warn('⚠️ Cart API test failed:', error);
            }
          }
        }, 200);
      }
    });
    
    // Listen for settings sync events from admin panel
    window.addEventListener('widget-settings-sync', function(event) {
      console.log('🔄 Settings sync event received:', event.detail);
      const newSettings = event.detail.settings;
      
      if (newSettings) {
        console.log('📥 Applying synced settings:', newSettings);
        isWidgetEnabled = newSettings.enabled;
        currentProductCount = newSettings.defaultProductCount || CONFIG.DEFAULT_PRODUCT_COUNT;
        
        // Refresh widget if on cart page
        if (document.location.pathname.includes('cart') || 
            document.querySelector('.ec-cart') || 
            window.location.hash.includes('cart')) {
          console.log('🔄 Refreshing widget with synced settings...');
          setTimeout(() => insertWidget(), 500);
        }
      }
    });
    
    // Listen for cross-tab sync via BroadcastChannel
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('widget-settings');
      channel.addEventListener('message', function(event) {
        if (event.data.type === 'settings-sync') {
          console.log('📡 Cross-tab settings sync received:', event.data);
          const newSettings = event.data.settings;
          
          if (newSettings) {
            console.log('📥 Applying cross-tab synced settings:', newSettings);
            isWidgetEnabled = newSettings.enabled;
            currentProductCount = newSettings.defaultProductCount || CONFIG.DEFAULT_PRODUCT_COUNT;
            
            // Refresh widget if on cart page
            if (document.location.pathname.includes('cart') || 
                document.querySelector('.ec-cart') || 
                window.location.hash.includes('cart')) {
              console.log('🔄 Refreshing widget with cross-tab synced settings...');
              setTimeout(() => insertWidget(), 500);
            }
          }
        }
      });
    }
    
    // Track storefront events - page loaded
    Ecwid.OnPageLoaded.add(function(page) {
      console.log('🔄 Page loaded:', page.type);
      console.log('📄 Full page details:', JSON.stringify(page));
      
      // Only show widget on cart page (as per documentation)
      if (page.type === "CART" && isWidgetEnabled) {
        console.log('🛒 On CART page, loading widget...');
        // Get cart details and insert widget with a small delay
        Ecwid.Cart.get(function(cart) {
          console.log('🛍️ Cart details:', cart);
          // Add delay to ensure DOM is fully loaded and wait for elements
          setTimeout(function() {
            console.log('⏱️ Starting widget insertion after delay...');
            insertWidgetWithRetry();
          }, 2000); // Increased delay to 2 seconds
        });
      } else {
        console.log('❌ Not on CART page or widget disabled, removing widget');
        // Remove widget on other pages
        removeWidget();
      }
    });
  });

  /**
   * Load widget settings from the backend
   */
  async function loadWidgetSettings() {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/settings`);
      if (response.ok) {
        const settings = await response.json();
        const oldEnabled = isWidgetEnabled;
        const oldCount = currentProductCount;
        
        isWidgetEnabled = settings.enabled;
        currentProductCount = settings.defaultProductCount || CONFIG.DEFAULT_PRODUCT_COUNT;
        
        console.log('Widget settings loaded:', settings);
        
        // Check if settings changed and refresh widget if needed
        if (oldEnabled !== isWidgetEnabled || oldCount !== currentProductCount) {
          console.log('🔄 Settings changed, refreshing widget...');
          // Refresh widget if on cart page
          if (document.location.pathname.includes('cart') || 
              document.querySelector('.ec-cart') || 
              window.location.hash.includes('cart')) {
            setTimeout(() => insertWidget(), 100);
          }
        } else {
          // If settings haven't changed, check widget position
          setTimeout(() => checkAndFixWidgetPosition(), 500);
        }
      }
    } catch (error) {
      console.warn('Failed to load widget settings, using defaults:', error);
    }
  }

  // Poll settings every 30 seconds for automatic sync
  setInterval(loadWidgetSettings, 30000);

  // Expose global function for manual sync (for debugging)
  window.recentlyUpdatedWidgetSync = function() {
    console.log('🔄 Manual widget sync triggered...');
    loadWidgetSettings();
  };

  // Expose global function to force widget refresh
  window.recentlyUpdatedWidgetRefresh = function() {
    console.log('🔄 Manual widget refresh triggered...');
    insertWidget();
  };

  /**
   * Load recent products from the backend
   */
  async function loadRecentProducts() {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/products/recent?count=${currentProductCount}`);
      if (response.ok) {
        products = await response.json();
        console.log(`Loaded ${products.length} recent products`);
        return products;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to load recent products:', error);
      return [];
    }
  }

  /**
   * Check and fix widget position if needed
   */
  function checkAndFixWidgetPosition() {
    const widget = document.getElementById(CONFIG.WIDGET_CONTAINER_ID);
    if (!widget) return false;

    const insertionPoint = findWidgetInsertionPoint();
    if (!insertionPoint) return false;

    // Check if widget is in the correct position
    const expectedParent = insertionPoint.parentNode;
    const currentParent = widget.parentNode;
    
    if (currentParent !== expectedParent) {
      console.log('🔧 Widget position needs correction...');
      
      try {
        // Move widget to correct position
        expectedParent.insertBefore(widget, insertionPoint);
        console.log('✅ Widget position corrected');
        return true;
      } catch (error) {
        console.error('❌ Failed to correct widget position:', error);
        return false;
      }
    }
    
    return true;
  }

  /**
   * Insert widget with retry mechanism for better placement
   */
  async function insertWidgetWithRetry(retryCount = 0, maxRetries = 5) {
    const MAX_RETRIES = maxRetries;
    const RETRY_DELAY = 1000; // 1 second between retries
    
    console.log(`🔄 Attempting widget insertion (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);
    
    // Check current DOM state
    const cartElements = document.querySelectorAll('.ec-cart');
    const footerElements = document.querySelectorAll('.ec-footer');
    const notranslateElements = document.querySelectorAll('.notranslate');
    
    console.log('📊 DOM state check:', {
      cartElements: cartElements.length,
      footerElements: footerElements.length,
      notranslateElements: notranslateElements.length
    });
    
    // If we have both cart and footer elements, proceed with insertion
    if (cartElements.length > 0 && footerElements.length > 0) {
      console.log('✅ Both cart and footer elements found, inserting widget');
      await insertWidget();
      return;
    }
    
    // If we have cart but no footer, and it's not the first attempt, proceed anyway
    if (cartElements.length > 0 && retryCount >= 2) {
      console.log('⚠️ Cart found but no footer after retries, inserting widget anyway');
      await insertWidget();
      return;
    }
    
    // If we haven't reached max retries, try again
    if (retryCount < MAX_RETRIES) {
      console.log(`⏳ Retrying in ${RETRY_DELAY}ms... (missing elements)`);
      setTimeout(() => {
        insertWidgetWithRetry(retryCount + 1, maxRetries);
      }, RETRY_DELAY);
    } else {
      console.warn('❌ Max retries reached, inserting widget with current DOM state');
      await insertWidget();
    }
  }

  /**
   * Insert the widget into the cart page
   */
  async function insertWidget(retryCount = 0) {
    const maxRetries = 5;
    
    console.log('🚀 Inserting recently updated products widget (attempt ' + (retryCount + 1) + '/' + maxRetries + ')');
    console.log('📋 Current page elements:');
    console.log('- .ec-cart elements:', document.querySelectorAll('.ec-cart').length);
    console.log('- .ec-footer elements:', document.querySelectorAll('.ec-footer').length);
    console.log('- .notranslate elements:', document.querySelectorAll('.notranslate').length);
    console.log('- body children:', document.body.children.length);

    // Check if widget already exists and remove it if in wrong place
    const existingWidget = document.querySelector(`#${CONFIG.WIDGET_CONTAINER_ID}`) || 
                          document.querySelector('.recently-updated-widget');
    
    if (existingWidget) {
      const cartElement = document.querySelector('.ec-cart.notranslate') || 
                         document.querySelector('.ec-cart');
      const footerElement = document.querySelector('.ec-footer');
      
      // Check if widget is in the right place
      let isInRightPlace = false;
      if (cartElement && footerElement) {
        // Widget should be before footer or inside cart
        isInRightPlace = cartElement.contains(existingWidget) || 
                        (existingWidget.nextSibling === footerElement) ||
                        (existingWidget.nextElementSibling === footerElement);
      }
      
      if (!isInRightPlace) {
        console.log('🔄 Removing misplaced widget to reposition...');
        existingWidget.remove();
      } else {
        console.log('✅ Widget is already in correct position, skipping insertion');
        return;
      }
    }

    // Remove any other existing widget instances
    removeWidget();

    // Load recent products
    console.log('📦 Loading recent products...');
    const recentProducts = await loadRecentProducts();
    console.log('✅ Loaded products count:', recentProducts.length);
    if (recentProducts.length === 0) {
      console.warn('⚠️ No recent products found');
      return;
    }

    // Create widget container
    console.log('🔧 Creating widget container...');
    widgetContainer = createWidgetContainer();
    
    // Generate widget HTML
    console.log('🎨 Generating widget HTML...');
    const widgetHTML = generateWidgetHTML(recentProducts);
    widgetContainer.innerHTML = widgetHTML;

    // Insert widget at the determined position
    console.log('📍 Inserting widget into DOM...');
    let insertionPoint = findWidgetInsertionPoint();
    let widgetPlaced = false;
    
    // Check if DOM is not ready yet
    if (insertionPoint === 'DOM_NOT_READY') {
      if (retryCount < maxRetries) {
        console.log('⏳ DOM not ready, will retry insertion in 500ms... (attempt ' + (retryCount + 1) + '/' + maxRetries + ')');
        setTimeout(() => {
          console.log('🔄 Retrying widget insertion after DOM delay...');
          insertWidget(retryCount + 1);
        }, 500);
        return;
      } else {
        console.warn('⚠️ Max retries reached, falling back to body insertion');
        // Continue with fallback logic
      }
    }
    
    if (insertionPoint && insertionPoint.parentNode) {
      try {
        // Insert before the insertion point
        insertionPoint.parentNode.insertBefore(widgetContainer, insertionPoint);
        console.log('✅ Widget inserted before insertion point');
        widgetPlaced = true;
      } catch (error) {
        console.error('❌ Failed to insert before insertion point:', error);
      }
    }
    
    if (!widgetPlaced) {
      // Fallback: try to append to cart element
      const cartElement = document.querySelector('.ec-cart.notranslate') || 
                         document.querySelector('.ec-cart') ||
                         document.querySelector('[class*="ec-cart"]');
      
      if (cartElement) {
        try {
          // Try to append to the end of cart element
          cartElement.appendChild(widgetContainer);
          console.log('✅ Widget appended to cart element');
          widgetPlaced = true;
        } catch (error) {
          console.error('❌ Failed to append to cart element:', error);
        }
      }
      
      if (!widgetPlaced) {
        // Last resort: append to body
        document.body.appendChild(widgetContainer);
        console.log('✅ Widget appended to body as last resort');
      }
    }

    // Attach event listeners
    console.log('📎 About to attach event listeners...');
    attachEventListeners();

    // Track widget view for analytics
    trackWidgetUsage('view', null);

    console.log('✅ Widget inserted successfully');
  }

  /**
   * Find the widget insertion point between ec-footer and ec-cart notranslate
   */
  function findWidgetInsertionPoint() {
    console.log('🔍 Looking for optimal widget insertion point...');
    
    // First check if DOM is ready for cart page
    const cartElement = document.querySelector('.ec-cart.notranslate') || 
                       document.querySelector('.ec-cart');
    const footerElement = document.querySelector('.ec-footer');
    
    console.log('🛒 Cart with notranslate:', cartElement && cartElement.classList.contains('notranslate') ? 'Found' : 'Not found');
    console.log('🛒 Generic cart element:', cartElement ? 'Found' : 'Not found');
    console.log('🦶 Footer element:', footerElement ? 'Found' : 'Not found');
    
    // If critical elements are missing, DOM is not ready yet
    if (!cartElement || !footerElement) {
      console.warn('⚠️ DOM not ready yet - missing critical elements');
      return 'DOM_NOT_READY';
    }
    
    if (cartElement) {
      console.log('✅ Found cart element:', cartElement.className);
      
      // Try to find ec-footer inside the cart
      let footerInsideCart = cartElement.querySelector('.ec-footer');
      console.log('🦶 Footer inside cart:', footerInsideCart ? 'Found' : 'Not found');
      
      if (footerInsideCart) {
        console.log('✅ Found footer element inside cart:', footerInsideCart.className);
        console.log('🎯 Will insert widget before footer element');
        return footerInsideCart;
      }
      
      // If footer exists as sibling, use it
      if (footerElement) {
        console.log('✅ Found footer element as sibling:', footerElement.className);
        console.log('🎯 Will insert widget before footer element');
        return footerElement;
      }
      
      // If no footer, try to insert at the end of cart
      console.log('🎯 No footer found, will append to cart element');
      return null; // This will trigger appendChild to cart
    }
    
    console.warn('⚠️ No suitable insertion point found');
    return null;
  }

  /**
   * Create the widget container element
   */
  function createWidgetContainer() {
    const container = document.createElement('div');
    container.id = CONFIG.WIDGET_CONTAINER_ID;
    container.className = 'recently-updated-widget';
    
    // Add data attributes to help identify our widget
    container.setAttribute('data-widget', 'recently-updated');
    container.setAttribute('data-widget-version', '1.0');
    
    // Add isolation styles to prevent conflicts
    container.style.isolation = 'isolate';
    container.style.contain = 'layout style';
    
    return container;
  }

  /**
   * Generate HTML for the widget
   */
  function generateWidgetHTML(products) {
    return `
      <div class="widget-header">
        <h3 class="widget-title">Recently Updated Products</h3>
      </div>
      <div class="grid__products grid__products--classic grid__products--layout-center grid__products--aspect-ratio-0667 grid__products--large-items" data-items="${products.length}" data-cols="3" style="max-width: 10000px;">
        ${products.map(product => generateProductHTML(product)).join('')}
      </div>
    `;
  }

  /**
   * Generate HTML for a single product using Ecwid structure
   */
  function generateProductHTML(product) {
    const imageUrl = product.thumbnailUrl || 'https://via.placeholder.com/150x150?text=No+Image';
    const price = product.price ? `$${product.price.toFixed(2)}` : 'Price unavailable';
    const productName = product.name || 'Untitled Product';
    const productUrl = `http://localhost:3000/#!/${product.name.replace(/\s+/g, '-').replace(/[^\w-]/g, '')}/p/${product.id}`;
    
    // Escape HTML attributes to prevent XSS
    const escapedName = productName.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const escapedImageUrl = imageUrl.replace(/"/g, '&quot;');
    
    return `
      <div class="grid-product grid-product--id-${product.id}">
        <div class="grid-product__wrap" data-product-id="${product.id}">
          <div class="grid-product__scroller grid-product__scroller--id-${product.id}"></div>
          <div class="grid-product__wrap-inner">
            <a href="${productUrl}" class="grid-product__image" title="${escapedName}" data-product-id="${product.id}">
              <div class="grid-product__spacer">
                <div class="grid-product__spacer-inner"></div>
              </div>
              <div class="grid-product__bg" style="background-color: rgb(219, 217, 219);"></div>
              <div class="grid-product__image-wrap">
                <div class="grid-product__label grid-product__label--bottom" is-only-preorder-available="false">
                  <div class="ec-label label--highlight">
                    <div class="label__text">Recently Updated</div>
                  </div>
                </div>
                <img src="${escapedImageUrl}" 
                     srcset="${escapedImageUrl} 1x" 
                     alt="${escapedName}" 
                     title="${escapedName}" 
                     width="1000" 
                     height="1500" 
                     loading="lazy" 
                     class="grid-product__picture" 
                     style="width: 100%; height: 100%;">
              </div>
              <div class="grid-product__shadow ec-text-muted">
                <div class="grid-product__shadow-inner">${productName}</div>
              </div>
              <div class="grid__clearfix"></div>
              <div class="grid-product__hover-wrap"></div>
            </a>
            <a href="${productUrl}" class="grid-product__title" title="${escapedName}" data-product-id="${product.id}">
              <div class="grid-product__title-inner">${productName}</div>
            </a>
            <div class="grid-product__price">
              <div class="grid-product__price-amount">
                <div class="grid-product__price-value ec-price-item">${price}</div>
              </div>
            </div>
            <div class="grid-product__actions">
              <button class="add-to-cart-btn" data-product-id="${product.id}">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
        <script>
          (function () {
            var container = document.querySelector(\`.grid-product--id-${product.id}\`);
            var img = container?.getElementsByTagName(\`img\`)[0];
            if (!img) return;
            if (!img.complete || img.naturalHeight === 0) {
              container?.classList.add(\`grid-product--loading\`);
              function callback(){
                container?.classList.remove(\`grid-product--loading\`);
                img.removeEventListener(\`load\`, callback);
              };
              img?.addEventListener(\`load\`, callback);
            }
          })();
        </script>
      </div>
    `;
  }

  /**
   * Attach event listeners to widget elements
   */
  function attachEventListeners() {
    if (!widgetContainer) {
      console.warn('⚠️ Cannot attach event listeners - no widget container');
      return;
    }

    console.log('🔗 Attaching event listeners to widget...');

    // Add to cart buttons
    const addToCartButtons = widgetContainer.querySelectorAll('.add-to-cart-btn');
    if (addToCartButtons.length > 0) {
      addToCartButtons.forEach(button => {
        button.addEventListener('click', handleAddToCart);
      });
      console.log(`✅ ${addToCartButtons.length} add-to-cart button listeners attached`);
    } else {
      console.warn('⚠️ No add-to-cart buttons found');
    }

    // Product links (image and title)
    const productLinks = widgetContainer.querySelectorAll('.grid-product__image, .grid-product__title');
    if (productLinks.length > 0) {
      productLinks.forEach(link => {
        link.addEventListener('click', handleProductClick);
      });
      console.log(`✅ ${productLinks.length} product link listeners attached`);
    } else {
      console.warn('⚠️ No product links found');
    }

    // Image error handling
    const productImages = widgetContainer.querySelectorAll('.grid-product__picture');
    if (productImages.length > 0) {
      productImages.forEach(img => {
        img.addEventListener('error', handleImageError);
      });
      console.log(`✅ ${productImages.length} image error listeners attached`);
    } else {
      console.warn('⚠️ No product images found');
    }
  }

  /**
   * Handle image loading errors
   */
  function handleImageError(event) {
    event.target.src = 'https://via.placeholder.com/150x150?text=No+Image';
    event.target.alt = 'Product image not available';
  }

  /**
   * Handle add to cart button click - Using correct documentation format
   */
  function handleAddToCart(event) {
    event.preventDefault();
    event.stopPropagation(); // Prevent event bubbling
    
    const productId = parseInt(event.target.getAttribute('data-product-id'));
    
    console.log('Adding product to cart:', productId);

    // Disable button temporarily
    const button = event.target;
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Adding...';

    // Wait for Ecwid to be completely ready before cart operations
    const waitForEcwidReady = () => {
      return new Promise((resolve, reject) => {
        if (window.Ecwid && window.Ecwid.Cart && typeof window.Ecwid.Cart.addProduct === 'function') {
          // Additional check - make sure cart is initialized
          window.Ecwid.Cart.get(function(cart) {
            if (cart !== undefined) {
              resolve();
            } else {
              reject(new Error('Cart not initialized'));
            }
          });
        } else {
          reject(new Error('Ecwid Cart API not available'));
        }
      });
    };

    // Try to add product to cart using CORRECT documentation format
    waitForEcwidReady()
      .then(() => {
        console.log('Ecwid is ready, adding product to cart');
        
        // Using the CORRECT format from Ecwid documentation
        // Callback should be INSIDE the product object, not as second argument
        var product = {
          id: productId,
          quantity: 1,
          callback: function(success, product, cart, error) {
            console.log('Cart operation result:', { success, product, cart, error });
            
            button.disabled = false;
            
            if (success) {
              button.textContent = '✓ Added';
              setTimeout(() => {
                button.textContent = originalText;
              }, 2000);
              
              console.log('Product added to cart successfully', product);
              
              // Track widget usage
              trackWidgetUsage('add_to_cart', productId);
            } else {
              button.textContent = 'Try Again';
              setTimeout(() => {
                button.textContent = originalText;
              }, 2000);
              
              console.error('Failed to add product to cart', error);
            }
          }
        };
        
        // Call with SINGLE argument as per documentation
        window.Ecwid.Cart.addProduct(product);
      })
      .catch((error) => {
        console.warn('Ecwid not ready, offering product view:', error);
        button.disabled = false;
        button.textContent = 'View Product';
        
        // Fallback: navigate to product page
        button.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          if (window.Ecwid && window.Ecwid.openPage) {
            window.Ecwid.openPage('product', { id: productId });
          } else {
            window.location.href = `#!/~/product/id=${productId}`;
          }
        };
        
        setTimeout(() => {
          button.textContent = originalText;
          button.onclick = handleAddToCart; // Restore original handler
        }, 3000);
      });
  }

  /**
   * Handle product name/image click for navigation
   */
  function handleProductClick(event) {
    // Prevent default link behavior since we're using JavaScript navigation
    event.preventDefault();
    
    const link = event.target.closest('.grid-product__image, .grid-product__title');
    const productId = link.getAttribute('data-product-id');
    
    console.log('Navigating to product:', productId);
    
    // Navigate to product page using Ecwid API
    Ecwid.openPage('product', {
      id: parseInt(productId)
    });
    
    // Track widget usage
    trackWidgetUsage('view_product', parseInt(productId));
  }

  /**
   * Track widget usage and add to order tracking
   */
  function trackWidgetUsage(action, productId) {
    try {
      // Add to widget tracking for orders
      if (action === 'add_to_cart') {
        const trackingItem = {
          productId: productId,
          action: action,
          timestamp: new Date().toISOString(),
          widget: 'recently-updated-products'
        };
        
        widgetAddedProducts.push(trackingItem);
        updateWidgetTrackingField();
        
        console.log(`🛒 Tracked widget add to cart: Product ${productId}`);
        
        // Send to analytics endpoint
        fetch(`${CONFIG.API_BASE_URL}/api/analytics/widget-analytics/add-to-cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            productId: productId,
            productName: '', // Will be filled from product data if available
            productSku: '',  // Will be filled from product data if available
            timestamp: new Date().toISOString(),
            widget: 'recently-updated-products'
          })
        }).catch(error => {
          console.warn('Failed to send analytics data:', error);
        });
      }

      // Track widget view
      if (action === 'view') {
        console.log(`👁️ Tracked widget view`);
        
        // Send view to analytics endpoint
        fetch(`${CONFIG.API_BASE_URL}/api/analytics/widget-analytics/view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            widget: 'recently-updated-products'
          })
        }).catch(error => {
          console.warn('Failed to send view analytics:', error);
        });
      }

      // General usage tracking (for other actions like view_product)
      if (action === 'view_product') {
        console.log(`👁️ Tracked widget product view: Product ${productId}`);
      }
    } catch (error) {
      console.warn('Failed to track widget usage:', error);
    }
  }

  /**
   * Remove the widget from the page
   */
  function removeWidget() {
    // Remove all instances of the widget
    const existingWidgets = document.querySelectorAll(`#${CONFIG.WIDGET_CONTAINER_ID}, .${CONFIG.WIDGET_SOURCE_LABEL}`);
    existingWidgets.forEach(widget => {
      if (widget.parentNode) {
        widget.parentNode.removeChild(widget);
        console.log('🗑️ Removed widget instance');
      }
    });
    
    // Reset widget container reference
    widgetContainer = null;
    console.log('🧹 All widget instances removed');
  }

  /**
   * Utility function to clean HTML and truncate text
   */
  function truncateText(text, maxLength) {
    if (!text) return '';
    
    // Remove HTML tags and decode HTML entities
    const cleanText = text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/&amp;/g, '&')  // Replace &amp; with &
      .replace(/&lt;/g, '<')   // Replace &lt; with <
      .replace(/&gt;/g, '>')   // Replace &gt; with >
      .replace(/&quot;/g, '"') // Replace &quot; with "
      .replace(/&#39;/g, "'")  // Replace &#39; with '
      .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
      .trim();                 // Remove leading/trailing whitespace
    
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.substring(0, maxLength).trim() + '...';
  }

  // Widget is automatically initialized by Ecwid.OnAPILoaded.add() above
  // No manual initialization needed - follows Ecwid documentation pattern

})();
