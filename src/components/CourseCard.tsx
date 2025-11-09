import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Star, Clock, Users, Play } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    titleMn?: string;
    description: string;
    descriptionMn?: string;
    category: string;
    categoryMn?: string;
    instructor: string;
    duration: string;
    level: "Beginner" | "Intermediate" | "Advanced";
    rating: number;
    reviewCount: number;
    enrolledCount: number;
    price: number;
    currency: string;
    thumbnail: string;
    featured?: boolean;
  };
}

export const CourseCard = ({ course }: CourseCardProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const levelColors = {
    Beginner: "bg-success/10 text-success border-success/20",
    Intermediate: "bg-accent/10 text-accent border-accent/20", 
    Advanced: "bg-destructive/10 text-destructive border-destructive/20"
  };

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return language === 'mn' ? 'Үнэгүй' : 'Free';
    return `${price.toLocaleString()} ${currency}`;
  };

  const title = language === 'mn' && course.titleMn ? course.titleMn : course.title;
  const description = language === 'mn' && course.descriptionMn ? course.descriptionMn : course.description;
  const category = language === 'mn' && course.categoryMn ? course.categoryMn : course.category;

  const addToCart = async () => {
    if (!user) {
      toast({
        title: language === 'mn' ? 'Нэвтрэх шаардлагатай' : 'Sign in required',
        description: language === 'mn' ? 'Сагсанд нэмэхийн тулд нэвтэрнэ үү' : 'Please sign in to add items to cart',
      });
      navigate('/auth');
      return;
    }

    setIsAddingToCart(true);
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
        videoId: course.id,
        title: course.title,
        price: course.price,
        quantity: 1
      };

      if (!cart) {
        // Create new cart
        const { error: insertError } = await supabase
          .from('carts')
          .insert({
            owner_id: user.id,
            items: [cartItem] as any,
            total: course.price,
            status: 'open'
          });

        if (insertError) throw insertError;
      } else {
        // Update existing cart
        const existingItems = (cart.items as any) || [];
        const existingItemIndex = existingItems.findIndex((item: any) => item.videoId === course.id);

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
          ? `${title} таны сагсанд нэмэгдсэн байна` 
          : `${title} has been added to your cart`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: language === 'mn' ? 'Алдаа' : 'Error',
        description: error.message,
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <Card className="group hover-scale hover:shadow-card transition-all duration-300 border-border/50 bg-gradient-card">
      <CardHeader className="relative p-0">
        {/* Thumbnail */}
        <div className="relative h-48 bg-gradient-hero rounded-t-xl overflow-hidden">
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
            <Play className="w-12 h-12 text-primary-foreground opacity-70" />
          </div>
          
          {/* Floating badges */}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-background/90 text-foreground">
              {category}
            </Badge>
          </div>
          
          {course.featured && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-accent text-accent-foreground">
                {language === 'mn' ? 'Онцлох' : 'Featured'}
              </Badge>
            </div>
          )}
          
          <div className="absolute bottom-3 right-3">
            <Badge 
              variant="outline" 
              className={levelColors[course.level]}
            >
              {course.level}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Title and Description */}
          <div>
            <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {title}
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-2">
              {description}
            </p>
          </div>

          {/* Instructor */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-semibold">
                {course.instructor.charAt(0)}
              </span>
            </div>
            <span className="text-sm font-medium">{course.instructor}</span>
          </div>

          {/* Meta Information */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{course.enrolledCount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-accent" fill="currentColor" />
                <span className="font-semibold">{course.rating}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                ({course.reviewCount.toLocaleString()} {language === 'mn' ? 'үнэлгээ' : 'reviews'})
              </span>
            </div>
            
            {/* Price */}
            <div className="text-right">
              <span className="text-lg font-bold text-primary">
                {formatPrice(course.price, course.currency)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <div className="flex w-full gap-2">
          <Button 
            asChild
            variant="outline" 
            size="sm" 
            className="flex-1 hover:bg-primary/5"
          >
            <Link to={`/trainings/${course.id}`}>
              {language === 'mn' ? 'Үзэх' : 'Preview'}
            </Link>
          </Button>
          <Button 
            variant="default"
            size="sm"
            className="flex-1 bg-accent hover:bg-accent/90"
            onClick={addToCart}
            disabled={isAddingToCart}
          >
            {isAddingToCart 
              ? (language === 'mn' ? 'Нэмж байна...' : 'Adding...') 
              : (language === 'mn' ? 'Худалдаж авах' : 'Buy')}
          </Button>
          <Button 
            asChild
            size="sm"
            className="flex-1 bg-gradient-hero hover:shadow-glow transition-all duration-300"
          >
            <Link to={`/trainings/${course.id}`}>
              {language === 'mn' ? 'Бүртгүүлэх' : 'Enroll Now'}
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};