import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Play, Star, Users, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export const Hero = () => {
  const { language } = useLanguage();
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isCourseVideoOpen, setIsCourseVideoOpen] = useState(false);

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-hero opacity-10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-accent opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      
      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="animate-fade-in">
            {/* Trust Badge */}
            <Badge variant="secondary" className="mb-6 text-sm font-medium bg-gradient-card border-primary/20">
              <Award className="w-4 h-4 mr-2" />
              {language === 'mn' 
                ? "Монгол даяар 10,000+ суралцагчдын итгэлтэй" 
                : "Trusted by 10,000+ learners in Mongolia"}
            </Badge>

            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
              {language === 'mn' ? (
                <>
                  Карьераа өөрчлөх{" "}
                  <span className="gradient-text">чадваруудыг</span> эзэмшээрэй
                </>
              ) : (
                <>
                  Master Skills That
                  <span className="gradient-text"> Transform Careers</span>
                </>
              )}
            </h1>

            <p className="text-muted-foreground/80 mb-8 leading-relaxed max-w-lg">
              {language === 'mn'
                ? "Олон нийтийн өмнө үг хэлэхээс эхлээд өгөгдлийн шинжилгээ, удирдлагаас техникийн ур чадвар хүртэл. Монголын тэргүүлэх сургалтын платформд нэгдээрэй."
                : "From public speaking to data analysis, leadership to technical skills. Join Mongolia's premier learning platform designed for your success."}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 mb-8">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-accent" fill="currentColor" />
                <span className="font-semibold">4.9/5</span>
                <span className="text-muted-foreground/70 text-sm">
                  {language === 'mn' ? "2,500+ үнэлгээнээс" : "from 2,500+ reviews"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="font-semibold">10,000+</span>
                <span className="text-muted-foreground/70 text-sm">
                  {language === 'mn' ? "идэвхтэй суралцагч" : "active learners"}
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/trainings">
                <Button 
                  size="lg" 
                  className="bg-gradient-hero hover:shadow-elegant transition-all duration-300 hover-scale text-lg px-8 py-6"
                >
                  {language === 'mn' ? "Сургалтууд үзэх" : "Explore Trainings"}
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-primary/20 hover:bg-primary/5 text-lg px-8 py-6 hover-scale"
                onClick={() => setIsVideoOpen(true)}
              >
                <Play className="w-5 h-5 mr-2" />
                {language === 'mn' ? "Танилцуулга үзэх" : "Watch Demo"}
              </Button>
            </div>
          </div>

          {/* Right Content - Featured Course Preview */}
          <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="relative">
              {/* Main Course Card */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-elegant hover-scale cursor-pointer" onClick={() => setIsCourseVideoOpen(true)}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center relative">
                    <Users className="w-6 h-6 text-primary-foreground" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="w-6 h-6 text-white" fill="white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {language === 'mn' ? "Олон нийтийн өмнө үг хэлэх чадвар" : "Public Speaking Mastery"}
                    </h3>
                    <p className="text-muted-foreground/70 text-sm">
                      {language === 'mn' ? "8 долоо хоног • Ахисан түвшин" : "8 weeks • Expert level"}
                    </p>
                  </div>
                </div>
                
                <p className="text-muted-foreground/80 mb-4">
                  {language === 'mn'
                    ? "Харилцааны чадвараа өөрчилж, ямар ч үзэгчдийн өмнө итгэлтэй байх арга барилыг эзэмшээрэй."
                    : "Transform your communication skills and build confidence in front of any audience."}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 bg-gradient-hero rounded-full border-2 border-background"></div>
                      <div className="w-8 h-8 bg-gradient-accent rounded-full border-2 border-background"></div>
                      <div className="w-8 h-8 bg-primary rounded-full border-2 border-background flex items-center justify-center">
                        <span className="text-primary-foreground text-xs font-bold">+</span>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground/70">
                      {language === 'mn' ? "120+ элссэн" : "120+ enrolled"}
                    </span>
                  </div>
                  <Badge className="bg-success text-success-foreground">
                    {language === 'mn' ? "Онцлох" : "Featured"}
                  </Badge>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-accent text-accent-foreground rounded-xl px-3 py-2 text-sm font-semibold shadow-card animate-bounce">
                {language === 'mn' ? "Шинэ!" : "New!"}
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-xl px-4 py-3 shadow-card">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-accent" fill="currentColor" />
                  <span className="font-semibold text-sm">4.8</span>
                  <span className="text-muted-foreground/70 text-xs">
                    ({language === 'mn' ? "89 үнэлгээ" : "89 reviews"})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Dialog */}
      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">
            {language === 'mn' ? "Танилцуулга бичлэг" : "Demo Video"}
          </DialogTitle>
          <div className="relative w-full aspect-video">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/_qEyJA5giXA"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Course Video Dialog */}
      <Dialog open={isCourseVideoOpen} onOpenChange={setIsCourseVideoOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">
            {language === 'mn' ? "Олон нийтийн өмнө үг хэлэх чадвар" : "Public Speaking Mastery"}
          </DialogTitle>
          <div className="relative w-full aspect-video">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/_qEyJA5giXA"
              title="Public Speaking Mastery Course Preview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
