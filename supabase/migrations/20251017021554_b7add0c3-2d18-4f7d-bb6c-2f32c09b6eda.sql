-- Create training_frequency enum
CREATE TYPE training_frequency AS ENUM ('weekly', 'monthly', 'quarterly', 'yearly');

-- Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  purpose text NOT NULL,
  location text NOT NULL,
  employee_count integer NOT NULL CHECK (employee_count > 0),
  training_frequency training_frequency NOT NULL DEFAULT 'monthly',
  contact_info text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create cart status enum
CREATE TYPE cart_status AS ENUM ('open', 'paid', 'cancelled');

-- Create carts table
CREATE TABLE IF NOT EXISTS public.carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total decimal(10,2) NOT NULL DEFAULT 0,
  qr_code_url text,
  status cart_status NOT NULL DEFAULT 'open',
  payment_reference text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create purchased_videos table to track video access
CREATE TABLE IF NOT EXISTS public.purchased_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES public.training_videos(id) ON DELETE CASCADE,
  cart_id uuid REFERENCES public.carts(id) ON DELETE SET NULL,
  purchased_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchased_videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
CREATE POLICY "Users can create their own company"
  ON public.companies FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can view their own company"
  ON public.companies FOR SELECT
  USING (auth.uid() = owner_user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own company"
  ON public.companies FOR UPDATE
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Admins can view all companies"
  ON public.companies FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for carts
CREATE POLICY "Users can create their own cart"
  ON public.carts FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can view their own carts"
  ON public.carts FOR SELECT
  USING (auth.uid() = owner_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own carts"
  ON public.carts FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own carts"
  ON public.carts FOR DELETE
  USING (auth.uid() = owner_id);

-- RLS Policies for purchased_videos
CREATE POLICY "Users can view their own purchases"
  ON public.purchased_videos FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "System can create purchase records"
  ON public.purchased_videos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_carts_updated_at
  BEFORE UPDATE ON public.carts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_companies_owner ON public.companies(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_carts_owner ON public.carts(owner_id);
CREATE INDEX IF NOT EXISTS idx_carts_status ON public.carts(status);
CREATE INDEX IF NOT EXISTS idx_purchased_videos_user ON public.purchased_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_purchased_videos_video ON public.purchased_videos(video_id);