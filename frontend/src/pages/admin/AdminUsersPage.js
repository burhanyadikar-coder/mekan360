import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Shield, Users, Search, ArrowLeft, Eye, ChevronRight, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PACKAGE_NAMES = {
  starter: 'Başlangıç',
  premium: 'Premium',
  ultra: 'Ultra'
};

const STATUS_COLORS = {
  active: 'bg-green-500/20 text-green-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  expired: 'bg-red-500/20 text-red-400'
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/users`);
      setUsers(response.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('adminToken');
        navigate('/mekanadmin/login');
      } else {
        toast.error('Kullanıcılar yüklenemedi');
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

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    user.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(search.toLowerCase())
  );

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
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/mekanadmin">
                <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-gold" />
                <span className="font-heading text-xl font-semibold text-white">Kullanıcılar</span>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {/* Search */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input
              placeholder="Kullanıcı ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40"
              data-testid="user-search-input"
            />
          </div>
          <Badge className="bg-white/10 text-white/70 border-0">
            {filteredUsers.length} kullanıcı
          </Badge>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsers.map(user => (
            <Card key={user.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                      <Users className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">
                        {user.first_name} {user.last_name}
                      </h3>
                      <p className="text-white/50 text-sm">{user.email}</p>
                      <p className="text-white/30 text-xs">{user.company_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge className={`${STATUS_COLORS[user.subscription_status] || STATUS_COLORS.pending} border-0`}>
                        {user.subscription_status === 'active' ? 'Aktif' : 
                         user.subscription_status === 'pending' ? 'Beklemede' : 'Süresi Dolmuş'}
                      </Badge>
                      <p className="text-white/50 text-xs mt-1">
                        {PACKAGE_NAMES[user.package] || user.package}
                      </p>
                    </div>
                    
                    <Link to={`/mekanadmin/users/${user.id}`}>
                      <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10" data-testid={`view-user-${user.id}`}>
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/50">Kullanıcı bulunamadı</p>
          </div>
        )}
      </main>
    </div>
  );
}
