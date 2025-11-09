-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_mn TEXT NOT NULL,
  description TEXT,
  description_mn TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add category_id to training_videos
ALTER TABLE public.training_videos
ADD COLUMN category_id UUID REFERENCES public.categories(id);

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Categories are viewable by everyone
CREATE POLICY "Anyone can view categories"
ON public.categories
FOR SELECT
USING (true);

-- Only admins can manage categories
CREATE POLICY "Admins can insert categories"
ON public.categories
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update categories"
ON public.categories
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete categories"
ON public.categories
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default categories
INSERT INTO public.categories (name, name_mn, description, description_mn) VALUES
  ('Public Speaking', 'Олон нийтийн өмнө үг хэлэх', 'Master the art of confident public speaking', 'Олон нийтийн өмнө итгэлтэй үг хэлэх чадварыг эзэмшээрэй'),
  ('Leadership', 'Манлайлал', 'Essential leadership and management skills', 'Удирдлага, манлайллын чадвар'),
  ('Data & Analytics', 'Өгөгдөл & Шинжилгээ', 'Data analysis and visualization skills', 'Өгөгдлийн шинжилгээ, дүрслэлийн чадвар'),
  ('Technical Skills', 'Техникийн ур чадвар', 'Programming and technical expertise', 'Програмчлал, техникийн мэргэжлийн чадвар'),
  ('Soft Skills', 'Зөөлөн ур чадвар', 'Communication and interpersonal skills', 'Харилцаа, хүмүүст хандах чадвар'),
  ('Engineering', 'Инженерчлэл', 'Engineering and technical problem solving', 'Инженерийн болон техникийн асуудал шийдвэрлэх');

-- Create index for better performance
CREATE INDEX idx_training_videos_category ON public.training_videos(category_id);