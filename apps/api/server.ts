/**
 * Miltera Fixlog API Server
 * 
 * Bu dosya, Hono.js framework'ü kullanarak RESTful API sunucusunu başlatır.
 * Server, PostgreSQL veritabanı ile bağlantı kurar ve tüm CRUD işlemlerini yönetir.
 * 
 * Özellikler:
 * - Hono.js ile modern API geliştirme
 * - PostgreSQL veritabanı entegrasyonu
 * - JWT tabanlı authentication
 * - WebSocket desteği (şu anda devre dışı)
 * - CORS ve güvenlik middleware'leri
 * - Error handling ve logging
 * 
 * Port: 3015
 * Host: 0.0.0.0 (tüm network interface'lerde dinler)
 */

import { serve } from '@hono/node-server'
import { createServer } from 'http'
import initializeApp from './src/app'
import { initializeWebSocket } from './src/lib/websocket'
import env from './src/config/env'

// API server port - frontend ile iletişim için
const port = 3015

/**
 * Ana server başlatma fonksiyonu
 * 
 * Bu fonksiyon:
 * 1. Uygulamayı initialize eder
 * 2. HTTP server oluşturur
 * 3. Hono app'i HTTP server'a bağlar
 * 4. WebSocket server'ı başlatır (şu anda devre dışı)
 * 5. Error handling yapar
 */
async function startServer() {
  try {
    console.log('🚀 Starting server...')
    
    // Uygulamayı initialize et - database bağlantısı, middleware'ler, routes
    const app = await initializeApp()
    console.log('✅ App initialized')
    
    // HTTP server oluştur - Hono app için
    const httpServer = createServer()
    
    // WebSocket server - şu anda devre dışı, gelecekte real-time bildirimler için
    // const wsServer = createServer()
    // initializeWebSocket(wsServer)
    // wsServer.listen(3028, 'localhost', () => {
    //   console.log('✅ WebSocket listening on ws://localhost:3028')
    // })
    
    // Hono app'i HTTP server'a bağla ve belirtilen port'ta dinlemeye başla
    // hostname: '0.0.0.0' - tüm network interface'lerde dinler (IPv4/IPv6 uyumluluğu için)
    serve({
      fetch: app.fetch,
      port,
      hostname: '0.0.0.0', // localhost yerine 0.0.0.0 kullanarak IPv4/IPv6 binding sorununu çözdük
      server: httpServer
    })
    
    console.log(`✅ Server is running on port ${port}`)
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1) // Hata durumunda server'ı kapat
  }
}

// Server'ı başlat
startServer()
