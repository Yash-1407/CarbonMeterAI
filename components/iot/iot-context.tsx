"use client"
import React, { createContext, useContext, useState } from 'react'

export type IoTType = 'virtual' | 'realtime' | null
export type IoTModule = 'transport' | 'energy' | null

interface IoTContextData {
  step: number;
  setStep: (step: number) => void;
  iotType: IoTType;
  setIotType: (type: IoTType) => void;
  iotModule: IoTModule;
  setIotModule: (module: IoTModule) => void;
  reset: () => void;
}

const IoTContext = createContext<IoTContextData | undefined>(undefined)

export function IoTProvider({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState(1)
  const [iotType, setIotType] = useState<IoTType>(null)
  const [iotModule, setIotModule] = useState<IoTModule>(null)

  const reset = () => {
    setStep(1)
    setIotType(null)
    setIotModule(null)
  }

  return (
    <IoTContext.Provider value={{ step, setStep, iotType, setIotType, iotModule, setIotModule, reset }}>
      {children}
    </IoTContext.Provider>
  )
}

export const useIoT = () => {
  const context = useContext(IoTContext)
  if (!context) throw new Error('useIoT must be used within IoTProvider')
  return context
}
