-- Add status enum for training videos
CREATE TYPE public.training_status AS ENUM ('uploaded', 'pending', 'approved', 'rejected');

-- Add status column to training_videos
ALTER TABLE public.training_videos 
ADD COLUMN status public.training_status NOT NULL DEFAULT 'pending';

-- Create table for tracking client video views
CREATE TABLE public.video_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  video_id UUID NOT NULL REFERENCES public.training_videos(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- Enable RLS on video_views
ALTER TABLE public.video_views ENABLE ROW LEVEL SECURITY;

-- RLS policies for video_views
CREATE POLICY "Users can view their own viewing history"
ON public.video_views
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can track their own views"
ON public.video_views
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Update training_videos RLS policies
DROP POLICY IF EXISTS "Anyone can view published videos" ON public.training_videos;
DROP POLICY IF EXISTS "Trainers can view their own videos" ON public.training_videos;

-- Clients (regular users) can only see approved videos
CREATE POLICY "Users can view approved videos"
ON public.training_videos
FOR SELECT
USING (status = 'approved' OR has_role(auth.uid(), 'admin'::app_role) OR (trainer_id = auth.uid() AND has_role(auth.uid(), 'trainer'::app_role)));

-- Add index for better query performance
CREATE INDEX idx_training_videos_status ON public.training_videos(status);
CREATE INDEX idx_video_views_user_id ON public.video_views(user_id);
CREATE INDEX idx_video_views_viewed_at ON public.video_views(viewed_at DESC);