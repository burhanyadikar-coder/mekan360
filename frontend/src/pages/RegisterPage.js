import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Checkbox } from '../components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Building2, Mail, Lock, User, Phone, ArrowRight, Check, Building, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PACKAGE_FEATURES = {
  starter: [
    '10 gayrimenkul ekleme',
    'Düz fotoğraf koleksiyonu',
    'İnteraktif haritalama',
    'Şirket adı ekleme',
    'Güneş simülasyonu'
  ],
  premium: [
    '50 gayrimenkul ekleme',
    'Düz fotoğraf + 360° görüntüleme',
    '(360° fotoğraflar kullanıcı tarafından eklenmelidir)',
    'İnteraktif haritalama',
    'Çevre bilgisi ekleme',
    'm² ve gayrimenkul özellikleri',
    'Şirket adı ekleme',
    'Güneş simülasyonu'
  ],
  ultra: [
    'Sınırsız gayrimenkul ekleme',
    'Tüm Premium özellikler dahil',
    'Öncelikli destek'
  ]
};

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [packages, setPackages] = useState({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    company_name: '',
    phone: '',
    package: 'premium',
    auto_payment: false
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await axios.get(`${API_URL}/packages`);
      setPackages(response.data);
    } catch (error) {
      console.error('Packages fetch error:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePackageSelect = (value) => {
    setFormData(prev => ({ ...prev, package: value }));
  };

  const validateStep1 = () => {
    if (!formData.first_name || !formData.last_name) {
      toast.error('Lütfen isim ve soyisim girin');
      return false;
    }
    if (!formData.company_name) {
      toast.error('Lütfen şirket adı girin');
      return false;
    }
    if (!formData.email) {
      toast.error('Lütfen e-posta girin');
      return false;
    }
    if (!formData.phone) {
      toast.error('Lütfen telefon numarası girin');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalı');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Şifreler eşleşmiyor');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        company_name: formData.company_name,
        phone: formData.phone,
        package: formData.package,
        auto_payment: formData.auto_payment
      });
      
      // Navigate to payment page with registration data
      navigate('/payment', { 
        state: { 
          userId: result.user_id,
          email: result.email,
          package: result.package,
          packageName: result.package_name,
          amount: result.amount
        } 
      });
    } catch (error) {
      const message = error.response?.data?.detail || 'Kayıt başarısız';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6" data-testid="register-logo">
            <Building2 className="w-10 h-10 text-primary" />
            <span className="font-heading text-2xl font-semibold text-primary">HomeView Pro</span>
          </Link>
          
          <h1 className="font-heading text-3xl md:text-4xl font-semibold text-primary mb-2">
            Hesap Oluşturun
          </h1>
          <p className="text-muted-foreground">
            {step === 1 ? 'Bilgilerinizi girin' : 'Paketinizi seçin'}
          </p>
          
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 1 ? 'bg-primary text-white' : 'bg-muted'}`}>1</div>
              <span className="hidden sm:inline">Bilgiler</span>
            </div>
            <div className="w-12 h-px bg-border" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? 'bg-primary text-white' : 'bg-muted'}`}>2</div>
              <span className="hidden sm:inline">Paket</span>
            </div>
            <div className="w-12 h-px bg-border" />
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-muted">3</div>
              <span className="hidden sm:inline">Ödeme</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} data-testid="register-form">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <User className="w-5 h-5 text-primary" />
                  Kişisel Bilgiler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">İsim *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="first_name"
                        name="first_name"
                        placeholder="İsminiz"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="pl-11 h-12"
                        required
                        data-testid="first-name-input"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Soyisim *</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      placeholder="Soyisminiz"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="h-12"
                      required
                      data-testid="last-name-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_name">Şirket / Firma Adı *</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="company_name"
                      name="company_name"
                      placeholder="Şirket adınız"
                      value={formData.company_name}
                      onChange={handleChange}
                      className="pl-11 h-12"
                      required
                      data-testid="company-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="ornek@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-11 h-12"
                        required
                        data-testid="email-input"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="05XX XXX XX XX"
                        value={formData.phone}
                        onChange={handleChange}
                        className="pl-11 h-12"
                        required
                        data-testid="phone-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Şifre *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="En az 6 karakter"
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-11 h-12"
                        required
                        data-testid="password-input"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Şifre Tekrar *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Şifreyi tekrar girin"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="pl-11 h-12"
                        required
                        data-testid="confirm-password-input"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-full"
                  data-testid="next-step-btn"
                >
                  Devam Et
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Package Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <RadioGroup
                value={formData.package}
                onValueChange={handlePackageSelect}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {/* Starter Package */}
                <Card className={`border-2 cursor-pointer transition-all ${formData.package === 'starter' ? 'border-primary shadow-lg' : 'border-border/40 hover:border-primary/50'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-heading text-xl font-semibold text-foreground">Başlangıç</h3>
                        <p className="text-muted-foreground text-sm">Yeni başlayanlar için</p>
                      </div>
                      <RadioGroupItem value="starter" id="starter" data-testid="package-starter" />
                    </div>
                    <div className="mb-6">
                      <span className="font-heading text-4xl font-bold text-primary">₺700</span>
                      <span className="text-muted-foreground">/ay</span>
                    </div>
                    <ul className="space-y-3">
                      {PACKAGE_FEATURES.starter.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Premium Package */}
                <Card className={`border-2 cursor-pointer transition-all relative ${formData.package === 'premium' ? 'border-gold shadow-lg' : 'border-border/40 hover:border-gold/50'}`}>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gold text-white text-xs font-medium rounded-full">
                    En Popüler
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-heading text-xl font-semibold text-foreground">Premium</h3>
                        <p className="text-muted-foreground text-sm">Profesyoneller için</p>
                      </div>
                      <RadioGroupItem value="premium" id="premium" data-testid="package-premium" />
                    </div>
                    <div className="mb-6">
                      <span className="font-heading text-4xl font-bold text-gold">₺1.000</span>
                      <span className="text-muted-foreground">/ay</span>
                    </div>
                    <ul className="space-y-3">
                      {PACKAGE_FEATURES.premium.map((feature, i) => (
                        <li key={i} className={`flex items-start gap-2 text-sm ${feature.startsWith('(') ? 'text-muted-foreground italic' : ''}`}>
                          {!feature.startsWith('(') && <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />}
                          {feature.startsWith('(') && <span className="w-4" />}
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Ultra Package */}
                <Card className={`border-2 cursor-pointer transition-all ${formData.package === 'ultra' ? 'border-primary shadow-lg' : 'border-border/40 hover:border-primary/50'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-heading text-xl font-semibold text-foreground">Ultra</h3>
                        <p className="text-muted-foreground text-sm">Kurumsal firmalar için</p>
                      </div>
                      <RadioGroupItem value="ultra" id="ultra" data-testid="package-ultra" />
                    </div>
                    <div className="mb-6">
                      <span className="font-heading text-4xl font-bold text-primary">₺2.000</span>
                      <span className="text-muted-foreground">/ay</span>
                    </div>
                    <ul className="space-y-3">
                      {PACKAGE_FEATURES.ultra.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </RadioGroup>

              {/* Auto Payment Option */}
              <Card className="border-border/40">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      id="auto_payment"
                      checked={formData.auto_payment}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_payment: checked }))}
                      data-testid="auto-payment-checkbox"
                    />
                    <div>
                      <Label htmlFor="auto_payment" className="font-medium cursor-pointer">
                        Otomatik ödeme aktif olsun
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Her ay otomatik olarak kartınızdan çekilsin. İstediğiniz zaman iptal edebilirsiniz.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 h-12 rounded-full"
                  data-testid="back-btn"
                >
                  Geri
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-full"
                  data-testid="continue-to-payment-btn"
                >
                  {loading ? 'İşleniyor...' : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Ödemeye Geç
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>

        <p className="text-center text-muted-foreground mt-8">
          Zaten hesabınız var mı?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline" data-testid="login-link">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
}
