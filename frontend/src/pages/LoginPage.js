import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { LogoIcon } from '../components/Logo';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Başarıyla giriş yapıldı');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.detail || 'Giriş başarısız';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          <div>
            <Link to="/" className="flex items-center gap-3 mb-12" data-testid="login-logo">
              <LogoIcon className="w-10 h-10" />
              <span className="font-heading text-xl font-semibold text-primary">mekan360</span>
            </Link>
            
            <h1 className="font-heading text-3xl md:text-4xl font-semibold text-primary mb-3">
              Tekrar Hoş Geldiniz
            </h1>
            <p className="text-muted-foreground">
              Hesabınıza giriş yapın ve gayrimenkullerinizi yönetmeye başlayın.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                E-posta Adresi
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 border-border focus:border-primary"
                  required
                  data-testid="login-email-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Şifre
                </Label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline" data-testid="forgot-password-link">
                  Şifremi Unuttum
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 h-12 border-border focus:border-primary"
                  required
                  data-testid="login-password-input"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-full text-sm font-medium tracking-wide"
              data-testid="login-submit-btn"
            >
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <p className="text-center text-muted-foreground">
            Hesabınız yok mu?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline" data-testid="register-link">
              Kayıt Ol
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div 
        className="hidden lg:block bg-cover bg-center relative"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1758193431355-54df41421657?crop=entropy&cs=srgb&fm=jpg&q=85')` }}
      >
        <div className="absolute inset-0 bg-primary/60" />
        <div className="absolute bottom-16 left-16 right-16 z-10">
          <blockquote className="font-serif italic text-2xl text-white/90 mb-4">
            "mekan360 ile satışlarımız %40 arttı. Müşteriler evleri satın almadan önce 360° turla gezebiliyor."
          </blockquote>
          <p className="text-white/70">— Mehmet Yılmaz, ABC Emlak</p>
        </div>
      </div>
    </div>
  );
}
