import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchSettings, saveSettings as saveSettingsApi } from '@/utils/settingsApi'

export interface WidgetSettings {
  enabled: boolean
  defaultProductCount: number
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<WidgetSettings>({
    enabled: true,
    defaultProductCount: 6,
  })
  
  const loading = ref(false)
  const error = ref<string | null>(null)

  const loadSettings = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await fetchSettings()
      settings.value = { ...settings.value, ...data }
    } catch (err) {
      error.value = 'Failed to load settings'
      console.error('Error loading settings:', err)
    } finally {
      loading.value = false
    }
  }

  const saveSettings = async () => {
    try {
      console.log('Store saving settings:', settings.value)
      await saveSettingsApi(settings.value)
      console.log('Settings saved to API successfully')
    } catch (err) {
      error.value = 'Failed to save settings'
      console.error('Error saving settings:', err)
      throw err
    }
  }

  const updateSettings = (newSettings: Partial<WidgetSettings>) => {
    settings.value = { ...settings.value, ...newSettings }
  }

  return {
    settings,
    loading,
    error,
    loadSettings,
    saveSettings,
    updateSettings,
  }
})
