import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Gift, 
  Copy, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Loader2,
  CheckCircle,
  Share2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReferralCode {
  id: string;
  code: string;
  discount_percentage: number;
  total_referrals: number;
  total_earnings: number;
  is_active: boolean;
}

interface ReferralUse {
  id: string;
  purchase_amount: number;
  commission_earned: number;
  created_at: string;
  referred_user: {
    full_name: string;
  };
}

export default function Referral() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [referralUses, setReferralUses] = useState<ReferralUse[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadReferralData();
  }, [user]);

  const loadReferralData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load referral code
      const { data: codeData, error: codeError } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (codeError) throw codeError;
      setReferralCode(codeData);

      // Load referral uses if code exists
      if (codeData) {
        const { data: usesData, error: usesError } = await supabase
          .from('referral_uses')
          .select('*, referred_user:profiles!referred_user_id(full_name)')
          .eq('referral_code_id', codeData.id)
          .order('created_at', { ascending: false });

        if (usesError) throw usesError;
        setReferralUses(usesData as any || []);
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

  const generateReferralCode = async () => {
    if (!user) return;

    setCreating(true);
    try {
      const code = `REF${user.id.substring(0, 8).toUpperCase()}`;
      
      const { error } = await supabase
        .from('referral_codes')
        .insert({
          user_id: user.id,
          code: code,
          discount_percentage: 10,
        });

      if (error) throw error;

      toast({
        title: language === 'mn' ? 'Амжилттай!' : 'Success!',
        description: language === 'mn'
          ? 'Таны санал болгох код үүсгэгдлээ'
          : 'Your referral code has been generated',
      });
      loadReferralData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: language === 'mn' ? 'Алдаа' : 'Error',
        description: error.message,
      });
    } finally {
      setCreating(false);
    }
  };

  const copyReferralLink = () => {
    if (!referralCode) return;

    const referralLink = `${window.location.origin}/auth?ref=${referralCode.code}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: language === 'mn' ? 'Хуулагдлаа!' : 'Copied!',
      description: language === 'mn'
        ? 'Холбоос хуулагдлаа'
        : 'Referral link copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 lg:px-6 py-8">
        <div className="mb-12">
          <h1 className="text-3xl lg:text-5xl font-bold mb-4">
            {language === 'mn' ? 'Санал болгох' : 'Referral'}
            <span className="gradient-text">
              {language === 'mn' ? ' хөтөлбөр' : ' Program'}
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            {language === 'mn'
              ? 'Найзаа урьж орлого олоорой'
              : 'Invite friends and earn rewards'
            }
          </p>
        </div>

        {!referralCode ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-6">🎁</div>
              <h3 className="text-2xl font-bold mb-4">
                {language === 'mn' 
                  ? 'Өөрийн санал болгох код үүсгэх' 
                  : 'Generate Your Referral Code'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {language === 'mn'
                  ? 'Санал болгосон хүн бүрээс 10% хөнгөлөлт өгч, та орлого олох боломжтой'
                  : 'Give your friends 10% off and earn commission on every purchase'
                }
              </p>
              <Button 
                size="lg" 
                onClick={generateReferralCode}
                disabled={creating}
                className="bg-gradient-hero"
              >
                {creating ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Gift className="h-5 w-5 mr-2" />
                )}
                {language === 'mn' ? 'Код үүсгэх' : 'Generate Code'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {language === 'mn' ? 'Нийт санал болгосон' : 'Total Referrals'}
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{referralCode.total_referrals}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {language === 'mn' ? 'Нийт орлого' : 'Total Earnings'}
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${referralCode.total_earnings.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {language === 'mn' ? 'Хөнгөлөлт' : 'Discount'}
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{referralCode.discount_percentage}%</div>
                </CardContent>
              </Card>
            </div>

            {/* Referral Code Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  {language === 'mn' ? 'Таны санал болгох код' : 'Your Referral Code'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={`${window.location.origin}/auth?ref=${referralCode.code}`}
                    readOnly
                    className="font-mono"
                  />
                  <Button onClick={copyReferralLink}>
                    {copied ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={referralCode.is_active ? 'default' : 'secondary'}>
                    {referralCode.is_active 
                      ? (language === 'mn' ? 'Идэвхтэй' : 'Active')
                      : (language === 'mn' ? 'Идэвхгүй' : 'Inactive')
                    }
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {language === 'mn' 
                      ? `Найзуудтаа ${referralCode.discount_percentage}% хөнгөлөлт өгөх` 
                      : `Give friends ${referralCode.discount_percentage}% off`
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Referral History */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'mn' ? 'Түүх' : 'Referral History'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {referralUses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {language === 'mn'
                      ? 'Танд ашигласан санал болгох байхгүй байна'
                      : 'No referrals yet. Share your code to get started!'
                    }
                  </div>
                ) : (
                  <div className="space-y-3">
                    {referralUses.map((use) => (
                      <div
                        key={use.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{use.referred_user?.full_name || 'User'}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(use.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            +${use.commission_earned.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {language === 'mn' ? 'Орлого' : 'Commission'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
