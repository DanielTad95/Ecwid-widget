/**
 * Widget UI Generator Module
 * HTML generation and sanitization
 */

(function() {
  'use strict';

  window.WidgetUI = {
    
    /**
     * Sanitize HTML to prevent XSS
     */
    sanitizeHTML(str) {
      if (!str) return '';
      
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    },

    /**
     * Generate product URL
     */
    generateProductURL(product) {
      const safeName = this.sanitizeHTML(product.name || 'product')
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '')
        .toLowerCase();
      
      return `#!/${safeName}/p/${product.id}`;
    },

    /**
     * Format price display
     */
    formatPrice(price) {
      if (typeof price !== 'number' || isNaN(price)) {
        return 'Price unavailable';
      }
      
      return `$${price.toFixed(2)}`;
    },

    /**
     * Generate HTML for a single product
     */
    generateProductHTML(product) {
      if (!product || !product.id) {
        window.WidgetLogger.warn('Invalid product data for HTML generation');
        return '';
      }

      const imageUrl = product.thumbnailUrl || 'https://via.placeholder.com/150x150?text=No+Image';
      const price = this.formatPrice(product.price);
      const productName = this.sanitizeHTML(product.name || 'Untitled Product');
      const productUrl = this.generateProductURL(product);

      return `
        <div class="grid-product grid-product--id-${product.id}">
          <div class="grid-product__wrap" data-product-id="${product.id}">
            <div class="grid-product__scroller grid-product__scroller--id-${product.id}"></div>
            <div class="grid-product__wrap-inner">
              <a href="${productUrl}" class="grid-product__image" title="${productName}" data-product-id="${product.id}">
                <div class="grid-product__spacer">
                  <div class="grid-product__spacer-inner"></div>
                </div>
                <div class="grid-product__bg" style="background-color: rgb(219, 217, 219);"></div>
                <div class="grid-product__image-wrap">
                  <div class="grid-product__label grid-product__label--bottom">
                    <div class="ec-label label--highlight">
                      <div class="label__text">Recently Updated</div>
                    </div>
                  </div>
                  <img src="${imageUrl}" 
                       alt="${productName}" 
                       title="${productName}" 
                       loading="lazy" 
                       class="grid-product__picture" 
                       style="width: 100%; height: 100%;"
                       onerror="this.src='https://via.placeholder.com/150x150?text=No+Image'">
                </div>
              </a>
              <a href="${productUrl}" class="grid-product__title" title="${productName}" data-product-id="${product.id}">
                <div class="grid-product__title-inner">${productName}</div>
              </a>
              <div class="grid-product__price">
                <div class="grid-product__price-amount">
                  <div class="grid-product__price-value ec-price-item">${price}</div>
                </div>
              </div>
              <div class="grid-product__actions">
                <button class="add-to-cart-btn" data-product-id="${product.id}" type="button">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    },

    /**
     * Generate complete widget HTML
     */
    generateWidgetHTML(products) {
      if (!Array.isArray(products) || products.length === 0) {
        return `
          <div class="widget-header">
            <h3 class="widget-title">Recently Updated Products</h3>
          </div>
          <div class="widget-empty">
            <p>No recent products available.</p>
          </div>
        `;
      }

      const productsHTML = products
        .filter(product => product && product.id)
        .map(product => this.generateProductHTML(product))
        .join('');

      return `
        <div class="widget-header">
          <h3 class="widget-title">Recently Updated Products</h3>
        </div>
        <div class="grid__products grid__products--classic grid__products--layout-center grid__products--aspect-ratio-0667 grid__products--large-items" 
             data-items="${products.length}" 
             data-cols="3" 
             style="max-width: 10000px;">
          ${productsHTML}
        </div>
      `;
    },

    /**
     * Show loading state
     */
    generateLoadingHTML() {
      return `
        <div class="widget-header">
          <h3 class="widget-title">Recently Updated Products</h3>
        </div>
        <div class="widget-loading">
          <div class="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      `;
    },

    /**
     * Show error state
     */
    generateErrorHTML(message = 'Failed to load products') {
      return `
        <div class="widget-header">
          <h3 class="widget-title">Recently Updated Products</h3>
        </div>
        <div class="widget-error">
          <p>${this.sanitizeHTML(message)}</p>
          <button onclick="window.WidgetCore?.refresh()" class="retry-btn">Try Again</button>
        </div>
      `;
    }
  };

})();
