import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Download, X, Smartphone } from 'lucide-react';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // iOS kontrolü
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // Standalone mod kontrolü (zaten uygulama olarak açılmış mı)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
      || window.navigator.standalone 
      || document.referrer.includes('android-app://');
    setIsStandalone(isInStandaloneMode);

    // beforeinstallprompt event'ini dinle
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Kullanıcı daha önce reddetmediyse banner'ı göster
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // appinstalled event'ini dinle
    window.addEventListener('appinstalled', () => {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      console.log('mekan360: Uygulama başarıyla yüklendi!');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('mekan360: Kullanıcı uygulamayı yükledi');
    } else {
      console.log('mekan360: Kullanıcı yüklemeyi reddetti');
    }
    
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Zaten yüklüyse veya standalone moddaysa gösterme
  if (isStandalone || (!deferredPrompt && !isIOS)) {
    return null;
  }

  // iOS için özel mesaj
  if (isIOS && !isStandalone) {
    if (!showInstallBanner) {
      // iOS'ta ilk ziyarette banner göster
      const iosShown = localStorage.getItem('pwa-ios-shown');
      if (!iosShown) {
        setTimeout(() => {
          setShowInstallBanner(true);
          localStorage.setItem('pwa-ios-shown', 'true');
        }, 3000);
      }
      return null;
    }

    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-border p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">mekan360'ı Yükleyin</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Safari'de <strong>Paylaş</strong> butonuna tıklayın, ardından <strong>"Ana Ekrana Ekle"</strong> seçeneğini seçin.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDismiss}
                className="text-xs"
              >
                Anladım
              </Button>
            </div>
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Android / Desktop için
  if (!showInstallBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">mekan360'ı Yükleyin</h3>
            <p className="text-sm text-muted-foreground">
              Uygulamayı ana ekranınıza ekleyin, hızlı erişim sağlayın.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleInstallClick}
              size="sm"
              className="bg-primary text-white hover:bg-primary/90"
            >
              <Download className="w-4 h-4 mr-1" />
              Yükle
            </Button>
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
