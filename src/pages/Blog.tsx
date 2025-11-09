import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Calendar, Eye, ArrowRight, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  title_mn: string;
  slug: string;
  excerpt: string;
  excerpt_mn: string;
  category: string;
  category_mn: string;
  featured_image: string | null;
  views_count: number;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

export default function Blog() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*, profiles(full_name)')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData = (data || []).map((post: any) => ({
        ...post,
        profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles
      }));

      setPosts(transformedData as BlogPost[]);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: language === 'mn' ? 'Алдаа' : 'Error',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.title_mn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt_mn.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(posts.map(p => p.category)));

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
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-5xl font-bold mb-4">
            {language === 'mn' ? 'Блог' : 'Blog'}
            <span className="gradient-text">
              {language === 'mn' ? ' & Зөвлөгөө' : ' & Insights'}
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'mn'
              ? 'Сургалтын зөвлөмж, амжилтын түүх болон салбарын чиг хандлага'
              : 'Training tips, success stories, and industry trends'
            }
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={language === 'mn' ? 'Хайх...' : 'Search...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('all')}
              >
                {language === 'mn' ? 'Бүгд' : 'All'}
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        {filteredPosts.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">
              {language === 'mn' ? 'Нийтлэл олдсонгүй' : 'No posts found'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'mn'
                ? 'Өөр түлхүүр үг ашиглан хайж үзнэ үү'
                : 'Try searching with different keywords'
              }
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post, index) => (
              <Card 
                key={post.id}
                className="hover:shadow-lg transition-all cursor-pointer group"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate(`/blog/${post.slug}`)}
              >
                <CardContent className="p-0">
                  {post.featured_image ? (
                    <div className="aspect-video bg-muted overflow-hidden">
                      <img 
                        src={post.featured_image} 
                        alt={language === 'mn' ? post.title_mn : post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-hero flex items-center justify-center">
                      <span className="text-4xl">📝</span>
                    </div>
                  )}
                  
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {language === 'mn' ? post.category_mn : post.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        {post.views_count}
                      </div>
                    </div>

                    <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {language === 'mn' ? post.title_mn : post.title}
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {language === 'mn' ? post.excerpt_mn : post.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="group-hover:translate-x-1 transition-transform"
                      >
                        {language === 'mn' ? 'Унших' : 'Read'}
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
