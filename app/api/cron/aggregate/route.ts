import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  // This route is meant to be called by a CRON job (e.g., Vercel Cron or Supabase pg_cron)
  // It authenticates via a secret header to prevent unauthorized aggregation trigger
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // For local dev, we might bypass or just return 401. Let's return 401 for safety in production.
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const supabase = await createClient()

    // Example Aggregation Logic
    // In a real scenario, we'd GROUP BY user_id and energy_type to sum up the values of the day
    // and then insert into a `daily_aggregation` table, clearing the raw `iot_data` if needed.
    
    // As a placeholder, we just log and return success
    console.log("[CRON] Running daily IoT Data Aggregation...")

    // Example query (Replace with real RPC / SQL function or complex postgrest query):
    // const { data, error } = await supabase.rpc('aggregate_iot_data_daily')

    return NextResponse.json({ success: true, message: 'Aggregation completed (Simulated).' })
  } catch (error: any) {
    console.error("[CRON] Aggregation failed:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
