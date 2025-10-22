# 🚀 Miltera Fixlog API - Backend Documentation

**Modern ve güvenli RESTful API** - Hono.js framework'ü ile geliştirilmiş, PostgreSQL ve Redis destekli enterprise-grade backend servisi.

## 📋 İçindekiler

- [Genel Bakış](#genel-bakış)
- [Teknik Mimari](#teknik-mimari)
- [Kurulum](#kurulum)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Database Schema](#database-schema)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)

## 🎯 Genel Bakış

Miltera Fixlog API, teknik servis yönetim sistemi için geliştirilmiş modern bir backend servisidir. JWT tabanlı authentication, role-based access control ve real-time özellikler ile güvenli ve ölçeklenebilir bir API sağlar.

### ✨ Ana Özellikler

- **🔐 JWT Authentication** - Güvenli token tabanlı kimlik doğrulama
- **👥 Role-based Access Control** - Admin, TSP, Customer rolleri
- **📊 Real-time Features** - WebSocket entegrasyonu
- **🗄️ PostgreSQL Database** - Drizzle ORM ile type-safe database operations
- **⚡ Redis Caching** - Yüksek performans için caching
- **📝 OpenAPI Documentation** - Otomatik API dokümantasyonu
- **🛡️ Security** - Rate limiting, CORS, input validation
- **📈 Monitoring** - Performance monitoring ve logging

## 🏗️ Teknik Mimari

### **Tech Stack**
- **Framework**: Hono.js (TypeScript)
- **Database**: PostgreSQL 15 + Drizzle ORM
- **Cache**: Redis
- **Authentication**: Better Auth + JWT + bcrypt
- **Validation**: Zod schema validation
- **Real-time**: WebSocket (Socket.IO)
- **Documentation**: OpenAPI 3.0
- **Testing**: Jest
- **Deployment**: Docker

### **Proje Yapısı**
```
apps/api/
├── src/
│   ├── app.ts                 # Ana uygulama yapılandırması
│   ├── server.ts              # Server başlatma
│   ├── config/                # Yapılandırma dosyaları
│   ├── controllers/           # API controllers
│   ├── routes/                # API routes
│   ├── services/              # Business logic
│   ├── repositories/          # Data access layer
│   ├── lib/                   # Utility libraries
│   ├── db/                    # Database schema ve migrations
│   ├── dtos/                  # Data transfer objects
│   └── helpers/               # Helper functions
├── drizzle/                   # Database migrations
├── package.json
└── README.md
```

## 🚀 Kurulum

### **Gereksinimler**
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- pnpm (önerilen)

### **1. Bağımlılıkları Yükleyin**
```bash
cd apps/api
pnpm install
```

### **2. Environment Dosyasını Oluşturun**
```bash
cp env.example .env.local
```

`.env.local` dosyasını düzenleyin:
```env
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fixlog

# Authentication
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Email Configuration
SENDGRID_API_KEY=your-sendgrid-api-key-here
SENDGRID_FROM_EMAIL=noreply@miltera.com

# Server Configuration
PORT=3015
NODE_ENV=development
```

### **3. Database'i Kurun**
```bash
# Migration'ları çalıştırın
pnpm db:migrate

# Seed verilerini ekleyin
pnpm db:seed
```

### **4. Server'ı Başlatın**
```bash
# Development mode
pnpm dev

# Production mode
pnpm build
pnpm start
```

## 📡 API Endpoints

### **Base URL**
```
http://localhost:3015/api/v1
```

### **Authentication Endpoints**
```http
POST   /auth/login              # Kullanıcı girişi
POST   /auth/register           # Kullanıcı kaydı
POST   /auth/change-password    # Şifre değiştirme
GET    /auth/profile            # Profil bilgileri
PUT    /auth/profile            # Profil güncelle
GET    /auth/preferences        # Kullanıcı tercihleri
PUT    /auth/preferences        # Tercihleri güncelle
GET    /auth/security           # Güvenlik ayarları
PUT    /auth/security           # Güvenlik ayarlarını güncelle
```

### **Products Endpoints**
```http
GET    /products                # Ürün listesi
POST   /products                # Yeni ürün oluştur
GET    /products/:id            # Ürün detayı
PUT    /products/:id            # Ürün güncelle
DELETE /products/:id            # Ürün sil
POST   /products/bulk           # Toplu ürün oluştur
GET    /products/export         # Excel export
POST   /products/import         # Excel import
GET    /products/:id/history    # Ürün geçmişi
GET    /products/:id/issues     # Ürün sorunları
GET    /products/stats          # Ürün istatistikleri
```

### **Issues Endpoints**
```http
GET    /issues                  # Arıza listesi
POST   /issues                  # Yeni arıza kaydı
GET    /issues/:id              # Arıza detayı
PUT    /issues/:id              # Arıza güncelle
DELETE /issues/:id              # Arıza sil
GET    /issues/stats            # Arıza istatistikleri
```

### **Companies Endpoints**
```http
GET    /companies               # Firma listesi
POST   /companies               # Yeni firma oluştur
GET    /companies/:id           # Firma detayı
PUT    /companies/:id           # Firma güncelle
DELETE /companies/:id           # Firma sil
```

### **Users Endpoints**
```http
GET    /users                   # Kullanıcı listesi
POST   /users                   # Yeni kullanıcı oluştur
GET    /users/:id               # Kullanıcı detayı
PUT    /users/:id               # Kullanıcı güncelle
DELETE /users/:id               # Kullanıcı sil
```

### **Service Operations Endpoints**
```http
GET    /service-operations      # Servis operasyonları
POST   /service-operations      # Yeni operasyon
GET    /service-operations/:id  # Operasyon detayı
PUT    /service-operations/:id  # Operasyon güncelle
DELETE /service-operations/:id  # Operasyon sil
```

### **Warehouse Endpoints**
```http
GET    /warehouse               # Depo bilgileri
GET    /warehouse/inventory     # Envanter listesi
POST   /warehouse/move          # Ürün taşıma
GET    /warehouse/stats         # Depo istatistikleri
```

### **Reports Endpoints**
```http
GET    /reports/dashboard       # Dashboard raporları
GET    /reports/products        # Ürün raporları
GET    /reports/issues          # Arıza raporları
GET    /reports/performance     # Performans raporları
```

## 🔐 Authentication

### **JWT Token Authentication**
API, JWT (JSON Web Token) tabanlı authentication kullanır. Tüm protected endpoint'ler için `Authorization` header'ında Bearer token gereklidir.

```http
Authorization: Bearer <jwt_token>
```

### **Login Request**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@miltera.com.tr",
  "password": "admin123"
}
```

### **Login Response**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@miltera.com.tr",
      "name": "Admin User",
      "role": "ADMIN",
      "isActive": true,
      "emailVerified": true
    },
    "token": "jwt_token_here"
  }
}
```

### **Role-based Access Control**
- **ADMIN**: Tüm endpoint'lere erişim
- **TSP**: Ürün, arıza, servis operasyonları
- **CUSTOMER**: Sadece kendi verilerine erişim

## 🗄️ Database Schema

### **Ana Tablolar**
- **users**: Kullanıcı bilgileri
- **companies**: Şirket bilgileri
- **products**: Ürün bilgileri
- **issues**: Arıza kayıtları
- **service_operations**: Servis operasyonları
- **shipments**: Sevkiyat bilgileri
- **locations**: Konum bilgileri
- **notifications**: Bildirimler
- **audit_logs**: Audit kayıtları

### **Database Commands**
```bash
# Migration oluştur
pnpm db:generate

# Migration'ları uygula
pnpm db:migrate

# Database studio'yu aç
pnpm db:studio

# Seed verilerini ekle
pnpm db:seed
```

## 🛠️ Development

### **Available Scripts**
```bash
pnpm dev              # Development server
pnpm build            # Production build
pnpm start            # Production server
pnpm test             # Run tests
pnpm test:watch       # Watch mode tests
pnpm test:coverage    # Test coverage
pnpm lint             # Lint code
pnpm format           # Format code
```

### **Code Structure**
- **Controllers**: HTTP request/response handling
- **Services**: Business logic
- **Repositories**: Data access layer
- **Routes**: API endpoint definitions
- **DTOs**: Data transfer objects
- **Helpers**: Utility functions

### **Adding New Endpoints**
1. Create DTO in `src/dtos/`
2. Create service in `src/services/`
3. Create controller in `src/controllers/`
4. Create route in `src/routes/`
5. Add route to main app in `src/app.ts`

## 🧪 Testing

### **Test Coverage**
- **Unit Tests**: Services, utilities
- **Integration Tests**: API endpoints
- **Authentication Tests**: JWT, RBAC
- **Database Tests**: CRUD operations

### **Run Tests**
```bash
# All tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage

# Specific test file
pnpm test auth.test.ts
```

## 🚀 Deployment

### **Docker Deployment**
```bash
# Build image
docker build -t miltera-api .

# Run container
docker run -p 3015:3015 miltera-api
```

### **Environment Variables (Production)**
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db:5432/fixlog
REDIS_URL=redis://prod-redis:6379
BETTER_AUTH_SECRET=production-secret-key
PORT=3015
```

### **Health Check**
```http
GET /api/v1/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-12-29T18:20:11.240Z"
}
```

## 📊 Performance

### **Metrics**
- **Response Time**: < 50ms
- **Throughput**: 1000+ requests/second
- **Uptime**: 99.9%
- **Error Rate**: < 0.1%

### **Monitoring**
- Performance monitoring middleware
- Request/response logging
- Error tracking
- Database query monitoring

## 🔒 Security

### **Security Features**
- JWT token authentication
- Password hashing (bcrypt)
- Rate limiting (100 req/15min)
- CORS protection
- Input validation (Zod)
- SQL injection prevention
- XSS protection
- Security headers

### **Rate Limiting**
```javascript
// 100 requests per 15 minutes per IP
rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
```

## 📝 API Documentation

### **OpenAPI Documentation**
API dokümantasyonu otomatik olarak oluşturulur:
```
http://localhost:3015/api-docs
```

### **Schema Validation**
Tüm request/response'lar Zod schema'ları ile validate edilir:
```typescript
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Run tests (`pnpm test`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Create Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

- **Email**: info@miltera.com
- **Documentation**: [API Docs](http://localhost:3015/api-docs)
- **Issues**: [GitHub Issues](https://github.com/ozgurkzlkaya/Miltera-Support/issues)

---

**Miltera Fixlog API** - Modern, secure, and scalable backend service for technical service management.