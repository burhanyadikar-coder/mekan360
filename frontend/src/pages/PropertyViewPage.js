import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Slider } from '../components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Building2,
  MapPin,
  Ruler,
  Layers,
  Compass,
  Flame,
  Calendar,
  Share2,
  Sun,
  Moon,
  School,
  ShoppingCart,
  Bus,
  TreePine,
  Hospital,
  CircleDot,
  Home,
  Phone,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Map,
  DoorOpen,
  Maximize2
} from 'lucide-react';
import { Pannellum } from 'pannellum-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const POI_ICONS = {
  school: School,
  market: ShoppingCart,
  transport: Bus,
  hospital: Hospital,
  park: TreePine,
  other: CircleDot,
};

const POI_COLORS = {
  school: 'bg-blue-500',
  market: 'bg-green-500',
  transport: 'bg-yellow-500',
  hospital: 'bg-red-500',
  park: 'bg-emerald-500',
  other: 'bg-gray-500',
};

const ROOM_NAMES = {
  living_room: 'Salon',
  bedroom: 'Yatak Odası',
  kitchen: 'Mutfak',
  bathroom: 'Banyo',
  balcony: 'Balkon',
  hallway: 'Koridor',
  entrance: 'Giriş',
  storage: 'Depo',
  other: 'Diğer'
};

