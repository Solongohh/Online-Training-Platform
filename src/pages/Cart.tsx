import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface CartItem {
  videoId: string;
  title: string;
  price: number;
  quantity: number;
}

interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  status: string;
  qr_code_url: string | null;
  payment_reference: string | null;
}

export default function Cart() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadCart();
    }
  }, [user]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('carts')
        .select('*')
        .eq('owner_id', user?.id)
        .eq('status', 'open')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setCart({
          ...data,
          items: (data.items as any) || []
        } as Cart);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Error' : 'Алдаа',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (videoId: string, quantity: number) => {
    if (!cart) return;

    setUpdating(true);
    try {
      const updatedItems = cart.items.map((item: CartItem) =>
        item.videoId === videoId ? { ...item, quantity: Math.max(1, quantity) } : item
      );

      const total = updatedItems.reduce(
        (sum: number, item: CartItem) => sum + item.price * item.quantity,
        0
      );

      const { error } = await supabase
        .from('carts')
        .update({ items: updatedItems as any, total })
        .eq('id', cart.id);

      if (error) throw error;

      await loadCart();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Error' : 'Алдаа',
        description: error.message,
      });
    } finally {
      setUpdating(false);
    }
  };

  const removeFromCart = async (videoId: string) => {
    if (!cart) return;

    setUpdating(true);
    try {
      const updatedItems = cart.items.filter((item: CartItem) => item.videoId !== videoId);

      if (updatedItems.length === 0) {
        // Delete cart if empty
        const { error } = await supabase
          .from('carts')
          .delete()
          .eq('id', cart.id);

        if (error) throw error;
        setCart(null);
      } else {
        const total = updatedItems.reduce(
          (sum: number, item: CartItem) => sum + item.price * item.quantity,
          0
        );

        const { error } = await supabase
          .from('carts')
          .update({ items: updatedItems as any, total })
          .eq('id', cart.id);

        if (error) throw error;
        await loadCart();
      }

      toast({
        title: language === 'en' ? 'Item removed from cart' : 'Сагснаас устгасан',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Error' : 'Алдаа',
        description: error.message,
      });
    } finally {
      setUpdating(false);
    }
  };

  const generateQRCode = async () => {
    if (!cart) return;

    setUpdating(true);
    try {
      // Generate QR code URL (placeholder - integrate with actual payment gateway)
      const paymentReference = `PAY-${Date.now()}-${cart.id.substring(0, 8)}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        `Payment Reference: ${paymentReference}\nAmount: ₮${cart.total.toLocaleString()}`
      )}`;

      const { error } = await supabase
        .from('carts')
        .update({ 
          qr_code_url: qrCodeUrl,
          payment_reference: paymentReference,
        })
        .eq('id', cart.id);

      if (error) throw error;

      await loadCart();

      toast({
        title: language === 'en' ? 'QR Code Generated' : 'QR код үүсгэсэн',
        description: language === 'en' ? 'Scan the QR code to complete payment' : 'Төлбөрөө төлөхийн тулд QR кодыг уншуулна уу',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Error' : 'Алдаа',
        description: error.message,
      });
    } finally {
      setUpdating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 lg:px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <ShoppingCart className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">
              {language === 'en' ? 'Shopping Cart' : 'Сагс'}
            </h1>
          </div>

          {!cart || cart.items.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {language === 'en' ? 'Your cart is empty' : 'Таны сагс хоосон байна'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {language === 'en' 
                    ? 'Browse trainings and add videos to your cart'
                    : 'Сургалтуудыг үзээд видео нэмнэ үү'
                  }
                </p>
                <Button onClick={() => navigate('/trainings')}>
                  {language === 'en' ? 'Browse Trainings' : 'Сургалтууд үзэх'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                {cart.items.map((item: CartItem) => (
                  <Card key={item.videoId}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            ₮{item.price.toLocaleString()} {language === 'en' ? 'each' : 'бүр'}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCartItem(item.videoId, item.quantity - 1)}
                              disabled={updating || item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCartItem(item.videoId, item.quantity + 1)}
                              disabled={updating}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="text-right w-20">
                            <p className="font-semibold">
                              ₮{(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.videoId)}
                            disabled={updating}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="md:col-span-1">
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle>
                      {language === 'en' ? 'Order Summary' : 'Захиалгын дүн'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {language === 'en' ? 'Subtotal' : 'Дэд дүн'}
                        </span>
                        <span>₮{cart.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {language === 'en' ? 'Tax' : 'Татвар'}
                        </span>
                        <span>₮0</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-bold text-lg">
                        <span>{language === 'en' ? 'Total' : 'Нийт'}</span>
                        <span>₮{cart.total.toLocaleString()}</span>
                      </div>
                    </div>

                    {cart.qr_code_url ? (
                      <div className="space-y-3">
                        <div className="bg-muted p-4 rounded-lg">
                          <img 
                            src={cart.qr_code_url} 
                            alt="Payment QR Code" 
                            className="w-full"
                          />
                        </div>
                        <Badge variant="secondary" className="w-full justify-center py-2">
                          {language === 'en' 
                            ? `Scan to Pay: ₮${cart.total.toLocaleString()}`
                            : `Төлбөр төлөх: ₮${cart.total.toLocaleString()}`
                          }
                        </Badge>
                        <p className="text-xs text-center text-muted-foreground">
                          {language === 'en' ? 'Payment Reference' : 'Төлбөрийн код'}: {cart.payment_reference}
                        </p>
                      </div>
                    ) : (
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={generateQRCode}
                        disabled={updating}
                      >
                        {updating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {language === 'en' ? 'Generating...' : 'Үүсгэж байна...'}
                          </>
                        ) : (
                          language === 'en' ? 'Generate QR Code' : 'QR код үүсгэх'
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
