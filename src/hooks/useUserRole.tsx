import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export function useUserRole(user: User | null) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      setChecked(true);
      return;
    }

    const checkRole = async () => {
      setLoading(true);
      setChecked(false);
      try {
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });
        if (error) throw error;
        setIsAdmin(!!data);
      } catch (error) {
        console.error('Error checking user role:', error);
        setIsAdmin(false);
      } finally {
        setChecked(true);
        setLoading(false);
      }
    };

    checkRole();
  }, [user]);

  return { isAdmin, loading, checked };
}
