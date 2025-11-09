-- Add trainer profile fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS bio_mn text,
ADD COLUMN IF NOT EXISTS professional_title text,
ADD COLUMN IF NOT EXISTS professional_title_mn text,
ADD COLUMN IF NOT EXISTS years_of_experience integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS avatar_url text;