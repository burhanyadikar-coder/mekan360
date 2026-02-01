import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import {
  Building2,
  ArrowLeft,
  Upload,
  X,
  Plus,
  MapPin,
  Home,
  Compass,
  Ruler,
  Layers,
  Calendar,
  Flame,
  Image as ImageIcon,
  Save,
  Grid3X3,
  DoorOpen,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown,
  Check
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const FACING_DIRECTIONS = [
  { value: 'Kuzey', label: 'Kuzey' },
  { value: 'Güney', label: 'Güney' },
  { value: 'Doğu', label: 'Doğu' },
  { value: 'Batı', label: 'Batı' },
  { value: 'Kuzey-Doğu', label: 'Kuzey-Doğu' },
  { value: 'Kuzey-Batı', label: 'Kuzey-Batı' },
  { value: 'Güney-Doğu', label: 'Güney-Doğu' },
  { value: 'Güney-Batı', label: 'Güney-Batı' },
];

const HEATING_TYPES = [
  { value: 'Doğalgaz (Kombi)', label: 'Doğalgaz (Kombi)' },
  { value: 'Merkezi', label: 'Merkezi' },
  { value: 'Soba', label: 'Soba' },
  { value: 'Klima', label: 'Klima' },
  { value: 'Yerden Isıtma', label: 'Yerden Isıtma' },
  { value: 'Yok', label: 'Yok' },
];

const ROOM_TYPES = [
  { value: 'entry', label: 'Giriş', icon: '🚪' },
  { value: 'living_room', label: 'Salon', icon: '🛋️' },
  { value: 'bedroom', label: 'Yatak Odası', icon: '🛏️' },
  { value: 'kitchen', label: 'Mutfak', icon: '🍳' },
  { value: 'bathroom', label: 'Banyo', icon: '🚿' },
  { value: 'wc', label: 'Tuvalet', icon: '🚽' },
  { value: 'balcony', label: 'Balkon', icon: '🌅' },
  { value: 'corridor', label: 'Koridor', icon: '🚶' },
  { value: 'stairs', label: 'Merdiven', icon: '📶' },
  { value: 'other', label: 'Diğer', icon: '📦' },
];

const POI_TYPES = [
  { value: 'school', label: 'Okul', icon: '🏫' },
  { value: 'market', label: 'Market', icon: '🛒' },
  { value: 'transport', label: 'Durak/Metro', icon: '🚌' },
  { value: 'hospital', label: 'Hastane', icon: '🏥' },
  { value: 'park', label: 'Park', icon: '🌳' },
  { value: 'other', label: 'Diğer', icon: '📍' },
];

const PROPERTY_TYPES = [
  { value: 'single', label: 'Tek Kat' },
  { value: 'duplex', label: 'Dubleks' },
  { value: 'triplex', label: 'Tripleks' },
];

export default function PropertyFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = Boolean(id);
  const coverInputRef = useRef(null);

  const [step, setStep] = useState(1); // 1: Type, 2: Info, 3: Rooms, 4: POIs
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    district: '',
    square_meters: '',
    room_count: '',
    property_type: 'single',
    floor: '',
    total_floors: '',
    building_age: '',
    heating_type: '',
    facing_direction: '',
    price: '',
    currency: 'TRY',
    view_type: 'regular',
    rooms: [],
    entry_room_id: null,
    pois: [],
    cover_image: null
  });

  // Room mapping state
  const [currentFloor, setCurrentFloor] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showRoomDialog, setShowRoomDialog] = useState(false);
  const [roomForm, setRoomForm] = useState({
    name: '',
    room_type: 'living_room',
    square_meters: '',
    facing_direction: '',
    photos: [],
    panorama_photo: null
  });
  const [addingRoomPosition, setAddingRoomPosition] = useState(null);

  // POI state
  const [newPoi, setNewPoi] = useState({ name: '', type: 'school', distance: '' });

  const has360 = user?.has_360;
  const maxFloors = formData.property_type === 'triplex' ? 3 : formData.property_type === 'duplex' ? 2 : 1;

  useEffect(() => {
    if (isEditing) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await axios.get(`${API_URL}/properties/${id}`);
      const property = response.data;
      setFormData({
        ...property,
        square_meters: property.square_meters.toString(),
        floor: property.floor.toString(),
        total_floors: property.total_floors.toString(),
        building_age: property.building_age.toString(),
        price: property.price.toString(),
      });
      setStep(2); // Skip to info step if editing
    } catch (error) {
      toast.error('Gayrimenkul bilgileri yüklenemedi');
      navigate('/dashboard');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Cover image upload
  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Görsel 5MB\'dan küçük olmalı');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, cover_image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Room functions
  const getGridPosition = (x, y) => {
    return formData.rooms.find(r => r.position_x === x && r.position_y === y && r.floor === currentFloor);
  };

  const getAdjacentPositions = (x, y) => {
    return [
      { x: x, y: y - 1, direction: 'up' },
      { x: x + 1, y: y, direction: 'right' },
      { x: x, y: y + 1, direction: 'down' },
      { x: x - 1, y: y, direction: 'left' },
    ].filter(pos => !getGridPosition(pos.x, pos.y));
  };

  const handleAddRoom = (x, y) => {
    setAddingRoomPosition({ x, y });
    setRoomForm({
      name: '',
      room_type: 'living_room',
      square_meters: '',
      facing_direction: '',
      photos: [],
      panorama_photo: null
    });
    setShowRoomDialog(true);
  };

  const handleRoomPhotoUpload = (e, isPanorama = false) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} 10MB'dan büyük`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isPanorama) {
          setRoomForm(prev => ({ ...prev, panorama_photo: reader.result }));
        } else {
          setRoomForm(prev => ({
            ...prev,
            photos: [...prev.photos, reader.result]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const saveRoom = () => {
    if (!roomForm.name) {
      toast.error('Lütfen oda adı girin');
      return;
    }

    const roomId = selectedRoom?.id || `room-${Date.now()}`;
    const newRoom = {
      id: roomId,
      name: roomForm.name,
      room_type: roomForm.room_type,
      position_x: addingRoomPosition?.x ?? selectedRoom?.position_x,
      position_y: addingRoomPosition?.y ?? selectedRoom?.position_y,
      floor: currentFloor,
      square_meters: roomForm.square_meters ? parseFloat(roomForm.square_meters) : null,
      facing_direction: roomForm.facing_direction || null,
      photos: roomForm.photos,
      panorama_photo: roomForm.panorama_photo,
      connections: []
    };

    // Update connections
    const adjacentRooms = formData.rooms.filter(r => 
      r.floor === currentFloor && (
        (Math.abs(r.position_x - newRoom.position_x) === 1 && r.position_y === newRoom.position_y) ||
        (Math.abs(r.position_y - newRoom.position_y) === 1 && r.position_x === newRoom.position_x)
      )
    );
    
    newRoom.connections = adjacentRooms.map(r => r.id);

    setFormData(prev => {
      const updatedRooms = selectedRoom
        ? prev.rooms.map(r => r.id === selectedRoom.id ? newRoom : r)
        : [...prev.rooms, newRoom];
      
      // Update adjacent rooms' connections
      return {
        ...prev,
        rooms: updatedRooms.map(r => {
          if (adjacentRooms.some(ar => ar.id === r.id)) {
            return {
              ...r,
              connections: [...new Set([...r.connections, roomId])]
            };
          }
          return r;
        }),
        entry_room_id: prev.entry_room_id || (roomForm.room_type === 'entry' ? roomId : null)
      };
    });

    setShowRoomDialog(false);
    setSelectedRoom(null);
    setAddingRoomPosition(null);
    toast.success(selectedRoom ? 'Oda güncellendi' : 'Oda eklendi');
  };

  const editRoom = (room) => {
    setSelectedRoom(room);
    setRoomForm({
      name: room.name,
      room_type: room.room_type,
      square_meters: room.square_meters?.toString() || '',
      facing_direction: room.facing_direction || '',
      photos: room.photos || [],
      panorama_photo: room.panorama_photo || null
    });
    setShowRoomDialog(true);
  };

  const deleteRoom = (roomId) => {
    setFormData(prev => ({
      ...prev,
      rooms: prev.rooms.filter(r => r.id !== roomId).map(r => ({
        ...r,
        connections: r.connections.filter(c => c !== roomId)
      })),
      entry_room_id: prev.entry_room_id === roomId ? null : prev.entry_room_id
    }));
    toast.success('Oda silindi');
  };

  // POI functions
  const addPoi = () => {
    if (!newPoi.name || !newPoi.distance) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }
    setFormData(prev => ({
      ...prev,
      pois: [...prev.pois, { ...newPoi }]
    }));
    setNewPoi({ name: '', type: 'school', distance: '' });
  };

  const removePoi = (index) => {
    setFormData(prev => ({
      ...prev,
      pois: prev.pois.filter((_, i) => i !== index)
    }));
  };

  // Submit
  const handleSubmit = async () => {
    if (!formData.title || !formData.address || !formData.city || !formData.district) {
      toast.error('Lütfen zorunlu alanları doldurun');
      setStep(2);
      return;
    }

    if (formData.rooms.length === 0) {
      toast.error('En az bir oda eklemelisiniz');
      setStep(3);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        square_meters: parseFloat(formData.square_meters) || 0,
        floor: parseInt(formData.floor) || 0,
        total_floors: parseInt(formData.total_floors) || 0,
        building_age: parseInt(formData.building_age) || 0,
        price: parseFloat(formData.price) || 0,
      };

      if (isEditing) {
        await axios.put(`${API_URL}/properties/${id}`, payload);
        toast.success('Gayrimenkul güncellendi');
      } else {
        await axios.post(`${API_URL}/properties`, payload);
        toast.success('Gayrimenkul eklendi');
      }
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.detail || 'İşlem başarısız';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Render grid for room mapping
  const renderGrid = () => {
    const floorRooms = formData.rooms.filter(r => r.floor === currentFloor);
    
    if (floorRooms.length === 0) {
      // Show initial add button
      return (
        <div className="flex items-center justify-center h-64">
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleAddRoom(0, 0)}
            className="border-dashed border-2"
            data-testid="add-first-room-btn"
          >
            <Plus className="w-5 h-5 mr-2" />
            Giriş Noktası Ekle
          </Button>
        </div>
      );
    }

    // Calculate grid bounds
    const minX = Math.min(...floorRooms.map(r => r.position_x)) - 1;
    const maxX = Math.max(...floorRooms.map(r => r.position_x)) + 1;
    const minY = Math.min(...floorRooms.map(r => r.position_y)) - 1;
    const maxY = Math.max(...floorRooms.map(r => r.position_y)) + 1;

    const grid = [];
    for (let y = minY; y <= maxY; y++) {
      const row = [];
      for (let x = minX; x <= maxX; x++) {
        const room = getGridPosition(x, y);
        const hasAdjacentRoom = floorRooms.some(r =>
          (Math.abs(r.position_x - x) === 1 && r.position_y === y) ||
          (Math.abs(r.position_y - y) === 1 && r.position_x === x)
        );

        row.push(
          <div key={`${x}-${y}`} className="w-24 h-24 p-1">
            {room ? (
              <button
                onClick={() => editRoom(room)}
                className={`w-full h-full rounded-lg p-2 text-center transition-all hover:scale-105 ${
                  room.id === formData.entry_room_id ? 'bg-gold text-white' : 'bg-primary/10 hover:bg-primary/20'
                }`}
                data-testid={`room-${room.id}`}
              >
                <span className="text-2xl block">{ROOM_TYPES.find(t => t.value === room.room_type)?.icon}</span>
                <span className="text-xs font-medium truncate block">{room.name}</span>
                {room.photos?.length > 0 && (
                  <span className="text-xs text-muted-foreground">{room.photos.length} foto</span>
                )}
              </button>
            ) : hasAdjacentRoom ? (
              <button
                onClick={() => handleAddRoom(x, y)}
                className="w-full h-full rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-all"
                data-testid={`add-room-${x}-${y}`}
              >
                <Plus className="w-6 h-6 text-muted-foreground" />
              </button>
            ) : null}
          </div>
        );
      }
      grid.push(
        <div key={y} className="flex justify-center">
          {row}
        </div>
      );
    }

    return <div className="space-y-0">{grid}</div>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary w-8 h-8 sm:w-10 sm:h-10" data-testid="back-btn">
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Link>
              <Link to="/dashboard" className="flex items-center gap-2 sm:gap-3">
                <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                <span className="font-heading text-base sm:text-lg font-semibold text-primary hidden sm:block">mekan360</span>
              </Link>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-1 sm:gap-2">
              {[1, 2, 3, 4].map(s => (
                <div
                  key={s}
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-colors ${
                    step >= s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 lg:px-12 py-8">
        <div className="mb-8">
          <h1 className="font-heading text-2xl md:text-3xl font-semibold text-primary">
            {isEditing ? 'Gayrimenkul Düzenle' : 'Yeni Gayrimenkul Ekle'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {step === 1 && 'Gayrimenkul tipini ve görüntüleme türünü seçin'}
            {step === 2 && 'Temel bilgileri girin'}
            {step === 3 && 'Odaları ve krokiyi oluşturun'}
            {step === 4 && 'Çevre bilgilerini ekleyin'}
          </p>
        </div>

        {/* Step 1: Type Selection */}
        {step === 1 && (
          <div className="space-y-6">
            {/* View Type Selection - Only for Premium/Ultra */}
            {has360 && (
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="font-heading text-lg">Görüntüleme Türü</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setFormData(p => ({ ...p, view_type: 'regular' }))}
                      className={`p-6 rounded-lg border-2 transition-all ${
                        formData.view_type === 'regular' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                      data-testid="view-type-regular"
                    >
                      <ImageIcon className="w-10 h-10 mx-auto mb-3 text-primary" />
                      <p className="font-medium">Normal Fotoğraf</p>
                      <p className="text-sm text-muted-foreground mt-1">Standart fotoğraf galerisi</p>
                    </button>
                    <button
                      onClick={() => setFormData(p => ({ ...p, view_type: '360' }))}
                      className={`p-6 rounded-lg border-2 transition-all ${
                        formData.view_type === '360' ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/50'
                      }`}
                      data-testid="view-type-360"
                    >
                      <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-gold/20 flex items-center justify-center">
                        <span className="font-bold text-gold">360°</span>
                      </div>
                      <p className="font-medium">360° Görüntüleme</p>
                      <p className="text-sm text-muted-foreground mt-1">Panoramik sanal tur</p>
                    </button>
                  </div>
                  {formData.view_type === '360' && (
                    <p className="text-sm text-amber-600 mt-4 flex items-start gap-2">
                      <span className="text-lg">⚠️</span>
                      360° fotoğrafların sizin tarafınızdan çekilip yüklenmesi gerekmektedir.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Property Type Selection */}
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="font-heading text-lg">Gayrimenkul Tipi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {PROPERTY_TYPES.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setFormData(p => ({ ...p, property_type: type.value }))}
                      className={`p-6 rounded-lg border-2 transition-all ${
                        formData.property_type === type.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                      data-testid={`property-type-${type.value}`}
                    >
                      <Layers className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <p className="font-medium">{type.label}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button onClick={() => setStep(2)} className="w-full rounded-full h-12" data-testid="next-to-info">
              Devam Et
            </Button>
          </div>
        )}

        {/* Step 2: Basic Info */}
        {step === 2 && (
          <div className="space-y-6">
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading text-lg">
                  <Home className="w-5 h-5 text-primary" />
                  Temel Bilgiler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">İlan Başlığı *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Örn: Deniz Manzaralı 3+1 Daire"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    data-testid="title-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Açıklama</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Gayrimenkul hakkında detaylı açıklama..."
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    data-testid="description-input"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Fiyat *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      placeholder="0"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      data-testid="price-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Para Birimi</Label>
                    <Select value={formData.currency} onValueChange={(v) => handleSelectChange('currency', v)}>
                      <SelectTrigger data-testid="currency-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TRY">TRY (₺)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading text-lg">
                  <MapPin className="w-5 h-5 text-primary" />
                  Konum Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Adres *</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Sokak, Mahalle"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    data-testid="address-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Şehir *</Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="İstanbul"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      data-testid="city-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">İlçe *</Label>
                    <Input
                      id="district"
                      name="district"
                      placeholder="Kadıköy"
                      value={formData.district}
                      onChange={handleChange}
                      required
                      data-testid="district-input"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading text-lg">
                  <Layers className="w-5 h-5 text-primary" />
                  Gayrimenkul Özellikleri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>m² *</Label>
                    <Input
                      name="square_meters"
                      type="number"
                      placeholder="120"
                      value={formData.square_meters}
                      onChange={handleChange}
                      required
                      data-testid="sqm-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Oda Sayısı *</Label>
                    <Input
                      name="room_count"
                      placeholder="3+1"
                      value={formData.room_count}
                      onChange={handleChange}
                      required
                      data-testid="rooms-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bulunduğu Kat</Label>
                    <Input
                      name="floor"
                      type="number"
                      placeholder="5"
                      value={formData.floor}
                      onChange={handleChange}
                      data-testid="floor-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Toplam Kat</Label>
                    <Input
                      name="total_floors"
                      type="number"
                      placeholder="10"
                      value={formData.total_floors}
                      onChange={handleChange}
                      data-testid="total-floors-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Bina Yaşı</Label>
                    <Input
                      name="building_age"
                      type="number"
                      placeholder="5"
                      value={formData.building_age}
                      onChange={handleChange}
                      data-testid="age-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Isıtma</Label>
                    <Select value={formData.heating_type} onValueChange={(v) => handleSelectChange('heating_type', v)}>
                      <SelectTrigger data-testid="heating-select">
                        <SelectValue placeholder="Seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {HEATING_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Cephe</Label>
                    <Select value={formData.facing_direction} onValueChange={(v) => handleSelectChange('facing_direction', v)}>
                      <SelectTrigger data-testid="facing-select">
                        <SelectValue placeholder="Seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {FACING_DIRECTIONS.map(dir => (
                          <SelectItem key={dir.value} value={dir.value}>{dir.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cover Image */}
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading text-lg">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  Kapak Görseli
                </CardTitle>
              </CardHeader>
              <CardContent>
                <input type="file" ref={coverInputRef} accept="image/*" onChange={handleCoverUpload} className="hidden" />
                {formData.cover_image ? (
                  <div className="relative rounded-lg overflow-hidden">
                    <img src={formData.cover_image} alt="Cover" className="w-full h-48 object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 w-8 h-8 rounded-full"
                      onClick={() => setFormData(p => ({ ...p, cover_image: null }))}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors"
                    data-testid="upload-cover-btn"
                  >
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Kapak görseli yükle</span>
                  </button>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-full h-12">
                Geri
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1 rounded-full h-12" data-testid="next-to-rooms">
                Devam Et
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Room Mapping */}
        {step === 3 && (
          <div className="space-y-6">
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading text-lg">
                  <Grid3X3 className="w-5 h-5 text-primary" />
                  Kroki Oluştur
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Floor selector for duplex/triplex */}
                {maxFloors > 1 && (
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentFloor(Math.max(0, currentFloor - 1))}
                      disabled={currentFloor === 0}
                    >
                      <ChevronDown className="w-4 h-4 mr-1" />
                      Alt Kat
                    </Button>
                    <span className="font-medium px-4 py-2 bg-muted rounded-full">
                      {currentFloor === 0 ? 'Zemin Kat' : `${currentFloor}. Kat`}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentFloor(Math.min(maxFloors - 1, currentFloor + 1))}
                      disabled={currentFloor === maxFloors - 1}
                    >
                      Üst Kat
                      <ChevronUp className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}

                <div className="bg-muted/50 rounded-lg p-6 min-h-[300px]">
                  {renderGrid()}
                </div>

                <p className="text-sm text-muted-foreground text-center mt-4">
                  {formData.rooms.length === 0 
                    ? 'Giriş noktası ekleyerek başlayın. Odalar eklendikçe çevresine yeni alanlar ekleyebilirsiniz.'
                    : `${formData.rooms.filter(r => r.floor === currentFloor).length} oda eklendi. + butonlarına tıklayarak yeni odalar ekleyin.`
                  }
                </p>
              </CardContent>
            </Card>

            {/* Room List */}
            {formData.rooms.length > 0 && (
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="font-heading text-lg">Eklenen Odalar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {formData.rooms.map(room => (
                      <div key={room.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{ROOM_TYPES.find(t => t.value === room.room_type)?.icon}</span>
                          <div>
                            <p className="font-medium">{room.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {maxFloors > 1 && `Kat ${room.floor} • `}
                              {room.photos?.length || 0} fotoğraf
                              {room.panorama_photo && ' • 360°'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => editRoom(room)}>
                            Düzenle
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteRoom(room.id)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1 rounded-full h-12">
                Geri
              </Button>
              <Button onClick={() => setStep(4)} className="flex-1 rounded-full h-12" data-testid="next-to-pois">
                Devam Et
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: POIs */}
        {step === 4 && (
          <div className="space-y-6">
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading text-lg">
                  <MapPin className="w-5 h-5 text-primary" />
                  Yakın Çevre
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {formData.pois.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.pois.map((poi, index) => {
                      const poiType = POI_TYPES.find(t => t.value === poi.type);
                      return (
                        <div key={index} className="flex items-center gap-2 px-3 py-2 bg-muted rounded-full text-sm">
                          <span>{poiType?.icon}</span>
                          <span className="font-medium">{poi.name}</span>
                          <span className="text-muted-foreground">({poi.distance})</span>
                          <button onClick={() => removePoi(index)} className="ml-1 text-muted-foreground hover:text-destructive">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="space-y-2">
                    <Label>Tür</Label>
                    <Select value={newPoi.type} onValueChange={(v) => setNewPoi(p => ({ ...p, type: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {POI_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>İsim</Label>
                    <Input
                      placeholder="Örn: Atatürk İlkokulu"
                      value={newPoi.name}
                      onChange={(e) => setNewPoi(p => ({ ...p, name: e.target.value }))}
                      data-testid="poi-name-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mesafe</Label>
                    <Input
                      placeholder="Örn: 500m"
                      value={newPoi.distance}
                      onChange={(e) => setNewPoi(p => ({ ...p, distance: e.target.value }))}
                      data-testid="poi-distance-input"
                    />
                  </div>
                  <Button type="button" variant="secondary" onClick={addPoi} data-testid="add-poi-btn">
                    <Plus className="w-4 h-4 mr-2" />
                    Ekle
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1 rounded-full h-12">
                Geri
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-12"
                data-testid="submit-btn"
              >
                {loading ? 'Kaydediliyor...' : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditing ? 'Güncelle' : 'Kaydet'}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Room Dialog */}
      <Dialog open={showRoomDialog} onOpenChange={setShowRoomDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {selectedRoom ? 'Oda Düzenle' : 'Yeni Oda Ekle'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Oda Adı *</Label>
                <Input
                  placeholder="Örn: Salon"
                  value={roomForm.name}
                  onChange={(e) => setRoomForm(p => ({ ...p, name: e.target.value }))}
                  data-testid="room-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Oda Tipi</Label>
                <Select value={roomForm.room_type} onValueChange={(v) => setRoomForm(p => ({ ...p, room_type: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOM_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>m² (Opsiyonel)</Label>
                <Input
                  type="number"
                  placeholder="25"
                  value={roomForm.square_meters}
                  onChange={(e) => setRoomForm(p => ({ ...p, square_meters: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Bakı (Opsiyonel)</Label>
                <Select value={roomForm.facing_direction} onValueChange={(v) => setRoomForm(p => ({ ...p, facing_direction: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {FACING_DIRECTIONS.map(dir => (
                      <SelectItem key={dir.value} value={dir.value}>{dir.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Photos */}
            <div className="space-y-2">
              <Label>Fotoğraflar</Label>
              <div className="grid grid-cols-4 gap-2">
                {roomForm.photos.map((photo, i) => (
                  <div key={i} className="relative aspect-square rounded overflow-hidden">
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setRoomForm(p => ({ ...p, photos: p.photos.filter((_, idx) => idx !== i) }))}
                      className="absolute top-1 right-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="aspect-square border-2 border-dashed border-border rounded flex items-center justify-center cursor-pointer hover:border-primary/50">
                  <Plus className="w-6 h-6 text-muted-foreground" />
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleRoomPhotoUpload(e, false)} />
                </label>
              </div>
            </div>

            {/* 360 Photo */}
            {formData.view_type === '360' && (
              <div className="space-y-2">
                <Label>360° Panoramik Fotoğraf</Label>
                {roomForm.panorama_photo ? (
                  <div className="relative rounded overflow-hidden">
                    <img src={roomForm.panorama_photo} alt="360" className="w-full h-32 object-cover" />
                    <button
                      onClick={() => setRoomForm(p => ({ ...p, panorama_photo: null }))}
                      className="absolute top-2 right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-gold text-white text-xs rounded">360°</div>
                  </div>
                ) : (
                  <label className="block w-full h-24 border-2 border-dashed border-gold/50 rounded flex flex-col items-center justify-center cursor-pointer hover:border-gold">
                    <span className="text-gold font-bold">360°</span>
                    <span className="text-xs text-muted-foreground">Panoramik fotoğraf yükle</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleRoomPhotoUpload(e, true)} />
                  </label>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoomDialog(false)}>İptal</Button>
            <Button onClick={saveRoom} data-testid="save-room-btn">
              {selectedRoom ? 'Güncelle' : 'Ekle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
