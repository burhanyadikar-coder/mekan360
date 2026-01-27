import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { 
  Eye, 
  Sun, 
  MapPin, 
  BarChart3, 
  Building2, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';

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
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3" data-testid="logo-link">
              <Building2 className="w-8 h-8 text-primary" />
              <span className="font-heading text-xl font-semibold text-primary">HomeView Pro</span>
            </Link>
            
            <div className="flex items-center gap-4">
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
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1758957530781-4ff54e09bee2?crop=entropy&cs=srgb&fm=jpg&q=85')` }}
        >
          <div className="absolute inset-0 hero-overlay" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-24">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8">
              <div className="animate-fade-in opacity-0">
                <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium tracking-wider uppercase rounded-full border border-white/20">
                  Premium Gayrimenkul Deneyimi
                </span>
              </div>
              
              <h1 className="font-heading text-5xl md:text-7xl font-light tracking-tight text-white animate-fade-in opacity-0 stagger-1">
                Dairelerinizi<br />
                <span className="font-semibold text-gold">Premium</span> Seviyede<br />
                Tanıtın
              </h1>
              
              <p className="text-lg md:text-xl text-white/80 max-w-xl leading-relaxed animate-fade-in opacity-0 stagger-2">
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
            Binlerce emlakçı ve inşaat firması HomeView Pro ile satışlarını artırıyor.
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
              <Building2 className="w-6 h-6 text-primary" />
              <span className="font-heading text-lg font-semibold text-primary">HomeView Pro</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2024 HomeView Pro. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
