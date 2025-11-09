-- Add foreign key relationship between training_videos and profiles
ALTER TABLE public.training_videos 
ADD CONSTRAINT training_videos_trainer_id_fkey 
FOREIGN KEY (trainer_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;