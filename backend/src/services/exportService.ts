import * as XLSX from 'xlsx'
import { EcwidProduct } from './ecwidService'
import fs from 'fs'
import path from 'path'

export class ExportService {
  async exportToCSV(products: EcwidProduct[]): Promise<Buffer> {
    const csvData = products.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku || '',
      price: product.price || 0,
      enabled: product.enabled ? 'Yes' : 'No',
      description: product.description || '',
      image: product.thumbnailUrl || '',
      updated: product.updated || '',
    }))

    // Create CSV string
    const headers = [
      'ID',
      'Name',
      'SKU',
      'Price',
      'Enabled',
      'Description',
      'Image URL',
      'Last Updated',
    ]

    const csvRows = [
      headers.join(','),
      ...csvData.map(row => [
        row.id,
        `"${row.name.replace(/"/g, '""')}"`,
        `"${row.sku}"`,
        row.price,
        row.enabled,
        `"${row.description.replace(/"/g, '""')}"`,
        `"${row.image}"`,
        `"${row.updated}"`,
      ].join(','))
    ]

    return Buffer.from(csvRows.join('\n'), 'utf8')
  }

  async exportToXLSX(products: EcwidProduct[]): Promise<Buffer> {
    const worksheetData = products.map(product => ({
      'ID': product.id,
      'Name': product.name,
      'SKU': product.sku || '',
      'Price': product.price || 0,
      'Enabled': product.enabled ? 'Yes' : 'No',
      'Description': product.description || '',
      'Image URL': product.thumbnailUrl || '',
      'Last Updated': product.updated || '',
    }))

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(worksheetData)

    // Set column widths
    worksheet['!cols'] = [
      { width: 10 },  // ID
      { width: 30 },  // Name
      { width: 15 },  // SKU
      { width: 10 },  // Price
      { width: 10 },  // Enabled
      { width: 50 },  // Description
      { width: 30 },  // Image URL
      { width: 20 },  // Last Updated
    ]

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products')

    // Generate buffer
    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    })

    return buffer
  }

  async exportProducts(products: EcwidProduct[], format: 'csv' | 'xlsx'): Promise<Buffer> {
    console.log(`Exporting ${products.length} products to ${format.toUpperCase()}`)
    
    if (format === 'csv') {
      return this.exportToCSV(products)
    } else if (format === 'xlsx') {
      return this.exportToXLSX(products)
    } else {
      throw new Error(`Unsupported export format: ${format}`)
    }
  }

  getContentType(format: 'csv' | 'xlsx'): string {
    switch (format) {
      case 'csv':
        return 'text/csv'
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      default:
        throw new Error(`Unsupported format: ${format}`)
    }
  }

  getFileName(format: 'csv' | 'xlsx'): string {
    const timestamp = new Date().toISOString().split('T')[0]
    return `products_${timestamp}.${format}`
  }
}

export const exportService = new ExportService()
