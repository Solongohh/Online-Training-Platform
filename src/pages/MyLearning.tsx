import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, CheckCircle, Clock, Loader2, Download, Award } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EnrolledVideo {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  price: number;
  progress_percentage: number;
  completed: boolean;
  last_watched_at: string;
  categories: {
    name: string;
    name_mn: string;
  } | null;
}

export default function MyLearning() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [enrolledVideos, setEnrolledVideos] = useState<EnrolledVideo[]>([]);
  const [downloadingCert, setDownloadingCert] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadEnrolledVideos();
  }, [user]);

  const loadEnrolledVideos = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get purchased videos
      const { data: purchases, error: purchasesError } = await supabase
        .from('purchased_videos')
        .select('video_id')
        .eq('user_id', user.id);

      if (purchasesError) throw purchasesError;

      if (!purchases || purchases.length === 0) {
        setEnrolledVideos([]);
        return;
      }

      const videoIds = purchases.map(p => p.video_id);

      // Get video details
      const { data: videos, error: videosError } = await supabase
        .from('training_videos')
        .select('id, title, description, youtube_url, price, categories(name, name_mn)')
        .in('id', videoIds);

      if (videosError) throw videosError;

      // Get progress for each video
      const { data: progressData, error: progressError } = await supabase
        .from('video_progress')
        .select('video_id, progress_percentage, completed, last_watched_at')
        .eq('user_id', user.id)
        .in('video_id', videoIds);

      if (progressError) throw progressError;

      // Combine data
      const progressMap = new Map(
        progressData?.map(p => [p.video_id, p]) || []
      );

      const enrichedVideos = videos?.map(video => ({
        ...video,
        progress_percentage: progressMap.get(video.id)?.progress_percentage || 0,
        completed: progressMap.get(video.id)?.completed || false,
        last_watched_at: progressMap.get(video.id)?.last_watched_at || new Date().toISOString(),
        categories: Array.isArray(video.categories) ? video.categories[0] : video.categories,
      })) || [];

      setEnrolledVideos(enrichedVideos as EnrolledVideo[]);
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

  const inProgressVideos = enrolledVideos.filter(v => !v.completed && v.progress_percentage > 0);
  const notStartedVideos = enrolledVideos.filter(v => v.progress_percentage === 0);
  const completedVideos = enrolledVideos.filter(v => v.completed);

  const downloadCertificate = async (videoId: string, videoTitle: string) => {
    if (!user) return;

    try {
      setDownloadingCert(videoId);
      
      const { data, error } = await supabase.functions.invoke('generate-certificate', {
        body: { videoId, userId: user.id }
      });

      if (error) throw error;

      // Download the certificate
      const link = document.createElement('a');
      link.href = data.certificate;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: language === 'en' ? 'Success' : 'Амжилттай',
        description: language === 'en' 
          ? 'Certificate downloaded successfully' 
          : 'Сертификат амжилттай татагдлаа',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Error' : 'Алдаа',
        description: error.message,
      });
    } finally {
      setDownloadingCert(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const renderVideoCard = (video: EnrolledVideo) => (
    <Card key={video.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
          <Play className="h-12 w-12 text-muted-foreground" />
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="font-semibold mb-1">{video.title}</h3>
            {video.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {video.description}
              </p>
            )}
          </div>

          {video.categories && (
            <Badge variant="outline">
              {language === 'mn' ? video.categories.name_mn : video.categories.name}
            </Badge>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {language === 'mn' ? 'Явц' : 'Progress'}
              </span>
              <span className="font-medium">{video.progress_percentage}%</span>
            </div>
            <Progress value={video.progress_percentage} className="h-2" />
          </div>

          {video.completed && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {language === 'mn' ? 'Дууссан' : 'Completed'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => downloadCertificate(video.id, video.title)}
                disabled={downloadingCert === video.id}
              >
                {downloadingCert === video.id ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Award className="h-4 w-4 mr-2" />
                )}
                {language === 'mn' ? 'Сертификат татах' : 'Download Certificate'}
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {language === 'mn' ? 'Сүүлд үзсэн' : 'Last watched'}: {' '}
              {new Date(video.last_watched_at).toLocaleDateString()}
            </span>
          </div>

          <Button 
            className="w-full"
            onClick={() => window.open(video.youtube_url, '_blank')}
          >
            <Play className="h-4 w-4 mr-2" />
            {video.completed 
              ? (language === 'mn' ? 'Дахин үзэх' : 'Watch Again')
              : (language === 'mn' ? 'Үргэлжлүүлэх' : 'Continue Learning')
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 lg:px-6 py-8">
        <div className="mb-12">
          <h1 className="text-3xl lg:text-5xl font-bold mb-4">
            {language === 'mn' ? 'Миний' : 'My'}
            <span className="gradient-text">
              {language === 'mn' ? ' сургалтууд' : ' Learning'}
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            {language === 'mn' 
              ? 'Таны бүртгүүлсэн сургалтууд болон явцын мэдээлэл'
              : 'Your enrolled trainings and progress tracking'
            }
          </p>
        </div>

        {enrolledVideos.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">
              {language === 'mn' ? 'Сургалт олдсонгүй' : 'No enrolled trainings'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {language === 'mn'
                ? 'Та одоогоор ямар ч сургалтанд бүртгүүлээгүй байна.'
                : "You haven't enrolled in any trainings yet."
              }
            </p>
            <Button onClick={() => navigate('/trainings')}>
              {language === 'mn' ? 'Сургалт хайх' : 'Browse Trainings'}
            </Button>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-4 mb-8">
              <TabsTrigger value="all">
                {language === 'mn' ? 'Бүгд' : 'All'} ({enrolledVideos.length})
              </TabsTrigger>
              <TabsTrigger value="progress">
                {language === 'mn' ? 'Явагдаж буй' : 'In Progress'} ({inProgressVideos.length})
              </TabsTrigger>
              <TabsTrigger value="notstarted">
                {language === 'mn' ? 'Эхлээгүй' : 'Not Started'} ({notStartedVideos.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                {language === 'mn' ? 'Дууссан' : 'Completed'} ({completedVideos.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {enrolledVideos.map(renderVideoCard)}
              </div>
            </TabsContent>

            <TabsContent value="progress">
              {inProgressVideos.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {inProgressVideos.map(renderVideoCard)}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">
                    {language === 'mn' ? 'Явагдаж буй сургалт байхгүй' : 'No trainings in progress'}
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="notstarted">
              {notStartedVideos.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {notStartedVideos.map(renderVideoCard)}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">
                    {language === 'mn' ? 'Эхлээгүй сургалт байхгүй' : 'No trainings waiting to start'}
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="completed">
              {completedVideos.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {completedVideos.map(renderVideoCard)}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">
                    {language === 'mn' ? 'Дууссан сургалт байхгүй' : 'No completed trainings yet'}
                  </p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
