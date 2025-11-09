import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const contactSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  phone: z.string()
    .trim()
    .min(8, { message: "Phone number must be at least 8 characters" })
    .max(20, { message: "Phone number must be less than 20 characters" }),
  subject: z.string()
    .trim()
    .min(1, { message: "Subject is required" })
    .max(200, { message: "Subject must be less than 200 characters" }),
  message: z.string()
    .trim()
    .min(10, { message: "Message must be at least 10 characters" })
    .max(2000, { message: "Message must be less than 2000 characters" })
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Contact() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});

  const contactInfo = [
    {
      icon: Mail,
      titleEn: "Email",
      titleMn: "Имэйл",
      valueEn: "info@makeredu.mn",
      valueMn: "info@makeredu.mn",
      href: "mailto:info@makeredu.mn"
    },
    {
      icon: Phone,
      titleEn: "Phone",
      titleMn: "Утас",
      valueEn: "+976 7000-0000",
      valueMn: "+976 7000-0000",
      href: "tel:+97670000000"
    },
    {
      icon: MapPin,
      titleEn: "Address",
      titleMn: "Хаяг",
      valueEn: "Ulaanbaatar, Mongolia",
      valueMn: "Улаанбаатар, Монгол Улс",
      href: null
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const validation = contactSchema.safeParse(formData);
    
    if (!validation.success) {
      const newErrors: Partial<Record<keyof ContactFormData, string>> = {};
      validation.error.errors.forEach((error) => {
        if (error.path[0]) {
          newErrors[error.path[0] as keyof ContactFormData] = error.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message
        }
      });

      if (error) throw error;

      toast({
        title: language === 'mn' ? 'Амжилттай илгээгдлээ' : 'Message sent successfully',
        description: language === 'mn' 
          ? 'Бид таны мессежийг хүлээн авлаа. Удахгүй холбогдох болно.'
          : 'We received your message and will get back to you soon.',
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: language === 'mn' ? 'Алдаа гарлаа' : 'Error',
        description: language === 'mn' 
          ? 'Мессеж илгээхэд алдаа гарлаа. Дахин оролдоно уу.'
          : 'Failed to send message. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 lg:px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            {language === 'mn' ? 'Холбоо барих' : 'Contact Us'}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {language === 'mn'
              ? 'Асуулт, санал хүсэлт байвал бидэнтэй холбогдоорой. Бид танд туслахад таатай байна.'
              : 'Have questions or suggestions? Get in touch with us. We\'re happy to help.'}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Information Cards */}
          {contactInfo.map((info, index) => {
            const Icon = info.icon;
            const content = (
              <Card key={index} className="hover-scale animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {language === 'mn' ? info.titleMn : info.titleEn}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'mn' ? info.valueMn : info.valueEn}
                  </p>
                </CardContent>
              </Card>
            );

            return info.href ? (
              <a key={index} href={info.href} className="block">
                {content}
              </a>
            ) : content;
          })}
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <Card className="border-primary/20 shadow-elegant">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {language === 'mn' ? 'Мессеж илгээх' : 'Send us a message'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">
                      {language === 'mn' ? 'Таны нэр' : 'Your Name'} *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder={language === 'mn' ? 'Нэрээ оруулна уу' : 'Enter your name'}
                      className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">
                      {language === 'mn' ? 'Имэйл хаяг' : 'Email Address'} *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder={language === 'mn' ? 'email@example.com' : 'email@example.com'}
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">
                    {language === 'mn' ? 'Утасны дугаар' : 'Phone Number'} *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder={language === 'mn' ? '9999-9999' : '9999-9999'}
                    className={errors.phone ? 'border-destructive' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="subject">
                    {language === 'mn' ? 'Гарчиг' : 'Subject'} *
                  </Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder={language === 'mn' ? 'Мессежийн гарчиг' : 'Message subject'}
                    className={errors.subject ? 'border-destructive' : ''}
                  />
                  {errors.subject && (
                    <p className="text-sm text-destructive mt-1">{errors.subject}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="message">
                    {language === 'mn' ? 'Мессеж' : 'Message'} *
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder={language === 'mn' 
                      ? 'Асуулт, санал хүсэлтээ энд бичнэ үү...'
                      : 'Write your message here...'}
                    rows={6}
                    className={errors.message ? 'border-destructive' : ''}
                  />
                  {errors.message && (
                    <p className="text-sm text-destructive mt-1">{errors.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-hero hover:shadow-glow transition-all duration-300"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {language === 'mn' ? 'Илгээж байна...' : 'Sending...'}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {language === 'mn' ? 'Мессеж илгээх' : 'Send Message'}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Map Section */}
        <div className="mt-12 animate-fade-in">
          <Card>
            <CardContent className="p-0">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center p-8">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {language === 'mn' 
                      ? 'Газрын зураг энд байрлана'
                      : 'Map will be displayed here'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
