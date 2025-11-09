-- Create trainer applications table
CREATE TABLE public.trainer_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  bio TEXT NOT NULL,
  experience TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.trainer_applications ENABLE ROW LEVEL SECURITY;

-- Users can create their own application
CREATE POLICY "Users can create their own trainer application"
ON public.trainer_applications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can view their own application
CREATE POLICY "Users can view their own trainer application"
ON public.trainer_applications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all applications
CREATE POLICY "Admins can view all trainer applications"
ON public.trainer_applications
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Admins can update applications
CREATE POLICY "Admins can update trainer applications"
ON public.trainer_applications
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_trainer_applications_updated_at
BEFORE UPDATE ON public.trainer_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();