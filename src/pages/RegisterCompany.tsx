import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

export default function RegisterCompany() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [hasCompany, setHasCompany] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    purpose: '',
    location: '',
    employee_count: '',
    training_frequency: 'monthly' as 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    contact_info: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      checkExistingCompany();
    }
  }, [user]);

  const checkExistingCompany = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_user_id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setHasCompany(true);
        setFormData({
          name: data.name,
          purpose: data.purpose,
          location: data.location,
          employee_count: data.employee_count.toString(),
          training_frequency: data.training_frequency,
          contact_info: data.contact_info || '',
        });
      }
    } catch (error: any) {
      console.error('Error checking company:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.purpose || !formData.location || !formData.employee_count) {
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Error' : 'Алдаа',
        description: language === 'en' ? 'Please fill in all required fields' : 'Шаардлагатай талбаруудыг бөглөнө үү',
      });
      return;
    }

    const employeeCount = parseInt(formData.employee_count);
    if (isNaN(employeeCount) || employeeCount <= 0) {
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Invalid Employee Count' : 'Буруу ажилтны тоо',
        description: language === 'en' ? 'Employee count must be a positive number' : 'Ажилтны тоо эерэг тоо байх ёстой',
      });
      return;
    }

    setLoading(true);
    try {
      const companyData = {
        owner_user_id: user?.id,
        name: formData.name,
        purpose: formData.purpose,
        location: formData.location,
        employee_count: employeeCount,
        training_frequency: formData.training_frequency,
        contact_info: formData.contact_info,
      };

      if (hasCompany) {
        const { error } = await supabase
          .from('companies')
          .update(companyData)
          .eq('owner_user_id', user?.id);

        if (error) throw error;

        toast({
          title: language === 'en' ? 'Success' : 'Амжилттай',
          description: language === 'en' ? 'Company information updated successfully' : 'Компанийн мэдээлэл амжилттай шинэчлэгдлээ',
        });
      } else {
        const { error } = await supabase
          .from('companies')
          .insert(companyData);

        if (error) throw error;

        toast({
          title: language === 'en' ? 'Success' : 'Амжилттай',
          description: language === 'en' ? 'Company registered successfully' : 'Компани амжилттай бүртгэгдлээ',
        });
        setHasCompany(true);
      }

      navigate('/trainings');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Error' : 'Алдаа',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
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
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl">
                  {hasCompany 
                    ? (language === 'en' ? 'Update Company Information' : 'Компанийн мэдээлэл шинэчлэх')
                    : (language === 'en' ? 'Register Your Company' : 'Компани бүртгүүлэх')
                  }
                </CardTitle>
              </div>
              <CardDescription>
                {language === 'en' 
                  ? 'Register your company to purchase training videos for your team'
                  : 'Багийнхаа сургалтын видео худалдан авахын тулд компаниа бүртгүүлнэ үү'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">
                    {language === 'en' ? 'Company Name *' : 'Компанийн нэр *'}
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={language === 'en' ? 'ACME Corporation' : 'Компанийн нэр'}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="purpose">
                    {language === 'en' ? 'Business Purpose *' : 'Бизнесийн зорилго *'}
                  </Label>
                  <Textarea
                    id="purpose"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    placeholder={language === 'en' 
                      ? "Describe your company's main business activities..."
                      : 'Компанийн үндсэн үйл ажиллагааг тайлбарлана уу...'
                    }
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location">
                    {language === 'en' ? 'Location *' : 'Байршил *'}
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder={language === 'en' ? 'City, Country' : 'Хот, Улс'}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="employee_count">
                    {language === 'en' ? 'Number of Employees *' : 'Ажилчдын тоо *'}
                  </Label>
                  <Input
                    id="employee_count"
                    type="number"
                    min="1"
                    value={formData.employee_count}
                    onChange={(e) => setFormData({ ...formData, employee_count: e.target.value })}
                    placeholder="50"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="training_frequency">
                    {language === 'en' ? 'Training Frequency *' : 'Сургалтын давтамж *'}
                  </Label>
                  <Select
                    value={formData.training_frequency}
                    onValueChange={(value: 'weekly' | 'monthly' | 'quarterly' | 'yearly') => 
                      setFormData({ ...formData, training_frequency: value })
                    }
                  >
                    <SelectTrigger id="training_frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">
                        {language === 'en' ? 'Weekly' : '7 хоног тутам'}
                      </SelectItem>
                      <SelectItem value="monthly">
                        {language === 'en' ? 'Monthly' : 'Сар бүр'}
                      </SelectItem>
                      <SelectItem value="quarterly">
                        {language === 'en' ? 'Quarterly' : 'Улирал бүр'}
                      </SelectItem>
                      <SelectItem value="yearly">
                        {language === 'en' ? 'Yearly' : 'Жил бүр'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="contact_info">
                    {language === 'en' ? 'Contact Information' : 'Холбоо барих мэдээлэл'}
                  </Label>
                  <Textarea
                    id="contact_info"
                    value={formData.contact_info}
                    onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                    placeholder={language === 'en' 
                      ? 'Phone, email, or other contact details...'
                      : 'Утас, имэйл эсвэл бусад холбоо барих мэдээлэл...'
                    }
                    rows={2}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
                    {language === 'en' ? 'Cancel' : 'Цуцлах'}
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {hasCompany 
                          ? (language === 'en' ? 'Updating...' : 'Шинэчилж байна...')
                          : (language === 'en' ? 'Registering...' : 'Бүртгэж байна...')
                        }
                      </>
                    ) : (
                      hasCompany 
                        ? (language === 'en' ? 'Update Company' : 'Компани шинэчлэх')
                        : (language === 'en' ? 'Register Company' : 'Компани бүртгүүлэх')
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
