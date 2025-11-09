import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CourseCard } from "@/components/CourseCard";
import { Footer } from "@/components/Footer";
import { AITrainingAssistant } from "@/components/AITrainingAssistant";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Users, Award, BookOpen, Clock, Globe, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

// Featured courses data
const featuredCourses = [
  {
    id: "1",
    title: "Public Speaking Mastery",
    titleMn: "Олон нийтийн өмнө үг хэлэх чадвар",
    description: "Master the art of confident public speaking and presentation skills",
    descriptionMn: "Олон нийтийн өмнө итгэлтэй үг хэлэх, танилцуулга хийх чадварыг эзэмшээрэй",
    category: "Soft Skills",
    categoryMn: "Зөөлөн ур чадвар",
    instructor: "Sarah Johnson",
    duration: "8 weeks",
    level: "Intermediate" as const,
    rating: 4.8,
    reviewCount: 89,
    enrolledCount: 320,
    price: 299000,
    currency: "₮",
    thumbnail: "/placeholder.jpg",
    featured: true
  },
  {
    id: "2", 
    title: "Data Analysis with Power BI",
    titleMn: "Power BI ашиглан өгөгдөл шинжилгээ",
    description: "Learn to analyze and visualize data using Microsoft Power BI",
    descriptionMn: "Microsoft Power BI ашиглан өгөгдлийг шинжилж, дүрслэн харуулах арга барилыг сурна уу",
    category: "Technical Skills",
    categoryMn: "Техникийн ур чадвар", 
    instructor: "Michael Chen",
    duration: "12 weeks",
    level: "Advanced" as const,
    rating: 4.9,
    reviewCount: 156,
    enrolledCount: 78,
    price: 450000,
    currency: "₮",
    thumbnail: "/placeholder.jpg"
  },
  {
    id: "3",
    title: "Leadership Fundamentals", 
    titleMn: "Удирдлагын үндэс суурь",
    description: "Essential leadership skills for managing teams and projects effectively",
    descriptionMn: "Баг, төслийг үр дүнтэй удирдахад шаардлагатай удирдлагын ур чадвар",
    category: "Leadership",
    categoryMn: "Манлайлал",
    instructor: "David Rodriguez",
    duration: "6 weeks", 
    level: "Beginner" as const,
    rating: 4.7,
    reviewCount: 234,
    enrolledCount: 567,
    price: 199000,
    currency: "₮",
    thumbnail: "/placeholder.jpg"
  }
];

const testimonials = [
  {
    name: "Баярмаа Б.",
    nameEn: "Bayarmaa B.",
    role: "Marketing Manager",
    roleEn: "Marketing Manager",
    comment: "Maker Edu-ийн дамжуулан олон нийтийн өмнө үг хэлэх чадвараа дээшлүүлж, ажилдаа их ашиг хүртлээ.",
    commentEn: "Through Maker Edu, I improved my public speaking skills and gained great benefits at work.",
    rating: 5
  },
  {
    name: "Төмөр С.",
    nameEn: "Tumur S.", 
    role: "Data Analyst",
    roleEn: "Data Analyst",
    comment: "Power BI сургалт маш практик байсан. Одоо өгөгдлийн шинжилгээг илүү өндөр түвшинд хийж байна.",
    commentEn: "The Power BI course was very practical. Now I'm doing data analysis at a much higher level.",
    rating: 5
  },
  {
    name: "Сарангэрэл Д.",
    nameEn: "Sarangerel D.",
    role: "Team Lead",  
    roleEn: "Team Lead",
    comment: "Удирдлагын сургалт миний багийг удирдах чадварыг эрс дээшлүүлсэн. Маш их талархаж байна.",
    commentEn: "The leadership training significantly improved my team management skills. Very grateful.",
    rating: 5
  }
];

