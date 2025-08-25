import { Router, Request, Response, NextFunction } from 'express'
import fs from 'fs/promises'
import path from 'path'

const router = Router()

interface WidgetSettings {
  enabled: boolean
  defaultProductCount: number
}

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json')

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(SETTINGS_FILE)
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// Load settings from file
async function loadSettings(): Promise<WidgetSettings> {
  try {
    await ensureDataDir()
    const data = await fs.readFile(SETTINGS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    // Return default settings if file doesn't exist
    return {
      enabled: true,
      defaultProductCount: 6,
    }
  }
}

// Save settings to file
async function saveSettings(settings: WidgetSettings): Promise<void> {
  try {
    await ensureDataDir()
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2))
  } catch (error) {
    console.error('Failed to save settings:', error)
    throw new Error('Failed to save settings')
  }
}

// GET /api/settings - Get current settings
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await loadSettings()
    res.json(settings)
  } catch (error) {
    next(error)
  }
})

// POST /api/settings - Update settings
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { enabled, defaultProductCount } = req.body

    // Validate input
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        status: 'error',
        message: 'enabled must be a boolean',
      })
    }

    if (typeof defaultProductCount !== 'number' || defaultProductCount < 1 || defaultProductCount > 50) {
      return res.status(400).json({
        status: 'error',
        message: 'defaultProductCount must be a number between 1 and 50',
      })
    }

    const settings: WidgetSettings = {
      enabled,
      defaultProductCount,
    }

    await saveSettings(settings)

    return res.json({
      status: 'success',
      message: 'Settings updated successfully',
      data: settings,
    })
  } catch (error) {
    return next(error)
  }
})

// PUT /api/settings - Same as POST for compatibility
router.put('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { enabled, defaultProductCount } = req.body

    // Validate input
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        status: 'error',
        message: 'enabled must be a boolean',
      })
    }

    if (typeof defaultProductCount !== 'number' || defaultProductCount < 1 || defaultProductCount > 50) {
      return res.status(400).json({
        status: 'error',
        message: 'defaultProductCount must be a number between 1 and 50',
      })
    }

    const settings: WidgetSettings = {
      enabled,
      defaultProductCount,
    }

    await saveSettings(settings)

    return res.json({
      status: 'success',
      message: 'Settings updated successfully',
      data: settings,
    })
  } catch (error) {
    return next(error)
  }
})

// POST /api/settings/sync - Force sync settings (timestamp for cache busting)
router.post('/sync', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await loadSettings()
    
    return res.json({
      status: 'success',
      message: 'Settings synchronized successfully',
      data: {
        ...settings,
        syncTimestamp: Date.now(),
      },
    })
  } catch (error) {
    return next(error)
  }
})

export default router
