"use client"

import React, { useState, useEffect } from "react"
import { useIoT } from "./iot-context"
import { Cpu, Activity, Car, Zap, ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { saveIoTConfiguration, startSimulatingIoTIngestion } from "@/lib/supabase/iot-service"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { calculateIoTCarbon } from "@/lib/carbon-calculations"

interface IoTWizardProps {
  user: { id: string; email?: string }
}

export function IoTWizard({ user }: IoTWizardProps) {
  const { step, setStep, iotType, setIotType, reset } = useIoT()

  const handleTypeSelect = (type: 'virtual' | 'realtime') => {
    setIotType(type)
    setStep(2)
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8 flex items-center justify-center relative max-w-xs mx-auto">
        <div className="absolute left-0 top-1/2 -z-10 h-1 w-full -translate-y-1/2 bg-muted rounded-full"></div>
        <div 
          className="absolute left-0 top-1/2 -z-10 h-1 -translate-y-1/2 bg-primary transition-all duration-300 rounded-full"
          style={{ width: `${((step - 1) / 1) * 100}%` }}
        ></div>
        <div className="flex w-full justify-between">
          {[1, 2].map((num) => (
            <div 
              key={num} 
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background font-semibold transition-colors
                ${step >= num ? 'border-primary text-primary' : 'border-muted text-muted-foreground'}`}
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 relative overflow-hidden">
        {step > 1 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setStep(step - 1)}
            className="absolute top-4 left-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        )}

        <div className="mt-8">
          {step === 1 && <Step1Type onSelect={handleTypeSelect} />}
          {step === 2 && iotType === 'virtual' && <Step2Virtual user={user} onComplete={reset} />}
          {step === 2 && iotType === 'realtime' && <Step2RealTime onComplete={reset} />}
        </div>
      </div>
    </div>
  )
}

function Step1Type({ onSelect }: { onSelect: (type: 'virtual' | 'realtime') => void }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-semibold mb-6 text-center">Select IoT Type</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <Card 
          className="cursor-pointer hover:border-primary transition-all hover:shadow-md group"
          onClick={() => onSelect('virtual')}
        >
          <CardHeader className="text-center">
            <Cpu className="w-12 h-12 mx-auto mb-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <CardTitle>Virtual IoT</CardTitle>
            <CardDescription>Manual Data Input Entry for Carbon Tracking</CardDescription>
          </CardHeader>
        </Card>

        <Card 
          className="cursor-pointer hover:border-primary transition-all hover:shadow-md group relative overflow-hidden"
          onClick={() => onSelect('realtime')}
        >
          <div className="absolute top-3 right-3 bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded">Coming Soon</div>
          <CardHeader className="text-center">
            <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <CardTitle>Real-Time IoT</CardTitle>
            <CardDescription>Simulated Sensor Data Ingestion Flow</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}

function Step2RealTime({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
      <Activity className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
      <h2 className="text-2xl font-bold mb-2">Real-Time IoT is Coming Soon</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        We are actively developing direct integrations with smart sensors and external APIs. For now, please use Virtual IoT to track your footprint manually.
      </p>
      <Button onClick={onComplete} variant="default">Back to Start</Button>
    </div>
  )
}

function Step2Virtual({ user, onComplete }: { user: any, onComplete: () => void }) {
  const { iotModule, setIotModule } = useIoT()

  useEffect(() => {
    if (!iotModule) setIotModule('transport')
  }, [iotModule, setIotModule])

  const safeModule = iotModule || 'transport'

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold capitalize">Configure Virtual IoT</h2>
        <p className="text-sm text-muted-foreground mt-2">Set reporting configurations for your virtual IoT.</p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="bg-muted p-1 rounded-lg inline-flex">
          <Button 
            variant={safeModule === 'transport' ? 'default' : 'ghost'} 
            onClick={() => setIotModule('transport')}
            className={`rounded-md ${safeModule === 'transport' ? 'shadow-sm' : ''}`}
          >
            <Car className="w-4 h-4 mr-2" /> Transport
          </Button>
          <Button 
            variant={safeModule === 'energy' ? 'default' : 'ghost'} 
            onClick={() => setIotModule('energy')}
            className={`rounded-md ${safeModule === 'energy' ? 'shadow-sm' : ''}`}
          >
            <Zap className="w-4 h-4 mr-2" /> Energy
          </Button>
        </div>
      </div>

      <ConfigurationForm module={safeModule} user={user} onComplete={onComplete} />
    </div>
  )
}

function ConfigurationForm({ module, user, onComplete }: { module: string, user: any, onComplete: () => void }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const isTransport = module === 'transport'
  
  // Transport Form States
  const [transportType, setTransportType] = useState('Car')
  const [frequency, setFrequency] = useState('Per Day')
  const [fuelType, setFuelType] = useState('Petrol')
  const [distanceUnit, setDistanceUnit] = useState('km')

  // Energy Form States
  const [energyType, setEnergyType] = useState('Electricity')
  const [usageDate, setUsageDate] = useState(new Date().toISOString().slice(0, 10))

  // Common State
  const [value, setValue] = useState('')

  // Total Carbon State
  const [calculationMethod, setCalculationMethod] = useState('default')
  const [customCarbonValue, setCustomCarbonValue] = useState('')

  // Determine the dynamic unit for Energy
  const getEnergyUnit = (type: string) => {
    switch (type) {
      case 'Electricity':
      case 'Solar':
      case 'Wind':
      case 'Hydropower':
      case 'Nuclear':
        return 'kWh'
      case 'Diesel':
      case 'Petrol':
      case 'LPG':
        return 'Liters'
      case 'Natural Gas':
      case 'Coal':
      case 'Biomass':
      default:
        return 'kg'
    }
  }

  // Energy help descriptions
  const getEnergyHelp = (type: string) => {
    switch (type) {
      case 'Electricity': return 'Standard grid power consumption'
      case 'Solar': return 'Renewable energy from your solar panels'
      case 'LPG': return 'Liquid Petroleum Gas typically used for cooking or heating'
      case 'Natural Gas': return 'Methane gas supplied via utility pipelines'
      default: return `Enter your ${type.toLowerCase()} usage statistics`
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!value || isNaN(Number(value))) {
      toast.error("Please enter a valid numeric value.")
      return
    }

    setLoading(true)
    try {
      const dynamicUnit = isTransport ? distanceUnit : getEnergyUnit(energyType)
      const finalTransportType = isTransport ? `${transportType} (${fuelType})` : undefined
      
      const calculatedDefault = calculateIoTCarbon(module, isTransport ? transportType : energyType, Number(value))
      const finalCarbon = calculationMethod === 'default' ? calculatedDefault : Number(customCarbonValue)

      await saveIoTConfiguration('virtual', module, {
        transportType: finalTransportType,
        frequency: isTransport ? frequency : undefined,
        energyType: !isTransport ? energyType : undefined,
        value: Number(value),
        unit: dynamicUnit,
        carbon_emission: finalCarbon,
        calculation_method: calculationMethod
      }, user)
      
      toast.success('✅ "IoT Data Saved Successfully"', { icon: <CheckCircle2 className="text-green-500"/>})
      setValue('') // Keep user on the form for multiple entries
    } catch (error) {
      toast.error("Failed to save configuration. Have you run the Supabase DB schema?")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-300">
      {isTransport ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Add Transport Type</Label>
              <Select value={transportType} onValueChange={setTransportType}>
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  {['Car', 'Bike', 'Bus', 'Train', 'Flight', 'Bicycle', 'Other'].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fuel Type</Label>
              <Select value={fuelType} onValueChange={setFuelType}>
                <SelectTrigger><SelectValue placeholder="Fuel" /></SelectTrigger>
                <SelectContent>
                  {['Petrol', 'Diesel', 'Electric', 'Hybrid', 'None'].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
              <SelectContent>
                {['Per Day', 'Per Week', 'Per Month'].map(f => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Enter Transport Distance</Label>
            <div className="flex gap-2">
              <Input 
                type="number" 
                placeholder="e.g. 15" 
                value={value} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)} 
                required 
                className="flex-1"
              />
              <Select value={distanceUnit} onValueChange={setDistanceUnit}>
                <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="km">km</SelectItem>
                  <SelectItem value="miles">miles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label>Add Energy Type</Label>
            <Select value={energyType} onValueChange={setEnergyType}>
              <SelectTrigger><SelectValue placeholder="Select energy" /></SelectTrigger>
              <SelectContent>
                {['Natural Gas', 'Coal', 'Electricity', 'Solar', 'Wind', 'Hydropower', 'LPG', 'Diesel', 'Petrol', 'Biomass', 'Nuclear', 'Other'].map(e => (
                  <SelectItem key={e} value={e}>{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{getEnergyHelp(energyType)}</p>
          </div>
          
          <div className="space-y-2">
            <Label>Date of Usage</Label>
            <Input 
              type="date" 
              value={usageDate} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsageDate(e.target.value)} 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label>Enter Consumption Value</Label>
            <div className="flex gap-2">
              <Input 
                type="number" 
                placeholder="e.g. 120" 
                value={value} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)} 
                required 
                className="flex-1"
              />
              <div className="w-[100px] flex items-center justify-center bg-muted border rounded-md text-sm text-muted-foreground">
                {getEnergyUnit(energyType)}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Total Carbon Option */}
      {value && !isNaN(Number(value)) && (
        <div className="mt-4 p-4 border rounded-lg bg-muted/40 animate-in fade-in duration-300">
          <Label className="text-base font-semibold mb-3 block">Total Carbon Calculation</Label>
          <div className="space-y-4">
            <RadioGroup value={calculationMethod} onValueChange={setCalculationMethod} className="flex flex-col sm:flex-row gap-4">
              <Label htmlFor="r1" className="flex items-center space-x-2 border bg-background p-3 rounded-md flex-1 cursor-pointer hover:bg-muted/50 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5 transition-colors">
                <RadioGroupItem value="default" id="r1" />
                <span>Default (Auto-calculated)</span>
              </Label>
              <Label htmlFor="r2" className="flex items-center space-x-2 border bg-background p-3 rounded-md flex-1 cursor-pointer hover:bg-muted/50 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5 transition-colors">
                <RadioGroupItem value="custom" id="r2" />
                <span>Customized</span>
              </Label>
            </RadioGroup>

            {calculationMethod === 'custom' && (
              <div className="space-y-2 pt-2 animate-in fade-in zoom-in duration-200">
                <Label>Enter Total Carbon (kg CO₂)</Label>
                <Input 
                  type="number" 
                  placeholder="e.g. 15.5" 
                  value={customCarbonValue}
                  onChange={(e) => setCustomCarbonValue(e.target.value)}
                  className="bg-background"
                />
              </div>
            )}
            
            <div className="pt-2 text-sm flex justify-between items-center border-t mt-4 border-dashed pt-4">
              <span className="text-muted-foreground font-medium">Carbon Footprint Preview:</span>
              <span className="text-lg font-bold text-primary">
                {
                  calculationMethod === 'default' 
                    ? calculateIoTCarbon(module, isTransport ? transportType : energyType, Number(value)).toFixed(2)
                    : (customCarbonValue || '0')
                } kg CO₂
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4 mt-6">
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? "Saving..." : `Save Virtual ${module === 'transport' ? 'Transport' : 'Energy'} IoT`}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          className="flex-1"
          onClick={() => router.push('/iot/dashboard')}
          disabled={loading}
        >
          View IoT Data
        </Button>
      </div>
    </form>
  )
}

