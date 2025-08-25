import axios from 'axios'
import type { WidgetSettings } from '@/stores/settingsStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

// Create axios instance for our backend API
const api = axios.create({
  baseURL: API_BASE_URL,
})

export const fetchSettings = async (): Promise<WidgetSettings> => {
  try {
    const response = await api.get('/api/settings')
    return response.data
  } catch (error) {
    console.error('Failed to fetch settings:', error)
    // Return default settings if API fails
    return {
      enabled: true,
      defaultProductCount: 6,
    }
  }
}

export const saveSettings = async (settings: WidgetSettings): Promise<void> => {
  try {
    console.log('API saving settings:', settings)
    const response = await api.post('/api/settings', settings)
    console.log('API response:', response.data)
  } catch (error: any) {
    console.error('Failed to save settings:', error)
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
    }
    throw new Error('Failed to save settings')
  }
}

export const syncSettings = async (): Promise<WidgetSettings & { syncTimestamp: number }> => {
  try {
    const response = await api.post('/api/settings/sync')
    return response.data.data
  } catch (error) {
    console.error('Failed to sync settings:', error)
    throw new Error('Failed to sync settings')
  }
}

// Local storage fallback for settings
export const loadSettingsFromLocalStorage = (): WidgetSettings => {
  try {
    const stored = localStorage.getItem('ecwid-widget-settings')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load settings from localStorage:', error)
  }
  
  return {
    enabled: true,
    defaultProductCount: 6,
  }
}

export const saveSettingsToLocalStorage = (settings: WidgetSettings): void => {
  try {
    localStorage.setItem('ecwid-widget-settings', JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error)
  }
}
