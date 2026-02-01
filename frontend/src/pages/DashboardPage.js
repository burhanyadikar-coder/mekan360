import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Plus,
  Eye,
  Clock,
  TrendingUp,
  BarChart3,
  Home,
  MapPin,
  MoreVertical,
  Pencil,
  Trash2,
  Share2,
  LogOut,
  User,
  Copy,
  Download,
  Users,
  Crown,
  FolderOpen
} from 'lucide-react';
import { LogoIcon } from '../components/Logo';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [propertiesRes, analyticsRes] = await Promise.all([
        axios.get(`${API_URL}/properties`),
        axios.get(`${API_URL}/analytics`)
      ]);
      setProperties(propertiesRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu gayrimenkulü silmek istediğinizden emin misiniz?')) return;

    try {
      await axios.delete(`${API_URL}/properties/${id}`);
      toast.success('Gayrimenkul başarıyla silindi');
      fetchData();
    } catch (error) {
      toast.error('Silme işlemi başarısız');
    }
  };

  const handleCopyLink = (shareLink) => {
    const fullUrl = `${window.location.origin}${shareLink}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success('Link kopyalandı');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}dk ${remainingSeconds}s`;
  };

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency || 'TRY',
      minimumFractionDigits: 0
    }).format(price);
  };

  const canAddProperty = user?.property_limit === -1 || user?.property_count < user?.property_limit;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary font-heading text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link to="/dashboard" className="flex items-center gap-2 sm:gap-3" data-testid="dashboard-logo">
              <LogoIcon className="w-7 h-7 sm:w-9 sm:h-9" />
              <span className="font-heading text-base sm:text-lg font-semibold text-primary">mekan360</span>
            </Link>

            <div className="flex items-center gap-1 sm:gap-4">
              <Link to="/groups">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary px-2 sm:px-4" data-testid="groups-nav-btn">
                  <FolderOpen className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Gruplar</span>
                </Button>
              </Link>
              <Link to="/analytics">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary px-2 sm:px-4" data-testid="analytics-nav-btn">
                  <BarChart3 className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Raporlar</span>
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1 sm:gap-2 px-1 sm:px-3" data-testid="user-menu-btn">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground hidden sm:block">{user?.company_name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-2">
                    <p className="text-sm font-medium">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-muted-foreground">
                    <Crown className="w-4 h-4 mr-2 text-gold" />
                    {user?.package_name}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive" data-testid="logout-btn">
                    <LogOut className="w-4 h-4 mr-2" />
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-semibold text-primary">
              Hoş Geldiniz, {user?.first_name}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">Gayrimenkullerinizi yönetin ve performansı takip edin.</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Badge variant="outline" className="text-gold border-gold/30 text-xs sm:text-sm">
              <Crown className="w-3 h-3 mr-1" />
              {user?.package_name}
            </Badge>
            {canAddProperty ? (
              <Link to="/property/new">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full text-xs sm:text-sm" data-testid="add-property-btn">
                  <Plus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Yeni Gayrimenkul</span>
                </Button>
              </Link>
            ) : (
              <Button disabled size="sm" className="rounded-full text-xs sm:text-sm" title="Paket limitinize ulaştınız">
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Limit Dolu</span>
              </Button>
            )}
          </div>
        </div>

        {/* Package Info */}
        <Card className="border-border/40 bg-primary/5 mb-8">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="text-muted-foreground">Gayrimenkul: </span>
                  <span className="font-semibold text-foreground">
                    {user?.property_count} / {user?.property_limit === -1 ? '∞' : user?.property_limit}
                  </span>
                </div>
                {user?.has_360 && (
                  <Badge className="bg-gold/20 text-gold border-0">360° Aktif</Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Abonelik: <span className="text-green-600 font-medium">Aktif</span>
                {user?.subscription_end && (
                  <span> • Bitiş: {new Date(user.subscription_end).toLocaleDateString('tr-TR')}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-border/40" data-testid="stat-properties">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Gayrimenkul</p>
                  <p className="font-heading text-3xl font-semibold text-primary mt-2">{properties.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Home className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40" data-testid="stat-views">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Görüntüleme</p>
                  <p className="font-heading text-3xl font-semibold text-primary mt-2">{analytics?.total_views || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-gold" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40" data-testid="stat-visitors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Ziyaretçi</p>
                  <p className="font-heading text-3xl font-semibold text-primary mt-2">{analytics?.total_visitors || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-900" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40" data-testid="stat-duration">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Ort. Süre</p>
                  <p className="font-heading text-3xl font-semibold text-primary mt-2">{formatDuration(analytics?.avg_duration || 0)}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Visitors */}
        {analytics?.recent_visitors?.length > 0 && (
          <Card className="border-border/40 mb-8">
            <CardContent className="p-6">
              <h3 className="font-heading text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Son Ziyaretçiler
              </h3>
              <div className="space-y-3">
                {analytics.recent_visitors.slice(0, 5).map((visitor, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-foreground">{visitor.first_name} {visitor.last_name}</p>
                      <p className="text-sm text-muted-foreground">{visitor.phone}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-muted-foreground">{visitor.visit_count} ziyaret</p>
                      <p className="text-muted-foreground">{formatDuration(visitor.total_duration)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Properties Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-xl font-semibold text-primary">Gayrimenkulleriniz</h2>
            <span className="text-sm text-muted-foreground">{properties.length} gayrimenkul</span>
          </div>

          {properties.length === 0 ? (
            <Card className="border-border/40 border-dashed">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Home className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-heading text-lg font-medium text-foreground mb-2">Henüz gayrimenkul eklemediniz</h3>
                <p className="text-muted-foreground mb-6">İlk gayrimenkulünüzü ekleyerek başlayın.</p>
                <Link to="/property/new">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full" data-testid="empty-add-property-btn">
                    <Plus className="w-4 h-4 mr-2" />
                    Gayrimenkul Ekle
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Card 
                  key={property.id} 
                  className="property-card border-border/40 overflow-hidden group"
                  data-testid={`property-card-${property.id}`}
                >
                  <div className="relative h-48 bg-muted overflow-hidden">
                    {property.cover_image ? (
                      <img
                        src={property.cover_image}
                        alt={property.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : property.rooms?.[0]?.photos?.[0] ? (
                      <img
                        src={property.rooms[0].photos[0]}
                        alt={property.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    
                    <div className="absolute top-3 right-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            size="icon" 
                            variant="secondary" 
                            className="w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-sm"
                            data-testid={`property-menu-${property.id}`}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/property/edit/${property.id}`)} data-testid={`edit-property-${property.id}`}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyLink(property.share_link)} data-testid={`copy-link-${property.id}`}>
                            <Copy className="w-4 h-4 mr-2" />
                            Linki Kopyala
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(property.share_link, '_blank')} data-testid={`view-property-${property.id}`}>
                            <Share2 className="w-4 h-4 mr-2" />
                            Önizle
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(property.id)} 
                            className="text-destructive"
                            data-testid={`delete-property-${property.id}`}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="absolute bottom-3 left-3 flex gap-2">
                      {property.view_type === '360' && (
                        <span className="px-2 py-1 bg-primary/90 text-white text-xs font-medium rounded">
                          360°
                        </span>
                      )}
                      {property.property_type !== 'single' && (
                        <span className="px-2 py-1 bg-gold/90 text-white text-xs font-medium rounded capitalize">
                          {property.property_type}
                        </span>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-heading text-lg font-medium text-foreground line-clamp-1">
                        {property.title}
                      </h3>
                      <span className="font-heading text-lg font-semibold text-gold whitespace-nowrap">
                        {formatPrice(property.price, property.currency)}
                      </span>
                    </div>

                    <div className="flex items-center text-muted-foreground text-sm mb-4">
                      <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="line-clamp-1">{property.district}, {property.city}</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span>{property.square_meters} m²</span>
                      <span>{property.room_count}</span>
                      <span>Kat {property.floor}/{property.total_floors}</span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Eye className="w-4 h-4" />
                          {property.view_count}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {formatDuration(Math.round(property.total_view_duration / Math.max(property.view_count, 1)))}
                        </span>
                      </div>
                      <Link to={`/property/${property.id}`}>
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" data-testid={`view-detail-${property.id}`}>
                          Detay
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
