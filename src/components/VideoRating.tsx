import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VideoRatingProps {
  videoId: string;
  userId: string;
  currentRating?: number;
  onRatingChange?: () => void;
}

export function VideoRating({ videoId, userId, currentRating = 0, onRatingChange }: VideoRatingProps) {
  const [rating, setRating] = useState(currentRating);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleRating = async (stars: number) => {
    setLoading(true);
    try {
      if (currentRating > 0) {
        // Update existing rating
        const { error } = await supabase
          .from('ratings')
          .update({ stars, updated_at: new Date().toISOString() })
          .eq('video_id', videoId)
          .eq('user_id', userId);

        if (error) throw error;
        toast({ title: 'Rating updated successfully' });
      } else {
        // Create new rating
        const { error } = await supabase
          .from('ratings')
          .insert({ video_id: videoId, user_id: userId, stars });

        if (error) throw error;
        toast({ title: 'Rating added successfully' });
      }
      
      setRating(stars);
      onRatingChange?.();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={loading}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => handleRating(star)}
          className="transition-transform hover:scale-110 disabled:opacity-50"
        >
          <Star
            className={`h-5 w-5 ${
              star <= (hover || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground'
            }`}
          />
        </button>
      ))}
      {rating > 0 && (
        <span className="ml-2 text-sm text-muted-foreground">
          {rating}/5
        </span>
      )}
    </div>
  );
}
