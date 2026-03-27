"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateIoTData } from "@/lib/supabase/iot-service"
import { toast } from "sonner"
import { PencilLine } from "lucide-react"

interface IoTData {
  id: string
  module: string
  transport_type: string | null
  frequency: string | null
  energy_type: string | null
  value: number
  unit: string | null
}

interface EditIoTModalProps {
  isOpen: boolean
  onClose: () => void
  data: IoTData | null
  onDataChange?: () => void
}

export function EditIoTModal({ isOpen, onClose, data, onDataChange }: EditIoTModalProps) {
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState('')
  const [frequency, setFrequency] = useState('Per Day')
  const [transportType, setTransportType] = useState('Car (Petrol)') // simplified edit
  const [energyType, setEnergyType] = useState('Electricity')

  useEffect(() => {
    if (data) {
      setValue(data.value.toString())
      setFrequency(data.frequency || 'Per Day')
      setTransportType(data.transport_type || 'Car (Petrol)')
      setEnergyType(data.energy_type || 'Electricity')
    }
  }, [data])

  if (!data) return null

  const isTransport = data.module === 'transport'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!value || isNaN(Number(value))) {
      toast.error("Please enter a valid numeric value.")
      return
    }

    setLoading(true)
    try {
      const updatePayload = {
        value: Number(value),
        frequency: isTransport ? frequency : data.frequency,
        transport_type: isTransport ? transportType : data.transport_type,
        energy_type: !isTransport ? energyType : data.energy_type,
      }

      await updateIoTData(data.id, updatePayload)
      if (onDataChange) onDataChange()
      toast.success(`✏️ Data updated`, { icon: <PencilLine className="w-4 h-4 text-blue-500" /> })
      onClose()
    } catch (error) {
      toast.error("Failed to update data.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit {data.module === 'transport' ? 'Transport' : 'Energy'} Data</DialogTitle>
          <DialogDescription>
            Make changes to your IoT record here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {isTransport ? (
            <>
              <div className="space-y-2">
                <Label>Transport Type</Label>
                <Input 
                  value={transportType} 
                  onChange={(e) => setTransportType(e.target.value)} 
                  placeholder="e.g. Car (Petrol)"
                />
              </div>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Per Day', 'Per Week', 'Per Month'].map(f => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label>Energy Type</Label>
              <Input 
                  value={energyType} 
                  onChange={(e) => setEnergyType(e.target.value)} 
                  placeholder="e.g. Electricity"
                />
            </div>
          )}

          <div className="space-y-2">
            <Label>Value ({data.unit})</Label>
            <Input 
              type="number" 
              value={value} 
              onChange={(e) => setValue(e.target.value)} 
              required 
            />
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
