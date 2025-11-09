import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export function useTrainerRole(user: User | null) {
  const [isTrainer, setIsTrainer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsTrainer(false);
      setLoading(false);
      return;
    }

    const checkRole = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'trainer')
          .maybeSingle();

        if (error) throw error;
        setIsTrainer(!!data);
      } catch (error) {
        console.error('Error checking trainer role:', error);
        setIsTrainer(false);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [user]);

  return { isTrainer, loading };
}
