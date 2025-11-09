import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface WishlistButtonProps {
  videoId: string;
  userId: string | undefined;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
}

export function WishlistButton({ 
  videoId, 
  userId, 
  variant = 'ghost', 
  size = 'default',
  showText = false 
}: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      checkWishlist();
    }
  }, [videoId, userId]);

  const checkWishlist = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', userId)
        .eq('video_id', videoId)
        .maybeSingle();

      if (error) throw error;
      setIsInWishlist(!!data);
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const toggleWishlist = async () => {
    if (!userId) {
      toast({
        title: language === 'mn' ? 'Нэвтрэх шаардлагатай' : 'Sign in required',
        description: language === 'mn' 
          ? 'Хадгалах тулд нэвтэрнэ үү' 
          : 'Please sign in to save to wishlist',
      });
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      if (isInWishlist) {
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', userId)
          .eq('video_id', videoId);

        if (error) throw error;

        setIsInWishlist(false);
        toast({
          title: language === 'mn' ? 'Хассан' : 'Removed',
          description: language === 'mn' 
            ? 'Хүслийн жагсаалтаас хасагдлаа' 
            : 'Removed from wishlist',
        });
      } else {
        const { error } = await supabase
          .from('wishlist')
          .insert({
            user_id: userId,
            video_id: videoId,
          });

        if (error) throw error;

        setIsInWishlist(true);
        toast({
          title: language === 'mn' ? 'Хадгалсан' : 'Saved',
          description: language === 'mn' 
            ? 'Хүслийн жагсаалтад нэмэгдлээ' 
            : 'Added to wishlist',
        });
      }
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

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleWishlist}
      disabled={loading}
      className={isInWishlist ? 'text-red-500 hover:text-red-600' : ''}
    >
      <Heart 
        className={`h-5 w-5 ${showText ? 'mr-2' : ''} ${isInWishlist ? 'fill-current' : ''}`} 
      />
      {showText && (
        isInWishlist 
          ? (language === 'mn' ? 'Хадгалсан' : 'Saved')
          : (language === 'mn' ? 'Хадгалах' : 'Save')
      )}
    </Button>
  );
}
