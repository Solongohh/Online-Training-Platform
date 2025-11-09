import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Auth() {
  const navigate = useNavigate();
  const { user, signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({ email: '', password: '', fullName: '' });

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(signInData.email, signInData.password);

    if (error) {
      toast({
        variant: 'destructive',
        title: language === 'mn' ? 'Алдаа' : 'Error',
        description: error.message,
      });
    } else {
      toast({
        title: language === 'mn' ? 'Амжилттай' : 'Success',
        description: language === 'mn' ? 'Амжилттай нэвтэрлээ' : 'Successfully signed in',
      });
      navigate('/');
    }

    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signUp(signUpData.email, signUpData.password, signUpData.fullName);

    if (error) {
      toast({
        variant: 'destructive',
        title: language === 'mn' ? 'Алдаа' : 'Error',
        description: error.message,
      });
    } else {
      toast({
        title: language === 'mn' ? 'Амжилттай' : 'Success',
        description: language === 'mn' ? 'Амжилттай бүртгэгдлээ' : 'Successfully signed up',
      });
      navigate('/');
    }

    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);

    const { error } = await resetPassword(resetEmail);

    if (error) {
      toast({
        variant: 'destructive',
        title: language === 'mn' ? 'Алдаа' : 'Error',
        description: error.message,
      });
    } else {
      toast({
        title: language === 'mn' ? 'Амжилттай' : 'Success',
        description: language === 'mn' 
          ? 'Нууц үг сэргээх холбоос илгээгдлээ. Имэйлээ шалгана уу.' 
          : 'Password reset link sent! Check your email.',
      });
      setForgotPasswordOpen(false);
      setResetEmail('');
    }

    setResetLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {language === 'mn' ? 'Maker Academy' : 'Maker Academy'}
          </CardTitle>
          <CardDescription className="text-center">
            {language === 'mn' ? 'Нэвтрэх эсвэл бүртгүүлэх' : 'Sign in or create an account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">
                {language === 'mn' ? 'Нэвтрэх' : 'Sign In'}
              </TabsTrigger>
              <TabsTrigger value="signup">
                {language === 'mn' ? 'Бүртгүүлэх' : 'Sign Up'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">
                    {language === 'mn' ? 'Имэйл' : 'Email'}
                  </Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder={language === 'mn' ? 'Имэйл хаяг' : 'Email address'}
                    value={signInData.email}
                    onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signin-password">
                      {language === 'mn' ? 'Нууц үг' : 'Password'}
                    </Label>
                    <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
                      <DialogTrigger asChild>
                        <Button variant="link" className="p-0 h-auto text-sm">
                          {language === 'mn' ? 'Нууц үг мартсан?' : 'Forgot password?'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {language === 'mn' ? 'Нууц үг сэргээх' : 'Reset Password'}
                          </DialogTitle>
                          <DialogDescription>
                            {language === 'mn' 
                              ? 'Имэйл хаягаа оруулна уу. Нууц үг сэргээх холбоос илгээх болно.' 
                              : 'Enter your email address and we\'ll send you a password reset link.'}
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleResetPassword} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="reset-email">
                              {language === 'mn' ? 'Имэйл' : 'Email'}
                            </Label>
                            <Input
                              id="reset-email"
                              type="email"
                              placeholder={language === 'mn' ? 'Имэйл хаяг' : 'Email address'}
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              required
                            />
                          </div>
                          <Button type="submit" className="w-full" disabled={resetLoading}>
                            {resetLoading 
                              ? (language === 'mn' ? 'Илгээж байна...' : 'Sending...') 
                              : (language === 'mn' ? 'Холбоос илгээх' : 'Send reset link')}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder={language === 'mn' ? 'Нууц үг' : 'Password'}
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (language === 'mn' ? 'Уншиж байна...' : 'Loading...') : (language === 'mn' ? 'Нэвтрэх' : 'Sign In')}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">
                    {language === 'mn' ? 'Нэр' : 'Full Name'}
                  </Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder={language === 'mn' ? 'Нэр' : 'Full name'}
                    value={signUpData.fullName}
                    onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">
                    {language === 'mn' ? 'Имэйл' : 'Email'}
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder={language === 'mn' ? 'Имэйл хаяг' : 'Email address'}
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">
                    {language === 'mn' ? 'Нууц үг' : 'Password'}
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder={language === 'mn' ? 'Нууц үг (6+ тэмдэгт)' : 'Password (6+ characters)'}
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (language === 'mn' ? 'Бүртгэж байна...' : 'Creating account...') : (language === 'mn' ? 'Бүртгүүлэх' : 'Sign Up')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
