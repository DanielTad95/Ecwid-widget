import { Router } from 'express';
import { analyticsStore } from '../services/analyticsStore';

const router = Router();

// Получить аналитику виджета
router.get('/widget-analytics', (req, res) => {
  try {
    const analytics = analyticsStore.getAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Error getting widget analytics:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Обновить статистику (когда товар добавлен в корзину через виджет)
router.post('/widget-analytics/add-to-cart', (req, res) => {
  try {
    const { productId, productName, productSku } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Сохраняем данные в аналитику
    analyticsStore.addToCart(
      parseInt(productId), 
      productName || '', 
      productSku || ''
    );

    console.log('Product added to cart via widget:', {
      productId,
      productName,
      productSku,
      timestamp: new Date().toISOString()
    });

    return res.json({ 
      success: true, 
      message: 'Analytics updated',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating analytics:', error);
    return res.status(500).json({ error: 'Failed to update analytics' });
  }
});

// Добавить просмотр виджета
router.post('/widget-analytics/view', (req, res) => {
  try {
    analyticsStore.addView();
    
    console.log('Widget view recorded:', {
      timestamp: new Date().toISOString()
    });

    return res.json({ 
      success: true, 
      message: 'View recorded',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error recording view:', error);
    return res.status(500).json({ error: 'Failed to record view' });
  }
});

// Получить данные tracking по конкретному продукту
router.get('/widget-analytics/product/:productId', (req, res) => {
  try {
    const { productId } = req.params;
    const productAnalytics = analyticsStore.getProductAnalytics(parseInt(productId));
    res.json(productAnalytics);
  } catch (error) {
    console.error('Error getting product analytics:', error);
    res.status(500).json({ error: 'Failed to get product analytics' });
  }
});

// Сбросить аналитику (для тестирования)
router.post('/widget-analytics/reset', (req, res) => {
  try {
    analyticsStore.reset();
    
    console.log('Analytics reset:', {
      timestamp: new Date().toISOString()
    });

    return res.json({ 
      success: true, 
      message: 'Analytics reset',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error resetting analytics:', error);
    return res.status(500).json({ error: 'Failed to reset analytics' });
  }
});

export default router;
