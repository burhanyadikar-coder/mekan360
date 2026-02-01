import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Shield, Users, Home, CreditCard, TrendingUp, LogOut, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/stats`);
      setStats(response.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('adminToken');
        navigate('/mekanadmin/login');
      } else {
        toast.error('Veriler yüklenemedi');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/mekanadmin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center">
        <div className="animate-pulse text-white font-heading text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-950">
      {/* Header */}
      <header className="bg-emerald-900/50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-gold" />
              <span className="font-heading text-base sm:text-xl font-semibold text-white">Admin Panel</span>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-4">
              <Link to="/mekanadmin/users">
                <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 px-2 sm:px-4" data-testid="users-nav">
                  <Users className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Kullanıcılar</span>
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="text-white/70 hover:text-white hover:bg-white/10 px-2 sm:px-4"
                data-testid="admin-logout-btn"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Çıkış</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8">
        <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-semibold text-white mb-6 sm:mb-8">
          Dashboard
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/50 font-semibold">Toplam Kullanıcı</p>
                  <p className="font-heading text-3xl font-semibold text-white mt-2">{stats?.total_users || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-gold" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/50 font-semibold">Aktif Abonelik</p>
                  <p className="font-heading text-3xl font-semibold text-white mt-2">{stats?.active_users || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/50 font-semibold">Toplam Gayrimenkul</p>
                  <p className="font-heading text-3xl font-semibold text-white mt-2">{stats?.total_properties || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Home className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/50 font-semibold">Toplam Gelir</p>
                  <p className="font-heading text-3xl font-semibold text-gold mt-2">₺{stats?.total_revenue?.toLocaleString() || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-gold" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Package Distribution */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gold" />
              Paket Dağılımı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white/5 rounded-lg">
                <p className="text-white/50 text-sm mb-2">Başlangıç</p>
                <p className="font-heading text-4xl font-bold text-white">{stats?.package_distribution?.starter || 0}</p>
                <p className="text-gold text-sm mt-1">₺700/ay</p>
              </div>
              <div className="text-center p-6 bg-gold/10 rounded-lg border border-gold/20">
                <p className="text-white/50 text-sm mb-2">Premium</p>
                <p className="font-heading text-4xl font-bold text-gold">{stats?.package_distribution?.premium || 0}</p>
                <p className="text-gold text-sm mt-1">₺1.000/ay</p>
              </div>
              <div className="text-center p-6 bg-white/5 rounded-lg">
                <p className="text-white/50 text-sm mb-2">Ultra</p>
                <p className="font-heading text-4xl font-bold text-white">{stats?.package_distribution?.ultra || 0}</p>
                <p className="text-gold text-sm mt-1">₺2.000/ay</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
