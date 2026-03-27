import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculateNextRun } from '@/lib/utils/recurring';

// Note: This route is meant to be hit by a cron job (e.g. Vercel Cron or GitHub Actions)
// We use a service role key here if available to bypass RLS for background jobs,
// otherwise RLS would block us from reading all users' jobs if we just use the anon key without a session.
// IF using the anon key, this would only work if RLS was bypassed or we had a dedicated secure endpoint.
// Assuming we are using service role key if SUPABASE_SERVICE_ROLE_KEY is set,
// else fallback to anon key (which might fail RLS if not authenticated).

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch due recurring activities
    const { data: jobs, error: fetchError } = await supabase
      .from('recurring_activities')
      .select('*')
      .lte('next_run_at', new Date().toISOString())
      .eq('is_active', true);

    if (fetchError) {
      console.error("Error fetching jobs:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ message: 'No due jobs found', processed: 0 });
    }

    let processedCount = 0;
    const errors = [];

    // 2. Process each job
    for (const job of jobs) {
      try {
        // Insert new record into the source table
        const { error: insertError } = await supabase
          .from(job.source_table)
          .insert({
            ...job.reference_payload,
            user_id: job.user_id // Ensure user_id is explicitly set
          });

        if (insertError) throw insertError;

        // 3. Update next_run_at
        const nextRun = calculateNextRun(job.frequency, new Date());
        
        const { error: updateError } = await supabase
          .from('recurring_activities')
          .update({ next_run_at: nextRun.toISOString() })
          .eq('id', job.id);
          
        if (updateError) throw updateError;

        processedCount++;
      } catch (err: any) {
        console.error(`Failed to process job ${job.id}:`, err);
        errors.push({ id: job.id, error: err.message || 'Unknown error' });
      }
    }

    return NextResponse.json({ 
      message: 'Processing complete', 
      processed: processedCount,
      failed: errors.length,
      errors 
    });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// Allow GET for easy manual triggering during development
export async function GET(request: Request) {
  return POST(request);
}
