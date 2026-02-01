import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Check, ArrowRight, Crown, Camera, Video, Globe, Phone, Gift, Building2, Briefcase } from 'lucide-react';
import { LogoIcon } from '../components/Logo';

const PACKAGES = [
  {
    id: 'free',
    name: 'Ücretsiz',
    price: 0,
    description: 'Denemek isteyenler için',
    features: [
      'Haftalık 1 gayrimenkul ekleme',
      'Düz fotoğraf koleksiyonu',
      'İnteraktif haritalama (kroki)',
      '7 gün sonra otomatik silme'
    ],
    notIncluded: [
      '360° panoramik görüntüleme',
      'Çevre bilgisi ekleme',
      'Şirket adı ekleme'
    ],
    highlight: false,
    icon: Gift,
    isFree: true
  },
  {
    id: 'starter',
    name: 'Başlangıç',
    price: 700,
    description: 'Yeni başlayanlar için ideal',
    features: [
      '10 gayrimenkul ekleme',
      'Düz fotoğraf koleksiyonu',
      'İnteraktif haritalama (kroki)',
      'Şirket adı ekleme',
      'Güneş simülasyonu',
      'Temel analitikler'
    ],
    notIncluded: [
      '360° panoramik görüntüleme',
      'Çevre bilgisi ekleme'
    ],
    highlight: false
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 1000,
    description: 'Profesyoneller için en popüler',
    features: [
      '50 gayrimenkul ekleme',
      'Düz fotoğraf koleksiyonu',
      '360° panoramik görüntüleme *',
      'İnteraktif haritalama (kroki)',
      'Çevre bilgisi ekleme (okul, market, durak vb.)',
      'm² ve tüm gayrimenkul özellikleri',
      'Şirket adı ekleme',
      'Güneş simülasyonu',
      'Detaylı ziyaretçi analitikleri'
    ],
    notIncluded: [],
    note: '* 360° fotoğrafların kullanıcı tarafından çekilip yüklenmesi gerekmektedir',
    highlight: true
  },
  {
    id: 'ultra',
    name: 'Ultra',
    price: 2000,
    description: 'Büyük firmalar için',
    features: [
      '100 gayrimenkul ekleme',
      'Tüm Premium özellikler dahil',
      'Öncelikli teknik destek',
      'Özel müşteri temsilcisi'
    ],
    notIncluded: [],
    highlight: false
  },
  {
    id: 'corporate',
    name: 'Kurumsal',
    price: -1,
    description: 'Kurumsal firmalar için özel',
    features: [
      'Sınırsız gayrimenkul ekleme',
      'Tüm Ultra özellikler dahil',
      'Özel entegrasyonlar',
      'API erişimi',
      '7/24 öncelikli destek',
      'Özel eğitim ve danışmanlık'
    ],
    notIncluded: [],
    highlight: false,
    icon: Briefcase,
    isContact: true
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link to="/" className="flex items-center gap-2 sm:gap-3" data-testid="logo-link">
              <LogoIcon className="w-8 h-8 sm:w-10 sm:h-10" />
              <span className="font-heading text-base sm:text-xl font-semibold text-primary">mekan360</span>
            </Link>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/login">
                <Button variant="ghost" className="text-primary hover:text-primary/80 text-xs sm:text-sm px-2 sm:px-4" data-testid="login-nav-btn">
                  Giriş Yap
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full text-xs sm:text-sm px-3 sm:px-6" data-testid="register-nav-btn">
                  Kayıt Ol
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-8 sm:py-16 lg:py-24 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-heading text-2xl sm:text-4xl md:text-5xl font-light text-white mb-2 sm:mb-4">
            Size Uygun <span className="font-semibold text-gold">Paketi</span> Seçin
          </h1>
          <p className="text-sm sm:text-lg text-white/70 max-w-2xl mx-auto">
            Ücretsiz başlayın, ihtiyacınıza göre yükseltin. Tüm ücretli paketler aylık abonelik şeklindedir.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-8 sm:py-16 lg:py-24 -mt-6 sm:-mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
            {PACKAGES.map((pkg) => (
              <Card 
                key={pkg.id}
                className={`relative border-2 transition-all hover:-translate-y-1 sm:hover:-translate-y-2 hover:shadow-xl ${
                  pkg.highlight 
                    ? 'border-gold shadow-lg sm:scale-105 z-10' 
                    : pkg.isFree
                    ? 'border-green-500/50'
                    : pkg.isContact
                    ? 'border-purple-500/50'
                    : 'border-border/40'
                }`}
              >
                {pkg.highlight && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 px-3 sm:px-6 py-1 sm:py-1.5 bg-gold text-white text-xs sm:text-sm font-medium rounded-full flex items-center gap-1">
                    <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                    En Popüler
                  </div>
                )}
                {pkg.isFree && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 px-3 sm:px-6 py-1 sm:py-1.5 bg-green-500 text-white text-xs sm:text-sm font-medium rounded-full flex items-center gap-1">
                    <Gift className="w-3 h-3 sm:w-4 sm:h-4" />
                    Ücretsiz
                  </div>
                )}
                
                <CardContent className="p-4 sm:p-6">
                  <div className="text-center mb-4 sm:mb-6">
                    {pkg.icon && (
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-full flex items-center justify-center ${
                        pkg.isFree ? 'bg-green-100' : pkg.isContact ? 'bg-purple-100' : 'bg-primary/10'
                      }`}>
                        <pkg.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${
                          pkg.isFree ? 'text-green-600' : pkg.isContact ? 'text-purple-600' : 'text-primary'
                        }`} />
                      </div>
                    )}
                    <h3 className="font-heading text-lg sm:text-xl font-semibold text-foreground mb-1">
                      {pkg.name}
                    </h3>
                    <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">
                      {pkg.description}
                    </p>
                    <div className="flex items-baseline justify-center gap-1">
                      {pkg.isContact ? (
                        <span className="font-heading text-sm sm:text-lg font-semibold text-purple-600">
                          Fiyat için iletişime geçin
                        </span>
                      ) : pkg.price === 0 ? (
                        <span className="font-heading text-2xl sm:text-4xl font-bold text-green-600">
                          Ücretsiz
                        </span>
                      ) : (
                        <>
                          <span className={`font-heading text-2xl sm:text-3xl font-bold ${pkg.highlight ? 'text-gold' : 'text-primary'}`}>
                            ₺{pkg.price.toLocaleString()}
                          </span>
                          <span className="text-muted-foreground text-xs sm:text-sm">/ay</span>
                        </>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          pkg.highlight ? 'bg-gold/20' : pkg.isFree ? 'bg-green-100' : pkg.isContact ? 'bg-purple-100' : 'bg-primary/10'
                        }`}>
                          <Check className={`w-2 h-2 sm:w-2.5 sm:h-2.5 ${
                            pkg.highlight ? 'text-gold' : pkg.isFree ? 'text-green-600' : pkg.isContact ? 'text-purple-600' : 'text-primary'
                          }`} />
                        </div>
                        <span className="text-xs sm:text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                    {pkg.notIncluded.map((feature, i) => (
                      <li key={`not-${i}`} className="flex items-start gap-2 opacity-50">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-muted">
                          <span className="text-xs text-muted-foreground">✕</span>
                        </div>
                        <span className="text-sm text-muted-foreground line-through">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {pkg.note && (
                    <p className="text-xs text-amber-600 mb-4 p-2 bg-amber-50 rounded-lg">
                      {pkg.note}
                    </p>
                  )}

                  {pkg.isContact ? (
                    <a href="tel:05514780259">
                      <Button 
                        className="w-full rounded-full h-10 bg-purple-600 text-white hover:bg-purple-700"
                        data-testid={`contact-${pkg.id}-btn`}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        0551 478 02 59
                      </Button>
                    </a>
                  ) : pkg.isFree ? (
                    <Link to="/register?package=free">
                      <Button 
                        className="w-full rounded-full h-10 bg-green-600 text-white hover:bg-green-700"
                        data-testid={`buy-${pkg.id}-btn`}
                      >
                        Ücretsiz Başla
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  ) : (
                    <Link to={`/register?package=${pkg.id}`}>
                      <Button 
                        className={`w-full rounded-full h-10 ${
                          pkg.highlight 
                            ? 'bg-gold text-white hover:bg-gold-hover' 
                            : 'bg-primary text-primary-foreground hover:bg-primary/90'
                        }`}
                        data-testid={`buy-${pkg.id}-btn`}
                      >
                        Satın Al
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services Section */}
      <section className="py-16 lg:py-24 bg-emerald-950">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-semibold text-white mb-4">
              Profesyonel Çekim Hizmetleri
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              (İstanbul Anadolu Yakası)
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-gold" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-white mb-2">
                  Profesyonel Fotoğraf Çekimi
                </h3>
                <p className="text-white/70 mb-4">
                  Dairenizin profesyonel fotoğrafları
                </p>
                <div className="text-3xl font-bold text-gold mb-2">₺400</div>
                <p className="text-white/50 text-sm">(İstanbul Anadolu Yakası)</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8 text-gold" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-white mb-2">
                  Fotoğraf + Video Çekimi
                </h3>
                <p className="text-white/70 mb-4">
                  Profesyonel fotoğraf ve tanıtım videosu
                </p>
                <div className="text-3xl font-bold text-gold mb-2">₺600</div>
                <p className="text-white/50 text-sm">(İstanbul Anadolu Yakası)</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-gold" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-white mb-2">
                  360° Çekim + Yükleme
                </h3>
                <p className="text-white/70 mb-4">
                  360 derece çekim ve sisteme yükleme
                </p>
                <div className="text-3xl font-bold text-gold mb-2">₺800</div>
                <p className="text-white/50 text-sm">(İstanbul Anadolu Yakası)</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 inline-block">
              <p className="text-white/80 mb-4 text-lg">Bu hizmetler için lütfen iletişime geçin</p>
              <a href="tel:05514780259" className="inline-flex items-center gap-3 text-gold hover:text-gold-hover transition-colors">
                <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6" />
                </div>
                <span className="text-2xl font-semibold">0551 478 02 59</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24 bg-muted">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-heading text-3xl font-semibold text-primary text-center mb-12">
            Sıkça Sorulan Sorular
          </h2>
          
          <div className="space-y-6">
            <div className="bg-card p-6 rounded-lg border border-border/40">
              <h3 className="font-heading font-semibold text-foreground mb-2">
                Ücretsiz paket nasıl çalışır?
              </h3>
              <p className="text-muted-foreground">
                Ücretsiz pakette haftada 1 gayrimenkul ekleyebilirsiniz. Eklediğiniz gayrimenkul 7 gün sonra otomatik olarak silinir. Sistemi denemek için idealdir.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border/40">
              <h3 className="font-heading font-semibold text-foreground mb-2">
                Aboneliğimi istediğim zaman iptal edebilir miyim?
              </h3>
              <p className="text-muted-foreground">
                Evet, aboneliğinizi istediğiniz zaman iptal edebilirsiniz. İptal ettiğinizde mevcut dönemin sonuna kadar hizmet almaya devam edersiniz.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border/40">
              <h3 className="font-heading font-semibold text-foreground mb-2">
                360° fotoğrafları nasıl çekeceğim?
              </h3>
              <p className="text-muted-foreground">
                360° fotoğraflar için özel kamera veya akıllı telefon uygulamaları (Google Street View, Insta360 vb.) kullanabilirsiniz. Çektiğiniz panoramik fotoğrafları sisteme yükleyebilirsiniz.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border/40">
              <h3 className="font-heading font-semibold text-foreground mb-2">
                Paket yükseltme yapabilir miyim?
              </h3>
              <p className="text-muted-foreground">
                Evet, istediğiniz zaman daha üst bir pakete geçiş yapabilirsiniz. Fark ücreti orantılı olarak hesaplanır.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border/40">
              <h3 className="font-heading font-semibold text-foreground mb-2">
                Ziyaretçi bilgilerini nasıl göreceğim?
              </h3>
              <p className="text-muted-foreground">
                Gayrimenkullerinizi görüntüleyen her ziyaretçi önce isim ve telefon bilgilerini girmek zorundadır. Bu bilgiler dashboard&apos;unuzdaki analitikler bölümünde görüntülenebilir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-emerald-950">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-light text-white mb-4">
            Hemen Başlamaya Hazır mısınız?
          </h2>
          <p className="text-lg text-white/70 mb-8">
            Ücretsiz kayıt olun ve hemen deneyin. İstediğiniz zaman paket yükseltebilirsiniz.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?package=free">
              <Button size="lg" className="bg-green-600 text-white hover:bg-green-700 rounded-full px-10 h-14 text-base font-medium">
                <Gift className="w-5 h-5 mr-2" />
                Ücretsiz Başla
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" className="bg-gold text-white hover:bg-gold-hover rounded-full px-10 h-14 text-base font-medium">
                Paketleri İncele
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <LogoIcon className="w-8 h-8" />
              <span className="font-heading text-lg font-semibold text-primary">mekan360</span>
            </div>
            <div className="flex items-center gap-6">
              <a 
                href="https://wa.me/905514780259" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span className="text-sm font-medium">0551 478 02 59</span>
              </a>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2024 mekan360. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
