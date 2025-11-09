import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Menu, X, Shield, LogOut, Video, User, ShoppingCart, Building2, ChevronDown, BookOpen, Heart, Gift } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "@/assets/maker-edu-logo.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useTrainerRole } from "@/hooks/useTrainerRole";
import { supabase } from "@/integrations/supabase/client";
import { NotificationBell } from "@/components/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Category {
  id: string;
  name: string;
  name_mn: string;
}

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useUserRole(user);
  const { isTrainer, loading: trainerLoading } = useTrainerRole(user);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error loading categories:', error);
    }
  };

  useEffect(() => {
    loadCategories();
    const fetchUserProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (data?.full_name) {
          setUserName(data.full_name);
        }
      } else {
        setUserName(null);
      }
    };

    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    const fetchCartItemCount = async () => {
      if (!user) {
        setCartItemCount(0);
        return;
      }

      const { data: cart } = await supabase
        .from('carts')
        .select('items')
        .eq('owner_id', user.id)
        .eq('status', 'open')
        .maybeSingle();

      if (cart?.items) {
        const items = cart.items as any[];
        const totalCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCartItemCount(totalCount);
      } else {
        setCartItemCount(0);
      }
    };

    fetchCartItemCount();

    // Set up real-time subscription for cart updates
    const channel = supabase
      .channel('cart-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'carts',
          filter: `owner_id=eq.${user?.id}`
        },
        () => {
          fetchCartItemCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const navItems = [
    { href: "/", label: language === 'mn' ? "Нүүр" : "Home" },
    { href: "/trainings", label: language === 'mn' ? "Сургалтууд" : "Trainings", hasDropdown: true },
    { href: "/blog", label: language === 'mn' ? "Блог" : "Blog" },
    { href: "/about", label: language === 'mn' ? "Тухай" : "About" },
    { href: "/contact", label: language === 'mn' ? "Холбоо барих" : "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="Maker Edu" className="h-10 w-10" />
            <span className="font-bold text-xl">
              <span className="gradient-text">Maker</span>{" "}
              <span className="text-muted-foreground">Edu</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              item.hasDropdown ? (
                <DropdownMenu key={item.href}>
                  <DropdownMenuTrigger className="text-foreground hover:text-primary transition-colors duration-200 font-medium flex items-center gap-1">
                    {item.label}
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuItem onClick={() => navigate('/trainings')}>
                      {language === 'mn' ? 'Бүх сургалтууд' : 'All Trainings'}
                    </DropdownMenuItem>
                    {categories.map((category) => (
                      <DropdownMenuItem 
                        key={category.id}
                        onClick={() => navigate(`/trainings?category=${category.id}`)}
                      >
                        {language === 'mn' ? category.name_mn : category.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={item.href}
                  to={item.href}
                  className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
                >
                  {item.label}
                </Link>
              )
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="hidden sm:flex items-center space-x-1"
            >
              <Globe className="w-4 h-4" />
              <Badge variant="secondary" className="text-xs">
                {language === 'mn' ? 'EN' : 'MN'}
              </Badge>
            </Button>

            {/* User Name Display */}
            {user && userName && (
              <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="font-medium">{userName}</span>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="hidden sm:flex items-center space-x-2">
              {user ? (
                <>
                  {user && <NotificationBell userId={user.id} />}
                  <Button variant="ghost" size="sm" onClick={() => navigate('/wishlist')}>
                    <Heart className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'Wishlist' : 'Хүслийн жагсаалт'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/my-learning')}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'My Learning' : 'Миний сургалт'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/cart')} className="relative">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'Cart' : 'Сагс'}
                    {cartItemCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full"
                      >
                        {cartItemCount}
                      </Badge>
                    )}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/register-company')}>
                    <Building2 className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'Company' : 'Компани'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/referral')}>
                    <Gift className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'Referral' : 'Санал болгох'}
                  </Button>
                  {!adminLoading && !trainerLoading && !isAdmin && !isTrainer && (
                    <Button variant="ghost" size="sm" onClick={() => navigate('/my-dashboard')}>
                      {language === 'mn' ? "Миний самбар" : "My Dashboard"}
                    </Button>
                  )}
                  {isAdmin && (
                    <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
                      <Shield className="h-4 w-4 mr-2" />
                      {language === 'en' ? 'Admin' : 'Админ'}
                    </Button>
                  )}
                  {isTrainer && (
                    <Button variant="ghost" size="sm" onClick={() => navigate('/trainer')}>
                      <Video className="h-4 w-4 mr-2" />
                      {language === 'mn' ? "Багш" : "Trainer"}
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
                    <User className="h-4 w-4 mr-2" />
                    {language === 'mn' ? "Профайл" : "Profile"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => signOut()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {language === 'mn' ? "Гарах" : "Sign Out"}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
                    {language === 'mn' ? "Нэвтрэх" : "Sign In"}
                  </Button>
                  <Button size="sm" className="bg-gradient-hero hover:shadow-glow transition-all duration-300" onClick={() => navigate('/auth')}>
                    {language === 'mn' ? "Бүртгүүлэх" : "Get Started"}
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col space-y-3">
              {navItems.map((item) => (
                item.hasDropdown ? (
                  <div key={item.href}>
                    <Link
                      to={item.href}
                      className="text-foreground hover:text-primary transition-colors duration-200 font-medium px-2 py-1 block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                    {categories.length > 0 && (
                      <div className="pl-4 mt-2 space-y-2">
                        {categories.map((category) => (
                          <Link
                            key={category.id}
                            to={`/trainings?category=${category.id}`}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 px-2 py-1 block"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {language === 'mn' ? category.name_mn : category.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="text-foreground hover:text-primary transition-colors duration-200 font-medium px-2 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
              ))}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleLanguage}
                  className="flex items-center space-x-1"
                >
                  <Globe className="w-4 h-4" />
                  <Badge variant="secondary" className="text-xs">
                    {language === 'mn' ? 'EN' : 'MN'}
                  </Badge>
                </Button>
                <div className="flex flex-col gap-2 w-full">
                  {user ? (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => { navigate('/my-learning'); setIsMenuOpen(false); }} className="w-full justify-start">
                        <BookOpen className="h-4 w-4 mr-2" />
                        {language === 'en' ? 'My Learning' : 'Миний сургалт'}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { navigate('/cart'); setIsMenuOpen(false); }} className="w-full justify-start relative">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {language === 'en' ? 'Cart' : 'Сагс'}
                        {cartItemCount > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full"
                          >
                            {cartItemCount}
                          </Badge>
                        )}
                      </Button>
                      {!adminLoading && !trainerLoading && !isAdmin && !isTrainer && (
                        <Button variant="ghost" size="sm" onClick={() => { navigate('/my-dashboard'); setIsMenuOpen(false); }} className="w-full justify-start">
                          {language === 'mn' ? "Миний самбар" : "My Dashboard"}
                        </Button>
                      )}
                      {isAdmin && (
                        <Button variant="ghost" size="sm" onClick={() => { navigate('/admin'); setIsMenuOpen(false); }} className="w-full justify-start">
                          <Shield className="h-4 w-4 mr-2" />
                          {language === 'en' ? 'Admin' : 'Админ'}
                        </Button>
                      )}
                      {isTrainer && (
                        <Button variant="ghost" size="sm" onClick={() => { navigate('/trainer'); setIsMenuOpen(false); }} className="w-full justify-start">
                          <Video className="h-4 w-4 mr-2" />
                          {language === 'mn' ? "Багш" : "Trainer"}
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => { signOut(); setIsMenuOpen(false); }} className="w-full justify-start">
                        <LogOut className="h-4 w-4 mr-2" />
                        {language === 'mn' ? "Гарах" : "Sign Out"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => { navigate('/auth'); setIsMenuOpen(false); }} className="w-full">
                        {language === 'mn' ? "Нэвтрэх" : "Sign In"}
                      </Button>
                      <Button size="sm" className="bg-gradient-hero w-full" onClick={() => { navigate('/auth'); setIsMenuOpen(false); }}>
                        {language === 'mn' ? "Бүртгүүлэх" : "Get Started"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};