import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { payment_reference, status } = await req.json();

    console.log('Payment webhook received:', { payment_reference, status });

    if (!payment_reference) {
      throw new Error('Payment reference is required');
    }

    // Find the cart by payment reference
    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select('*')
      .eq('payment_reference', payment_reference)
      .single();

    if (cartError || !cart) {
      console.error('Cart not found:', cartError);
      throw new Error('Cart not found');
    }

    // Update cart status
    if (status === 'paid' || status === 'success' || status === 'completed') {
      const { error: updateError } = await supabase
        .from('carts')
        .update({ status: 'paid' })
        .eq('id', cart.id);

      if (updateError) {
        console.error('Error updating cart:', updateError);
        throw updateError;
      }

      // Grant access to purchased videos
      const items = (cart.items as any) || [];
      const purchasedVideos = items.map((item: any) => ({
        user_id: cart.owner_id,
        video_id: item.videoId,
        cart_id: cart.id,
      }));

      // Insert purchased videos (ignore duplicates)
      for (const video of purchasedVideos) {
        await supabase
          .from('purchased_videos')
          .upsert(video, { onConflict: 'user_id,video_id' });
      }

      console.log('Payment processed successfully:', cart.id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Payment processed and access granted',
          cart_id: cart.id
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    } else if (status === 'failed' || status === 'cancelled') {
      const { error: updateError } = await supabase
        .from('carts')
        .update({ status: 'cancelled' })
        .eq('id', cart.id);

      if (updateError) {
        console.error('Error updating cart:', updateError);
        throw updateError;
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Payment cancelled',
          cart_id: cart.id
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: 'Invalid status' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );

  } catch (error: any) {
    console.error('Payment webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
