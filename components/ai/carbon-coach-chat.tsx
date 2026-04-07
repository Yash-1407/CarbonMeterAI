"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, Bot, User, Minimize2, Maximize2 } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export function CarbonCoachChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const toggleChat = () => {
    setIsOpen(!isOpen)
    setIsMinimized(false)
  }

  const toggleMinimize = () => setIsMinimized(!isMinimized)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)

    const assistantId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "" }])

    try {
      console.log("[CarbonCoach] Sending to /api/chat-claude...");
      const response = await fetch("/api/chat-claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        }),
      })

      console.log("[CarbonCoach] Response status:", response.status);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder("utf-8")

      console.log("[CarbonCoach] Got reader:", !!reader);

      if (reader) {
        let buffer = ""
        while (true) {
          const { value, done } = await reader.read()
          if (done) {
            console.log("[CarbonCoach] Stream done");
            break
          }

          const rawChunk = decoder.decode(value, { stream: true })
          console.log("[CarbonCoach] Raw chunk:", rawChunk);
          buffer += rawChunk
          
          let newlineIndex: number
          while ((newlineIndex = buffer.indexOf("\n")) >= 0) {
            const line = buffer.slice(0, newlineIndex).trim()
            buffer = buffer.slice(newlineIndex + 1)

            if (!line) continue;
            console.log("[CarbonCoach] Parsed line:", line);

            if (line.startsWith("data: ")) {
              const dataStr = line.slice(6).trim()
              if (dataStr === "[DONE]") {
                console.log("[CarbonCoach] Received [DONE]");
                break
              }
              if (dataStr) {
                try {
                  const data = JSON.parse(dataStr)
                  console.log("[CarbonCoach] Parsed data:", data);
                  if (data.text) {
                    setMessages(prev =>
                      prev.map(msg =>
                        msg.id === assistantId
                          ? { ...msg, content: msg.content + data.text }
                          : msg
                      )
                    )
                  }
                } catch (parseErr) {
                  console.error("[CarbonCoach] JSON parse error:", parseErr, "raw:", dataStr);
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Carbon Coach error:", error)
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantId
            ? { ...msg, content: "Sorry, I couldn't connect to the AI service. Please try again." }
            : msg
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg z-50 transition-all hover:scale-105"
        size="icon"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    )
  }

  return (
    <Card
      className={`fixed bottom-6 right-6 w-96 shadow-xl z-50 transition-all duration-300 ${
        isMinimized ? "h-16" : "h-[500px]"
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-t-lg">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Carbon Coach (AI)
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
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8 animate-in fade-in zoom-in duration-500">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-emerald-500" />
                  <p className="text-sm font-medium">Hello! I'm your AI Carbon Coach.</p>
                  <p className="text-xs mt-2 opacity-80">I analyze your past footprint history to give personalized advice.</p>
                  <ul className="text-xs mt-4 space-y-2 max-w-[80%] mx-auto text-left">
                    <li className="bg-muted p-2 rounded-md">✨ "How can I reduce my transport emissions?"</li>
                    <li className="bg-muted p-2 rounded-md">🏆 "Give me a 7-day challenge!"</li>
                    <li className="bg-muted p-2 rounded-md">🔍 "What is my worst category?"</li>
                  </ul>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  {message.role === "assistant" && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}

                  <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    message.role === "user" ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white" : "bg-muted"
                  }`}>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>

                  {message.role === "user" && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-muted rounded-lg px-3 py-2 text-sm flex space-x-1 items-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="bg-gradient-to-r from-emerald-500 to-green-600">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
