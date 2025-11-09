import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoId, userId } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch video and user details
    const { data: video } = await supabase
      .from('training_videos')
      .select('title, profiles(full_name)')
      .eq('id', videoId)
      .single();

    const { data: user } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();

    const { data: progress } = await supabase
      .from('video_progress')
      .select('completed, updated_at')
      .eq('video_id', videoId)
      .eq('user_id', userId)
      .single();

    if (!video || !user || !progress?.completed) {
      return new Response(
        JSON.stringify({ error: 'Course not completed or data not found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate SVG certificate
    const completionDate = new Date(progress.updated_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const profiles = video.profiles as any;
    const trainerName = Array.isArray(profiles) 
      ? profiles[0]?.full_name 
      : profiles?.full_name;

    const svg = `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Border -->
        <rect x="20" y="20" width="760" height="560" 
              fill="white" stroke="url(#grad1)" stroke-width="8" rx="10"/>
        
        <!-- Inner border -->
        <rect x="40" y="40" width="720" height="520" 
              fill="none" stroke="#e5e7eb" stroke-width="2" rx="5"/>
        
        <!-- Header -->
        <text x="400" y="100" text-anchor="middle" 
              font-family="serif" font-size="48" font-weight="bold" fill="#1f2937">
          Certificate of Completion
        </text>
        
        <!-- Subtitle -->
        <text x="400" y="140" text-anchor="middle" 
              font-family="sans-serif" font-size="18" fill="#6b7280">
          This is to certify that
        </text>
        
        <!-- Student name -->
        <text x="400" y="220" text-anchor="middle" 
              font-family="serif" font-size="36" font-weight="bold" fill="#6366f1">
          ${user?.full_name || 'Student'}
        </text>
        
        <!-- Achievement text -->
        <text x="400" y="270" text-anchor="middle" 
              font-family="sans-serif" font-size="18" fill="#6b7280">
          has successfully completed
        </text>
        
        <!-- Course name -->
        <text x="400" y="330" text-anchor="middle" 
              font-family="serif" font-size="28" font-weight="600" fill="#1f2937">
          ${video.title}
        </text>
        
        <!-- Completion date -->
        <text x="400" y="400" text-anchor="middle" 
              font-family="sans-serif" font-size="16" fill="#6b7280">
          Completed on ${completionDate}
        </text>
        
        <!-- Trainer signature line -->
        <line x1="250" y1="480" x2="550" y2="480" stroke="#d1d5db" stroke-width="2"/>
        
        <!-- Trainer name -->
        <text x="400" y="510" text-anchor="middle" 
              font-family="sans-serif" font-size="16" fill="#1f2937">
          ${trainerName || 'Instructor'}
        </text>
        
        <text x="400" y="535" text-anchor="middle" 
              font-family="sans-serif" font-size="14" fill="#9ca3af">
          Course Instructor
        </text>
      </svg>
    `;

    // Convert SVG to base64
    const base64 = btoa(unescape(encodeURIComponent(svg)));

    return new Response(
      JSON.stringify({ 
        certificate: `data:image/svg+xml;base64,${base64}`,
        filename: `certificate-${video.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.svg`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: any) {
    console.error('Error generating certificate:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
