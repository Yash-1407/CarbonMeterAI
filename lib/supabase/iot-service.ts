import { createClient } from "@/lib/supabase/client"
import { calculateNextRun } from "@/lib/utils/recurring"

export async function saveIoTConfiguration(type: string, module: string, data: any, user: any) {
  const supabase = createClient()
  
  const payload = {
    type,
    module,
    transport_type: data.transportType || null,
    frequency: data.frequency || null,
    energy_type: data.energyType || null,
    value: Number(data.value),
    unit: data.unit || null,
    carbon_emission: data.carbon_emission || null,
    calculation_method: data.calculation_method || null,
    user_id: user.id
  };

  const { data: result, error } = await supabase
    .from('iot_data')
    .insert([payload])

  if (error) {
    console.error("Supabase IoT Insert Error:", error)
    throw error
  }
  
  // Save recurring job if requested
  if (data.frequency && data.frequency !== "None") {
    // Determine a reference date (default to today)
    const referenceDate = data.usageDate ? new Date(data.usageDate) : new Date();
    const nextRun = calculateNextRun(data.frequency, referenceDate);
    
    // Omit fields not needed directly but copy everything standard for reference payload
    const { user_id, ...payloadWithoutUser } = payload;
    
    const { error: recurError } = await supabase.from("recurring_activities").insert({
      user_id: user.id,
      source_table: "iot_data",
      reference_payload: payloadWithoutUser,
      frequency: data.frequency,
      next_run_at: nextRun.toISOString(),
      is_active: true
    });

    if (recurError) {
      console.error("Failed to save recurring activity for IoT:", recurError);
      // We don't throw here to avoid failing the main IoT insert, but we log the error.
    }
  }
  
  return result
}

// Simulated real-time ingestion placeholder
export function startSimulatingIoTIngestion(type: string, module: string, user: any) {
  console.log(`[IoT Sim] Starting simulation for ${module} (${type})...`)
  const interval = setInterval(async () => {
    const mockValue = Math.floor(Math.random() * 50) + 10 // random value
    try {
      await saveIoTConfiguration('realtime', module, { 
        value: mockValue,
        unit: module === 'energy' ? 'kWh' : 'km'
      }, user)
      console.log(`[IoT Sim] Ingested ${mockValue} for ${module}`)
    } catch (e) {
      console.error("[IoT Sim] Failed to ingest data", e)
    }
  }, 5000) // Insert every 5 seconds
  
  return () => clearInterval(interval)
}

export async function getIoTData(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('iot_data')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Supabase Fetch IoT Data Error:", error)
    throw error
  }

  return data
}

export async function updateIoTData(id: string, updateData: any) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('iot_data')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error("Supabase Update IoT Data Error:", error)
    throw error
  }

  return data
}

export async function deleteIoTData(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('iot_data')
    .delete()
    .eq('id', id)

  if (error) {
    console.error("Supabase Delete IoT Data Error:", error)
    throw error
  }

  return true
}