export default function PropertyViewPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVisitorForm, setShowVisitorForm] = useState(true);
  const [visitor, setVisitor] = useState(null);
  const [visitorForm, setVisitorForm] = useState({ first_name: '', last_name: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  
  // View states
  const [viewMode, setViewMode] = useState('info'); // 'info', 'tour', 'floorplan'
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [sunTime, setSunTime] = useState([12]);
  const [fullscreen, setFullscreen] = useState(false);
  
  const viewStartTime = useRef(null);
  const visitedRooms = useRef([]);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  useEffect(() => {
    if (visitor && !viewStartTime.current) {
      viewStartTime.current = Date.now();
    }

    return () => {
      if (visitor && viewStartTime.current) {
        trackVisit();
      }
    };
  }, [visitor]);

  const fetchProperty = async () => {
    try {
      const response = await axios.get(`${API_URL}/properties/${id}`);
      setProperty(response.data);
    } catch (error) {
      toast.error('Gayrimenkul bulunamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleVisitorSubmit = async (e) => {
    e.preventDefault();
    if (!visitorForm.first_name || !visitorForm.last_name || !visitorForm.phone) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(`${API_URL}/visitors/register`, {
        property_id: id,
        ...visitorForm
      });
      setVisitor(response.data);
      setShowVisitorForm(false);
      toast.success('Hoş geldiniz!');
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const trackVisit = async () => {
    if (!visitor || !viewStartTime.current) return;
    
    const duration = Math.round((Date.now() - viewStartTime.current) / 1000);
    try {
      await axios.post(`${API_URL}/visits`, {
        property_id: id,
        visitor_id: visitor.id,
        duration,
        rooms_visited: visitedRooms.current
      });
    } catch (error) {
      console.error('Visit tracking failed:', error);
    }
  };

  const getSunFilter = () => {
    const time = sunTime[0];
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

  const formatTime = (hour) => `${hour.toString().padStart(2, '0')}:00`;

  const handleRoomChange = (index) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentRoomIndex(index);
      setCurrentPhotoIndex(0);
      const room = property.rooms[index];
      if (room && !visitedRooms.current.includes(room.id)) {
        visitedRooms.current.push(room.id);
      }
      setIsTransitioning(false);
    }, 300);
  };

  const handlePhotoChange = (direction) => {
    const room = property.rooms[currentRoomIndex];
    if (!room?.photos?.length) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      if (direction === 'next') {
        setCurrentPhotoIndex((prev) => (prev + 1) % room.photos.length);
      } else {
        setCurrentPhotoIndex((prev) => (prev - 1 + room.photos.length) % room.photos.length);
      }
      setIsTransitioning(false);
    }, 300);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title,
          text: `${property?.title} - ${property?.district}, ${property?.city}`,
          url: shareUrl,
        });
      } catch (error) {
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link kopyalandı');
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link kopyalandı');
    }
  };

  const currentRoom = property?.rooms?.[currentRoomIndex];
  const has360 = property?.view_type === '360' && currentRoom?.panorama_photo;
  const hasPhotos = currentRoom?.photos?.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 to-emerald-900">
        <div className="animate-pulse text-white font-heading text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 to-emerald-900">
        <div className="text-center text-white">
          <Home className="w-16 h-16 text-white/50 mx-auto mb-4" />
          <h1 className="font-heading text-2xl mb-2">Gayrimenkul Bulunamadı</h1>
          <p className="text-white/70">Bu gayrimenkul silinmiş veya mevcut değil.</p>
        </div>
      </div>
    );
  }

  // Visitor Form
  if (showVisitorForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 to-emerald-900 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Property Preview Card */}
          <Card className="bg-white/10 backdrop-blur border-white/20 overflow-hidden mb-6">
            {(property.cover_image || property.rooms?.[0]?.photos?.[0]) && (
              <img 
                src={property.cover_image || property.rooms[0].photos[0]} 
                alt={property.title} 
                className="w-full h-48 object-cover"
              />
            )}
            <CardContent className="p-6">
              <p className="text-white/60 text-sm mb-2">{property.company_name}</p>
              <h1 className="font-heading text-2xl font-semibold text-white mb-2">{property.title}</h1>
              <p className="text-white/70 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {property.district}, {property.city}
              </p>
              <div className="flex items-center gap-4 mt-4 text-white/60 text-sm">
                <span>{property.room_count}</span>
                <span>•</span>
                <span>{property.square_meters} m²</span>
                <span>•</span>
                <span>Kat {property.floor}</span>
              </div>
              {property.view_type === '360' && (
                <Badge className="mt-4 bg-amber-500/20 text-amber-400 border-0">
                  360° Sanal Tur
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Visitor Form */}
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6">
              <h2 className="font-heading text-xl text-white mb-2">Daireyi Görüntüle</h2>
              <p className="text-white/60 text-sm mb-6">
                Daireyi görüntülemek için lütfen bilgilerinizi girin
              </p>
              
              <form onSubmit={handleVisitorSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/80">Adınız</Label>
                    <Input
                      value={visitorForm.first_name}
                      onChange={(e) => setVisitorForm({...visitorForm, first_name: e.target.value})}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      placeholder="Ad"
                    />
                  </div>
                  <div>
                    <Label className="text-white/80">Soyadınız</Label>
                    <Input
                      value={visitorForm.last_name}
                      onChange={(e) => setVisitorForm({...visitorForm, last_name: e.target.value})}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      placeholder="Soyad"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-white/80">Telefon</Label>
                  <Input
                    value={visitorForm.phone}
                    onChange={(e) => setVisitorForm({...visitorForm, phone: e.target.value})}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    placeholder="05XX XXX XX XX"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white h-12 rounded-full"
                >
                  {submitting ? 'Yükleniyor...' : 'Daireyi Görüntüle'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main Property View
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 to-emerald-900">
      {/* Info View */}
      {viewMode === 'info' && (
        <div className="min-h-screen">
          {/* Header */}
          <header className="p-4 flex items-center justify-between">
            <div className="text-white/60 text-sm">{property.company_name}</div>
            <Button variant="ghost" size="sm" onClick={handleShare} className="text-white/70 hover:text-white">
              <Share2 className="w-4 h-4 mr-2" />
              Paylaş
            </Button>
          </header>

          {/* Cover Image */}
          <div className="relative h-64 md:h-80">
            {(property.cover_image || property.rooms?.[0]?.photos?.[0]) ? (
              <img 
                src={property.cover_image || property.rooms[0].photos[0]} 
                alt={property.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-white/10 flex items-center justify-center">
                <Home className="w-16 h-16 text-white/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 to-transparent" />
            
            {/* Price Badge */}
            <div className="absolute bottom-4 right-4">
              <div className="bg-amber-500 text-white px-4 py-2 rounded-full font-heading text-xl font-bold">
                {formatPrice(property.price, property.currency)}
              </div>
            </div>
          </div>

          {/* Property Info */}
          <div className="px-4 pb-32">
            <h1 className="font-heading text-3xl font-semibold text-white mt-4 mb-2">
              {property.title}
            </h1>
            
            <p className="text-white/70 flex items-center gap-2 mb-6">
              <MapPin className="w-4 h-4" />
              {property.address}, {property.district}, {property.city}
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-3 mb-8">
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <Ruler className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-white font-semibold">{property.square_meters}</p>
                <p className="text-white/50 text-xs">m²</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <DoorOpen className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-white font-semibold">{property.room_count}</p>
                <p className="text-white/50 text-xs">Oda</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <Layers className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-white font-semibold">{property.floor}/{property.total_floors}</p>
                <p className="text-white/50 text-xs">Kat</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <Calendar className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-white font-semibold">{property.building_age}</p>
                <p className="text-white/50 text-xs">Yaş</p>
              </div>
            </div>

            {/* Details */}
            <div className="bg-white/10 rounded-xl p-4 mb-6">
              <h3 className="text-white font-semibold mb-4">Detaylar</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span className="text-white/70">Cephe:</span>
                  <span className="text-white">{property.facing_direction}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span className="text-white/70">Isıtma:</span>
                  <span className="text-white">{property.heating_type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span className="text-white/70">Tip:</span>
                  <span className="text-white">
                    {property.property_type === 'single' ? 'Normal' : 
                     property.property_type === 'duplex' ? 'Dubleks' : 'Tripleks'}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="bg-white/10 rounded-xl p-4 mb-6">
                <h3 className="text-white font-semibold mb-2">Açıklama</h3>
                <p className="text-white/70 text-sm leading-relaxed">{property.description}</p>
              </div>
            )}

            {/* POIs */}
            {property.pois?.length > 0 && (
              <div className="bg-white/10 rounded-xl p-4 mb-6">
                <h3 className="text-white font-semibold mb-4">Yakın Çevre</h3>
                <div className="space-y-3">
                  {property.pois.map((poi, idx) => {
                    const Icon = POI_ICONS[poi.type] || CircleDot;
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${POI_COLORS[poi.type]} flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white">{poi.name}</span>
                        {poi.distance && (
                          <span className="text-white/50 text-sm ml-auto">{poi.distance}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Fixed Bottom Actions */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-emerald-950 via-emerald-950 to-transparent pt-12">
            <div className="flex gap-3">
              {property.rooms?.length > 0 && (
                <Button 
                  onClick={() => setViewMode('floorplan')}
                  variant="outline"
                  className="flex-1 h-14 rounded-full border-white/30 text-white hover:bg-white/10"
                >
                  <Map className="w-5 h-5 mr-2" />
                  Kroki
                </Button>
              )}
              <Button 
                onClick={() => setViewMode('tour')}
                className="flex-1 h-14 rounded-full bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Eye className="w-5 h-5 mr-2" />
                Daireyi Gez
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floor Plan View */}
      {viewMode === 'floorplan' && (
        <div className="min-h-screen p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setViewMode('info')}
              className="text-white/70 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Geri
            </Button>
            <h2 className="text-white font-heading text-xl">Daire Krokisi</h2>
            <div className="w-20" />
          </div>

          {/* Floor Plan Grid */}
          <div className="bg-white/10 rounded-2xl p-6 mb-6">
            <div className="relative" style={{ minHeight: '400px' }}>
              {/* Rooms as interactive cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.rooms?.map((room, idx) => (
                  <button
                    key={room.id}
                    onClick={() => {
                      setCurrentRoomIndex(idx);
                      setViewMode('tour');
                    }}
                    className={`p-4 rounded-xl text-left transition-all hover:scale-105 ${
                      room.id === property.entry_room_id 
                        ? 'bg-amber-500/30 border-2 border-amber-500' 
                        : 'bg-white/10 border border-white/20 hover:border-amber-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <DoorOpen className="w-4 h-4 text-amber-400" />
                      <span className="text-white font-medium text-sm">
                        {room.name || ROOM_NAMES[room.room_type] || room.room_type}
                      </span>
                    </div>
                    {room.square_meters && (
                      <p className="text-white/50 text-xs">{room.square_meters} m²</p>
                    )}
                    {room.id === property.entry_room_id && (
                      <Badge className="mt-2 bg-amber-500 text-white text-xs">Giriş</Badge>
                    )}
                    {room.photos?.length > 0 && (
                      <p className="text-white/40 text-xs mt-1">{room.photos.length} fotoğraf</p>
                    )}
                    {room.panorama_photo && (
                      <Badge className="mt-1 bg-blue-500/30 text-blue-300 text-xs border-0">360°</Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-500/30 border border-amber-500" />
              <span>Giriş Noktası</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-white/10 border border-white/20" />
              <span>Oda</span>
            </div>
          </div>

          {/* Start Tour Button */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-emerald-950 via-emerald-950 to-transparent pt-12">
            <Button 
              onClick={() => setViewMode('tour')}
              className="w-full h-14 rounded-full bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Eye className="w-5 h-5 mr-2" />
              Tura Başla
            </Button>
          </div>
        </div>
      )}

      {/* Tour View */}
      {viewMode === 'tour' && (
        <div className={`min-h-screen ${fullscreen ? 'fixed inset-0 z-50' : ''}`}>
          {/* Header */}
          {!fullscreen && (
            <div className="flex items-center justify-between p-4">
              <Button 
                variant="ghost" 
                onClick={() => setViewMode('info')}
                className="text-white/70 hover:text-white"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Geri
              </Button>
              <h2 className="text-white font-heading text-lg">
                {currentRoom?.name || ROOM_NAMES[currentRoom?.room_type] || 'Oda'}
              </h2>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setFullscreen(true)}
                className="text-white/70 hover:text-white"
              >
                <Maximize2 className="w-5 h-5" />
              </Button>
            </div>
          )}

          {/* Fullscreen Close Button */}
          {fullscreen && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setFullscreen(false)}
              className="absolute top-4 right-4 z-50 text-white bg-black/50 hover:bg-black/70 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          )}

          {/* Photo/Panorama View */}
          <div className={`relative ${fullscreen ? 'h-screen' : 'h-[60vh]'}`}>
            {has360 ? (
              // 360 Panorama
              <div className="w-full h-full" style={{ filter: getSunFilter() }}>
                <Pannellum
                  width="100%"
                  height="100%"
                  image={currentRoom.panorama_photo}
                  pitch={0}
                  yaw={0}
                  hfov={110}
                  autoLoad
                  showZoomCtrl={false}
                  showFullscreenCtrl={false}
                  mouseZoom={true}
                  compass={true}
                />
              </div>
            ) : hasPhotos ? (
              // Regular Photos with Transition
              <div className="relative w-full h-full overflow-hidden">
                <img
                  src={currentRoom.photos[currentPhotoIndex]}
                  alt={`${currentRoom.name} - ${currentPhotoIndex + 1}`}
                  className={`w-full h-full object-contain bg-black transition-all duration-300 ${
                    isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                  }`}
                  style={{ filter: getSunFilter() }}
                />
                
                {/* Photo Navigation */}
                {currentRoom.photos.length > 1 && (
                  <>
                    <button
                      onClick={() => handlePhotoChange('prev')}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => handlePhotoChange('next')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    
                    {/* Photo Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {currentRoom.photos.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setIsTransitioning(true);
                            setTimeout(() => {
                              setCurrentPhotoIndex(idx);
                              setIsTransitioning(false);
                            }, 300);
                          }}
                          className={`w-2 h-2 rounded-full transition-all ${
                            idx === currentPhotoIndex ? 'bg-white w-6' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full h-full bg-white/10 flex items-center justify-center">
                <div className="text-center text-white/50">
                  <Home className="w-16 h-16 mx-auto mb-4" />
                  <p>Bu oda için fotoğraf yok</p>
                </div>
              </div>
            )}

            {/* 360 Badge */}
            {has360 && (
              <Badge className="absolute top-4 left-4 bg-blue-500 text-white">
                360° - Sürükleyerek Gez
              </Badge>
            )}
          </div>

          {/* Sun Simulation */}
          {!fullscreen && (
            <div className="px-4 py-4 bg-black/30">
              <div className="flex items-center gap-4">
                <Sun className="w-5 h-5 text-amber-400" />
                <div className="flex-1">
                  <Slider
                    value={sunTime}
                    onValueChange={setSunTime}
                    min={6}
                    max={20}
                    step={1}
                    className="w-full"
                  />
                </div>
                <span className="text-white/70 text-sm w-12">{formatTime(sunTime[0])}</span>
              </div>
            </div>
          )}

          {/* Room Navigation */}
          {!fullscreen && property.rooms?.length > 1 && (
            <div className="px-4 py-4">
              <p className="text-white/50 text-sm mb-3">Diğer Odalar</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {property.rooms.map((room, idx) => (
                  <button
                    key={room.id}
                    onClick={() => handleRoomChange(idx)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition-all ${
                      idx === currentRoomIndex
                        ? 'bg-amber-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {room.name || ROOM_NAMES[room.room_type] || room.room_type}
                    {room.panorama_photo && <span className="ml-1">🔄</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {!fullscreen && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-emerald-950 via-emerald-950 to-transparent pt-12">
              <div className="flex gap-3">
                <Button 
                  onClick={() => setViewMode('floorplan')}
                  variant="outline"
                  className="flex-1 h-12 rounded-full border-white/30 text-white hover:bg-white/10"
                >
                  <Map className="w-5 h-5 mr-2" />
                  Kroki
                </Button>
                <Button 
                  onClick={() => setViewMode('info')}
                  variant="outline"
                  className="flex-1 h-12 rounded-full border-white/30 text-white hover:bg-white/10"
                >
                  Daire Bilgileri
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
