import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing supabase env vars")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
  console.log("Checking game_achievements...");
  const { data: gData, error: gErr } = await supabase.from('game_achievements').select('*').limit(5)
  if (gErr) console.error("Err:", gErr)
  else console.log(JSON.stringify(gData, null, 2))
}

test()
