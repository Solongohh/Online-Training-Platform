import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  type: 'course_completion' | 'new_course' | 'purchase_confirmation';
  data: {
    userName?: string;
    courseName?: string;
    trainerName?: string;
    price?: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, type, data }: EmailRequest = await req.json();

    let html = '';

    switch (type) {
      case 'course_completion':
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6366f1;">Congratulations, ${data.userName}!</h1>
            <p>You've successfully completed <strong>${data.courseName}</strong>!</p>
            <p>Your certificate of completion is now available in your learning dashboard.</p>
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovableproject.com') || ''}/my-learning" 
               style="display: inline-block; background-color: #6366f1; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; margin-top: 16px;">
              View Certificate
            </a>
          </div>
        `;
        break;

      case 'new_course':
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6366f1;">New Course Available!</h1>
            <p>Hi ${data.userName},</p>
            <p>A new course <strong>${data.courseName}</strong> by ${data.trainerName} is now available!</p>
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovableproject.com') || ''}/trainings" 
               style="display: inline-block; background-color: #6366f1; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; margin-top: 16px;">
              Browse Courses
            </a>
          </div>
        `;
        break;

      case 'purchase_confirmation':
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6366f1;">Purchase Confirmed!</h1>
            <p>Hi ${data.userName},</p>
            <p>Thank you for purchasing <strong>${data.courseName}</strong>!</p>
            <p>Amount paid: <strong>$${data.price?.toFixed(2)}</strong></p>
            <p>You can now access the course in your learning dashboard.</p>
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovableproject.com') || ''}/my-learning" 
               style="display: inline-block; background-color: #6366f1; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; margin-top: 16px;">
              Start Learning
            </a>
          </div>
        `;
        break;
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Maker Edu <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    const responseData = await res.json();

    if (!res.ok) {
      console.error('Resend API error:', responseData);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: responseData }),
        { status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: responseData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
