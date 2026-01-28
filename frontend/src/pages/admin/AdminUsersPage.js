import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Shield, Users, Search, ArrowLeft, ChevronRight, LogOut, Plus, Calendar, Building2, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PACKAGES = {
  starter: { name: 'Başlangıç', price: 700 },
  premium: { name: 'Premium', price: 1000 },
  ultra: { name: 'Ultra', price: 2000 }
};

const STATUS_COLORS = {
  active: 'bg-green-500/20 text-green-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  expired: 'bg-red-500/20 text-red-400'
};

const STATUS_NAMES = {
  active: 'Aktif',
  pending: 'Beklemede',
  expired: 'Süresi Dolmuş'
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    company_name: '',
    phone: '',
    package: 'starter',
    subscription_status: 'active',
    subscription_days: 30
  });
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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.email || !newUser.password || !newUser.first_name || !newUser.last_name || !newUser.company_name) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    setCreating(true);
    try {
      await axios.post(`${API_URL}/admin/users`, newUser);
      toast.success('Kullanıcı başarıyla eklendi');
      setAddDialogOpen(false);
      setNewUser({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        company_name: '',
        phone: '',
        package: 'starter',
        subscription_status: 'active',
        subscription_days: 30
      });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Kullanıcı eklenemedi');
    } finally {
      setCreating(false);
    }
  };

  const getRemainingDays = (endDate) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
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
        {/* Search and Add */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input
              placeholder="Kullanıcı ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
          </div>
          <Badge className="bg-white/10 text-white/70 border-0">
            {filteredUsers.length} kullanıcı
          </Badge>
          
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gold text-white hover:bg-gold/90">
                <Plus className="w-4 h-4 mr-2" />
                Kullanıcı Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">Ad *</Label>
                    <Input
                      id="first_name"
                      value={newUser.first_name}
                      onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
                      placeholder="Ad"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Soyad *</Label>
                    <Input
                      id="last_name"
                      value={newUser.last_name}
                      onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
                      placeholder="Soyad"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="company_name">Şirket Adı *</Label>
                  <Input
                    id="company_name"
                    value={newUser.company_name}
                    onChange={(e) => setNewUser({...newUser, company_name: e.target.value})}
                    placeholder="Şirket veya ofis adı"
                  />
                </div>

                <div>
                  <Label htmlFor="email">E-posta *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="ornek@email.com"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Şifre *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Şifre"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    placeholder="05XX XXX XX XX"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Paket *</Label>
                    <Select value={newUser.package} onValueChange={(v) => setNewUser({...newUser, package: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="starter">Başlangıç (₺700/ay)</SelectItem>
                        <SelectItem value="premium">Premium (₺1.000/ay)</SelectItem>
                        <SelectItem value="ultra">Ultra (₺2.000/ay)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Durum *</Label>
                    <Select value={newUser.subscription_status} onValueChange={(v) => setNewUser({...newUser, subscription_status: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="pending">Beklemede</SelectItem>
                        <SelectItem value="expired">Süresi Dolmuş</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="subscription_days">Abonelik Süresi (gün)</Label>
                  <Input
                    id="subscription_days"
                    type="number"
                    min="1"
                    value={newUser.subscription_days}
                    onChange={(e) => setNewUser({...newUser, subscription_days: parseInt(e.target.value) || 30})}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                    İptal
                  </Button>
                  <Button type="submit" disabled={creating} className="bg-gold hover:bg-gold/90">
                    {creating ? 'Ekleniyor...' : 'Kullanıcı Ekle'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsers.map(user => {
            const remainingDays = getRemainingDays(user.subscription_end);
            return (
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
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-white/50 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </span>
                          {user.phone && (
                            <span className="text-white/50 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {user.phone}
                            </span>
                          )}
                        </div>
                        <p className="text-white/30 text-xs flex items-center gap-1 mt-1">
                          <Building2 className="w-3 h-3" />
                          {user.company_name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      {/* Package Info */}
                      <div className="text-center">
                        <p className="text-white/40 text-xs uppercase tracking-wider">Paket</p>
                        <p className="text-gold font-medium">{PACKAGES[user.package]?.name || user.package}</p>
                        <p className="text-white/40 text-xs">₺{PACKAGES[user.package]?.price}/ay</p>
                      </div>

                      {/* Status */}
                      <div className="text-center">
                        <p className="text-white/40 text-xs uppercase tracking-wider">Durum</p>
                        <Badge className={`${STATUS_COLORS[user.subscription_status] || STATUS_COLORS.pending} border-0 mt-1`}>
                          {STATUS_NAMES[user.subscription_status] || user.subscription_status}
                        </Badge>
                      </div>

                      {/* Remaining Days */}
                      <div className="text-center min-w-[80px]">
                        <p className="text-white/40 text-xs uppercase tracking-wider">Kalan Süre</p>
                        {remainingDays !== null ? (
                          <p className={`font-medium mt-1 ${remainingDays <= 7 ? 'text-red-400' : remainingDays <= 15 ? 'text-yellow-400' : 'text-green-400'}`}>
                            {remainingDays > 0 ? `${remainingDays} gün` : 'Süresi doldu'}
                          </p>
                        ) : (
                          <p className="text-white/30 mt-1">-</p>
                        )}
                      </div>

                      {/* Properties Count */}
                      <div className="text-center">
                        <p className="text-white/40 text-xs uppercase tracking-wider">Daire</p>
                        <p className="text-white font-medium mt-1">{user.property_count || 0}</p>
                      </div>
                      
                      <Link to={`/mekanadmin/users/${user.id}`}>
                        <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10">
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
