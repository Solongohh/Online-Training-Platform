-- Extend training_videos table with pricing and validation fields
ALTER TABLE public.training_videos
ADD COLUMN IF NOT EXISTS is_private_link_validated boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_free boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS price decimal(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS duration_seconds integer,
ADD COLUMN IF NOT EXISTS size_mb decimal(10,2);

-- Create ratings table
CREATE TABLE IF NOT EXISTS public.ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES public.training_videos(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stars integer NOT NULL CHECK (stars >= 1 AND stars <= 5),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(video_id, user_id)
);

-- Create reviews/comments table
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES public.training_videos(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text text NOT NULL,
  moderated boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Extend profiles table with user activity tracking
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS liked_video_ids uuid[] DEFAULT ARRAY[]::uuid[],
ADD COLUMN IF NOT EXISTS browsed_video_ids uuid[] DEFAULT ARRAY[]::uuid[],
ADD COLUMN IF NOT EXISTS reviews_count integer DEFAULT 0;

-- Enable RLS on new tables
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ratings
CREATE POLICY "Users can view all ratings"
  ON public.ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own ratings"
  ON public.ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON public.ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON public.ratings FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for reviews
CREATE POLICY "Users can view moderated reviews"
  ON public.reviews FOR SELECT
  USING (moderated = true OR auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can moderate reviews"
  ON public.reviews FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete their own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updating ratings updated_at
CREATE TRIGGER update_ratings_updated_at
  BEFORE UPDATE ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updating reviews updated_at
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ratings_video_id ON public.ratings(video_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON public.ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON public.ratings(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_video_id ON public.reviews(video_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_moderated ON public.reviews(moderated);
CREATE INDEX IF NOT EXISTS idx_training_videos_status ON public.training_videos(status);
CREATE INDEX IF NOT EXISTS idx_training_videos_is_free ON public.training_videos(is_free);