import { useState } from 'react';
import { Mail, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { z } from 'zod';

const emailSchema = z.string().email();

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    const result = emailSchema.safeParse(email.trim());
    if (!result.success) {
      toast({
        variant: 'destructive',
        title: language === 'mn' ? 'Алдаа' : 'Error',
        description: language === 'mn' 
          ? 'И-мэйл хаяг буруу байна' 
          : 'Invalid email address',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email: result.data });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: language === 'mn' ? 'Аль хэдийн бүртгэгдсэн' : 'Already subscribed',
            description: language === 'mn'
              ? 'Та аль хэдийн бүртгүүлсэн байна'
              : 'This email is already subscribed',
          });
        } else {
          throw error;
        }
      } else {
        setSubscribed(true);
        setEmail('');
        toast({
          title: language === 'mn' ? 'Амжилттай!' : 'Success!',
          description: language === 'mn'
            ? 'Мэдээллийн сувгаар бүртгүүллээ'
            : 'Successfully subscribed to newsletter',
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: language === 'mn' ? 'Алдаа' : 'Error',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">
            {language === 'mn' ? 'Баярлалаа!' : 'Thank You!'}
          </h3>
          <p className="text-muted-foreground">
            {language === 'mn'
              ? 'Та манай мэдээллийн сувгаар амжилттай бүртгүүллээ'
              : "You've successfully subscribed to our newsletter"
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              {language === 'mn' ? 'Мэдээлэл авах' : 'Stay Updated'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === 'mn'
                ? 'Шинэ сургалт, зөвлөгөөний мэдээлэл аваарай'
                : 'Get latest training updates and tips'
              }
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder={language === 'mn' ? 'И-мэйл хаяг' : 'Email address'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={255}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Mail className="h-4 w-4 mr-2" />
            )}
            {language === 'mn' ? 'Бүртгүүлэх' : 'Subscribe'}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            {language === 'mn'
              ? 'Та ямар ч үед цуцлах боломжтой'
              : 'Unsubscribe at any time'
            }
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
