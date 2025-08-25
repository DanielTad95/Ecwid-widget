<template>
  <div class="analytics-container">
    <h2>📊 Аналитика виджета</h2>
    
    <!-- Основная статистика -->
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Просмотры</h3>
        <div class="stat-value">{{ analytics.totalViews }}</div>
      </div>
      
      <div class="stat-card">
        <h3>Добавлено в корзину</h3>
        <div class="stat-value">{{ analytics.addedToCart }}</div>
      </div>
      
      <div class="stat-card">
        <h3>Конверсия</h3>
        <div class="stat-value">
          {{ analytics.totalViews > 0 ? ((analytics.addedToCart / analytics.totalViews) * 100).toFixed(1) : 0 }}%
        </div>
      </div>
      
      <div class="stat-card">
        <h3>Последнее обновление</h3>
        <div class="stat-value small">
          {{ formatDate(analytics.lastUpdated) }}
        </div>
      </div>
    </div>
    
    <!-- Таблица по продуктам -->
    <div class="products-analytics">
      <h3>📈 Статистика по продуктам</h3>
      
      <div v-if="loading" class="loading">
        Загрузка данных...
      </div>
      
      <div v-else-if="analytics.products.length === 0" class="no-data">
        Пока нет данных по продуктам
      </div>
      
      <table v-else class="products-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>SKU</th>
            <th>Добавлено в корзину</th>
            <th>Последнее добавление</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in analytics.products" :key="product.id">
            <td>{{ product.id }}</td>
            <td>{{ product.name }}</td>
            <td>{{ product.sku }}</td>
            <td>{{ product.addedToCart }}</td>
            <td>{{ formatDate(product.lastAdded) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Кнопка обновления -->
    <div class="actions">
      <button @click="refreshAnalytics" :disabled="loading" class="refresh-btn">
        {{ loading ? 'Обновление...' : '🔄 Обновить данные' }}
      </button>
      
      <button @click="resetAnalytics" :disabled="loading" class="reset-btn">
        {{ loading ? 'Сброс...' : '🗑️ Сбросить статистику' }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '../stores/settingsStore'

export default {
  name: 'AnalyticsComponent',
  setup() {
    const settingsStore = useSettingsStore()
    const loading = ref(false)
    const analytics = ref({
      totalViews: 0,
      addedToCart: 0,
      lastUpdated: new Date().toISOString(),
      products: []
    })

    const fetchAnalytics = async () => {
      try {
        loading.value = true
        const response = await fetch('http://localhost:3001/api/analytics/widget-analytics')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        analytics.value = data
      } catch (error) {
        console.error('Ошибка загрузки аналитики:', error)
        // Используем console.error вместо store.setError
        alert('Ошибка загрузки данных аналитики')
      } finally {
        loading.value = false
      }
    }

    const refreshAnalytics = () => {
      fetchAnalytics()
    }

    const resetAnalytics = async () => {
      try {
        loading.value = true
        const response = await fetch('http://localhost:3001/api/analytics/widget-analytics/reset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        // После сброса обновляем данные
        await fetchAnalytics()
        alert('Статистика успешно сброшена')
      } catch (error) {
        console.error('Ошибка сброса аналитики:', error)
        alert('Ошибка сброса статистики')
      } finally {
        loading.value = false
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'Никогда'
      
      try {
        const date = new Date(dateString)
        return date.toLocaleString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        return 'Неверная дата'
      }
    }

    onMounted(() => {
      fetchAnalytics()
    })

    return {
      loading,
      analytics,
      refreshAnalytics,
      resetAnalytics,
      formatDate
    }
  }
}
</script>

<style scoped>
.analytics-container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.stat-card h3 {
  margin: 0 0 10px 0;
  color: #495057;
  font-size: 14px;
  font-weight: 600;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #007bff;
  margin: 0;
}

.stat-value.small {
  font-size: 12px;
  color: #6c757d;
}

.products-analytics {
  margin-bottom: 30px;
}

.products-analytics h3 {
  margin-bottom: 15px;
  color: #495057;
}

.loading, .no-data {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  font-style: italic;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.products-table th,
.products-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.products-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

.products-table tr:hover {
  background: #f8f9fa;
}

.actions {
  text-align: center;
}

.refresh-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: #0056b3;
}

.refresh-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.reset-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
  margin-left: 10px;
}

.reset-btn:hover:not(:disabled) {
  background: #c82333;
}

.reset-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}
</style>
