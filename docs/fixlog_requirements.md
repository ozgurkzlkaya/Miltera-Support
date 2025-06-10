# Fixlog Gereksinim Dokümanı

**Proje Adı:** Teknik Servis Portalı (service.miltera.com.tr)

**Doküman Sürümü:** 1.0

**Tarih:** 02 Haziran 2025

**Hazırlayan(lar):** Mehmet Kurnaz - Miltera R&D

# **1. Giriş**
## **1.1. Projenin Amacı**
Teknik Servis Portalının temel hedefi; Miltera'nın ürettiği enerji sektörü ürünlerinin (ağ geçitleri, enerji analizörleri, VPN router vb.) yaşam döngüsünü baştan sona takip edebilmek ve teknik servis süreçlerini dijitalleştirmektir. Portal, ürünlerin ilk üretiminden başlayarak fabrikasyon testleri, müşteriye gönderim, garanti süresi takibi, sahada yaşanan arıza durumları ve tamir süreçlerinin tamamını izleyerek geçmişe dönük analizler ile anlamlı sonuçlar çıkarılmasını sağlar.

## **1.2. Kapsam**
### **1.2.1. Kapsam Dahilindeki Ana Özellikler**
- **Ürün Yaşam Döngüsü Yönetimi**: İlk üretimden hurdaya ayırma sürecine kadar tüm aşamaların takibi
- **Depo Yönetimi**: Ürünlerin fiziksel ve dijital envanterinin yönetimi
- **Arıza Yönetimi**: Müşteri arıza kayıtları oluşturma ve takip etme
- **Teknik Servis Operasyonları**: TSP'lerin tüm servis işlemlerini kaydetme ve yönetme
- **Sevkiyat Yönetimi**: Satış ve servis amaçlı gönderimlerinin planlanması ve takibi
- **Müşteri Portalı**: Müşterilerin kendi arıza kayıtlarını oluşturma ve izleme
- **Raporlama ve Analiz**: Geçmişe dönük analizler ve raporlar
- **Otomatik Bildirimler**: E-posta ile durum bildirimleri
- **Garanti Takibi**: Ürünlerin garanti durumlarının yönetimi
### **1.2.2. Kapsam Dışı Bırakılanlar**
- Muhasebe sistemi entegrasyonu (sadece bildirim gönderilecek)
- Kargo şirketi otomatik entegrasyonu (manuel takip numarası girişi)
- CRM sistemi entegrasyonu
- Üretim planlama modülü
## 1.3. Aktörler (Kullanıcı Rolleri ve Dış Sistemler)
### 1.3.1. Yönetici Hesabı
Sistem yönetimi, kullanıcı yönetimi ve tüm konfigürasyonları yapan üst düzey yetkililer.

### 1.3.2. TSP (Teknik Servis Personeli) Hesabı
Ürün testleri, arıza giderme, sevkiyat işlemleri ve teknik operasyonları yürüten personel.

### 1.3.3. Müşteri Hesabı
Arıza kaydı oluşturan ve takibini yapan müşteri kullanıcıları.

### 1.3.4. E-Posta Sistemi
Durum değişikliklerinde otomatik bildirim göndermek için kullanılacak dış e-posta servisi.

## **1.4. Tanımlar ve Kısaltmalar**
- **TSP**: Teknik Servis Personeli
- **Yaşam Döngüsü**: Ürünün üretimden hurdaya kadar geçirdiği tüm aşamalar
- **Fabrikasyon Testi**: İlk üretim sonrası yapılan donanım doğrulama testleri
- **Arıza Kaydı**: Müşteri tarafından oluşturulan teknik destek talebi
- **Sevkiyat**: Ürünlerin müşteriye gönderilme süreci
## **1.5. Referanslar**
- Mevcut Miltera teknik servis süreçleri
- Miltera ürün kataloğu ve teknik dokümanları
# **2. Genel Açıklama ve Bağlam**
## **2.1. Mevcut Durum / Problem Tanımı**
Şu anda Miltera'da teknik servis süreçleri manuel olarak yürütülmekte ve ürün takibi Excel tabloları veya kağıt bazlı sistemlerle yapılmaktadır. Bu durum şu problemlere neden olmaktadır:

- Ürünlerin nerede olduğu ve hangi durumda bulunduğu hızlıca tespit edilememektedir
- Müşteri arıza kayıtları manuel olarak alınmakta ve takibi zor olmaktadır
- Geçmişe dönük analizler yapmak çok zaman almakta ve hata riskli olmaktadır
- Garanti durumları manuel takip edilmekte ve kaybolma riski bulunmaktadır
- Teknik servis personeli arasında bilgi paylaşımı yetersizdir
- Müşteriler arıza durumlarını sürekli telefon ederek öğrenmek zorundadır
## **2.2. Önerilen Çözüm (Genel Bakış)**
Web tabanlı Teknik Servis Portalı, tüm ürün yaşam döngüsünü dijital ortamda takip edebilen merkezi bir sistem sunmaktadır. Portal şu faydaları sağlayacaktır:

- **Merkezi Veri Yönetimi**: Tüm ürün bilgileri tek merkezden yönetilir
- **Otomatik Takip**: Ürün durumları otomatik güncellenir ve geçmiş tutulur
- **Müşteri Self-Servisi**: Müşteriler kendi arıza kayıtlarını oluşturup takip edebilir
- **Verimlilik Artışı**: Manuel süreçler otomatikleştirilir
- **Analiz Kapasitesi**: Geçmişe dönük analizler kolayca yapılabilir
- **Şeffaflık**: Tüm paydaşlar süreçleri şeffaf olarak görebilir
## **2.3. Başarı Kriterleri**
- İlk 6 ayda tüm aktif ürünlerin sisteme kayıt edilmesi (%100)
- Müşteri arıza kaydı oluşturma süresinin %80 azalması (5 dakikadan 1 dakikaya)
- Teknik servis işlem sürelerinin %50 azalması
- Müşteri memnuniyet skorunda %30 artış
- İlk yılda en az 50 aktif müşteri kullanıcısı
## **2.4. Varsayımlar**
- Müşterilerin temel web teknolojilerini kullanabilme yetisi vardır
- Teknik servis personeli internet erişimine sahiptir
- E-posta altyapısı stabil çalışmaktadır
- Ürün seri numaraları benzersiz ve takip edilebilir durumdadır
## **2.5. Bağımlılıklar**
- Güvenilir internet bağlantısı
- E-posta sunucu servisi
- Ürün seri numarası standartlaşması
- Mevcut müşteri iletişim bilgilerinin temizlenmesi


