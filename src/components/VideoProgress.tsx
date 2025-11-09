import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface VideoProgressProps {
  videoId: string;
  userId: string;
  onProgressUpdate?: () => void;
}

export function VideoProgress({ videoId, userId, onProgressUpdate }: VideoProgressProps) {
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    loadProgress();
  }, [videoId, userId]);

  const loadProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('video_progress')
        .select('*')
        .eq('video_id', videoId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProgress(data.progress_percentage);
        setCompleted(data.completed);
      }
    } catch (error: any) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (newProgress: number, isCompleted: boolean = false) => {
    try {
      const { data: existing } = await supabase
        .from('video_progress')
        .select('id')
        .eq('video_id', videoId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('video_progress')
          .update({
            progress_percentage: newProgress,
            completed: isCompleted,
            last_watched_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('video_progress')
          .insert({
            video_id: videoId,
            user_id: userId,
            progress_percentage: newProgress,
            completed: isCompleted,
          });

        if (error) throw error;
      }

      setProgress(newProgress);
      setCompleted(isCompleted);
      onProgressUpdate?.();

      if (isCompleted) {
        toast({
          title: language === 'mn' ? 'Баяр хүргэе!' : 'Congratulations!',
          description: language === 'mn' 
            ? 'Та энэ сургалтыг амжилттай дүүргэлээ!' 
            : 'You have completed this training!',
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: language === 'mn' ? 'Алдаа' : 'Error',
        description: error.message,
      });
    }
  };

  const markAsComplete = () => updateProgress(100, true);
  const markAsInProgress = () => updateProgress(50, false);
  const resetProgress = () => updateProgress(0, false);

  if (loading) {
    return <div className="h-2 bg-muted rounded-full animate-pulse" />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {completed ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <Play className="h-5 w-5 text-primary" />
          )}
          <span className="text-sm font-medium">
            {language === 'mn' ? 'Явц' : 'Progress'}: {progress}%
          </span>
        </div>
        {completed && (
          <span className="text-xs bg-green-500/10 text-green-700 dark:text-green-400 px-2 py-1 rounded">
            {language === 'mn' ? 'Дууссан' : 'Completed'}
          </span>
        )}
      </div>

      <Progress value={progress} className="h-2" />

      <div className="flex gap-2 flex-wrap">
        {!completed && progress === 0 && (
          <Button size="sm" variant="outline" onClick={markAsInProgress}>
            {language === 'mn' ? 'Эхлүүлэх' : 'Start Learning'}
          </Button>
        )}
        {!completed && progress > 0 && (
          <Button size="sm" onClick={markAsComplete}>
            {language === 'mn' ? 'Дуусгах гэж тэмдэглэх' : 'Mark as Complete'}
          </Button>
        )}
        {progress > 0 && (
          <Button size="sm" variant="ghost" onClick={resetProgress}>
            {language === 'mn' ? 'Дахин эхлүүлэх' : 'Reset'}
          </Button>
        )}
      </div>
    </div>
  );
}
