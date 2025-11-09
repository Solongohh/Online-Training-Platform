import { useState, useEffect } from 'react';
import { MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDistanceToNow } from 'date-fns';

interface Question {
  id: string;
  question: string;
  is_answered: boolean;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
  };
  answers: Answer[];
}

interface Answer {
  id: string;
  answer: string;
  is_best_answer: boolean;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
  };
}

interface VideoDiscussionProps {
  videoId: string;
  userId: string | undefined;
}

export function VideoDiscussion({ videoId, userId }: VideoDiscussionProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    loadQuestions();
  }, [videoId]);

  const loadQuestions = async () => {
    try {
      const { data: questionsData, error: questionsError } = await supabase
        .from('video_questions')
        .select('*, profiles(full_name)')
        .eq('video_id', videoId)
        .order('created_at', { ascending: false });

      if (questionsError) throw questionsError;

      // Load answers for each question
      const questionsWithAnswers = await Promise.all(
        (questionsData || []).map(async (question) => {
          const { data: answersData } = await supabase
            .from('question_answers')
            .select('*, profiles(full_name)')
            .eq('question_id', question.id)
            .order('is_best_answer', { ascending: false })
            .order('created_at', { ascending: false });

          return {
            ...question,
            answers: answersData || [],
          };
        })
      );

      setQuestions(questionsWithAnswers as any);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: language === 'mn' ? 'Алдаа' : 'Error',
        description: error.message,
      });
    }
  };

  const submitQuestion = async () => {
    if (!userId || !newQuestion.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('video_questions')
        .insert({
          video_id: videoId,
          user_id: userId,
          question: newQuestion.trim(),
        });

      if (error) throw error;

      setNewQuestion('');
      toast({
        title: language === 'mn' ? 'Асуулт нэмэгдлээ' : 'Question posted',
        description: language === 'mn' 
          ? 'Таны асуулт нэмэгдсэн' 
          : 'Your question has been posted',
      });
      loadQuestions();
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

  const submitAnswer = async (questionId: string) => {
    if (!userId || !replyText.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('question_answers')
        .insert({
          question_id: questionId,
          user_id: userId,
          answer: replyText.trim(),
        });

      if (error) throw error;

      // Mark question as answered
      await supabase
        .from('video_questions')
        .update({ is_answered: true })
        .eq('id', questionId);

      setReplyText('');
      setReplyingTo(null);
      toast({
        title: language === 'mn' ? 'Хариулт нэмэгдлээ' : 'Answer posted',
        description: language === 'mn' 
          ? 'Таны хариулт нэмэгдсэн' 
          : 'Your answer has been posted',
      });
      loadQuestions();
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {language === 'mn' ? 'Асуулт, хариулт' : 'Q&A Discussion'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {userId && (
            <div className="space-y-3">
              <Textarea
                placeholder={language === 'mn' 
                  ? 'Асуулт асуух...' 
                  : 'Ask a question...'}
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                rows={3}
                maxLength={500}
              />
              <div className="flex justify-end">
                <Button 
                  onClick={submitQuestion} 
                  disabled={loading || !newQuestion.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {language === 'mn' ? 'Асуух' : 'Post Question'}
                </Button>
              </div>
            </div>
          )}

          <Separator />

          {questions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {language === 'mn' 
                ? 'Асуулт байхгүй. Эхний асуугч болоорой!' 
                : 'No questions yet. Be the first to ask!'}
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question) => (
                <Card key={question.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {question.profiles.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {question.profiles.full_name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(question.created_at), { 
                                  addSuffix: true 
                                })}
                              </span>
                            </div>
                            <p className="text-sm">{question.question}</p>
                          </div>
                        </div>
                        {question.is_answered && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {language === 'mn' ? 'Хариулсан' : 'Answered'}
                          </Badge>
                        )}
                      </div>

                      {/* Answers */}
                      {question.answers.length > 0 && (
                        <div className="ml-11 space-y-3 border-l-2 border-border pl-4">
                          {question.answers.map((answer) => (
                            <div key={answer.id} className="space-y-2">
                              <div className="flex items-start gap-3">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {answer.profiles.full_name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-xs">
                                      {answer.profiles.full_name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {formatDistanceToNow(new Date(answer.created_at), { 
                                        addSuffix: true 
                                      })}
                                    </span>
                                    {answer.is_best_answer && (
                                      <Badge variant="secondary" className="text-xs">
                                        {language === 'mn' ? 'Шилдэг' : 'Best'}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {answer.answer}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply form */}
                      {userId && (
                        <div className="ml-11">
                          {replyingTo === question.id ? (
                            <div className="space-y-2">
                              <Textarea
                                placeholder={language === 'mn' 
                                  ? 'Хариулах...' 
                                  : 'Write your answer...'}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                rows={2}
                                maxLength={500}
                              />
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => submitAnswer(question.id)}
                                  disabled={loading || !replyText.trim()}
                                >
                                  {language === 'mn' ? 'Хариулах' : 'Reply'}
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => {
                                    setReplyingTo(null);
                                    setReplyText('');
                                  }}
                                >
                                  {language === 'mn' ? 'Цуцлах' : 'Cancel'}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setReplyingTo(question.id)}
                            >
                              {language === 'mn' ? 'Хариулах' : 'Reply'}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
