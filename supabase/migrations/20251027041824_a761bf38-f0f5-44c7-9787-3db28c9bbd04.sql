-- Create a function to send completion email notification
CREATE OR REPLACE FUNCTION public.notify_course_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_email text;
  user_name text;
  video_title text;
BEGIN
  -- Only proceed if completed status changed to true
  IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
    -- Get user email and name
    SELECT email, full_name INTO user_email, user_name
    FROM profiles
    WHERE id = NEW.user_id;
    
    -- Get video title
    SELECT title INTO video_title
    FROM training_videos
    WHERE id = NEW.video_id;
    
    -- Insert notification for the user
    INSERT INTO notifications (user_id, title, message, type, link)
    VALUES (
      NEW.user_id,
      'Course Completed!',
      'Congratulations! You have completed ' || video_title,
      'success',
      '/my-learning'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for course completion
DROP TRIGGER IF EXISTS on_course_completed ON video_progress;
CREATE TRIGGER on_course_completed
  AFTER INSERT OR UPDATE ON video_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_course_completion();