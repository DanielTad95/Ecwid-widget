import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import productRoutes from './routes/products'
import settingsRoutes from './routes/settings'
import analyticsRoutes from './routes/analytics'
import { errorHandler } from './middleware/errorHandler'
import { notFound } from './middleware/notFound'

// Load environment variables
dotenv.config()

const app = express()
const PORT = Number(process.env['PORT']) || 3001

// Middleware
app.use(helmet())
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://frontend:3000',
    'http://localhost:3002',
    'http://widget-server:3002'
  ],
  credentials: true,
}))
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env['NODE_ENV'] || 'development',
  })
})

// API routes
app.use('/api/products', productRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/analytics', analyticsRoutes)

// 404 handler
app.use(notFound)

// Error handler
app.use(errorHandler)

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📍 Health check: http://localhost:${PORT}/health`)
  console.log(`🔗 API base: http://localhost:${PORT}/api`)
  console.log(`🌍 Environment: ${process.env['NODE_ENV'] || 'development'}`)
})

export default app