const Index = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Featured Courses Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-12 animate-fade-in">
            <Badge variant="secondary" className="mb-4">
              {language === 'mn' ? "Онцлох сургалтууд" : "Featured Courses"}
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              {language === 'mn' ? (
                <>Хамгийн алдартай <span className="gradient-text">сургалтууд</span></>
              ) : (
                <>Most Popular <span className="gradient-text">Trainings</span></>
              )}
            </h2>
            <p className="text-muted-foreground/80 max-w-2xl mx-auto">
              {language === 'mn'
                ? "Карьераа өөрчилсөн олон мянган суралцагчдад нэгдээрэй."
                : "Join thousands of learners who have transformed their careers with our expert-led courses."}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredCourses.map((course, index) => (
              <div 
                key={course.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CourseCard course={course} />
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Button 
              asChild
              size="lg"
              className="bg-gradient-hero hover:shadow-elegant transition-all duration-300 hover-scale"
            >
              <Link to="/trainings">
                {language === 'mn' ? "Бүх сургалтууд үзэх" : "View All Trainings"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-br from-muted/30 to-background">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center animate-fade-in">
              <div className="text-3xl lg:text-4xl font-bold gradient-text mb-2">10,000+</div>
              <div className="text-muted-foreground/70">
                {language === 'mn' ? "Идэвхтэй суралцагч" : "Active Learners"}
              </div>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="text-3xl lg:text-4xl font-bold gradient-text mb-2">50+</div>
              <div className="text-muted-foreground/70">
                {language === 'mn' ? "Мэргэжлийн багш" : "Expert Instructors"}
              </div>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="text-3xl lg:text-4xl font-bold gradient-text mb-2">95%</div>
              <div className="text-muted-foreground/70">
                {language === 'mn' ? "Дүүргэх хувь" : "Completion Rate"}
              </div>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="text-3xl lg:text-4xl font-bold gradient-text mb-2">4.8/5</div>
              <div className="text-muted-foreground/70">
                {language === 'mn' ? "Дундаж үнэлгээ" : "Average Rating"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              {language === 'mn' ? (
                <><span className="gradient-text">Ангиллаар</span> үзэх</>
              ) : (
                <>Explore by <span className="gradient-text">Category</span></>
              )}
            </h2>
            <p className="text-muted-foreground/80 max-w-2xl mx-auto">
              {language === 'mn'
                ? "Зөөлөн ур чадвараас эхлээд техникийн мэргэжил хүртэл, карьерын бүх зорилгод зориулсан сургалтууд."
                : "From soft skills to technical expertise, we have courses for every career goal."}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Users, title: language === 'mn' ? "Олон нийтийн өмнө үг хэлэх" : "Public Speaking", count: 12, color: "from-primary to-primary-hover" },
              { icon: BookOpen, title: language === 'mn' ? "Манлайлал" : "Leadership", count: 8, color: "from-accent to-accent-hover" },
              { icon: Globe, title: language === 'mn' ? "Өгөгдөл & Шинжилгээ" : "Data & Analytics", count: 15, color: "from-success to-green-600" },
              { icon: Award, title: language === 'mn' ? "Техникийн ур чадвар" : "Technical Skills", count: 20, color: "from-purple-500 to-purple-600" },
              { icon: Clock, title: language === 'mn' ? "Зөөлөн ур чадвар" : "Soft Skills", count: 18, color: "from-orange-500 to-orange-600" },
              { icon: CheckCircle, title: language === 'mn' ? "Инженерчлэл" : "Engineering", count: 10, color: "from-blue-500 to-blue-600" }
            ].map((category, index) => (
              <Link key={category.title} to="/trainings">
                <Card 
                  className="group hover-scale cursor-pointer border-border/50 hover:shadow-card transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <category.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {category.title}
                        </h3>
                        <p className="text-muted-foreground/70 text-sm">
                          {language === 'mn' ? `${category.count} сургалт` : `${category.count} courses available`}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-muted/30 to-background">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-12 animate-fade-in">
            <Badge variant="secondary" className="mb-4">
              {language === 'mn' ? "Амжилтын түүхүүд" : "Success Stories"}
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              {language === 'mn' ? (
                <>Манай <span className="gradient-text">суралцагчдын</span> санал</>
              ) : (
                <>What Our <span className="gradient-text">Learners Say</span></>
              )}
            </h2>
            <p className="text-muted-foreground/80 max-w-2xl mx-auto">
              {language === 'mn'
                ? "Манай платформоор дамжуулан карьераа дэвшүүлсэн мэргэжилтнүүдийн бодит санал."
                : "Real feedback from professionals who've advanced their careers through our platform."}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index}
                className="border-border/50 hover:shadow-card transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-accent" fill="currentColor" />
                    ))}
                  </div>
                  
                  <blockquote className="text-muted-foreground/80 mb-4 italic">
                    "{language === 'mn' ? testimonial.comment : testimonial.commentEn}"
                  </blockquote>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-hero rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-semibold">
                        {(language === 'mn' ? testimonial.name : testimonial.nameEn).charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold">
                        {language === 'mn' ? testimonial.name : testimonial.nameEn}
                      </div>
                      <div className="text-sm text-muted-foreground/70">
                        {language === 'mn' ? testimonial.role : testimonial.roleEn}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center bg-gradient-card border border-border/50 rounded-3xl p-8 lg:p-12 shadow-elegant">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              {language === 'mn' ? (
                <><span className="gradient-text">Суралцахад</span> бэлэн үү?</>
              ) : (
                <>Ready to Start <span className="gradient-text">Learning?</span></>
              )}
            </h2>
            <p className="text-muted-foreground/80 mb-8 max-w-2xl mx-auto">
              {language === 'mn'
                ? "Maker Edu-тэй хамт карьераа дэвшүүлж буй олон мянган мэргэжилтнүүдэд нэгдээрэй. Өнөөдөр эхлээд мэргэжлийн багш нартай хамт сурна уу."
                : "Join thousands of professionals who are advancing their careers with Maker Edu. Start your journey today with our expert-led courses."}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                asChild
                size="lg"
                className="bg-gradient-hero hover:shadow-glow transition-all duration-300 hover-scale text-lg px-8 py-6"
              >
                <Link to="/trainings">
                  {language === 'mn' ? "Бүх сургалтууд үзэх" : "Browse All Courses"}
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-primary/20 hover:bg-primary/5 text-lg px-8 py-6 hover-scale"
              >
                {language === 'mn' ? "Мэргэжилтэнтэй ярилцах" : "Talk to an Expert"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      
      {/* Floating AI Assistant */}
      <AITrainingAssistant floating />
    </div>
  );
};

export default Index;
