-- Create table for training videos
CREATE TABLE public.training_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  youtube_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_trainer FOREIGN KEY (trainer_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.training_videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for training_videos
CREATE POLICY "Trainers can view their own videos"
ON public.training_videos
FOR SELECT
USING (
  trainer_id = auth.uid() OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Trainers can insert their own videos"
ON public.training_videos
FOR INSERT
WITH CHECK (
  trainer_id = auth.uid() AND 
  has_role(auth.uid(), 'trainer'::app_role)
);

CREATE POLICY "Trainers can update their own videos"
ON public.training_videos
FOR UPDATE
USING (
  trainer_id = auth.uid() AND 
  has_role(auth.uid(), 'trainer'::app_role)
);

CREATE POLICY "Trainers can delete their own videos"
ON public.training_videos
FOR DELETE
USING (
  trainer_id = auth.uid() AND 
  has_role(auth.uid(), 'trainer'::app_role)
);

CREATE POLICY "Anyone can view published videos"
ON public.training_videos
FOR SELECT
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_training_videos_updated_at
BEFORE UPDATE ON public.training_videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();