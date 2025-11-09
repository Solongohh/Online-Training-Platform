import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, User, Trash2, CheckCircle, XCircle, Clock, GraduationCap, BarChart3, TrendingUp, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Profile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: 'admin' | 'user' | 'trainer';
}

interface TrainingVideo {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  status: 'uploaded' | 'pending' | 'approved' | 'rejected';
  trainer_id: string;
  created_at: string;
  trainer_name?: string;
  trainer_email?: string;
}

interface TrainerApplication {
  id: string;
  user_id: string;
  full_name: string;
  bio: string;
  experience: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  profiles?: {
    email: string;
  };
}

export default function Admin() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, loading: roleLoading, checked } = useUserRole(user);
  const { toast } = useToast();
  const { language } = useLanguage();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [applications, setApplications] = useState<TrainerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // Only redirect if we've checked roles and a direct backend verification also says not admin
    if (user && checked && !roleLoading && !isAdmin) {
      (async () => {
        try {
          const { data, error } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
          if (error) throw error;
          if (!data) {
          toast({
            variant: 'destructive',
            title: language === 'en' ? 'Access Denied' : 'Хандах эрх хаагдсан',
            description: language === 'en' ? 'You do not have admin privileges' : 'Танд админ эрх байхгүй байна',
          });
          navigate('/');
        }
      } catch (e) {
        // On error, be safe and redirect
        navigate('/');
      }
      })();
    }
  }, [user, checked, isAdmin, roleLoading, navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [profilesResult, rolesResult, videosResult, applicationsResult, ratingsResult, blogResult, reviewsResult] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('user_roles').select('*'),
        supabase.from('training_videos').select('*, profiles(full_name, email)').order('created_at', { ascending: false }),
        supabase.from('trainer_applications').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
        supabase.from('ratings').select('*, training_videos(title, trainer_id, profiles(full_name))').order('created_at', { ascending: false }),
        supabase.from('blog_posts').select('*, profiles(full_name, email)').order('created_at', { ascending: false }),
        supabase.from('reviews').select('*, profiles(full_name), training_videos(title)').order('created_at', { ascending: false })
      ]);

      if (profilesResult.error) throw profilesResult.error;
      if (rolesResult.error) throw rolesResult.error;
      if (videosResult.error) throw videosResult.error;
      if (applicationsResult.error) throw applicationsResult.error;

      // Enrich videos with trainer info
      const enrichedVideos = (videosResult.data || []).map(video => {
        const trainerProfile = Array.isArray(video.profiles) ? video.profiles[0] : video.profiles;
        return {
          ...video,
          trainer_name: trainerProfile?.full_name,
          trainer_email: trainerProfile?.email
        };
      });

      // Enrich applications
      const enrichedApplications = (applicationsResult.data || []).map(app => {
        const profile = profilesResult.data?.find(p => p.id === app.user_id);
        return {
          ...app,
          status: app.status as 'pending' | 'approved' | 'rejected',
          profiles: profile ? { email: profile.email } : undefined
        };
      });

      // Calculate analytics
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const ratingsData = ratingsResult.data || [];
      
      // Weekly ratings
      const weeklyRatings = ratingsData.filter(r => new Date(r.created_at) >= weekAgo);
      const weeklyVideoRatings = calculateVideoRatings(weeklyRatings);
      
      // Monthly ratings
      const monthlyRatings = ratingsData.filter(r => new Date(r.created_at) >= monthAgo);
      const monthlyVideoRatings = calculateVideoRatings(monthlyRatings);

      // Video status counts
      const statusCounts = {
        uploaded: enrichedVideos.filter(v => v.status === 'uploaded').length,
        pending: enrichedVideos.filter(v => v.status === 'pending').length,
        approved: enrichedVideos.filter(v => v.status === 'approved').length,
        rejected: enrichedVideos.filter(v => v.status === 'rejected').length,
      };

      // Trainer performance
      const trainerStats = calculateTrainerStats(enrichedVideos, ratingsData);

      // Load revenue data
      const { data: paidCarts } = await supabase
        .from('carts')
        .select('*, training_videos!inner(title, price, trainer_id, profiles(full_name))')
        .eq('status', 'paid');

      const revenueStats = calculateRevenueStats(paidCarts || []);

      setRevenueData(revenueStats);

      setAnalyticsData({
        weeklyVideoRatings,
        monthlyVideoRatings,
        statusCounts,
        trainerStats,
        totalRatings: ratingsData.length
      });

      setProfiles(profilesResult.data || []);
      setRoles(rolesResult.data || []);
      setVideos(enrichedVideos);
      setApplications(enrichedApplications);
      setBlogPosts(blogResult.data || []);
      setReviews(reviewsResult.data || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Error' : 'Алдаа',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateVideoRatings = (ratings: any[]) => {
    const videoMap = new Map();
    
    ratings.forEach(rating => {
      const videoId = rating.video_id;
      if (!videoMap.has(videoId)) {
        videoMap.set(videoId, {
          videoId,
          title: rating.training_videos?.title || 'Unknown',
          ratings: [],
          count: 0,
          avgStars: 0
        });
      }
      const video = videoMap.get(videoId);
      video.ratings.push(rating.stars);
      video.count++;
    });

    const results = Array.from(videoMap.values()).map(video => ({
      ...video,
      avgStars: video.ratings.reduce((a: number, b: number) => a + b, 0) / video.count
    }));

    return results.sort((a, b) => b.count - a.count).slice(0, 10);
  };

  const calculateTrainerStats = (videos: any[], ratings: any[]) => {
    const trainerMap = new Map();

    videos.forEach(video => {
      const trainerId = video.trainer_id;
      if (!trainerMap.has(trainerId)) {
        trainerMap.set(trainerId, {
          trainerId,
          name: video.trainer_name || 'Unknown',
          totalVideos: 0,
          approved: 0,
          pending: 0,
          rejected: 0,
          totalRatings: 0,
          avgRating: 0,
          ratingSum: 0
        });
      }
      const trainer = trainerMap.get(trainerId);
      trainer.totalVideos++;
      if (video.status === 'approved') trainer.approved++;
      if (video.status === 'pending') trainer.pending++;
      if (video.status === 'rejected') trainer.rejected++;
    });

    ratings.forEach(rating => {
      const trainerId = rating.training_videos?.trainer_id;
      if (trainerId && trainerMap.has(trainerId)) {
        const trainer = trainerMap.get(trainerId);
        trainer.totalRatings++;
        trainer.ratingSum += rating.stars;
      }
    });

    return Array.from(trainerMap.values()).map(trainer => ({
      ...trainer,
      avgRating: trainer.totalRatings > 0 ? trainer.ratingSum / trainer.totalRatings : 0,
      approvalRate: trainer.totalVideos > 0 ? (trainer.approved / trainer.totalVideos) * 100 : 0
    })).sort((a, b) => b.totalVideos - a.totalVideos);
  };

  const calculateRevenueStats = (paidCarts: any[]) => {
    let totalRevenue = 0;
    const videoRevenue: Record<string, { title: string; revenue: number; count: number }> = {};
    const trainerRevenue: Record<string, { name: string; revenue: number; orders: number }> = {};
    const companyRevenue: Record<string, { companyId: string; revenue: number; orders: number }> = {};

    paidCarts.forEach(cart => {
      totalRevenue += parseFloat(cart.total || 0);
      
      const items = (cart.items as any) || [];
      items.forEach((item: any) => {
        // Video revenue
        if (!videoRevenue[item.videoId]) {
          videoRevenue[item.videoId] = {
            title: item.title,
            revenue: 0,
            count: 0
          };
        }
        videoRevenue[item.videoId].revenue += item.price * item.quantity;
        videoRevenue[item.videoId].count += item.quantity;
      });

      // Company revenue (if applicable)
      if (cart.company_id) {
        if (!companyRevenue[cart.company_id]) {
          companyRevenue[cart.company_id] = {
            companyId: cart.company_id,
            revenue: 0,
            orders: 0
          };
        }
        companyRevenue[cart.company_id].revenue += parseFloat(cart.total || 0);
        companyRevenue[cart.company_id].orders++;
      }
    });

    // Sort by revenue
    const topVideos = Object.entries(videoRevenue)
      .map(([id, data]) => ({ videoId: id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const topCompanies = Object.entries(companyRevenue)
      .map(([id, data]) => ({ ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      totalRevenue,
      totalOrders: paidCarts.length,
      topVideos,
      topCompanies
    };
  };

  const toggleRole = async (userId: string, role: 'admin' | 'trainer') => {
    try {
      const existingRole = roles.find(r => r.user_id === userId && r.role === role);
      
      if (existingRole) {
        await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', role);
        toast({
          title: language === 'en' ? 'Success' : 'Амжилттай',
          description: language === 'en' ? `${role} role removed` : `${role} эрх хасагдлаа`,
        });
      } else {
        await supabase.from('user_roles').insert({ user_id: userId, role });
        toast({
          title: language === 'en' ? 'Success' : 'Амжилттай',
          description: language === 'en' ? `${role} role assigned` : `${role} эрх олгогдлоо`,
        });
      }
      
      await loadData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Error' : 'Алдаа',
        description: error.message,
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      
      if (error) throw error;

      toast({
        title: language === 'en' ? 'Success' : 'Амжилттай',
        description: language === 'en' ? 'User deleted successfully' : 'Хэрэглэгч амжилттай устгагдлаа',
      });
      
      await loadData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Error' : 'Алдаа',
        description: error.message,
      });
    }
  };

  const hasRole = (userId: string, role: 'admin' | 'trainer'): boolean => {
    return !!roles.find(r => r.user_id === userId && r.role === role);
  };

  const updateVideoStatus = async (videoId: string, status: 'approved' | 'rejected') => {
    try {
      // Optimistic update - remove from UI immediately
      setVideos(prev => prev.map(v => 
        v.id === videoId ? { ...v, status } : v
      ));

      const { error } = await supabase
        .from('training_videos')
        .update({ status })
        .eq('id', videoId);

      if (error) throw error;

      toast({
        title: language === 'en' ? 'Success' : 'Амжилттай',
        description: language === 'en' ? `Video ${status}` : `Видео ${status === 'approved' ? 'зөвшөөрөгдлөө' : 'татгалзсан'}`,
      });
      
      await loadData();
    } catch (error: any) {
      // Revert optimistic update on error
      await loadData();
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Error' : 'Алдаа',
        description: error.message,
      });
    }
  };

  const handleApplicationAction = async (
    applicationId: string,
    userId: string,
    action: 'approve' | 'reject'
  ) => {
    try {
      // Update application status
      const { error: appError } = await supabase
        .from('trainer_applications')
        .update({ status: action === 'approve' ? 'approved' : 'rejected' })
        .eq('id', applicationId);

      if (appError) throw appError;

      // If approved, add trainer role
      if (action === 'approve') {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'trainer' });

        if (roleError) throw roleError;
      }

      toast({
        title: language === 'en' ? 'Success' : 'Амжилттай',
        description: language === 'en' 
          ? `Application ${action === 'approve' ? 'approved' : 'rejected'}`
          : `Өргөдөл ${action === 'approve' ? 'зөвшөөрөгдлөө' : 'татгалзсан'}`,
      });
      
      await loadData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Error' : 'Алдаа',
        description: error.message,
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const deleteBlogPost = async (postId: string) => {
    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', postId);
      if (error) throw error;
      
      toast({
        title: language === 'en' ? 'Success' : 'Амжилттай',
        description: language === 'en' ? 'Blog post deleted' : 'Блог нийтлэл устгагдлаа',
      });
      await loadData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Error' : 'Алдаа',
        description: error.message,
      });
    }
  };

  const toggleBlogPublish = async (postId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ published: !currentStatus })
        .eq('id', postId);
      
      if (error) throw error;
      
      toast({
        title: language === 'en' ? 'Success' : 'Амжилттай',
        description: !currentStatus 
          ? (language === 'en' ? 'Post published' : 'Нийтлэл нийтлэгдлээ')
          : (language === 'en' ? 'Post unpublished' : 'Нийтлэл нуугдлаа'),
      });
      await loadData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Error' : 'Алдаа',
        description: error.message,
      });
    }
  };

  const toggleReviewModeration = async (reviewId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ moderated: !currentStatus })
        .eq('id', reviewId);
      
      if (error) throw error;
      
      toast({
        title: language === 'en' ? 'Success' : 'Амжилттай',
        description: !currentStatus 
          ? (language === 'en' ? 'Review approved' : 'Сэтгэгдэл зөвшөөрөгдлөө')
          : (language === 'en' ? 'Review hidden' : 'Сэтгэгдэл нуугдлаа'),
      });
      await loadData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Error' : 'Алдаа',
        description: error.message,
      });
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
      if (error) throw error;
      
      toast({
        title: language === 'en' ? 'Success' : 'Амжилттай',
        description: language === 'en' ? 'Review deleted' : 'Сэтгэгдэл устгагдлаа',
      });
      await loadData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Error' : 'Алдаа',
        description: error.message,
      });
    }
  };

  const pendingVideos = videos.filter(v => v.status === 'pending');
  const unmoderatedReviews = reviews.filter(r => !r.moderated);

  if (authLoading || roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {language === 'en' ? 'Admin Dashboard' : 'Админ самбар'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'en' ? 'Manage registered users and permissions' : 'Бүртгэлтэй хэрэглэгчид болон эрхийг удирдах'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/')}>
              {language === 'en' ? 'Back to Home' : 'Нүүр хуудас руу'}
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              {language === 'en' ? 'Sign Out' : 'Гарах'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">
              {language === 'en' ? 'Users' : 'Хэрэглэгчид'} ({profiles.length})
            </TabsTrigger>
            <TabsTrigger value="videos">
              {language === 'en' ? 'Video Approvals' : 'Видео зөвшөөрөл'}
              {pendingVideos.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingVideos.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="applications">
              {language === 'en' ? 'Trainer Applications' : 'Багшийн өргөдөл'}
              {applications.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {applications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="blog">
              {language === 'en' ? 'Blog Posts' : 'Блог нийтлэл'} ({blogPosts.length})
            </TabsTrigger>
            <TabsTrigger value="reviews">
              {language === 'en' ? 'Reviews' : 'Сэтгэгдэл'}
              {unmoderatedReviews.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unmoderatedReviews.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Analytics' : 'Тайлан'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'en' ? 'Registered Users' : 'Бүртгэлтэй хэрэглэгчид'}
                </CardTitle>
              </CardHeader>
              <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'en' ? 'Name' : 'Нэр'}</TableHead>
                  <TableHead>{language === 'en' ? 'Email' : 'Имэйл'}</TableHead>
                  <TableHead>{language === 'en' ? 'Role' : 'Эрх'}</TableHead>
                  <TableHead>{language === 'en' ? 'Registered' : 'Бүртгүүлсэн'}</TableHead>
                  <TableHead className="text-right">{language === 'en' ? 'Actions' : 'Үйлдэл'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => {
                  const isAdmin = hasRole(profile.id, 'admin');
                  const isTrainer = hasRole(profile.id, 'trainer');
                  return (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">
                        {profile.full_name || (language === 'en' ? 'No name' : 'Нэргүй')}
                      </TableCell>
                      <TableCell>{profile.email}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {isAdmin && (
                            <Badge variant="default">
                              <Shield className="h-3 w-3 mr-1" /> Admin
                            </Badge>
                          )}
                          {isTrainer && (
                            <Badge variant="secondary">
                              <User className="h-3 w-3 mr-1" /> Trainer
                            </Badge>
                          )}
                          {!isAdmin && !isTrainer && (
                            <Badge variant="outline">
                              <User className="h-3 w-3 mr-1" /> User
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(profile.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant={isAdmin ? 'destructive' : 'default'}
                            onClick={() => toggleRole(profile.id, 'admin')}
                            disabled={profile.id === user?.id}
                          >
                            {isAdmin 
                              ? (language === 'en' ? 'Remove Admin' : 'Админ хасах')
                              : (language === 'en' ? 'Make Admin' : 'Админ болгох')
                            }
                          </Button>
                          <Button
                            size="sm"
                            variant={isTrainer ? 'destructive' : 'secondary'}
                            onClick={() => toggleRole(profile.id, 'trainer')}
                          >
                            {isTrainer 
                              ? (language === 'en' ? 'Remove Trainer' : 'Багш хасах')
                              : (language === 'en' ? 'Make Trainer' : 'Багш болгох')
                            }
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={profile.id === user?.id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {language === 'en' ? 'Delete User' : 'Хэрэглэгч устгах'}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {language === 'en'
                                    ? `Are you sure you want to delete ${profile.email}? This action cannot be undone.`
                                    : `${profile.email} хэрэглэгчийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.`
                                  }
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {language === 'en' ? 'Cancel' : 'Цуцлах'}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteUser(profile.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {language === 'en' ? 'Delete' : 'Устгах'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="videos">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'en' ? 'Training Videos - Pending Approval' : 'Сургалтын видео - Зөвшөөрөл хүлээж байна'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingVideos.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">
                      {language === 'en' ? 'No pending videos' : 'Хүлээгдэж буй видео байхгүй'}
                    </h3>
                    <p className="text-muted-foreground">
                      {language === 'en' ? 'All videos have been reviewed' : 'Бүх видеог хянасан байна'}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{language === 'en' ? 'Title' : 'Гарчиг'}</TableHead>
                        <TableHead>{language === 'en' ? 'Trainer' : 'Багш'}</TableHead>
                        <TableHead>{language === 'en' ? 'Submitted' : 'Илгээсэн'}</TableHead>
                        <TableHead>{language === 'en' ? 'Status' : 'Төлөв'}</TableHead>
                        <TableHead className="text-right">{language === 'en' ? 'Actions' : 'Үйлдэл'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingVideos.map((video) => (
                        <TableRow key={video.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{video.title}</p>
                              {video.description && (
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {video.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {video.trainer_name || video.trainer_email || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            {new Date(video.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">
                              <Clock className="h-3 w-3 mr-1" />
                              {language === 'en' ? 'Pending' : 'Хүлээгдэж буй'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                onClick={() => updateVideoStatus(video.id, 'approved')}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                {language === 'en' ? 'Approve' : 'Зөвшөөрөх'}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateVideoStatus(video.id, 'rejected')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                {language === 'en' ? 'Reject' : 'Татгалзах'}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  {language === 'en' ? 'Trainer Applications' : 'Багшийн өргөдөл'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">
                      {language === 'en' ? 'No pending applications' : 'Хүлээгдэж буй өргөдөл байхгүй'}
                    </h3>
                    <p className="text-muted-foreground">
                      {language === 'en' ? 'All trainer applications have been reviewed' : 'Бүх багшийн өргөдлийг хянасан байна'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <Card key={app.id} className="border-2">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold">{app.full_name}</h3>
                              <p className="text-sm text-muted-foreground">{app.profiles?.email}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {language === 'en' ? 'Applied' : 'Өргөдөл гаргасан'}: {new Date(app.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApplicationAction(app.id, app.user_id, 'approve')}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                {language === 'en' ? 'Approve' : 'Зөвшөөрөх'}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleApplicationAction(app.id, app.user_id, 'reject')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                {language === 'en' ? 'Reject' : 'Татгалзах'}
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium text-sm mb-1">
                                {language === 'en' ? 'Bio' : 'Танилцуулга'}
                              </h4>
                              <p className="text-sm text-muted-foreground">{app.bio}</p>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-sm mb-1">
                                {language === 'en' ? 'Teaching Experience' : 'Багшлах туршлага'}
                              </h4>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{app.experience}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blog">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'en' ? 'Blog Posts Management' : 'Блог нийтлэл удирдлага'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {blogPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      {language === 'en' ? 'No blog posts yet' : 'Одоогоор блог нийтлэл байхгүй'}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{language === 'en' ? 'Title' : 'Гарчиг'}</TableHead>
                        <TableHead>{language === 'en' ? 'Author' : 'Зохиогч'}</TableHead>
                        <TableHead>{language === 'en' ? 'Category' : 'Ангилал'}</TableHead>
                        <TableHead>{language === 'en' ? 'Status' : 'Төлөв'}</TableHead>
                        <TableHead>{language === 'en' ? 'Created' : 'Үүсгэсэн'}</TableHead>
                        <TableHead className="text-right">{language === 'en' ? 'Actions' : 'Үйлдэл'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blogPosts.map((post: any) => {
                        const authorProfile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
                        return (
                          <TableRow key={post.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{post.title}</p>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {post.excerpt}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {authorProfile?.full_name || authorProfile?.email || 'Unknown'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{post.category}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={post.published ? 'default' : 'secondary'}>
                                {post.published 
                                  ? (language === 'en' ? 'Published' : 'Нийтлэгдсэн')
                                  : (language === 'en' ? 'Draft' : 'Ноорог')
                                }
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(post.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  variant={post.published ? 'outline' : 'default'}
                                  onClick={() => toggleBlogPublish(post.id, post.published)}
                                >
                                  {post.published 
                                    ? (language === 'en' ? 'Unpublish' : 'Нуух')
                                    : (language === 'en' ? 'Publish' : 'Нийтлэх')
                                  }
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="ghost">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        {language === 'en' ? 'Delete Blog Post' : 'Блог нийтлэл устгах'}
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {language === 'en'
                                          ? `Are you sure you want to delete "${post.title}"? This action cannot be undone.`
                                          : `"${post.title}" нийтлэлийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.`
                                        }
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        {language === 'en' ? 'Cancel' : 'Цуцлах'}
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteBlogPost(post.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        {language === 'en' ? 'Delete' : 'Устгах'}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'en' ? 'Review Moderation' : 'Сэтгэгдэл хянах'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      {language === 'en' ? 'No reviews yet' : 'Одоогоор сэтгэгдэл байхгүй'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review: any) => {
                      const userProfile = Array.isArray(review.profiles) ? review.profiles[0] : review.profiles;
                      const videoData = Array.isArray(review.training_videos) ? review.training_videos[0] : review.training_videos;
                      return (
                        <Card key={review.id} className={!review.moderated ? 'border-2 border-yellow-500' : 'border'}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium">{userProfile?.full_name || 'Anonymous'}</p>
                                  <Badge variant={review.moderated ? 'default' : 'secondary'}>
                                    {review.moderated 
                                      ? (language === 'en' ? 'Approved' : 'Зөвшөөрөгдсөн')
                                      : (language === 'en' ? 'Pending' : 'Хүлээгдэж буй')
                                    }
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  {language === 'en' ? 'Video: ' : 'Видео: '}{videoData?.title || 'Unknown'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(review.created_at).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant={review.moderated ? 'outline' : 'default'}
                                  onClick={() => toggleReviewModeration(review.id, review.moderated)}
                                >
                                  {review.moderated 
                                    ? (language === 'en' ? 'Hide' : 'Нуух')
                                    : (language === 'en' ? 'Approve' : 'Зөвшөөрөх')
                                  }
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="ghost">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        {language === 'en' ? 'Delete Review' : 'Сэтгэгдэл устгах'}
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {language === 'en'
                                          ? 'Are you sure you want to delete this review? This action cannot be undone.'
                                          : 'Энэ сэтгэгдлийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.'
                                        }
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        {language === 'en' ? 'Cancel' : 'Цуцлах'}
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteReview(review.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        {language === 'en' ? 'Delete' : 'Устгах'}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                            <p className="text-sm">{review.text}</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              {/* Video Status Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {language === 'en' ? 'Video Status Statistics' : 'Видеоны төлөвийн статистик'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsData && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">
                          {language === 'en' ? 'Uploaded' : 'Байршуулсан'}
                        </p>
                        <p className="text-2xl font-bold">{analyticsData.statusCounts.uploaded}</p>
                      </div>
                      <div className="bg-yellow-500/10 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">
                          {language === 'en' ? 'Pending' : 'Хүлээгдэж буй'}
                        </p>
                        <p className="text-2xl font-bold text-yellow-600">{analyticsData.statusCounts.pending}</p>
                      </div>
                      <div className="bg-green-500/10 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">
                          {language === 'en' ? 'Approved' : 'Зөвшөөрөгдсөн'}
                        </p>
                        <p className="text-2xl font-bold text-green-600">{analyticsData.statusCounts.approved}</p>
                      </div>
                      <div className="bg-red-500/10 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">
                          {language === 'en' ? 'Rejected' : 'Татгалзсан'}
                        </p>
                        <p className="text-2xl font-bold text-red-600">{analyticsData.statusCounts.rejected}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Rating Leaderboards */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      {language === 'en' ? 'Weekly Rating Leaderboard' : '7 хоногийн үнэлгээний жагсаалт'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsData?.weeklyVideoRatings.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        {language === 'en' ? 'No ratings this week' : 'Энэ долоо хоногт үнэлгээ байхгүй'}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {analyticsData?.weeklyVideoRatings.map((video: any, index: number) => (
                          <div key={video.videoId} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                              <div>
                                <p className="font-medium line-clamp-1">{video.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {video.count} {language === 'en' ? 'ratings' : 'үнэлгээ'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">{video.avgStars.toFixed(1)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      {language === 'en' ? 'Monthly Rating Leaderboard' : 'Сарын үнэлгээний жагсаалт'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsData?.monthlyVideoRatings.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        {language === 'en' ? 'No ratings this month' : 'Энэ сард үнэлгээ байхгүй'}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {analyticsData?.monthlyVideoRatings.map((video: any, index: number) => (
                          <div key={video.videoId} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                              <div>
                                <p className="font-medium line-clamp-1">{video.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {video.count} {language === 'en' ? 'ratings' : 'үнэлгээ'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">{video.avgStars.toFixed(1)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Trainer Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Trainer Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsData?.trainerStats.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No trainer data available
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Trainer</TableHead>
                          <TableHead className="text-center">Total Videos</TableHead>
                          <TableHead className="text-center">Approved</TableHead>
                          <TableHead className="text-center">Pending</TableHead>
                          <TableHead className="text-center">Approval Rate</TableHead>
                          <TableHead className="text-center">Avg Rating</TableHead>
                          <TableHead className="text-center">Total Ratings</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analyticsData?.trainerStats.map((trainer: any) => (
                          <TableRow key={trainer.trainerId}>
                            <TableCell className="font-medium">{trainer.name}</TableCell>
                            <TableCell className="text-center">{trainer.totalVideos}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="default" className="bg-green-500">
                                {trainer.approved}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary">
                                {trainer.pending}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {trainer.approvalRate.toFixed(0)}%
                            </TableCell>
                            <TableCell className="text-center">
                              {trainer.avgRating > 0 ? (
                                <div className="flex items-center justify-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span>{trainer.avgRating.toFixed(1)}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {trainer.totalRatings}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Revenue Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Revenue Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {revenueData ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-500/10 p-6 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                          <p className="text-3xl font-bold text-green-600">
                            ${revenueData.totalRevenue.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-blue-500/10 p-6 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                          <p className="text-3xl font-bold text-blue-600">
                            {revenueData.totalOrders}
                          </p>
                        </div>
                      </div>

                      {revenueData.topVideos.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3">Top Selling Videos</h4>
                          <div className="space-y-2">
                            {revenueData.topVideos.map((video: any, index: number) => (
                              <div key={video.videoId} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div className="flex items-center gap-3">
                                  <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                                  <div>
                                    <p className="font-medium">{video.title}</p>
                                    <p className="text-xs text-muted-foreground">{video.count} sales</p>
                                  </div>
                                </div>
                                <span className="font-semibold text-green-600">
                                  ${video.revenue.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No revenue data available
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
