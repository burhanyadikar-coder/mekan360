import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Building2, CreditCard, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { completePayment } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const { userId, email, package: packageType, packageName, amount } = location.state || {};

  useEffect(() => {
    if (!userId) {
      navigate('/register');
    }
  }, [userId, navigate]);

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // MOCK: Simulate iyzico payment process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Complete payment and get token
      await completePayment(userId, amount, packageType);
      
      setPaymentComplete(true);
      toast.success('Ödeme başarılı! Yönlendiriliyorsunuz...');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ödeme işlemi başarısız');
    } finally {
      setLoading(false);
    }
  };

  if (!userId) return null;

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border/40">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="font-heading text-2xl font-semibold text-foreground mb-2">
              Ödeme Başarılı!
            </h2>
            <p className="text-muted-foreground mb-4">
              {packageName} aboneliğiniz aktif edildi.
            </p>
            <p className="text-sm text-muted-foreground">
              Dashboard'a yönlendiriliyorsunuz...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <Building2 className="w-10 h-10 text-primary" />
            <span className="font-heading text-2xl font-semibold text-primary">mekan360</span>
          </Link>
          
          <h1 className="font-heading text-3xl font-semibold text-primary mb-2">
            Ödeme
          </h1>
          <p className="text-muted-foreground">
            Aboneliğinizi tamamlamak için ödeme yapın
          </p>
        </div>

        {/* Order Summary */}
        <Card className="border-border/40 mb-6">
          <CardContent className="p-6">
            <h3 className="font-heading text-lg font-semibold mb-4">Sipariş Özeti</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paket</span>
                <span className="font-medium">{packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">E-posta</span>
                <span className="font-medium">{email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Süre</span>
                <span className="font-medium">Aylık</span>
              </div>
              <div className="border-t border-border pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Toplam</span>
                  <span className="font-heading text-2xl font-bold text-primary">₺{amount}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form (MOCK) */}
        <Card className="border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="w-5 h-5 text-primary" />
              <h3 className="font-heading text-lg font-semibold">Kart Bilgileri</h3>
            </div>

            {/* Mock Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Demo Modu</p>
                  <p className="text-sm text-amber-700">
                    iyzico entegrasyonu yakında aktif edilecek. Şimdilik demo ödeme yapabilirsiniz.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Kart Numarası</Label>
                <Input 
                  placeholder="4242 4242 4242 4242" 
                  className="h-12"
                  defaultValue="4242 4242 4242 4242"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Son Kullanma</Label>
                  <Input 
                    placeholder="MM/YY" 
                    className="h-12"
                    defaultValue="12/25"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CVV</Label>
                  <Input 
                    placeholder="123" 
                    className="h-12"
                    defaultValue="123"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Kart Üzerindeki İsim</Label>
                <Input 
                  placeholder="AD SOYAD" 
                  className="h-12"
                  defaultValue="TEST USER"
                />
              </div>
            </div>

            <Button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-full mt-6"
              data-testid="pay-btn"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  İşleniyor...
                </span>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  ₺{amount} Öde
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              Ödemeniz SSL ile güvence altındadır. Kart bilgileriniz saklanmaz.
            </p>

            {/* Sözleşmeler */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg text-xs text-muted-foreground space-y-2">
              <p className="font-medium text-foreground">Önemli Bilgiler:</p>
              <p>• Ödeme yaparak <a href="#" className="text-primary underline">Kullanıcı Sözleşmesi</a> ve <a href="#" className="text-primary underline">KVKK Aydınlatma Metni</a>'ni kabul etmiş sayılırsınız.</p>
              <p>• Dijital hizmet niteliğinde olduğundan, satın alınan abonelikler için <strong>iade yapılmamaktadır</strong>.</p>
              <p>• Aboneliğiniz aylık olarak yenilenir. İstediğiniz zaman iptal edebilirsiniz.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
