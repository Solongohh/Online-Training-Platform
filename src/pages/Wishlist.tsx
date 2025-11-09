import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Trash2, ShoppingCart, Loader2, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WishlistVideo {
  id: string;
  video_id: string;
  training_videos: {
    id: string;
    title: string;
    description: string | null;
    youtube_url: string;
    price: number;
    is_free: boolean;
    categories: {
      name: string;
      name_mn: string;
    } | null;
  };
}

export default function Wishlist() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState<WishlistVideo[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadWishlist();
  }, [user]);

  const loadWishlist = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wishlist')
        .select('*, training_videos(*, categories(name, name_mn))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData = (data || []).map((item: any) => ({
        ...item,
        training_videos: {
          ...item.training_videos,
          categories: Array.isArray(item.training_videos?.categories) 
            ? item.training_videos.categories[0] 
            : item.training_videos?.categories
        }
      }));

      setWishlistItems(transformedData as any);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: language === 'mn' ? 'Алдаа' : 'Error',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistId: string) => {
    setRemovingId(wishlistId);
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', wishlistId);

      if (error) throw error;

      toast({
        title: language === 'mn' ? 'Устгасан' : 'Removed',
        description: language === 'mn' 
          ? 'Хүслийн жагсаалтаас устгагдлаа' 
          : 'Removed from wishlist',
      });
      loadWishlist();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: language === 'mn' ? 'Алдаа' : 'Error',
        description: error.message,
      });
    } finally {
      setRemovingId(null);
    }
  };

  const addToCart = async (video: WishlistVideo['training_videos']) => {
    if (!user) return;

    try {
      let { data: cart, error: cartError } = await supabase
        .from('carts')
        .select('*')
        .eq('owner_id', user.id)
        .eq('status', 'open')
        .maybeSingle();

      if (cartError && cartError.code !== 'PGRST116') throw cartError;

      const cartItem = {
        videoId: video.id,
        title: video.title,
        price: video.price,
        quantity: 1
      };

      if (!cart) {
        const { error: insertError } = await supabase
          .from('carts')
          .insert({
            owner_id: user.id,
            items: [cartItem] as any,
            total: video.price,
            status: 'open'
          });

        if (insertError) throw insertError;
      } else {
        const existingItems = (cart.items as any) || [];
        const updatedItems = [...existingItems, cartItem];
        const total = updatedItems.reduce((sum: number, item: any) => 
          sum + item.price * item.quantity, 0);

        const { error: updateError } = await supabase
          .from('carts')
          .update({ items: updatedItems as any, total })
          .eq('id', cart.id);

        if (updateError) throw updateError;
      }

      toast({
        title: language === 'mn' ? 'Нэмэгдсэн' : 'Added',
        description: language === 'mn' 
          ? 'Сагсанд нэмэгдлээ' 
          : 'Added to cart',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: language === 'mn' ? 'Алдаа' : 'Error',
        description: error.message,
      });
    }
  };

  if (loading) {
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
        <div className="mb-12">
          <h1 className="text-3xl lg:text-5xl font-bold mb-4">
            {language === 'mn' ? 'Миний' : 'My'}
            <span className="gradient-text">
              {language === 'mn' ? ' хүслийн жагсаалт' : ' Wishlist'}
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            {language === 'mn' 
              ? 'Хадгалсан сургалтуудынхаа жагсаалт'
              : 'Your saved trainings'
            }
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">💝</div>
            <h3 className="text-xl font-semibold mb-2">
              {language === 'mn' ? 'Хүслийн жагсаалт хоосон' : 'Wishlist is empty'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {language === 'mn'
                ? 'Та одоогоор ямар ч сургалт хадгалаагүй байна.'
                : "You haven't saved any trainings yet."
              }
            </p>
            <Button onClick={() => navigate('/trainings')}>
              {language === 'mn' ? 'Сургалт хайх' : 'Browse Trainings'}
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                    <Play className="h-12 w-12 text-muted-foreground" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold flex-1">
                        {item.training_videos.title}
                      </h3>
                      {item.training_videos.is_free ? (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
                          Free
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ${item.training_videos.price.toFixed(2)}
                        </Badge>
                      )}
                    </div>

                    {item.training_videos.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.training_videos.description}
                      </p>
                    )}

                    {item.training_videos.categories && (
                      <Badge variant="outline">
                        {language === 'mn' 
                          ? item.training_videos.categories.name_mn 
                          : item.training_videos.categories.name}
                      </Badge>
                    )}

                    <div className="flex gap-2">
                      {item.training_videos.is_free ? (
                        <Button 
                          className="flex-1"
                          onClick={() => window.open(item.training_videos.youtube_url, '_blank')}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          {language === 'mn' ? 'Үзэх' : 'Watch'}
                        </Button>
                      ) : (
                        <Button 
                          className="flex-1"
                          onClick={() => addToCart(item.training_videos)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {language === 'mn' ? 'Сагсанд нэмэх' : 'Add to Cart'}
                        </Button>
                      )}
                      <Button 
                        variant="outline"
                        size="icon"
                        onClick={() => removeFromWishlist(item.id)}
                        disabled={removingId === item.id}
                      >
                        {removingId === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
