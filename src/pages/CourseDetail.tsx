import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VideoDiscussion } from "@/components/VideoDiscussion";
import { WishlistButton } from "@/components/WishlistButton";
import { AITrainingAssistant } from "@/components/AITrainingAssistant";
import {
  Star,
  Clock, 
  Users, 
  BookOpen, 
  Award, 
  Play, 
  Download,
  Heart,
  Share,
  CheckCircle,
  Calendar,
  Globe,
  ShoppingCart,
  Loader2
} from "lucide-react";

// Mock course data (in real app, this would come from an API)
const mockCourse = {
  id: "1",
  title: "Public Speaking Mastery",
  titleMn: "Олон нийтийн өмнө үг хэлэх чадвар",
  description: "Master the art of confident public speaking and presentation skills. This comprehensive course will transform how you communicate in professional and personal settings.",
  descriptionMn: "Олон нийтийн өмнө итгэлтэй үг хэлэх, танилцуулга хийх чадварыг эзэмшээрэй. Энэ иж бүрэн сургалт таны мэргэжлийн болон хувийн харилцааны арга барилыг өөрчлөх болно.",
  category: "Soft Skills",
  categoryMn: "Зөөлөн ур чадвар",
  instructor: {
    name: "Sarah Johnson",
    title: "Communication Expert & Executive Coach",
    titleMn: "Харилцааны мэргэжилтэн, Гүйцэтгэх захирлын сургагч",
    bio: "Sarah is a renowned communication expert with over 15 years of experience training executives and professionals worldwide.",
    bioMn: "Сара бол дэлхий даяар гүйцэтгэх захирлууд болон мэргэжилтнүүдийг 15 гаруй жил сургаж ирсэн нэр хүндтэй харилцааны мэргэжилтэн юм.",
    avatar: "/placeholder.jpg",
    rating: 4.9,
    students: 15000
  },
  duration: "8 weeks",
  level: "Intermediate",
  rating: 4.8,
  reviewCount: 89,
  enrolledCount: 320,
  price: 299000,
  currency: "₮",
  language: "English with Mongolian subtitles",
  languageMn: "Англи хэл, монгол орчуулга",
  thumbnail: "/placeholder.jpg",
  featured: true,
  whatYouWillLearn: [
    "Master confident public speaking techniques",
    "Overcome speaking anxiety and fear",
    "Create compelling presentations",
    "Handle Q&A sessions professionally",
    "Use body language effectively",
    "Engage any audience"
  ],
  whatYouWillLearnMn: [
    "Итгэлтэй олон нийтийн өмнө үг хэлэх арга техникийг эзэмших",
    "Үг хэлэхийн цагийн сэтгэлийн түгшүүр, айдсыг даван туулах",
    "Сонирхолтой танилцуулга бэлтгэх",
    "Асуулт хариултын цагийг мэргэжлийн түвшинд удирдах", 
    "Биеийн хэлээ үр дүнтэй ашиглах",
    "Ямар ч үзэгчдийг татах"
  ],
  curriculum: [
    {
      week: 1,
      title: "Foundation of Public Speaking",
      titleMn: "Олон нийтийн өмнө үг хэлэхийн үндэс",
      lessons: [
        "Understanding your audience",
        "Basic speaking techniques", 
        "Overcoming nervousness"
      ]
    },
    {
      week: 2,
      title: "Crafting Your Message",
      titleMn: "Мессеж боловсруулах",
      lessons: [
        "Structure and storytelling",
        "Creating compelling content",
        "Using visual aids"
      ]
    },
    {
      week: 3,
      title: "Delivery Techniques",
      titleMn: "Хүргэх арга техник",
      lessons: [
        "Voice control and projection",
        "Body language mastery",
        "Eye contact and gestures"
      ]
    }
  ]
};

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [cartLoading, setCartLoading] = useState(false);

  const addToCart = async () => {
    if (!user) {
      toast({
        title: language === 'mn' ? 'Нэвтрэх шаардлагатай' : 'Sign in required',
        description: language === 'mn' ? 'Сагсанд нэмэхийн тулд нэвтэрнэ үү' : 'Please sign in to add items to cart',
      });
      navigate('/auth');
      return;
    }

    setCartLoading(true);
    try {
      // Get or create cart
      let { data: cart, error: cartError } = await supabase
        .from('carts')
        .select('*')
        .eq('owner_id', user.id)
        .eq('status', 'open')
        .maybeSingle();

      if (cartError && cartError.code !== 'PGRST116') throw cartError;

      const cartItem = {
        videoId: id,
        title: mockCourse.title,
        price: mockCourse.price,
        quantity: 1
      };

      if (!cart) {
        // Create new cart
        const { error: insertError } = await supabase
          .from('carts')
          .insert({
            owner_id: user.id,
            items: [cartItem] as any,
            total: mockCourse.price,
            status: 'open'
          });

        if (insertError) throw insertError;
      } else {
        // Update existing cart
        const existingItems = (cart.items as any) || [];
        const existingItemIndex = existingItems.findIndex((item: any) => item.videoId === id);

        let updatedItems;
        if (existingItemIndex >= 0) {
          // Increment quantity
          updatedItems = [...existingItems];
          updatedItems[existingItemIndex].quantity++;
        } else {
          // Add new item
          updatedItems = [...existingItems, cartItem];
        }

        const total = updatedItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

        const { error: updateError } = await supabase
          .from('carts')
          .update({ items: updatedItems as any, total })
          .eq('id', cart.id);

        if (updateError) throw updateError;
      }

      toast({
        title: language === 'mn' ? 'Сагсанд нэмэгдсэн' : 'Added to cart',
        description: language === 'mn' 
          ? `${getTitle(mockCourse.title, mockCourse.titleMn)} таны сагсанд нэмэгдсэн байна`
          : `${mockCourse.title} has been added to your cart`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: language === 'mn' ? 'Алдаа' : 'Error',
        description: error.message,
      });
    } finally {
      setCartLoading(false);
    }
  };

  const getTitle = (en: string, mn?: string) => {
    return language === 'mn' && mn ? mn : en;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 lg:px-6 py-8">
        {/* Course Header */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Left Content */}
          <div className="lg:col-span-2 animate-fade-in">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
              <span>{language === 'mn' ? 'Нүүр' : 'Home'}</span>
              <span>/</span>
              <span>{language === 'mn' ? 'Сургалтууд' : 'Trainings'}</span>
              <span>/</span>
              <span className="text-foreground">{getTitle(mockCourse.title, mockCourse.titleMn)}</span>
            </nav>

            {/* Course Title */}
            <div className="mb-6">
              <Badge variant="secondary" className="mb-3">
                {getTitle(mockCourse.category, mockCourse.categoryMn)}
              </Badge>
              <h1 className="text-3xl lg:text-4xl font-bold mb-4">
                {getTitle(mockCourse.title, mockCourse.titleMn)}
              </h1>
              <p className="text-lg text-muted-foreground">
                {getTitle(mockCourse.description, mockCourse.descriptionMn)}
              </p>
            </div>

            {/* Course Meta */}
            <div className="flex flex-wrap items-center gap-6 mb-6">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-accent" fill="currentColor" />
                <span className="font-semibold">{mockCourse.rating}</span>
                <span className="text-muted-foreground">
                  ({mockCourse.reviewCount} {language === 'en' ? 'reviews' : 'үнэлгээ'})
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-primary" />
                <span>{mockCourse.enrolledCount.toLocaleString()} {language === 'en' ? 'enrolled' : 'суралцагч'}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span>{mockCourse.duration}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-muted-foreground" />
                <span>{mockCourse.level}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <span>{getTitle(mockCourse.language, mockCourse.languageMn)}</span>
              </div>
            </div>

            {/* About the Instructor */}
            <Card className="mb-8 border-primary/20 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-6 h-6 text-primary" />
                  <span>{language === 'mn' ? 'Багшийн тухай' : 'About the Instructor'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <Avatar className="w-24 h-24 border-4 border-primary/20">
                    <AvatarImage src={mockCourse.instructor.avatar} />
                    <AvatarFallback className="text-2xl">{mockCourse.instructor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-bold text-2xl mb-1">{mockCourse.instructor.name}</h3>
                      <p className="text-muted-foreground text-lg">
                        {getTitle(mockCourse.instructor.title, mockCourse.instructor.titleMn)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-6">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 rounded-lg bg-accent/10">
                          <Star className="w-5 h-5 text-accent" fill="currentColor" />
                        </div>
                        <div>
                          <div className="font-semibold text-lg">{mockCourse.instructor.rating}</div>
                          <div className="text-xs text-muted-foreground">
                            {language === 'mn' ? 'Үнэлгээ' : 'Rating'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-lg">{mockCourse.instructor.students.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">
                            {language === 'mn' ? 'Суралцагчид' : 'Students'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="p-2 rounded-lg bg-success/10">
                          <BookOpen className="w-5 h-5 text-success" />
                        </div>
                        <div>
                          <div className="font-semibold text-lg">15+</div>
                          <div className="text-xs text-muted-foreground">
                            {language === 'mn' ? 'Жилийн туршлага' : 'Years Experience'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-border pt-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {getTitle(mockCourse.instructor.bio, mockCourse.instructor.bioMn)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Purchase Card */}
          <div className="animate-slide-up">
            <div className="sticky top-24">
              <Card className="border-border/50 shadow-elegant">
                <CardHeader>
                  {/* Video Preview */}
                  <div className="relative h-48 bg-gradient-hero rounded-xl overflow-hidden mb-4">
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Button size="lg" className="bg-white/20 backdrop-blur-sm hover:bg-white/30">
                        <Play className="w-8 h-8 text-white" />
                      </Button>
                    </div>
                    {mockCourse.featured && (
                      <Badge className="absolute top-3 right-3 bg-accent">
                        {language === 'en' ? 'Featured' : 'Онцлох'}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Price */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {mockCourse.price.toLocaleString()} {mockCourse.currency}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {language === 'en' ? 'One-time payment • Lifetime access' : 'Нэг удаагийн төлбөр • Насан туршийн хандалт'}
                    </p>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <Button 
                    size="lg" 
                    className="w-full bg-gradient-hero hover:shadow-glow transition-all duration-300"
                    onClick={async () => {
                      await addToCart();
                      navigate('/cart');
                    }}
                    disabled={cartLoading}
                  >
                    {cartLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    {language === 'en' ? 'Enroll Now' : 'Бүртгүүлэх'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full"
                    onClick={addToCart}
                    disabled={cartLoading}
                  >
                    {cartLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ShoppingCart className="h-4 w-4 mr-2" />
                    )}
                    {language === 'en' ? 'Add to Cart' : 'Сагсанд нэмэх'}
                  </Button>
                  
                  <div className="flex justify-center space-x-4 pt-2">
                    <WishlistButton videoId={id || ''} userId={user?.id} showText />
                    <Button variant="ghost" size="sm">
                      <Share className="w-5 h-5 mr-1" />
                      {language === 'en' ? 'Share' : 'Хуваалцах'}
                    </Button>
                  </div>
                  
                  {/* Features */}
                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="flex items-center space-x-3 text-sm">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span>{language === 'en' ? 'Lifetime access' : 'Насан туршийн хандалт'}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <Download className="w-5 h-5 text-success" />
                      <span>{language === 'en' ? 'Downloadable resources' : 'Татаж авах боломжтой материал'}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <Award className="w-5 h-5 text-success" />
                      <span>{language === 'en' ? 'Certificate of completion' : 'Дүүргэсний гэрчилгээ'}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <Calendar className="w-5 h-5 text-success" />
                      <span>{language === 'en' ? '30-day money back guarantee' : '30 хоногийн мөнгө буцаах баталгаа'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Course Details Tabs */}
        <div className="animate-fade-in">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-5 lg:w-fit">
              <TabsTrigger value="overview">{language === 'en' ? 'Overview' : 'Тойм'}</TabsTrigger>
              <TabsTrigger value="curriculum">{language === 'en' ? 'Curriculum' : 'Сургалтын хөтөлбөр'}</TabsTrigger>
              <TabsTrigger value="ai-assistant">{language === 'en' ? 'AI Assistant' : 'AI Туслах'}</TabsTrigger>
              <TabsTrigger value="reviews">{language === 'en' ? 'Reviews' : 'Үнэлгээ'}</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'en' ? 'What You\'ll Learn' : 'Юу сурах вэ'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {(language === 'en' ? mockCourse.whatYouWillLearn : mockCourse.whatYouWillLearnMn).map((item, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="curriculum" className="space-y-6">
              {mockCourse.curriculum.map((week, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <Badge variant="outline">{language === 'en' ? 'Week' : 'Долоо хоног'} {week.week}</Badge>
                      <span>{getTitle(week.title, week.titleMn)}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {week.lessons.map((lesson, lessonIndex) => (
                        <div key={lessonIndex} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                          <Play className="w-4 h-4 text-primary" />
                          <span>{lesson}</span>
                          <div className="ml-auto text-sm text-muted-foreground">5-10 min</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="ai-assistant">
              <AITrainingAssistant 
                videoContext={{
                  title: getTitle(mockCourse.title, mockCourse.titleMn),
                  description: getTitle(mockCourse.description, mockCourse.descriptionMn),
                  category: getTitle(mockCourse.category, mockCourse.categoryMn)
                }}
              />
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4">⭐</div>
                  <h3 className="text-xl font-semibold mb-2">
                    {language === 'en' ? 'Reviews coming soon!' : 'Үнэлгээнүүд удахгүй!'}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'en' 
                      ? 'Student reviews and ratings will be displayed here.'
                      : 'Оюутнуудын үнэлгээ, дүгнэлтүүд энд харагдах болно.'
                    }
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="faq">
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4">❓</div>
                  <h3 className="text-xl font-semibold mb-2">
                    {language === 'en' ? 'FAQ section coming soon!' : 'Түгээмэл асуултууд удахгүй!'}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'en' 
                      ? 'Frequently asked questions will be displayed here.'
                      : 'Түгээмэл тавигдаг асуултууд энд харагдах болно.'
                    }
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}