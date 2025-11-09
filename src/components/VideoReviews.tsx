import { useState, useEffect } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Review {
  id: string;
  text: string;
  created_at: string;
  user_id: string;
  moderated: boolean;
  profiles: {
    full_name: string;
  };
}

interface VideoReviewsProps {
  videoId: string;
  userId: string;
}

export function VideoReviews({ videoId, userId }: VideoReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newReview, setNewReview] = useState('');
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReviews();
  }, [videoId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles(full_name)')
        .eq('video_id', videoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error loading reviews',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          video_id: videoId,
          user_id: userId,
          text: newReview.trim(),
          moderated: false,
        });

      if (error) throw error;

      toast({
        title: 'Review submitted',
        description: 'Your review is pending moderation',
      });
      setNewReview('');
      setShowForm(false);
      loadReviews();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const userReview = reviews.find(r => r.user_id === userId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Reviews ({reviews.filter(r => r.moderated).length})
        </h3>
        {!userReview && !showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            Write Review
          </Button>
        )}
      </div>

      {showForm && !userReview && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            placeholder="Share your thoughts about this training..."
            rows={4}
            maxLength={1000}
            required
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Review'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          No reviews yet. Be the first to review!
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{review.profiles.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {!review.moderated && (
                    <Badge variant="secondary">Pending Moderation</Badge>
                  )}
                </div>
                <p className="text-sm">{review.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
