import { Request, Response, NextFunction } from 'express'

export interface ApiError extends Error {
  statusCode?: number
  status?: string
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500
  const status = err.status || 'error'

  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    statusCode,
    url: req.url,
    method: req.method,
  })

  res.status(statusCode).json({
    status,
    message: err.message || 'Internal Server Error',
    ...(process.env['NODE_ENV'] === 'development' && { stack: err.stack }),
  })
}
