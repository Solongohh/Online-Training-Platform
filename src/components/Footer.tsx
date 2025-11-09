import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import logo from "@/assets/maker-edu-logo.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { NewsletterSignup } from "@/components/NewsletterSignup";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { language } = useLanguage();

  return (
    <footer className="bg-gradient-to-br from-muted/30 to-background border-t border-border">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <img src={logo} alt="Maker Edu" className="h-10 w-10" />
              <span className="font-bold text-xl gradient-text">Maker Edu</span>
            </Link>
            
            <p className="text-muted-foreground max-w-sm">
              {language === 'mn'
                ? "Монголын зөөлөн болон хатуу ур чадваруудын тэргүүлэх сургалтын платформ. Чанартай боловсролоор карьераа дэмжинэ."
                : "Mongolia's premier learning platform for soft and hard skills. Empowering careers through quality education."}
            </p>
            
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {language === 'mn' ? "10,000+ суралцагчдын итгэлтэй" : "Trusted by 10,000+ learners"}
              </Badge>
            </div>
            
            {/* Social Links */}
            <div className="flex items-center space-x-3 pt-2">
              <Button variant="ghost" size="sm" className="hover:text-primary">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="hover:text-primary">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="hover:text-primary">
                <Linkedin className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="hover:text-primary">
                <Instagram className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Navigation Column */}
          <div>
            <h3 className="font-semibold text-lg mb-4">
              {language === 'mn' ? "Цэс" : "Navigation"}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/trainings" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {language === 'mn' ? "Бүх сургалтууд" : "All Trainings"}
                </Link>
              </li>
              <li>
                <Link 
                  to="/trainings?category=soft-skills" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {language === 'mn' ? "Зөөлөн ур чадвар" : "Soft Skills"}
                </Link>
              </li>
              <li>
                <Link 
                  to="/trainings?category=hard-skills" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {language === 'mn' ? "Техникийн ур чадвар" : "Technical Skills"}
                </Link>
              </li>
              <li>
                <Link 
                  to="/trainings?category=leadership" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {language === 'mn' ? "Манлайлал" : "Leadership"}
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {language === 'mn' ? "Тухай" : "About"}
                </Link>
              </li>
              <li>
                <Link 
                  to="/blog" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {language === 'mn' ? "Блог" : "Blog"}
                </Link>
              </li>
              <li>
                <Link 
                  to="/referral" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {language === 'mn' ? "Санал болгох" : "Referral Program"}
                </Link>
              </li>
              <li>
                <Link 
                  to="/apply-trainer" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {language === 'mn' ? "Багш болох" : "Become a Trainer"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="font-semibold text-lg mb-4">
              {language === 'mn' ? "Дэмжлэг" : "Support"}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/help" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {language === 'mn' ? "Тусламжийн төв" : "Help Center"}
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {language === 'mn' ? "Холбоо барих" : "Contact Us"}
                </Link>
              </li>
              <li>
                <Link 
                  to="/policies" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {language === 'mn' ? "Нууцлалын бодлого" : "Privacy Policy"}
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {language === 'mn' ? "Үйлчилгээний нөхцөл" : "Terms of Service"}
                </Link>
              </li>
              <li>
                <Link 
                  to="/consent" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {language === 'mn' ? "Өгөгдөл & Зөвшөөрөл" : "Data & Consent"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="font-semibold text-lg mb-4">
              {language === 'mn' ? "Холбоо барих" : "Contact"}
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  {language === 'mn' 
                    ? "СБД дүүрэг, 1-р хороо, Олимпийн гудамж, United Center 28А" 
                    : "SBD District, 1st khoroo, Olympic Street, United Center 28A"}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Mail className="w-5 h-5 text-primary" />
                <span className="text-sm">
                  maker_edu_mon@gmail.com
                </span>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-sm">
                  +976 9913 2224
                </span>
              </div>
            </div>
            
            {/* Newsletter Signup */}
            <div className="mt-6">
              <NewsletterSignup />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>© {currentYear} Maker Edu. {language === 'mn' ? "Бүх эрх хуулиар хамгаалагдсан." : "All rights reserved."}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>{language === 'mn' ? "Монгол улсад" : "Made with"}</span>
              <Heart className="w-4 h-4 text-accent" fill="currentColor" />
              <span>{language === 'mn' ? "бүтээсэн" : "in Mongolia"}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
