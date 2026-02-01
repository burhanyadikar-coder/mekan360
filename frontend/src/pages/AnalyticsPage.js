import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Building2,
  ArrowLeft,
  Eye,
  Clock,
  TrendingUp,
  BarChart3,
  Home,
  Calendar
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [propertyVisits, setPropertyVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    fetchProperties();
  }, []);

  useEffect(() => {
    if (selectedProperty !== 'all') {
      fetchPropertyVisits(selectedProperty);
    } else {
      setPropertyVisits([]);
    }
  }, [selectedProperty]);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API_URL}/analytics`);
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Analitik veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await axios.get(`${API_URL}/properties`);
      setProperties(response.data);
    } catch (error) {
      console.error('Properties fetch error:', error);
    }
  };

  const fetchPropertyVisits = async (propertyId) => {
    try {
      const response = await axios.get(`${API_URL}/properties/${propertyId}/visits`);
      setPropertyVisits(response.data);
    } catch (error) {
      console.error('Visits fetch error:', error);
    }
  };

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}dk ${remainingSeconds}s`;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary font-heading text-xl">Yükleniyor...</div>
      </div>
    );
  }

  // Prepare chart data
  const dailyViewsData = analytics?.daily_views?.map(item => ({
    date: formatDate(item.date),
    views: item.views
  })) || [];

  const topPropertiesData = analytics?.top_properties?.map(item => ({
    name: item.title.length > 20 ? item.title.substring(0, 20) + '...' : item.title,
    views: item.views,
    avgDuration: Math.round(item.avg_duration)
  })) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary w-8 h-8 sm:w-10 sm:h-10" data-testid="back-btn">
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Link>
              <Link to="/dashboard" className="flex items-center gap-2 sm:gap-3" data-testid="analytics-logo">
                <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                <span className="font-heading text-base sm:text-lg font-semibold text-primary">mekan360</span>
              </Link>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="font-medium text-foreground text-sm sm:text-base">Raporlar</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8">
        {/* Page Title */}
        <div className="mb-6 sm:mb-8">
          <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-semibold text-primary">
            Analitik Raporlar
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Dairelerinizin performansını takip edin.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-border/40" data-testid="total-views-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Toplam Görüntüleme</p>
                  <p className="font-heading text-3xl font-semibold text-primary mt-2">{analytics?.total_views || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-gold" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40" data-testid="total-duration-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Toplam Süre</p>
                  <p className="font-heading text-3xl font-semibold text-primary mt-2">{formatDuration(analytics?.total_duration || 0)}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-emerald-900" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40" data-testid="avg-duration-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Ort. Görüntüleme</p>
                  <p className="font-heading text-3xl font-semibold text-primary mt-2">{formatDuration(analytics?.avg_duration || 0)}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40" data-testid="total-properties-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Toplam Daire</p>
                  <p className="font-heading text-3xl font-semibold text-primary mt-2">{properties.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Home className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Views Chart */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-lg">
                <Calendar className="w-5 h-5 text-primary" />
                Günlük Görüntülemeler (Son 30 Gün)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dailyViewsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyViewsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="views" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Henüz görüntüleme verisi yok
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Properties Chart */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-lg">
                <TrendingUp className="w-5 h-5 text-gold" />
                En Çok Görüntülenen Daireler
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topPropertiesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topPropertiesData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      type="number" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={11}
                      width={120}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(value, name) => [
                        name === 'views' ? `${value} görüntüleme` : `${value}s ortalama`,
                        name === 'views' ? 'Görüntüleme' : 'Ort. Süre'
                      ]}
                    />
                    <Bar 
                      dataKey="views" 
                      fill="hsl(var(--primary))" 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Henüz daire verisi yok
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Property-specific Analytics */}
        <Card className="border-border/40 mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center gap-2 font-heading text-lg">
                <Eye className="w-5 h-5 text-primary" />
                Daire Bazlı Ziyaretler
              </CardTitle>
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger className="w-full sm:w-[250px]" data-testid="property-select">
                  <SelectValue placeholder="Daire seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Daireler</SelectItem>
                  {properties.map(property => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {selectedProperty === 'all' ? (
              <div className="text-center py-12 text-muted-foreground">
                Detaylı ziyaret bilgilerini görmek için bir daire seçin.
              </div>
            ) : propertyVisits.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-5 gap-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold pb-2 border-b border-border">
                  <span>Ziyaretçi</span>
                  <span>Telefon</span>
                  <span>Tarih</span>
                  <span>Süre</span>
                  <span>Saat</span>
                </div>
                {propertyVisits.slice(0, 20).map((visit, index) => {
                  const visitDate = new Date(visit.visited_at);
                  return (
                    <div 
                      key={visit.id || index} 
                      className="grid grid-cols-5 gap-4 py-3 border-b border-border/50 last:border-0"
                      data-testid={`visit-row-${index}`}
                    >
                      <span className="text-foreground font-medium">
                        {visit.visitor_name || 'Bilinmeyen'}
                      </span>
                      <span className="text-muted-foreground">
                        {visit.visitor_phone || '-'}
                      </span>
                      <span className="text-foreground">
                        {visitDate.toLocaleDateString('tr-TR')}
                      </span>
                      <span className="text-foreground font-medium">
                        {formatDuration(visit.duration)}
                      </span>
                      <span className="text-muted-foreground">
                        {visitDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Bu daire için henüz ziyaret kaydı yok.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Visitors */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-lg">
              <Eye className="w-5 h-5 text-gold" />
              Son Ziyaretçiler
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.recent_visitors?.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-5 gap-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold pb-2 border-b border-border">
                  <span>Ad Soyad</span>
                  <span>Telefon</span>
                  <span>Daire</span>
                  <span>Ziyaret Sayısı</span>
                  <span>Son Ziyaret</span>
                </div>
                {analytics.recent_visitors.map((visitor, index) => {
                  const property = properties.find(p => p.id === visitor.property_id);
                  const lastVisit = new Date(visitor.last_visit);
                  return (
                    <div 
                      key={visitor.id} 
                      className="grid grid-cols-5 gap-4 py-3 border-b border-border/50 last:border-0"
                    >
                      <span className="text-foreground font-medium">
                        {visitor.first_name} {visitor.last_name}
                      </span>
                      <span className="text-muted-foreground">
                        {visitor.phone}
                      </span>
                      <span className="text-foreground truncate">
                        {property?.title || 'Bilinmeyen'}
                      </span>
                      <span className="text-foreground font-medium">
                        {visitor.visit_count}
                      </span>
                      <span className="text-muted-foreground">
                        {lastVisit.toLocaleDateString('tr-TR')} {lastVisit.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Henüz ziyaretçi kaydı yok.
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
