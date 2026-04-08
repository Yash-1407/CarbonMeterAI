import { createClient } from '@/lib/supabase/server';

export async function getUserHistory() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Fetch AI/IoT synced data
  const { data: iotData, error: iotError } = await supabase
    .from('iot_data')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30);

  if (iotError && iotError.code !== '42P01') { 
    console.error('Error fetching iot history:', iotError);
  }

  // Fetch manually logged carbon activities
  const { data: carbonData, error: carbonError } = await supabase
    .from('carbon_activities')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30);

  if (carbonError) {
    console.error('Error fetching carbon activities:', carbonError);
  }

  // Combine and sort by date descending
  const combined = [...(iotData || []), ...(carbonData || [])];
  combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return combined.slice(0, 30);
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
