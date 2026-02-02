import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Slider } from '../components/ui/slider';
import {
  Building2,
  ArrowLeft,
  MapPin,
  Ruler,
  Layers,
  Compass,
  Flame,
  Calendar,
  Share2,
  Copy,
  Sun,
  Moon,
  School,
  ShoppingCart,
  Bus,
  TreePine,
  Hospital,
  CircleDot,
  Home
} from 'lucide-react';
import { Pannellum } from 'pannellum-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Room type names
const ROOM_NAMES = {
  living_room: 'Salon',
  bedroom: 'Yatak Odası',
  kitchen: 'Mutfak',
  bathroom: 'Banyo',
  balcony: 'Balkon',
  hallway: 'Koridor',
  entrance: 'Giriş',
  entry: 'Giriş',
  storage: 'Depo',
  other: 'Diğer'
};

const POI_ICONS = {
  school: School,
  market: ShoppingCart,
  transport: Bus,
  hospital: Hospital,
  park: TreePine,
  other: CircleDot,
};

const POI_COLORS = {
  school: 'bg-blue-100 text-blue-700',
  market: 'bg-green-100 text-green-700',
  transport: 'bg-yellow-100 text-yellow-700',
  hospital: 'bg-red-100 text-red-700',
  park: 'bg-emerald-100 text-emerald-700',
  other: 'bg-gray-100 text-gray-700',
};

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sunTime, setSunTime] = useState([12]);
  const [viewStartTime, setViewStartTime] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0);
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    fetchProperty();
    setViewStartTime(Date.now());

    return () => {
      if (!hasTrackedRef.current && viewStartTime) {
        trackVisit();
      }
    };
  }, [id]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!hasTrackedRef.current && viewStartTime) {
        trackVisit();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [viewStartTime]);

  const fetchProperty = async () => {
    try {
      const response = await axios.get(`${API_URL}/properties/${id}`);
      setProperty(response.data);
    } catch (error) {
      toast.error('Daire bilgileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const trackVisit = async () => {
    if (hasTrackedRef.current || !viewStartTime) return;
    hasTrackedRef.current = true;

    const duration = Math.round((Date.now() - viewStartTime) / 1000);
    try {
      await axios.post(`${API_URL}/visits`, {
        property_id: id,
        duration,
        visitor_ip: null,
        user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Visit tracking failed:', error);
    }
  };

  const handleCopyLink = () => {
    const fullUrl = window.location.href;
    navigator.clipboard.writeText(fullUrl);
    toast.success('Link kopyalandı');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title,
          text: `${property?.title} - ${property?.district}, ${property?.city}`,
          url: window.location.href,
        });
      } catch (error) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const getSunFilter = () => {
    const time = sunTime[0];
    // Morning (6-10): warmer, less bright
    // Midday (10-14): bright, neutral
    // Afternoon (14-18): warm golden
    // Evening (18-20): warm, dimmer

    let brightness = 1;
    let sepia = 0;
    let saturate = 1;

    if (time < 8) {
      brightness = 0.7 + (time - 6) * 0.1;
      sepia = 0.3 - (time - 6) * 0.1;
    } else if (time < 10) {
      brightness = 0.9 + (time - 8) * 0.05;
      sepia = 0.1 - (time - 8) * 0.05;
    } else if (time < 14) {
      brightness = 1;
      sepia = 0;
    } else if (time < 17) {
      brightness = 1 - (time - 14) * 0.03;
      sepia = (time - 14) * 0.1;
      saturate = 1 + (time - 14) * 0.05;
    } else {
      brightness = 0.85 - (time - 17) * 0.1;
      sepia = 0.3 + (time - 17) * 0.1;
      saturate = 1.15;
    }

    return `brightness(${brightness}) sepia(${sepia}) saturate(${saturate})`;
  };

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency || 'TRY',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatTime = (hour) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary font-heading text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Home className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-heading text-2xl text-foreground mb-2">Daire Bulunamadı</h1>
          <p className="text-muted-foreground mb-6">Bu daire silinmiş veya mevcut değil.</p>
          <Link to="/">
            <Button className="rounded-full">Ana Sayfaya Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" data-testid="back-to-home">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/" className="flex items-center gap-3" data-testid="detail-logo">
                <Building2 className="w-7 h-7 text-primary" />
                <span className="font-heading text-lg font-semibold text-primary">mekan360</span>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleCopyLink} data-testid="copy-link-btn">
                <Copy className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Kopyala</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare} data-testid="share-btn">
                <Share2 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Paylaş</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 360 Panorama Section - Using rooms data */}
      {property.view_type === '360' && property.rooms?.some(r => r.panorama_photo) && (
        <section className="relative" data-testid="panorama-section">
          <div className="panorama-container sun-filter" style={{ filter: getSunFilter() }}>
            <Pannellum
              width="100%"
              height="100%"
              image={property.rooms[selectedRoomIndex]?.panorama_photo || property.rooms.find(r => r.panorama_photo)?.panorama_photo}
              pitch={0}
              yaw={0}
              hfov={110}
              autoLoad
              autoRotate={-2}
              compass={true}
              showZoomCtrl={true}
              showFullscreenCtrl={true}
            />
          </div>

          {/* Room selector for 360 */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 justify-center">
            {property.rooms.filter(r => r.panorama_photo).map((room, idx) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoomIndex(property.rooms.indexOf(room))}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  property.rooms.indexOf(room) === selectedRoomIndex
                    ? 'bg-amber-500 text-white'
                    : 'bg-black/50 text-white hover:bg-black/70'
                }`}
              >
                {room.name || ROOM_NAMES[room.room_type] || 'Oda'}
              </button>
            ))}
          </div>

          {/* Sun Simulation Overlay */}
          <div className="absolute bottom-0 left-0 right-0 glass-dark p-4 md:p-6">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-white">
                  <Sun className="w-5 h-5 text-gold" />
                  <span className="text-sm font-medium">Güneş Simülasyonu</span>
                </div>
                <span className="text-white font-heading text-lg">{formatTime(sunTime[0])}</span>
              </div>
              <div className="flex items-center gap-4">
                <Moon className="w-4 h-4 text-white/60" />
                <Slider
                  value={sunTime}
                  onValueChange={setSunTime}
                  min={6}
                  max={20}
                  step={1}
                  className="flex-1"
                  data-testid="sun-slider"
                />
                <Sun className="w-4 h-4 text-gold" />
              </div>
              <p className="text-xs text-white/60 mt-2 text-center">
                Cephe: {property.facing_direction} - Gün içinde ışık değişimini görün
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8 lg:py-12">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-7 space-y-8">
            {/* Title & Price */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="font-heading text-2xl md:text-3xl font-semibold text-primary mb-2" data-testid="property-title">
                    {property.title}
                  </h1>
                  <p className="flex items-center text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-1" />
                    {property.address}, {property.district}, {property.city}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-heading text-2xl md:text-3xl font-semibold text-gold" data-testid="property-price">
                    {formatPrice(property.price, property.currency)}
                  </p>
                </div>
              </div>

              {property.description && (
                <p className="text-muted-foreground leading-relaxed mt-4" data-testid="property-description">
                  {property.description}
                </p>
              )}
            </div>

            {/* Property Features */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="border-border/40">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Ruler className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Alan</p>
                    <p className="font-heading font-medium text-foreground">{property.square_meters} m²</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Home className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Oda</p>
                    <p className="font-heading font-medium text-foreground">{property.room_count}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Kat</p>
                    <p className="font-heading font-medium text-foreground">{property.floor}/{property.total_floors}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                    <Compass className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Cephe</p>
                    <p className="font-heading font-medium text-foreground">{property.facing_direction}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Isıtma</p>
                    <p className="font-heading font-medium text-foreground text-sm">{property.heating_type}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Bina Yaşı</p>
                    <p className="font-heading font-medium text-foreground">{property.building_age} yıl</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Room Images Gallery - From rooms data */}
            {property.rooms?.some(r => r.photos?.length > 0) && (
              <div>
                <h2 className="font-heading text-xl font-semibold text-primary mb-4">Oda Görselleri</h2>
                {property.rooms.filter(r => r.photos?.length > 0).map((room, roomIdx) => (
                  <div key={room.id} className="mb-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      {room.name || ROOM_NAMES[room.room_type] || 'Oda'}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {room.photos.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(img)}
                          className="aspect-square rounded-sm overflow-hidden hover:opacity-90 transition-opacity"
                          data-testid={`gallery-image-${roomIdx}-${index}`}
                        >
                          <img src={img} alt={`${room.name} - ${index + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Legacy: Regular Images Gallery */}
            {property.regular_images?.length > 0 && (
              <div>
                <h2 className="font-heading text-xl font-semibold text-primary mb-4">Görseller</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.regular_images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(img)}
                      className="aspect-square rounded-sm overflow-hidden hover:opacity-90 transition-opacity"
                      data-testid={`gallery-image-${index}`}
                    >
                      <img src={img} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - POIs & Contact */}
          <div className="lg:col-span-5 space-y-6">
            {/* POIs */}
            {property.pois?.length > 0 && (
              <Card className="border-border/40">
                <CardContent className="p-6">
                  <h3 className="font-heading text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Yakın Çevre
                  </h3>
                  <div className="space-y-3">
                    {property.pois.map((poi, index) => {
                      const IconComponent = POI_ICONS[poi.type] || CircleDot;
                      const colorClass = POI_COLORS[poi.type] || POI_COLORS.other;
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between py-3 border-b border-border last:border-0"
                          data-testid={`poi-item-${index}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <span className="font-medium text-foreground">{poi.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                            {poi.distance}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Share Card */}
            <Card className="border-border/40 bg-primary text-primary-foreground">
              <CardContent className="p-6 text-center">
                <h3 className="font-heading text-xl font-semibold mb-2">Bu daireyi beğendiniz mi?</h3>
                <p className="text-primary-foreground/80 text-sm mb-4">
                  Linki paylaşarak arkadaşlarınıza gösterin.
                </p>
                <Button
                  onClick={handleShare}
                  className="bg-gold text-white hover:bg-gold-hover rounded-full w-full"
                  data-testid="share-cta-btn"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Paylaş
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
          data-testid="image-modal"
        >
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setSelectedImage(null)}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </div>
      )}

      {/* Footer */}
      <footer className="py-8 bg-muted border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <p className="text-muted-foreground text-sm">
            Bu ilan <span className="font-medium text-foreground">mekan360</span> ile oluşturulmuştur.
          </p>
        </div>
      </footer>
    </div>
  );
}
