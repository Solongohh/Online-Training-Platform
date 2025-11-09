import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const hookSecret = Deno.env.get("AUTH_HOOK_SECRET") as string;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("not allowed", { status: 400 });
  }

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    const wh = new Webhook(hookSecret);
    
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = wh.verify(payload, headers) as {
      user: {
        email: string;
      };
      email_data: {
        token: string;
        token_hash: string;
        redirect_to: string;
        email_action_type: string;
      };
    };

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    let subject = "";
    let html = "";

    // Handle different email types
    if (email_action_type === "recovery") {
      const resetLink = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=recovery&redirect_to=${redirect_to}`;
      
      subject = "Reset Your Password - Maker Academy";
      html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Reset Your Password</h1>
              </div>
              <div style="padding: 40px 30px;">
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                  We received a request to reset your password for your Maker Academy account.
                </p>
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                  Click the button below to create a new password:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Reset Password
                  </a>
                </div>
                <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                  Or copy and paste this link into your browser:
                </p>
                <p style="color: #667eea; font-size: 14px; word-break: break-all; background-color: #f4f4f4; padding: 10px; border-radius: 4px; margin: 10px 0 20px;">
                  ${resetLink}
                </p>
                <p style="color: #999; font-size: 14px; line-height: 1.6; margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                  If you didn't request this password reset, you can safely ignore this email.
                </p>
              </div>
              <div style="background-color: #f8f8f8; padding: 20px 30px; text-align: center;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} Maker Academy. All rights reserved.
                </p>
              </div>
            </div>
          </body>
        </html>
      `;
    } else if (email_action_type === "signup") {
      const confirmLink = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=signup&redirect_to=${redirect_to}`;
      
      subject = "Welcome to Maker Academy - Confirm Your Email";
      html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Welcome to Maker Academy!</h1>
              </div>
              <div style="padding: 40px 30px;">
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                  Thank you for signing up! We're excited to have you join our learning community.
                </p>
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                  Click the button below to confirm your email address and get started:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${confirmLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Confirm Email
                  </a>
                </div>
                <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                  Or copy and paste this link into your browser:
                </p>
                <p style="color: #667eea; font-size: 14px; word-break: break-all; background-color: #f4f4f4; padding: 10px; border-radius: 4px; margin: 10px 0 20px;">
                  ${confirmLink}
                </p>
              </div>
              <div style="background-color: #f8f8f8; padding: 20px 30px; text-align: center;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} Maker Academy. All rights reserved.
                </p>
              </div>
            </div>
          </body>
        </html>
      `;
    }

    const { error } = await resend.emails.send({
      from: "Maker Academy <onboarding@resend.dev>",
      to: [user.email],
      subject,
      html,
    });

    if (error) {
      console.error("Error sending email:", error);
      throw error;
    }

    console.log(`Email sent successfully to ${user.email}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in auth-email-hook:", error);
    return new Response(
      JSON.stringify({
        error: {
          http_code: error.code || 500,
          message: error.message,
        },
      }),
      {
        status: error.code || 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
