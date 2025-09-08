# Fixlog - Teknik Servis Portalı

Modern ve kapsamlı teknik servis yönetim sistemi. Miltera'nın enerji sektörü ürünlerinin yaşam döngüsünü baştan sona takip edebilen, teknik servis süreçlerini dijitalleştiren web tabanlı portal.

## 🚀 Özellikler

### 📦 Ürün Yaşam Döngüsü Yönetimi
- **İlk Üretim**: Ürünlerin sisteme girişi ve sayımı
- **Fabrikasyon Testleri**: Donanım doğrulama ve konfigürasyon
- **Sevkiyat Yönetimi**: Müşteriye gönderim süreçleri
- **Arıza Takibi**: Müşteri arıza kayıtları ve çözüm süreçleri
- **Garanti Yönetimi**: Garanti durumu ve süre takibi
- **Hurda Yönetimi**: Tamir edilemeyen ürünlerin hurdaya ayrılması

### 🏢 Depo ve Envanter Yönetimi
- **Konum Yönetimi**: Depo, raf, servis alanı vb. konumlar
- **Stok Takibi**: Gerçek zamanlı envanter durumu
- **Toplu İşlemler**: Çoklu ürün ekleme ve durum güncelleme
- **Envanter Sayımı**: Fiziksel sayım ve sistem karşılaştırması
- **Stok Uyarıları**: Düşük stok, sevkiyata hazır ürün bildirimleri

### 🔧 Teknik Servis Operasyonları
- **Servis İş Akışları**: Adım adım tamir süreçleri
- **Operasyon Türleri**: Donanım doğrulama, tamir, test, kalite kontrol
- **Teknisyen Performansı**: Kişisel ve ekip performans raporları
- **Garanti Kontrolü**: Garanti kapsamında olan/olmayan işlemler
- **Maliyet Takibi**: Operasyon maliyetleri ve süre analizi

### 📧 Otomatik Bildirimler
- **E-posta Bildirimleri**: Durum değişikliklerinde otomatik bildirimler
- **Müşteri Bildirimleri**: Arıza durumu, sevkiyat bilgileri
- **TSP Bildirimleri**: Yeni arıza kayıtları, operasyon atamaları
- **Yönetici Bildirimleri**: Önemli durum değişiklikleri

### 👥 Kullanıcı Yönetimi
- **Rol Tabanlı Erişim**: Admin, TSP, Müşteri rolleri
- **Müşteri Portalı**: Self-service arıza kaydı ve takip
- **TSP Paneli**: Teknik servis operasyonları yönetimi
- **Admin Paneli**: Sistem yönetimi ve konfigürasyon

## 🏗️ Teknik Mimari

### Backend (API)
- **Framework**: Hono.js (TypeScript)
- **Database**: PostgreSQL 15 + Drizzle ORM
- **Authentication**: Better Auth + JWT
- **Email Service**: SMTP entegrasyonu (Nodemailer)
- **Validation**: Zod schema validation
- **Cache**: Redis

### Frontend (Web)
- **Framework**: Next.js 14 (App Router)
- **UI Library**: Material-UI (MUI)
- **State Management**: React Query + Zustand
- **Authentication**: Better Auth
- **Styling**: Emotion + MUI Theme

### Veritabanı Şeması
```sql
-- Ana Tablolar
users (Kullanıcılar)
companies (Firmalar)
products (Ürünler)
issues (Arıza Kayıtları)
service_operations (Servis Operasyonları)
shipments (Sevkiyatlar)
locations (Konumlar)
product_history (Ürün Geçmişi)

-- İlişkili Tablolar
product_types, product_models
issue_categories, internal_issue_categories
shipment_items, issue_products
```

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- pnpm (önerilen)

### 1. Projeyi Klonlayın
```bash
git clone <repository-url>
cd fixlog
```

### 2. Bağımlılıkları Yükleyin
```bash
pnpm install
```

### 3. Environment Dosyasını Oluşturun
```bash
# API için
cp apps/api/env.example apps/api/.env.local

# Web için
cp apps/web/.env.example apps/web/.env.local
```

### 4. Veritabanını Kurun

#### Docker ile (Önerilen)
```bash
# PostgreSQL ve Redis'i başlatın
docker-compose up -d postgres redis

# Migration'ları çalıştırın
cd apps/api
pnpm db:migrate

# Seed verilerini ekleyin
pnpm db:seed
```

#### Manuel Kurulum
```bash
# PostgreSQL veritabanı oluşturun
createdb fixlog

# Migration'ları çalıştırın
cd apps/api
pnpm db:migrate
pnpm db:seed
```

### 5. Ortam Değişkenlerini Ayarlayın
```bash
# apps/api/.env.local dosyasını düzenleyin
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fixlog"
BETTER_AUTH_SECRET="your-secret-key"
REDIS_URL="redis://localhost:6379"
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### 6. Uygulamayı Başlatın
```bash
# Development modunda
pnpm dev

