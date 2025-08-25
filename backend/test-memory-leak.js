/**
 * Простой тест защиты от утечек памяти в AnalyticsStore
 */

const { analyticsStore } = require('./dist/services/analyticsStore');

console.log('🧪 Тестирование защиты от утечек памяти...\n');

// Сбрасываем состояние перед тестом
analyticsStore.reset();

// Функция для добавления тестовых товаров
function addTestProducts(count, prefix = 'test') {
  console.log(`📦 Добавляем ${count} тестовых товаров...`);
  
  for (let i = 1; i <= count; i++) {
    analyticsStore.addProduct({
      id: `${prefix}-${i}`,
      name: `Товар ${prefix} ${i}`,
      price: Math.floor(Math.random() * 1000) + 100,
      lastAdded: new Date().toISOString()
    });
  }
  
  console.log(`📊 Текущее количество товаров: ${analyticsStore.getAnalytics().products.length}`);
}

// Тест 1: Превышение лимита товаров
console.log('=== ТЕСТ 1: Превышение лимита товаров ===');
addTestProducts(150, 'limit-test');
console.log(`🎯 После добавления 150 товаров: ${analyticsStore.getAnalytics().products.length} (ожидаем <= 100)\n`);

// Тест 2: Принудительная очистка
console.log('=== ТЕСТ 2: Принудительная очистка ===');
addTestProducts(50, 'cleanup-test');
console.log(`📊 Перед очисткой: ${analyticsStore.getAnalytics().products.length}`);
analyticsStore.forceCleanup();
console.log(`🧹 После очистки: ${analyticsStore.getAnalytics().products.length}\n`);

// Тест 3: Добавление старых товаров (имитация)
console.log('=== ТЕСТ 3: Старые товары ===');
const oldProduct = {
  id: 'old-product-1',
  name: 'Старый товар',
  price: 500,
  lastAdded: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString() // 32 дня назад
};

analyticsStore.addProduct(oldProduct);
console.log(`📊 После добавления старого товара: ${analyticsStore.getAnalytics().products.length}`);
analyticsStore.forceCleanup();
console.log(`🧹 После очистки старых товаров: ${analyticsStore.getAnalytics().products.length}\n`);

// Финальная статистика
const analytics = analyticsStore.getAnalytics();
console.log('=== ФИНАЛЬНАЯ СТАТИСТИКА ===');
console.log(`📦 Общее количество товаров: ${analytics.products.length}`);
console.log(`📈 Общее количество просмотров: ${analytics.totalViews}`);
console.log(`🕒 Последнее обновление: ${analytics.lastUpdated}`);

console.log('\n✅ Тест защиты от утечек памяти завершен!');
