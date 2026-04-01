import { createClient } from '@/lib/supabase/server';

export async function getUserHistory() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('iot_data')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user history:', error);
    return [];
  }

  return data;
}

export async function getCategoryHistory(category: string) {
  const data = await getUserHistory();
  if (!data) return [];
  
  // Filter for matching category fields
  return data.filter(d => 
    d.module === category || 
    d.transport_type === category || 
    d.energy_type === category ||
    d.type === category
  );
}
