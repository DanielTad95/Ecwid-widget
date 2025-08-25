import { Router, Request, Response, NextFunction } from 'express'
import { EcwidService } from '../services/ecwidService'
import { exportService } from '../services/exportService'

const router = Router()
const ecwidService = new EcwidService()

// GET /api/products - Get all products
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query['limit'] as string) || 100
    const products = await ecwidService.getProducts(limit)
    res.json(products)
    return
  } catch (error) {
    next(error)
    return
  }
})

// GET /api/products/recent - Get recently updated products
router.get('/recent', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = parseInt(req.query['count'] as string) || 6
    const products = await ecwidService.getRecentProducts(count)
    res.json(products)
    return
  } catch (error) {
    next(error)
    return
  }
})

// GET /api/products/:id - Get single product
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = parseInt(req.params['id'] || '0')
    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid product ID',
      })
    }

    const product = await ecwidService.getProduct(productId)
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found',
      })
    }

    res.json(product)
    return
  } catch (error) {
    next(error)
    return
  }
})

// POST /api/products/export - Export products
router.post('/export', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { products, format } = req.body

    if (!products || !Array.isArray(products)) {
      return res.status(400).json({
        status: 'error',
        message: 'Products array is required',
      })
    }

    if (!format || !['csv', 'xlsx'].includes(format)) {
      return res.status(400).json({
        status: 'error',
        message: 'Format must be either "csv" or "xlsx"',
      })
    }

    const buffer = await exportService.exportProducts(products, format)
    const contentType = exportService.getContentType(format)
    const fileName = exportService.getFileName(format)

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.setHeader('Content-Length', buffer.length)

    res.send(buffer)
    return
  } catch (error) {
    next(error)
    return
  }
})

// POST /api/products/refresh - Refresh product cache
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    ecwidService.clearCache()
    res.json({
      status: 'success',
      message: 'Product cache cleared',
    })
    return
  } catch (error) {
    next(error)
    return
  }
})

export default router
