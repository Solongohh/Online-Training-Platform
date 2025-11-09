import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ApplyTrainer() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    experience: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error(language === 'en' ? 'You must be logged in to apply' : 'Өргөдөл гаргахын тулд нэвтэрсэн байх ёстой');
      return;
    }

    if (!formData.fullName || !formData.bio || !formData.experience) {
      toast.error(language === 'en' ? 'Please fill in all fields' : 'Бүх талбарыг бөглөнө үү');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('trainer_applications')
        .insert({
          user_id: user.id,
          full_name: formData.fullName,
          bio: formData.bio,
          experience: formData.experience
        });

      if (error) throw error;

      toast.success(language === 'en' 
        ? 'Application submitted successfully! We will review it soon.'
        : 'Өргөдөл амжилттай илгээгдлээ! Бид удахгүй хянах болно.'
      );
      navigate('/my-dashboard');
    } catch (error: any) {
      console.error('Error submitting application:', error);
      if (error.code === '23505') {
        toast.error(language === 'en' 
          ? 'You have already submitted an application'
          : 'Та аль хэдийн өргөдөл илгээсэн байна'
        );
      } else {
        toast.error(language === 'en' 
          ? 'Failed to submit application'
          : 'Өргөдөл илгээхэд алдаа гарлаа'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>
            {language === 'en' ? 'Apply to Become a Trainer' : 'Багшаар өргөдөл гаргах'}
          </CardTitle>
          <CardDescription>
            {language === 'en' 
              ? 'Fill out this form to apply for trainer status. Our admin team will review your application.'
              : 'Багшийн эрх авахын тулд энэ маягтыг бөглөнө үү. Манай админ баг таны өргөдлийг хянах болно.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                {language === 'en' ? 'Full Name' : 'Бүтэн нэр'}
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder={language === 'en' ? 'Enter your full name' : 'Бүтэн нэрээ оруулна уу'}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">
                {language === 'en' ? 'Bio' : 'Товч танилцуулга'}
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder={language === 'en' ? 'Tell us about yourself' : 'Өөрийнхөө тухай хэлнэ үү'}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">
                {language === 'en' ? 'Teaching Experience' : 'Багшлах туршлага'}
              </Label>
              <Textarea
                id="experience"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder={language === 'en' 
                  ? 'Describe your teaching experience and qualifications'
                  : 'Багшлах туршлага болон мэргэшлээ тайлбарлана уу'
                }
                rows={4}
                required
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {language === 'en' ? 'Submit Application' : 'Өргөдөл илгээх'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/my-dashboard')}>
                {language === 'en' ? 'Cancel' : 'Цуцлах'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
