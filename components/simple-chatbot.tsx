"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, Bot, User, Minimize2, Maximize2, Sparkles, Leaf } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

const ECO_RESPONSES = [
  "Great question! Here are some ways to reduce your carbon footprint: Use public transport, eat more plant-based meals, and switch to renewable energy sources.",
  "Did you know? The average person can reduce their carbon footprint by 2.3 tons per year by making simple lifestyle changes like cycling instead of driving short distances.",
  "Eco tip: LED light bulbs use 75% less energy than traditional incandescent bulbs and last 25 times longer. Small changes make a big difference!",
  "To track your carbon footprint effectively, start by monitoring your energy usage, transportation habits, and food choices. Our Calculate page can help you get started!",
  "Community engagement is key to fighting climate change! Check out our Community page to connect with other eco-warriors and share your sustainability journey.",
  "Your Reports page shows detailed insights into your environmental impact. Regular monitoring helps you identify areas for improvement and celebrate your progress!",
  "Gamification makes sustainability fun! Earn achievements and climb the leaderboard by consistently tracking your carbon footprint and making eco-friendly choices.",
]

export function SimpleChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const toggleChat = () => {
    setIsOpen(!isOpen)
    setIsMinimized(false)
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    setTimeout(() => {
      const randomResponse = ECO_RESPONSES[Math.floor(Math.random() * ECO_RESPONSES.length)]
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: randomResponse,
      }
      setMessages((prev) => [...prev, botResponse])
      setIsLoading(false)
    }, 1500)
  }

  if (!isOpen) {
    return (
      <Button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-xl hover:shadow-2xl z-50 animate-pulse-glow"
        size="icon"
      >
        <MessageCircle className="h-7 w-7" />
      </Button>
    )
  }

  return (
    <Card
      className={`fixed bottom-6 right-6 w-96 shadow-2xl z-50 transition-all duration-300 border-2 border-primary/20 ${
        isMinimized ? "h-16" : "h-[500px]"
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-primary to-secondary text-white rounded-t-lg">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="relative">
            <Bot className="h-6 w-6" />
            <Sparkles className="h-3 w-3 absolute -top-1 -right-1 animate-pulse" />
          </div>
          EcoBot Assistant
        </CardTitle>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={toggleMinimize} className="h-8 w-8 text-white hover:bg-white/20">
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleChat} className="h-8 w-8 text-white hover:bg-white/20">
            ×
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-[calc(500px-4rem)]">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <div className="relative mx-auto w-16 h-16 mb-4">
                    <Bot className="h-12 w-12 mx-auto text-primary animate-float" />
                    <Leaf className="h-6 w-6 absolute -top-1 -right-1 text-secondary animate-pulse" />
                  </div>
                  <p className="text-sm font-medium mb-2">Hi! I'm EcoBot, your sustainability assistant 🌱</p>
                  <div className="text-xs space-y-1 bg-gradient-to-r from-primary/5 to-secondary/5 p-3 rounded-lg">
                    <p>Ask me about:</p>
                    <ul className="space-y-1">
                      <li>• Reducing your carbon footprint</li>
                      <li>• Eco-friendly tips and advice</li>
                      <li>• Using Carbon Meter features</li>
                      <li>• Climate change questions</li>
                    </ul>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-md">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-3 text-sm shadow-md ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-primary to-secondary text-white"
                        : "bg-card border border-border"
                    }`}
                  >
                    {message.content}
                  </div>

                  {message.role === "user" && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-secondary to-primary flex items-center justify-center flex-shrink-0 shadow-md">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-md">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-card border border-border rounded-xl px-4 py-3 text-sm shadow-md">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-gradient-to-r from-primary/5 to-secondary/5">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me about sustainability..."
                className="flex-1 border-2 border-primary/20 focus:border-primary"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-md"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
