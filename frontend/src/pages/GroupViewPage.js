import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Building2, MapPin, Home, Eye, Phone, Ruler, Layers } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function GroupViewPage() {
  const { id } = useParams();
  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGroup();
  }, [id]);

  const fetchGroup = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/public/groups/${id}`);
      
      if (!res.ok) {
        setError('Grup bulunamadı');
        return;
      }
      
      const data = await res.json();
      setGroupData(data);
    } catch (error) {
      console.error('Error fetching group:', error);
      setError('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency || 'TRY',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 to-emerald-900">
        <div className="animate-pulse text-white font-heading text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 to-emerald-900">
        <div className="text-center text-white">
          <Building2 className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-semibold mb-2">{error}</h1>
          <p className="text-white/60">Bu paylaşım linki geçerli değil veya kaldırılmış olabilir.</p>
        </div>
      </div>
    );
  }

  const { group, properties } = groupData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 to-emerald-900">
      {/* Header */}
      <header className="p-6 text-center border-b border-white/10">
        <p className="text-white/60 text-sm mb-2">{group.company_name}</p>
        <h1 className="font-heading text-3xl font-semibold text-white mb-2">{group.name}</h1>
        {group.description && (
          <p className="text-white/70 max-w-xl mx-auto">{group.description}</p>
        )}
        <Badge className="mt-4 bg-amber-500/20 text-amber-400 border-0">
          {properties.length} Daire
        </Badge>
      </header>

      {/* Properties Grid */}
      <div className="p-6">
        {properties.length === 0 ? (
          <div className="text-center py-16">
            <Home className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-white/70 text-lg">Bu grupta henüz daire yok</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="bg-white/10 border-white/20 overflow-hidden group hover:bg-white/15 transition-all">
                {/* Cover Image */}
                <div className="relative h-48 bg-white/5">
                  {property.cover_image ? (
                    <img 
                      src={property.cover_image} 
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : property.rooms?.[0]?.photos?.[0] ? (
                    <img 
                      src={property.rooms[0].photos[0]} 
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-12 h-12 text-white/20" />
                    </div>
                  )}
                  
                  {/* Price Badge */}
                  <div className="absolute bottom-3 right-3">
                    <div className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {formatPrice(property.price, property.currency)}
                    </div>
                  </div>
                  
                  {property.view_type === '360' && (
                    <Badge className="absolute top-3 left-3 bg-blue-500 text-white border-0">
                      360° Tur
                    </Badge>
                  )}
                </div>

                <CardContent className="p-5">
                  <h3 className="font-heading text-lg font-semibold text-white mb-2 line-clamp-1">
                    {property.title}
                  </h3>
                  
                  <p className="text-white/60 text-sm flex items-center gap-1 mb-4">
                    <MapPin className="w-4 h-4" />
                    {property.district}, {property.city}
                  </p>

                  {/* Quick Stats */}
                  <div className="flex items-center gap-4 text-sm text-white/50 mb-4">
                    <span className="flex items-center gap-1">
                      <Ruler className="w-4 h-4" />
                      {property.square_meters} m²
                    </span>
                    <span>{property.room_count}</span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-4 h-4" />
                      Kat {property.floor}
                    </span>
                  </div>

                  <Link to={`/view/${property.id}`}>
                    <Button className="w-full rounded-full bg-amber-500 hover:bg-amber-600 text-white">
                      <Eye className="w-4 h-4 mr-2" />
                      Daireyi Görüntüle
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Contact Footer */}
      <footer className="p-6 border-t border-white/10 mt-8">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-white/60 mb-4">Bu daireler hakkında bilgi almak için</p>
          <a href="tel:05514780259">
            <Button size="lg" className="rounded-full bg-green-600 hover:bg-green-700 text-white">
              <Phone className="w-5 h-5 mr-2" />
              0551 478 02 59
            </Button>
          </a>
          <p className="text-white/40 text-sm mt-4">{group.company_name}</p>
        </div>
      </footer>
    </div>
  );
}
