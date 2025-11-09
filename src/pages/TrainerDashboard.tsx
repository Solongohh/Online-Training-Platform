import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Edit2, Trash2, Video, Clock, CheckCircle, XCircle, Upload, DollarSign, User } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

interface TrainingVideo {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  status: 'uploaded' | 'pending' | 'approved' | 'rejected';
  created_at: string;
  is_free: boolean;
  price: number;
  duration_seconds: number | null;
  size_mb: number | null;
  is_private_link_validated: boolean;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
  name_mn: string;
}

export default function TrainerDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTrainer, setIsTrainer] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<TrainingVideo | null>(null);
  const [activeTab, setActiveTab] = useState<string>('videos');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtube_url: '',
    is_free: false,
    price: 0,
    category_id: ''
  });
  const [profileData, setProfileData] = useState({
    full_name: '',
    bio: '',
    bio_mn: '',
    professional_title: '',
    professional_title_mn: '',
    years_of_experience: 0,
    avatar_url: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      checkTrainerRole();
    }
  }, [user]);

  const checkTrainerRole = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'trainer')
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        toast({
          variant: 'destructive',
          title: 'Access Denied',
          description: 'You need trainer privileges to access this page',
        });
        navigate('/');
        return;
      }
      
      setIsTrainer(true);
      loadCategories();
      loadVideos();
      loadProfile();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
      navigate('/');
    }
  };

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

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfileData({
          full_name: data.full_name || '',
          bio: data.bio || '',
          bio_mn: data.bio_mn || '',
          professional_title: data.professional_title || '',
          professional_title_mn: data.professional_title_mn || '',
          years_of_experience: data.years_of_experience || 0,
          avatar_url: data.avatar_url || ''
        });
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    setProfileLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          bio: profileData.bio,
          bio_mn: profileData.bio_mn,
          professional_title: profileData.professional_title,
          professional_title_mn: profileData.professional_title_mn,
          years_of_experience: profileData.years_of_experience,
          avatar_url: profileData.avatar_url
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: language === 'mn' ? 'Амжилттай' : 'Success',
        description: language === 'mn' 
          ? 'Таны профайл шинэчлэгдсэн байна' 
          : 'Your profile has been updated',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: language === 'mn' ? 'Алдаа' : 'Error',
        description: error.message,
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const loadVideos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('training_videos')
        .select('*')
        .eq('trainer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
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

  const validateYouTubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    return youtubeRegex.test(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.youtube_url) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Title and YouTube URL are required',
      });
      return;
    }

    if (!validateYouTubeUrl(formData.youtube_url)) {
      toast({
        variant: 'destructive',
        title: 'Invalid YouTube URL',
        description: 'Please enter a valid YouTube video URL (youtube.com or youtu.be)',
      });
      return;
    }

    if (!formData.is_free && formData.price <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Price',
        description: 'Paid videos must have a price greater than 0',
      });
      return;
    }

    if (!formData.category_id) {
      toast({
        variant: 'destructive',
        title: 'Category Required',
        description: 'Please select a category for your video',
      });
      return;
    }

    try {
      if (editingVideo) {
        const { error } = await supabase
          .from('training_videos')
          .update({
            title: formData.title,
            description: formData.description,
            youtube_url: formData.youtube_url,
            is_free: formData.is_free,
            price: formData.is_free ? 0 : formData.price,
            category_id: formData.category_id,
          })
          .eq('id', editingVideo.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Video updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('training_videos')
          .insert({
            trainer_id: user?.id,
            title: formData.title,
            description: formData.description,
            youtube_url: formData.youtube_url,
            is_free: formData.is_free,
            price: formData.is_free ? 0 : formData.price,
            category_id: formData.category_id,
          });

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Video added successfully',
        });
      }

      setDialogOpen(false);
      setFormData({ title: '', description: '', youtube_url: '', is_free: false, price: 0, category_id: '' });
      setEditingVideo(null);
      loadVideos();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const handleEdit = (video: TrainingVideo) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || '',
      youtube_url: video.youtube_url,
      is_free: video.is_free,
      price: video.price || 0,
      category_id: video.category_id || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (videoId: string) => {
    try {
      const { error } = await supabase
        .from('training_videos')
        .delete()
        .eq('id', videoId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Video deleted successfully',
      });
      loadVideos();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingVideo(null);
    setFormData({ title: '', description: '', youtube_url: '', is_free: false, price: 0, category_id: '' });
  };

  const getFilteredVideos = (status?: string) => {
    if (!status || status === 'all') return videos;
    return videos.filter(v => v.status === status);
  };

  const getStatusBadge = (status: string) => {
    const config = {
      uploaded: { variant: 'secondary' as const, icon: Upload, label: 'Uploaded', className: '' },
      pending: { variant: 'default' as const, icon: Clock, label: 'Pending', className: '' },
      approved: { variant: 'default' as const, icon: CheckCircle, label: 'Approved', className: 'bg-green-500' },
      rejected: { variant: 'destructive' as const, icon: XCircle, label: 'Rejected', className: '' }
    };
    const { icon: Icon, label, className } = config[status as keyof typeof config] || config.pending;
    return (
      <Badge variant={config[status as keyof typeof config]?.variant} className={className}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const pendingCount = videos.filter(v => v.status === 'pending').length;
  const approvedCount = videos.filter(v => v.status === 'approved').length;
  const uploadedCount = videos.filter(v => v.status === 'uploaded').length;
  const rejectedCount = videos.filter(v => v.status === 'rejected').length;

  if (authLoading || loading || !isTrainer) {
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
              {language === 'mn' ? 'Багшийн хяналтын самбар' : 'Trainer Dashboard'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'mn' ? 'Сургалтын видео болон профайлаа удирдах' : 'Manage your training videos and profile'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/')}>
              {language === 'mn' ? 'Нүүр хуудас' : 'Back to Home'}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="videos">
              <Video className="h-4 w-4 mr-2" />
              {language === 'mn' ? 'Миний видеонууд' : 'My Videos'}
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              {language === 'mn' ? 'Профайл' : 'Profile'}
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'mn' ? 'Багшийн танилцуулга' : 'Trainer Introduction'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div>
                    <Label htmlFor="full_name">
                      {language === 'mn' ? 'Бүтэн нэр' : 'Full Name'}
                    </Label>
                    <Input
                      id="full_name"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                      placeholder={language === 'mn' ? 'Нэрээ оруулна уу' : 'Enter your full name'}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="professional_title">
                        {language === 'mn' ? 'Мэргэжлийн албан тушаал (Англи)' : 'Professional Title (English)'}
                      </Label>
                      <Input
                        id="professional_title"
                        value={profileData.professional_title}
                        onChange={(e) => setProfileData({ ...profileData, professional_title: e.target.value })}
                        placeholder="Communication Expert"
                      />
                    </div>
                    <div>
                      <Label htmlFor="professional_title_mn">
                        {language === 'mn' ? 'Мэргэжлийн албан тушаал (Монгол)' : 'Professional Title (Mongolian)'}
                      </Label>
                      <Input
                        id="professional_title_mn"
                        value={profileData.professional_title_mn}
                        onChange={(e) => setProfileData({ ...profileData, professional_title_mn: e.target.value })}
                        placeholder="Харилцааны мэргэжилтэн"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="years_of_experience">
                      {language === 'mn' ? 'Туршлагын жил' : 'Years of Experience'}
                    </Label>
                    <Input
                      id="years_of_experience"
                      type="number"
                      min="0"
                      value={profileData.years_of_experience}
                      onChange={(e) => setProfileData({ ...profileData, years_of_experience: parseInt(e.target.value) || 0 })}
                      placeholder="15"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">
                      {language === 'mn' ? 'Танилцуулга (Англи)' : 'Bio (English)'}
                    </Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      placeholder={language === 'mn' 
                        ? 'Өөрийнхөө тухай англи хэл дээр бичнэ үү...'
                        : 'Tell us about yourself in English...'}
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio_mn">
                      {language === 'mn' ? 'Танилцуулга (Монгол)' : 'Bio (Mongolian)'}
                    </Label>
                    <Textarea
                      id="bio_mn"
                      value={profileData.bio_mn}
                      onChange={(e) => setProfileData({ ...profileData, bio_mn: e.target.value })}
                      placeholder={language === 'mn'
                        ? 'Өөрийнхөө тухай монгол хэл дээр бичнэ үү...'
                        : 'Tell us about yourself in Mongolian...'}
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="avatar_url">
                      {language === 'mn' ? 'Зургийн URL' : 'Avatar URL'}
                    </Label>
                    <Input
                      id="avatar_url"
                      value={profileData.avatar_url}
                      onChange={(e) => setProfileData({ ...profileData, avatar_url: e.target.value })}
                      placeholder="https://example.com/avatar.jpg"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === 'mn' 
                        ? 'Профайл зургийн холбоосыг оруулна уу'
                        : 'Enter the URL to your profile picture'}
                    </p>
                  </div>

                  <Button type="submit" disabled={profileLoading}>
                    {profileLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {language === 'mn' ? 'Шинэчилж байна...' : 'Updating...'}
                      </>
                    ) : (
                      language === 'mn' ? 'Профайл шинэчлэх' : 'Update Profile'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos">
            <div className="flex justify-end mb-4">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleDialogClose()}>
                    <Plus className="h-4 w-4 mr-2" />
                    {language === 'mn' ? 'Видео нэмэх' : 'Add Video'}
                  </Button>
                </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingVideo 
                      ? (language === 'mn' ? 'Видео засах' : 'Edit Video')
                      : (language === 'mn' ? 'Шинэ видео нэмэх' : 'Add New Video')}
                  </DialogTitle>
                  <DialogDescription>
                    {language === 'mn' 
                      ? 'Сургалтын видеоны YouTube холбоосыг нэмнэ үү'
                      : 'Add a YouTube link to your training video'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter video title"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter video description"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="youtube_url">YouTube URL *</Label>
                      <Input
                        id="youtube_url"
                        value={formData.youtube_url}
                        onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                        placeholder="https://www.youtube.com/watch?v=..."
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Must be a valid YouTube link (youtube.com or youtu.be)
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category_id}
                        onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={language === 'mn' ? 'Ангилал сонгох' : 'Select category'} />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {language === 'mn' ? category.name_mn : category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                      <div className="space-y-0.5">
                        <Label htmlFor="is_free">Free Video</Label>
                        <p className="text-xs text-muted-foreground">
                          Make this video available for free
                        </p>
                      </div>
                      <Switch
                        id="is_free"
                        checked={formData.is_free}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_free: checked })}
                      />
                    </div>

                    {!formData.is_free && (
                      <div>
                        <Label htmlFor="price">Price ($) *</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                          placeholder="9.99"
                          required={!formData.is_free}
                        />
                      </div>
                    )}
                  </div>
                  <DialogFooter className="mt-6">
                    <Button type="button" variant="outline" onClick={handleDialogClose}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingVideo ? 'Update' : 'Add'} Video
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Your Training Videos ({videos.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="all">
                      All ({videos.length})
                    </TabsTrigger>
                    <TabsTrigger value="uploaded">
                      Uploaded ({uploadedCount})
                    </TabsTrigger>
                    <TabsTrigger value="pending">
                      Pending ({pendingCount})
                    </TabsTrigger>
                    <TabsTrigger value="approved">
                      Approved ({approvedCount})
                    </TabsTrigger>
                    <TabsTrigger value="rejected">
                      Rejected ({rejectedCount})
                    </TabsTrigger>
                  </TabsList>

                  {['all', 'uploaded', 'pending', 'approved', 'rejected'].map((status) => (
                    <TabsContent key={status} value={status} className="mt-6">
                      {getFilteredVideos(status === 'all' ? undefined : status).length === 0 ? (
                        <div className="text-center py-12">
                          <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">No videos in this category</h3>
                          <p className="text-muted-foreground mb-4">
                            {status === 'all' ? 'Start by adding your first training video' : `No ${status} videos yet`}
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {getFilteredVideos(status === 'all' ? undefined : status).map((video) => (
                            <Card key={video.id}>
                              <CardContent className="p-4">
                                <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                                  <Video className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-semibold">{video.title}</h3>
                                  {getStatusBadge(video.status)}
                                </div>
                                {video.description && (
                                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                    {video.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mb-3">
                                  {video.is_free ? (
                                    <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
                                      Free
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                      <DollarSign className="h-3 w-3" />
                                      ${video.price?.toFixed(2)}
                                    </Badge>
                                  )}
                                  {video.duration_seconds && (
                                    <span className="text-xs text-muted-foreground">
                                      {Math.floor(video.duration_seconds / 60)}:{(video.duration_seconds % 60).toString().padStart(2, '0')}
                                    </span>
                                  )}
                                  {video.size_mb && (
                                    <span className="text-xs text-muted-foreground">
                                      {video.size_mb.toFixed(1)} MB
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEdit(video)}
                                    className="flex-1"
                                  >
                                    <Edit2 className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button size="sm" variant="destructive">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Video</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete "{video.title}"? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDelete(video.id)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
