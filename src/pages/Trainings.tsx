import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AITrainingAssistant } from "@/components/AITrainingAssistant";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Grid, List, ShoppingCart, Play, Loader2, Star, DollarSign } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WishlistButton } from "@/components/WishlistButton";

interface Video {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  is_free: boolean;
  price: number;
  duration_seconds: number | null;
  status: string;
  category_id: string | null;
  created_at: string;
  categories?: {
    name: string;
    name_mn: string;
  } | null;
  profiles: {
    full_name: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
  name_mn: string;
}

export default function Trainings() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriceFilter, setSelectedPriceFilter] = useState("all");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [cartLoading, setCartLoading] = useState<string | null>(null);
  const [avgRatings, setAvgRatings] = useState<Record<string, { avg: number; count: number }>>({});

  useEffect(() => {
    // Check for category filter in URL
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategoryFilter(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    loadCategories();
    loadVideos();
  }, []);

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

  const loadVideos = async () => {
    try {
      setLoading(true);
      const { data: videosData, error: videosError } = await supabase
        .from('training_videos')
        .select('*, profiles(full_name), categories(name, name_mn)')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (videosError) throw videosError;

      // Load ratings
      const { data: ratingsData } = await supabase
        .from('ratings')
        .select('video_id, stars');

      // Calculate average ratings
      const ratingsMap: Record<string, { sum: number; count: number }> = {};
      ratingsData?.forEach(rating => {
        if (!ratingsMap[rating.video_id]) {
          ratingsMap[rating.video_id] = { sum: 0, count: 0 };
        }
        ratingsMap[rating.video_id].sum += rating.stars;
        ratingsMap[rating.video_id].count++;
      });

      const avgRatingsMap: Record<string, { avg: number; count: number }> = {};
      Object.entries(ratingsMap).forEach(([videoId, { sum, count }]) => {
        avgRatingsMap[videoId] = { avg: sum / count, count };
      });

      setAvgRatings(avgRatingsMap);
      
      // Transform the data to handle profiles and categories array
      const transformedVideos = (videosData || []).map(video => ({
        ...video,
        profiles: Array.isArray(video.profiles) ? video.profiles[0] : video.profiles,
        categories: Array.isArray(video.categories) ? video.categories[0] : video.categories
      }));
      
      setVideos(transformedVideos as Video[]);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error loading videos',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (video: Video) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to add items to cart',
      });
      navigate('/auth');
      return;
    }

    setCartLoading(video.id);
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
        videoId: video.id,
        title: video.title,
        price: video.price,
        quantity: 1
      };

      if (!cart) {
        // Create new cart
        const { error: insertError } = await supabase
          .from('carts')
          .insert({
            owner_id: user.id,
            items: [cartItem] as any,
            total: video.price,
            status: 'open'
          });

        if (insertError) throw insertError;
      } else {
        // Update existing cart
        const existingItems = (cart.items as any) || [];
        const existingItemIndex = existingItems.findIndex((item: any) => item.videoId === video.id);

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
        title: 'Added to cart',
        description: `${video.title} has been added to your cart`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setCartLoading(null);
    }
  };

  // Filter and sort videos
  const filteredVideos = videos
    .filter(video => {
      const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (video.description?.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesPrice = selectedPriceFilter === "all" || 
                          (selectedPriceFilter === "free" && video.is_free) ||
                          (selectedPriceFilter === "paid" && !video.is_free);
      
      const matchesCategory = selectedCategoryFilter === "all" || 
                             video.category_id === selectedCategoryFilter;
      
      return matchesSearch && matchesPrice && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          const ratingA = avgRatings[a.id]?.avg || 0;
          const ratingB = avgRatings[b.id]?.avg || 0;
          return ratingB - ratingA;
        case "newest":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  if (loading) {
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
        {/* Page Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-3xl lg:text-5xl font-bold mb-4">
            {language === 'en' ? 'Browse' : 'Үзэх'}
            <span className="gradient-text">
              {language === 'en' ? ' Trainings' : ' сургалтууд'}
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'en' 
              ? 'Discover professional training videos from certified trainers.'
              : 'Батлагдсан багш нараас мэргэжлийн сургалтын видеог олоорой.'
            }
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 animate-slide-up">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder={language === 'en' ? "Search videos..." : "Видео хайх..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="w-5 h-5 mr-2" />
                {language === 'en' ? 'Filters' : 'Шүүлтүүр'}
              </Button>
            </div>

            <div className={`${showFilters || window.innerWidth >= 1024 ? 'block' : 'hidden'} lg:block`}>
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <Select value={selectedPriceFilter} onValueChange={setSelectedPriceFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder={language === 'en' ? "Price" : "Үнэ"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder={language === 'en' ? "Category" : "Ангилал"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{language === 'en' ? 'All Categories' : 'Бүх ангилал'}</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {language === 'mn' ? category.name_mn : category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder={language === 'en' ? "Sort By" : "Эрэмбэлэх"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">{language === 'en' ? 'Newest First' : 'Шинэ эхэндээ'}</SelectItem>
                      <SelectItem value="price-low">{language === 'en' ? 'Price: Low to High' : 'Үнэ: Бага-их'}</SelectItem>
                      <SelectItem value="price-high">{language === 'en' ? 'Price: High to Low' : 'Үнэ: Их-бага'}</SelectItem>
                      <SelectItem value="rating">{language === 'en' ? 'Highest Rated' : 'Өндөр үнэлгээтэй'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold">
              {language === 'en' ? 'Available Videos' : 'Боломжтой видеонууд'}
            </h2>
            <Badge variant="secondary">
              {filteredVideos.length} {language === 'en' ? 'videos' : 'видео'}
            </Badge>
          </div>
        </div>

        {/* Video Grid */}
        {filteredVideos.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredVideos.map((video, index) => (
              <Card 
                key={video.id} 
                className="hover:shadow-lg transition-shadow animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                    <Play className="h-12 w-12 text-muted-foreground" />
                  </div>

                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`font-semibold ${!video.is_free ? 'text-muted-foreground' : ''}`}>
                      {video.title}
                    </h3>
                    {video.is_free ? (
                      <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
                        Free
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        ${video.price.toFixed(2)}
                      </Badge>
                    )}
                  </div>

                  {video.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {video.description}
                    </p>
                  )}

                  {video.categories && (
                    <Badge variant="outline" className="mb-3">
                      {language === 'mn' ? video.categories.name_mn : video.categories.name}
                    </Badge>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {avgRatings[video.id] && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {avgRatings[video.id].avg.toFixed(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({avgRatings[video.id].count})
                          </span>
                        </div>
                      )}
                    </div>
                    {video.duration_seconds && (
                      <span className="text-xs text-muted-foreground">
                        {Math.floor(video.duration_seconds / 60)}:{(video.duration_seconds % 60).toString().padStart(2, '0')}
                      </span>
                    )}
                  </div>

                  {video.profiles && (
                    <p className="text-xs text-muted-foreground mb-4">
                      By {video.profiles.full_name}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <div className="flex-1">
                      {video.is_free ? (
                        <Button 
                          className="w-full"
                          onClick={() => window.open(video.youtube_url, '_blank')}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Watch Now
                        </Button>
                      ) : (
                        <>
                          <div className="flex gap-2 mb-2">
                            <Button 
                              variant="outline"
                              className="flex-1"
                              onClick={() => addToCart(video)}
                              disabled={cartLoading === video.id}
                            >
                              {cartLoading === video.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <ShoppingCart className="h-4 w-4 mr-2" />
                              )}
                              Add to Cart
                            </Button>
                            <WishlistButton videoId={video.id} userId={user?.id} size="icon" />
                          </div>
                          <Button 
                            className="w-full"
                            onClick={async () => {
                              await addToCart(video);
                              navigate('/cart');
                            }}
                            disabled={cartLoading === video.id}
                          >
                            <DollarSign className="h-4 w-4 mr-2" />
                            Buy Now
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">
              {language === 'en' ? 'No videos found' : 'Видео олдсонгүй'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {language === 'en' 
                ? 'Try adjusting your search criteria.'
                : 'Хайлтын нөхцөлөө өөрчлөх эсвэл бүх ангиллыг үзэж үзээрэй.'
              }
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedPriceFilter("all");
              }}
              className="bg-gradient-hero"
            >
              {language === 'en' ? 'Reset Filters' : 'Шүүлтүүрийг цэвэрлэх'}
            </Button>
          </div>
        )}
      </main>

      <Footer />
      
      {/* Floating AI Assistant */}
      <AITrainingAssistant floating />
    </div>
  );
}
