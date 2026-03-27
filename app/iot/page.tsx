import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { IoTWizard } from "@/components/iot/iot-wizard"
import { IoTProvider } from "@/components/iot/iot-context"

export default async function IoTPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // We serialize the user to pass it to the client component
  const serializedUser = {
    id: user.id,
    email: user.email,
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">IoT Data Integration</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Connect your Virtual or Real-Time IoT devices to sync consumption data automatically.
        </p>
      </div>
      <IoTProvider>
        <IoTWizard user={serializedUser} />
      </IoTProvider>
    </div>
  )
}