# Production build
pnpm build
pnpm start
```

## 📱 Kullanım

### Admin Kullanıcısı
- **Email**: admin@miltera.com.tr
- **Şifre**: (seed'de oluşturulur)
- **Yetkiler**: 
  - Sistem yönetimi
  - Kullanıcı, firma, ürün türü yönetimi
  - Konfigürasyon ayarları
  - Sistem geneli raporlar

### TSP (Teknik Servis Personeli)
- **Email**: tsp@miltera.com.tr
- **Şifre**: (seed'de oluşturulur)
- **Yetkiler**:
  - Ürün yönetimi (ilk üretim, test, konfigürasyon)
  - Arıza işlemleri (kayıt, tamir süreçleri)
  - Sevkiyat işlemleri
  - Envanter yönetimi

### Müşteri Kullanıcısı
- **Email**: musteri@testmusteri.com
- **Şifre**: (seed'de oluşturulur)
- **Yetkiler**:
  - Arıza kaydı oluşturma
  - Arıza durumu takibi
  - Ürün geçmişi görüntüleme

## 🔄 İş Akışları

### Ürün Yaşam Döngüsü
```
İlk Üretim → Fabrikasyon Testi → Sevkiyat Hazır → Müşteriye Gönderim
     ↓              ↓                ↓              ↓
   Sayım      Donanım Doğrulama   Konfigürasyon   Satış
     ↓              ↓                ↓              ↓
   Depo        Test Sonucu        Seri No Atama   Garanti Başlangıcı
```

### Arıza Süreci
```
Arıza Kaydı → Teslim Alma → Ön Test → Tamir → Final Test → Sevkiyat
     ↓            ↓           ↓        ↓        ↓          ↓
  Müşteri     TSP Bildirim  Bulgular  İşlemler  Kalite    Müşteri
  Bildirimi   TSP Bildirimi  Raporu   Kaydı     Kontrolü  Bildirimi
```

## 📊 Raporlama

### Ürün Raporları
- Durum bazında ürün dağılımı
- Garanti durumu analizi
- Üretim ve satış istatistikleri

### Servis Raporları
- Teknisyen performans analizi
- Arıza türü dağılımı
- Tamir süre ve maliyet analizi

### Envanter Raporları
- Konum bazında stok durumu
- Sevkiyata hazır ürün listesi
- Arızalı ürün raporu

## 🔧 API Endpoints

### Ürün Yönetimi
```
GET    /api/products              # Ürün listesi
POST   /api/products              # Yeni ürün oluşturma
PUT    /api/products/:id/status   # Durum güncelleme
GET    /api/products/:id/history  # Ürün geçmişi
```

### Arıza Yönetimi
```
GET    /api/issues                # Arıza listesi
POST   /api/issues                # Yeni arıza kaydı
PUT    /api/issues/:id/status     # Durum güncelleme
POST   /api/issues/:id/operations # Operasyon ekleme
```

### Servis Operasyonları
```
GET    /api/service-operations    # Operasyon listesi
POST   /api/service-operations    # Yeni operasyon
GET    /api/service-operations/stats # İstatistikler
```

### Depo Yönetimi
```
GET    /api/warehouse/inventory   # Envanter durumu
POST   /api/warehouse/locations   # Konum oluşturma
PUT    /api/warehouse/move        # Ürün taşıma
```

## 🛠️ Geliştirme

### Kod Yapısı
```
apps/
├── api/                    # Backend API
│   ├── src/
│   │   ├── controllers/    # API controllers
│   │   ├── services/       # Business logic
│   │   ├── db/            # Database schema
│   │   └── routes/        # API routes
│   └── drizzle/           # Database migrations
└── web/                   # Frontend
    ├── app/               # Next.js app router
    ├── components/        # React components
    ├── features/          # Feature modules
    └── lib/              # Utilities
```

### Veritabanı İşlemleri
```bash
# Migration oluşturma
cd apps/api
pnpm db:generate

# Migration çalıştırma
pnpm db:migrate

# Seed verileri
pnpm db:seed

# Drizzle Studio (veritabanı görüntüleme)
pnpm db:studio
```

### Docker ile Geliştirme
```bash
# Tüm servisleri başlatma
docker-compose up -d

# Sadece veritabanı servisleri
docker-compose up -d postgres redis

# Logları görüntüleme
docker-compose logs -f api

# Servisleri durdurma
docker-compose down
```

### Katkıda Bulunma
1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 İletişim

- **Proje Sahibi**: Miltera R&D
- **E-posta**: info@miltera.com
- **Website**: https://miltera.com

## 🙏 Teşekkürler

Bu proje aşağıdaki teknolojiler ve topluluklar sayesinde mümkün olmuştur:

- [Next.js](https://nextjs.org/)
- [Hono](https://hono.dev/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Material-UI](https://mui.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)
- [Better Auth](https://auth.better-auth.com/)