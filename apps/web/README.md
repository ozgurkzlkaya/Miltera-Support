# 🎨 Miltera Fixlog Web - Frontend Documentation

**Modern ve kullanıcı dostu web arayüzü** - Next.js 14 ile geliştirilmiş, Material-UI destekli, rol bazlı dashboard sistemi.

## 📋 İçindekiler

- [Genel Bakış](#genel-bakış)
- [Teknik Mimari](#teknik-mimari)
- [Rol Bazlı Dashboard](#rol-bazlı-dashboard)
- [Kurulum](#kurulum)
- [Kullanıcı Akışları](#kullanıcı-akışları)
- [Component Yapısı](#component-yapısı)
- [Authentication](#authentication)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)

## 🎯 Genel Bakış

Miltera Fixlog Web, teknik servis yönetim sistemi için geliştirilmiş modern bir frontend uygulamasıdır. Rol bazlı dashboard sistemi ile her kullanıcı tipine özel arayüz ve işlevsellik sunar.

### ✨ Ana Özellikler

- **🎭 Rol Bazlı Dashboard** - Admin, TSP, Customer rolleri için özel arayüzler
- **🔐 JWT Authentication** - Güvenli kullanıcı girişi ve session yönetimi
- **📊 Real-time Analytics** - Canlı veri görselleştirme
- **🔔 Notification System** - Multi-channel bildirim sistemi
- **📱 Responsive Design** - Mobil uyumlu tasarım
- **🌐 Internationalization** - Çoklu dil desteği
- **⚡ Performance** - Optimized loading ve caching
- **🎨 Material-UI** - Modern ve tutarlı tasarım

## 🏗️ Teknik Mimari

### **Tech Stack**
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI)
- **State Management**: React Query + Zustand
- **Authentication**: Better Auth + JWT
- **Styling**: Emotion + MUI Theme
- **Real-time**: WebSocket integration
- **Testing**: Jest + Cypress
- **Deployment**: Vercel/Docker

### **Proje Yapısı**
```
apps/web/
├── app/                        # Next.js App Router
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   ├── auth/                  # Authentication pages
│   └── dashboard/             # Dashboard pages
├── components/                # Reusable components
│   ├── Layout.tsx             # Main layout component
│   ├── DataTable.tsx          # Generic data table
│   └── providers/             # Context providers
├── features/                  # Feature-based modules
│   ├── auth/                  # Authentication features
│   ├── products/              # Product management
│   ├── issues/                # Issue management
│   └── reports/               # Reporting features
├── lib/                       # Utility libraries
│   ├── api.ts                 # API client
│   ├── auth.ts                # Authentication utilities
│   └── websocket.ts           # WebSocket client
├── hooks/                     # Custom React hooks
├── utils/                     # Utility functions
└── cypress/                   # E2E tests
```

## 🎭 Rol Bazlı Dashboard

### **Kullanıcı Rolleri**

#### **1. 👑 Yönetici (Admin)**
- **Dashboard**: Sistem yönetimi ve raporlama
- **Erişim**: Tüm modüllere tam erişim
- **Özellikler**:
  - Kullanıcı yönetimi
  - Sistem ayarları
  - Kapsamlı raporlama
  - Analytics dashboard
  - Audit logs

#### **2. 🔧 Teknik Servis Personeli (TSP)**
- **Dashboard**: Ürün yönetimi ve servis operasyonları
- **Erişim**: Üretim ve servis modüllerine erişim
- **Özellikler**:
  - Ürün ekleme ve yönetimi
  - Fabrikasyon testi
  - Sevkiyat yönetimi
  - Arıza çözümü
  - Servis operasyonları

#### **3. 👤 Müşteri (Customer)**
- **Dashboard**: Arıza kaydı ve durum takibi
- **Erişim**: Sadece kendi verilerine erişim
- **Özellikler**:
  - Arıza kaydı oluşturma
  - Durum takibi
  - Ürün geçmişi
  - Bildirimler

### **Dashboard Yönlendirme**
```typescript
// Rol bazlı dashboard yönlendirme
const getDashboardPath = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return '/dashboard/admin';
    case 'TSP':
      return '/dashboard/tsp';
    case 'CUSTOMER':
      return '/dashboard/customer';
    default:
      return '/dashboard';
  }
};
```

## 🚀 Kurulum

### **Gereksinimler**
- Node.js 18+
- pnpm (önerilen)

### **1. Bağımlılıkları Yükleyin**
```bash
cd apps/web
pnpm install
```

### **2. Environment Dosyasını Oluşturun**
```bash
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3015
NEXT_PUBLIC_APP_NAME="FixLog Teknik Servis Portalı"
NEXT_PUBLIC_APP_VERSION="1.0.0"
NEXT_PUBLIC_BETTER_AUTH_SECRET=your-secret-key-here
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3015
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_REAL_TIME=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NODE_ENV=development
EOF
```

### **3. Development Server'ı Başlatın**
```bash
pnpm dev
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

## 🔄 Kullanıcı Akışları

### **1. Kullanıcı Girişi**
```
Kullanıcı Girişi (Yönetici/TSP/Müşteri)
    ↓
Authentication (JWT Token)
    ↓
Rol Tespiti
    ↓
Rol Bazlı Dashboard Yönlendirme
```

### **2. Rol Bazlı Dashboard Akışları**

#### **TSP Akışı**
```
TSP Dashboard
    ↓
Ürün Ekleme
    ↓
Fabrikasyon Testi
    ↓
Sevkiyat
    ↓
Otomatik Bildirimler
```

#### **Müşteri Akışı**
```
Customer Dashboard
    ↓
Arıza Kaydı
    ↓
Durum Takibi
    ↓
Otomatik Bildirimler
```

#### **Yönetici Akışı**
```
Admin Dashboard
    ↓
Sistem Yönetimi
    ↓
Raporlama
    ↓
Analytics
```

### **3. Otomatik Bildirimler ve Durum Güncellemeleri**
- WebSocket ile real-time bildirimler
- E-posta bildirimleri
- SMS bildirimleri
- In-app notifications

### **4. Geçmiş Analizi ve Raporlama**
- Kullanıcı aktivite geçmişi
- Sistem performans raporları
- İş süreç analizi
- Audit trail

## 🧩 Component Yapısı

### **Layout Components**
- **Layout.tsx**: Ana layout wrapper
- **AuthGuard.tsx**: Authentication kontrolü
- **PageWrapper.tsx**: Sayfa wrapper'ı

### **Feature Components**
- **ProductManagement**: Ürün yönetimi
- **IssueTracking**: Arıza takibi
- **ServiceOperations**: Servis operasyonları
- **UserManagement**: Kullanıcı yönetimi
- **Reporting**: Raporlama

### **UI Components**
- **DataTable.tsx**: Generic data table
- **FormRenderer.tsx**: Dynamic form renderer
- **NotificationCenter.tsx**: Bildirim merkezi
- **DashboardAnalytics.tsx**: Analytics dashboard

### **Provider Components**
- **AuthProvider.tsx**: Authentication context
- **WebSocketProvider.tsx**: WebSocket context
- **ThemeProvider.tsx**: Theme context
- **NotificationProvider.tsx**: Notification context

## 🔐 Authentication

### **Authentication Flow**
```typescript
// Login process
const login = async (email: string, password: string) => {
  const response = await apiClient.post('/auth/login', {
    email,
    password
  });
  
  // Store token and user data
  localStorage.setItem('auth_token', response.data.token);
  localStorage.setItem('user', JSON.stringify(response.data.user));
  
  // Redirect based on role
  const dashboardPath = getDashboardPath(response.data.user.role);
  router.push(dashboardPath);
};
```

### **Role-based Route Protection**
```typescript
// Protected route component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginPage />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <AccessDenied />;
  }
  
  return children;
};
```

### **Authentication State Management**
```typescript
// Auth context
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}
```

## 🛠️ Development

### **Available Scripts**
```bash
pnpm dev              # Development server
pnpm build            # Production build
pnpm start            # Production server
pnpm test             # Run tests
pnpm test:watch       # Watch mode tests
pnpm test:e2e         # E2E tests
pnpm lint             # Lint code
pnpm format           # Format code
```

### **Adding New Features**
1. Create feature directory in `features/`
2. Add components, services, and types
3. Create route in `app/` directory
4. Add to navigation if needed
5. Update role permissions

### **State Management**
- **React Query**: Server state management
- **Zustand**: Client state management
- **Context API**: Global state (auth, theme, notifications)

## 🧪 Testing

### **Test Types**
- **Unit Tests**: Component testing
- **Integration Tests**: Feature testing
- **E2E Tests**: User flow testing
- **Visual Tests**: UI regression testing

### **Run Tests**
```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage report
pnpm test:coverage
```

### **Test Structure**
```
__tests__/
├── components/        # Component tests
├── features/          # Feature tests
├── hooks/             # Hook tests
└── utils/             # Utility tests

cypress/
├── e2e/               # E2E test files
├── fixtures/          # Test data
└── support/           # Test utilities
```

## 🚀 Deployment

### **Vercel Deployment**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### **Docker Deployment**
```bash
# Build image
docker build -t miltera-web .

# Run container
docker run -p 3000:3000 miltera-web
```

### **Environment Variables (Production)**
```env
NEXT_PUBLIC_API_URL=https://api.fixlog.com
NEXT_PUBLIC_APP_NAME="FixLog Teknik Servis Portalı"
NEXT_PUBLIC_WEBSOCKET_URL=wss://api.fixlog.com
NODE_ENV=production
```

## 📊 Performance

### **Optimization Features**
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Webpack bundle analyzer
- **Caching**: React Query caching
- **Lazy Loading**: Component lazy loading

### **Performance Metrics**
- **Lighthouse Score**: > 90
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

## 🎨 UI/UX Features

### **Design System**
- **Material-UI**: Consistent design language
- **Custom Theme**: Brand-specific styling
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Theme switching support

### **Accessibility**
- **WCAG 2.1 AA**: Accessibility compliance
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and descriptions
- **Color Contrast**: High contrast ratios

## 🔔 Notification System

### **Notification Types**
- **Success**: Operation success messages
- **Error**: Error notifications
- **Warning**: Warning messages
- **Info**: Information messages
- **Real-time**: WebSocket notifications

### **Notification Channels**
- **In-app**: Toast notifications
- **Email**: Email notifications
- **SMS**: SMS notifications
- **Push**: Browser push notifications

## 🌐 Internationalization

### **Supported Languages**
- **Turkish**: Primary language
- **English**: Secondary language
- **Extensible**: Easy to add new languages

### **Translation Structure**
```
messages/
├── tr.json           # Turkish translations
├── en.json           # English translations
└── index.ts          # Translation utilities
```

## 📱 Responsive Design

### **Breakpoints**
- **Mobile**: < 600px
- **Tablet**: 600px - 960px
- **Desktop**: > 960px

### **Mobile Features**
- **Touch-friendly**: Large touch targets
- **Swipe gestures**: Navigation gestures
- **Offline support**: Service worker
- **PWA**: Progressive Web App features

## 🔒 Security

### **Security Features**
- **XSS Protection**: Content Security Policy
- **CSRF Protection**: CSRF tokens
- **Input Validation**: Client-side validation
- **Secure Headers**: Security headers
- **Authentication**: JWT token validation

## 📈 Analytics

### **Analytics Features**
- **User Behavior**: Page views, clicks
- **Performance**: Load times, errors
- **Business Metrics**: User engagement
- **Real-time**: Live user activity

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
- **Documentation**: [Web Docs](http://localhost:3000/docs)
- **Issues**: [GitHub Issues](https://github.com/ozgurkzlkaya/Miltera-Support/issues)

---

**Miltera Fixlog Web** - Modern, responsive, and role-based frontend application for technical service management.