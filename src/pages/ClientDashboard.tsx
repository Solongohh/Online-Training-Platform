import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Video, Clock, GraduationCap, Heart, Star, MessageSquare } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useTrainerRole } from '@/hooks/useTrainerRole';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoRating } from '@/components/VideoRating';
import { VideoReviews } from '@/components/VideoReviews';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface VideoData {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  is_free: boolean;
  price: number;
  duration_seconds: number | null;
}

interface VideoView {
  id: string;
  viewed_at: string;
  training_videos: VideoData;
}

interface Rating {
  id: string;
  stars: number;
  video_id: string;
  training_videos: VideoData;
}

interface Review {
  id: string;
  text: string;
  created_at: string;
  video_id: string;
  training_videos: VideoData;
}

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isTrainer } = useTrainerRole(user);
  const { toast } = useToast();
  const [viewHistory, setViewHistory] = useState<VideoView[]>([]);
  const [likedVideos, setLikedVideos] = useState<string[]>([]);
  const [myRatings, setMyRatings] = useState<Rating[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasApplication, setHasApplication] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string>('');
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [activeTab, setActiveTab] = useState('browsed');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load view history
      const { data: viewsData, error: viewsError } = await supabase
        .from('video_views')
        .select('*, training_videos(id, title, description, youtube_url, is_free, price, duration_seconds)')
        .eq('user_id', user?.id)
        .order('viewed_at', { ascending: false })
        .limit(20);

      if (viewsError) throw viewsError;
      setViewHistory(viewsData || []);

      // Load liked videos from profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('liked_video_ids')
        .eq('id', user?.id)
        .single();

      setLikedVideos(profileData?.liked_video_ids || []);

      // Load my ratings
      const { data: ratingsData } = await supabase
        .from('ratings')
        .select('*, training_videos(id, title, description, youtube_url, is_free, price, duration_seconds)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      setMyRatings(ratingsData || []);

      // Load my reviews
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*, training_videos(id, title, description, youtube_url, is_free, price, duration_seconds)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      setMyReviews(reviewsData || []);

      // Check for trainer application
      const { data: appData } = await supabase
        .from('trainer_applications')
        .select('status')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (appData) {
        setHasApplication(true);
        setApplicationStatus(appData.status);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (videoId: string) => {
    try {
      const isLiked = likedVideos.includes(videoId);
      const newLikedVideos = isLiked
        ? likedVideos.filter(id => id !== videoId)
        : [...likedVideos, videoId];

      const { error } = await supabase
        .from('profiles')
        .update({ liked_video_ids: newLikedVideos })
        .eq('id', user?.id);

      if (error) throw error;
      setLikedVideos(newLikedVideos);
      toast({
        title: isLiked ? 'Removed from liked videos' : 'Added to liked videos',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const getLikedVideosData = async () => {
    if (likedVideos.length === 0) return [];
    const { data } = await supabase
      .from('training_videos')
      .select('*')
      .in('id', likedVideos);
    return data || [];
  };

  const [likedVideosData, setLikedVideosData] = useState<VideoData[]>([]);

  useEffect(() => {
    if (likedVideos.length > 0) {
      getLikedVideosData().then(setLikedVideosData);
    } else {
      setLikedVideosData([]);
    }
  }, [likedVideos]);

  if (authLoading || loading) {
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
            <p className="text-muted-foreground">Manage your trainings, ratings, and reviews</p>
          </div>
          <div className="flex gap-2">
            {!isTrainer && !hasApplication && (
              <Button onClick={() => navigate('/apply-trainer')} className="gap-2">
                <GraduationCap className="h-4 w-4" />
                Want to become Trainer?
              </Button>
            )}
            
            {hasApplication && applicationStatus === 'pending' && (
              <Badge variant="secondary" className="py-2 px-4">
                Application Pending Review
              </Badge>
            )}
            
            {hasApplication && applicationStatus === 'rejected' && (
              <Badge variant="destructive" className="py-2 px-4">
                Application Rejected
              </Badge>
            )}
            
            <Button variant="outline" onClick={() => navigate('/trainings')}>
              Browse Trainings
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="browsed">
              <Clock className="h-4 w-4 mr-2" />
              Browsed ({viewHistory.length})
            </TabsTrigger>
            <TabsTrigger value="liked">
              <Heart className="h-4 w-4 mr-2" />
              Liked ({likedVideos.length})
            </TabsTrigger>
            <TabsTrigger value="ratings">
              <Star className="h-4 w-4 mr-2" />
              My Ratings ({myRatings.length})
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <MessageSquare className="h-4 w-4 mr-2" />
              My Reviews ({myReviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browsed">
            <Card>
              <CardHeader>
                <CardTitle>Recently Browsed Trainings</CardTitle>
              </CardHeader>
              <CardContent>
                {viewHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No viewing history yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start browsing trainings to see them here
                    </p>
                    <Button onClick={() => navigate('/trainings')}>
                      Browse Trainings
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {viewHistory.map((view) => (
                      <Card key={view.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                            <Video className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold">{view.training_videos.title}</h3>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleLike(view.training_videos.id)}
                            >
                              <Heart
                                className={`h-4 w-4 ${
                                  likedVideos.includes(view.training_videos.id)
                                    ? 'fill-red-500 text-red-500'
                                    : ''
                                }`}
                              />
                            </Button>
                          </div>
                          {view.training_videos.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {view.training_videos.description}
                            </p>
                          )}
                          <div className="flex items-center text-xs text-muted-foreground mb-3">
                            <Clock className="h-3 w-3 mr-1" />
                            Viewed {new Date(view.viewed_at).toLocaleDateString()}
                          </div>
                          <div className="space-y-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full"
                                  onClick={() => setSelectedVideo(view.training_videos)}
                                >
                                  <Star className="h-4 w-4 mr-2" />
                                  Rate & Review
                                </Button>
                              </DialogTrigger>
                              {selectedVideo && (
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>{selectedVideo.title}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-semibold mb-2">Your Rating</h4>
                                      <VideoRating
                                        videoId={selectedVideo.id}
                                        userId={user!.id}
                                        currentRating={myRatings.find(r => r.video_id === selectedVideo.id)?.stars}
                                        onRatingChange={loadData}
                                      />
                                    </div>
                                    <VideoReviews videoId={selectedVideo.id} userId={user!.id} />
                                  </div>
                                </DialogContent>
                              )}
                            </Dialog>
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={() => window.open(view.training_videos.youtube_url, '_blank')}
                            >
                              Watch Again
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="liked">
            <Card>
              <CardHeader>
                <CardTitle>Liked Trainings</CardTitle>
              </CardHeader>
              <CardContent>
                {likedVideosData.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No liked videos yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start liking videos to save them here
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {likedVideosData.map((video) => (
                      <Card key={video.id}>
                        <CardContent className="p-4">
                          <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                            <Video className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <h3 className="font-semibold mb-2">{video.title}</h3>
                          {video.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {video.description}
                            </p>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            className="w-full mb-2"
                            onClick={() => toggleLike(video.id)}
                          >
                            <Heart className="h-4 w-4 mr-2" />
                            Unlike
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => window.open(video.youtube_url, '_blank')}
                          >
                            Watch Video
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ratings">
            <Card>
              <CardHeader>
                <CardTitle>My Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                {myRatings.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No ratings yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start rating videos you've watched
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myRatings.map((rating) => (
                      <Card key={rating.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{rating.training_videos.title}</h3>
                              <div className="flex items-center gap-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < rating.stars
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-muted-foreground'
                                    }`}
                                  />
                                ))}
                                <span className="ml-2 text-sm text-muted-foreground">
                                  {rating.stars}/5
                                </span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(rating.training_videos.youtube_url, '_blank')}
                            >
                              Watch
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>My Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {myReviews.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Share your thoughts about trainings you've watched
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myReviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold">{review.training_videos.title}</h3>
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm mb-3">{review.text}</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(review.training_videos.youtube_url, '_blank')}
                          >
                            Watch Video
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
