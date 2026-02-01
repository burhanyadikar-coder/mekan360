import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { 
  Eye, 
  Sun, 
  MapPin, 
  BarChart3, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { LogoIcon } from '../components/Logo';

const features = [
  {
    icon: Eye,
    title: '360° Sanal Tur',
    description: 'Müşterileriniz evinizin her köşesini interaktif olarak keşfetsin.'
  },
  {
    icon: Sun,
    title: 'Güneş Simülasyonu',
    description: 'Günün her saatinde odaya giren ışığı görselleştirin.'
  },
  {
    icon: MapPin,
    title: 'Konum Bilgileri',
    description: 'Okul, market, durak - tüm önemli noktalar tek bakışta.'
  },
  {
    icon: BarChart3,
    title: 'Detaylı Analitik',
    description: 'Ziyaretçi davranışlarını takip edin, raporlarla satış stratejinizi güçlendirin.'
  }
];

const stats = [
  { value: '360°', label: 'Panoramik Görüntü' },
  { value: '%87', label: 'Daha Fazla İlgi' },
  { value: '3x', label: 'Hızlı Satış' }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link to="/" className="flex items-center gap-2 sm:gap-3" data-testid="logo-link">
              <LogoIcon className="w-8 h-8 sm:w-10 sm:h-10" />
              <span className="font-heading text-base sm:text-xl font-semibold text-primary">mekan360</span>
            </Link>
            
            {/* Desktop Menu - lg ve üzeri */}
            <div className="hidden lg:flex items-center gap-4">
              <Link to="/pricing">
                <Button variant="ghost" className="text-primary hover:text-primary/80" data-testid="pricing-nav-btn">
                  Fiyatlar
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost" className="text-primary hover:text-primary/80" data-testid="login-nav-btn">
                  Giriş Yap
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6" data-testid="register-nav-btn">
                  Üyelik Satın Al
                </Button>
              </Link>
            </div>

            {/* Mobile/Tablet Menu - lg altı */}
            <div className="flex lg:hidden items-center gap-1 sm:gap-2">
              <Link to="/pricing">
                <Button variant="ghost" size="sm" className="text-primary text-xs px-2">
                  Fiyatlar
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-primary text-xs px-2">
                  Giriş
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-primary text-primary-foreground rounded-full text-xs px-2 sm:px-3">
                  Kayıt
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16 sm:pt-20">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1758957530781-4ff54e09bee2?crop=entropy&cs=srgb&fm=jpg&q=85')` }}
        >
          <div className="absolute inset-0 hero-overlay" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-24">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-4 sm:space-y-8">
              <div className="animate-fade-in opacity-0">
                <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm text-white/90 text-xs sm:text-sm font-medium tracking-wider uppercase rounded-full border border-white/20">
                  Premium Gayrimenkul Deneyimi
                </span>
              </div>
              
              <h1 className="font-heading text-3xl sm:text-5xl md:text-7xl font-light tracking-tight text-white animate-fade-in opacity-0 stagger-1">
                Dairelerinizi<br />
                <span className="font-semibold text-gold">Premium</span> Seviyede<br />
                Tanıtın
              </h1>
              
              <p className="text-sm sm:text-lg md:text-xl text-white/80 max-w-xl leading-relaxed animate-fade-in opacity-0 stagger-2">
                360° sanal turlar, güneş simülasyonu ve detaylı analitiklerle gayrimenkul satışlarınızı hızlandırın.
              </p>
              
              <div className="flex flex-wrap gap-4 animate-fade-in opacity-0 stagger-3">
                <Link to="/pricing">
                  <Button size="lg" className="bg-gold text-white hover:bg-gold-hover rounded-full px-8 h-14 text-base font-medium tracking-wide btn-primary" data-testid="hero-cta-btn">
                    Paketleri İncele
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-full px-8 h-14 text-base font-medium" data-testid="demo-btn">
                    Üyelik Satın Al
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="lg:col-span-5 hidden lg:block animate-fade-in opacity-0 stagger-4">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-full h-full bg-gold/20 rounded-sm" />
                <img 
                  src="https://images.unsplash.com/photo-1627383837679-6488f58969d5?crop=entropy&cs=srgb&fm=jpg&q=85"
                  alt="Modern Interior"
                  className="relative z-10 w-full rounded-sm shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="font-heading text-4xl md:text-5xl font-light text-gold mb-2">{stat.value}</div>
                <div className="text-white/70 text-sm md:text-base tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-4">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Özellikler</span>
              <h2 className="font-heading text-3xl md:text-4xl font-semibold text-primary mt-4 mb-6">
                Satışlarınızı Güçlendiren Araçlar
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Modern gayrimenkul pazarlaması için ihtiyacınız olan tüm araçlar tek platformda.
              </p>
            </div>
            
            <div className="lg:col-span-8">
              <div className="grid sm:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div 
                    key={index} 
                    className="group p-8 bg-card border border-border/40 rounded-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-heading text-xl font-medium text-primary mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-emerald-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gold rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-100 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <h2 className="font-heading text-3xl md:text-5xl font-light text-white mb-6">
            Gayrimenkul Pazarlamanızı<br />
            <span className="font-semibold text-gold">Dönüştürmeye</span> Hazır mısınız?
          </h2>
          <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
            Binlerce emlakçı ve inşaat firması mekan360 ile satışlarını artırıyor.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-gold text-white hover:bg-gold-hover rounded-full px-10 h-14 text-base font-medium tracking-wide" data-testid="cta-register-btn">
              Üyelik Satın Al
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
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
                data-testid="whatsapp-link"
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
