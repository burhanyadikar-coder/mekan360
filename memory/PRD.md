# mekan360 - Premium Daire Tanıtım Sistemi v2

## Problem Statement
Emlakçılar ve inşaat firmaları için premium daire tanıtım sistemi. 3 farklı paket ile aylık abonelik modeli, interaktif kroki oluşturma, 360° sanal tur, ziyaretçi takibi ve admin paneli.

## User Personas
1. **Yayıncı (Admin)**: Platform yöneticisi - kullanıcı ve ödeme yönetimi (/mekanadmin)
2. **Emlak Danışmanı / İnşaat Firması**: Gayrimenkul ekleyen ve yöneten kullanıcı
3. **Son Kullanıcı (Müşteri)**: Gayrimenkulü sanal turla gezebilen potansiyel alıcı

## Core Requirements
### Paket Sistemi (Aylık Abonelik)
- **Başlangıç (₺700/ay)**: 10 gayrimenkul, düz fotoğraf, haritalama, şirket adı, güneş sim.
- **Premium (₺1.000/ay)**: 50 gayrimenkul, düz + 360°, haritalama, çevre bilgisi, tüm özellikler
- **Ultra (₺2.000/ay)**: Sınırsız gayrimenkul, tüm premium özellikler

### Rol Bazlı Özellikler
- Admin Paneli: Kullanıcı/ödeme yönetimi, istatistikler
- Kullanıcı: Kayıt + paket seçimi + ödeme, gayrimenkul CRUD, kroki oluşturma
- Son Kullanıcı: İsim-telefon girişi, sanal tur görüntüleme

## What's Been Implemented (26 Ocak 2025)

### Backend (FastAPI + MongoDB)
- Multi-role JWT Authentication (Admin/User)
- Package-based subscription system
- MOCK payment flow (iyzico integration ready)
- Property CRUD with room mapping
- Visitor registration and tracking
- Analytics endpoints
- Password reset with email (Resend ready)

### Frontend (React + Tailwind + Shadcn/UI)
- **Admin Panel** (/admin):
  - Secure login
  - Dashboard with stats
  - User management (view/edit)
  - Payment history
- **User Panel**:
  - 3-step registration (info → package → payment)
  - Dashboard with package info
  - Interactive property form with room mapping
  - Analytics page
- **Public Pages**:
  - Premium landing page
  - Property view with visitor form
  - 360° viewer + sun simulation

### Kroki/Haritalama Sistemi
- Giriş noktası ekleme
- + butonlarıyla yeni oda ekleme
- Oda bazlı fotoğraf yükleme
- 360° panorama desteği
- Dubleks/Tripleks kat geçişleri
- Oda bağlantıları otomatik

## Tech Stack
- Backend: FastAPI, MongoDB, JWT, bcrypt, Resend
- Frontend: React, Tailwind CSS, Shadcn/UI, Pannellum-react, Recharts

## Prioritized Backlog

### P0 (Kritik - Tamamlandı)
- [x] Multi-role auth (Admin/User)
- [x] 3 paket sistemi
- [x] MOCK ödeme akışı
- [x] Kroki oluşturma sistemi
- [x] Ziyaretçi form ve takibi
- [x] Admin paneli

### P1 (Önemli - Beklemede)
- [ ] iyzico gerçek entegrasyonu
- [ ] Resend API key ekleme (email gönderimi)
- [ ] Otomatik abonelik yenileme
- [ ] Fotoğraf indirme özelliği

### P2 (Nice to Have)
- [ ] WhatsApp paylaşım
- [ ] QR kod oluşturma
- [ ] PDF export
- [ ] Çoklu dil desteği

## Admin Credentials
- Email: admin@homeviewpro.com
- Password: AdminHVP2024!

## Next Tasks
1. iyzico API anahtarları ile gerçek ödeme entegrasyonu
2. Resend API key ile email gönderimi aktivasyonu
3. Fotoğraf optimizasyonu ve indirme
