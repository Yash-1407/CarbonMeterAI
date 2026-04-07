"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Car, Plane, Utensils, Recycle, Settings } from "lucide-react";
import CarbonAvatar, { getAvatarState, AvatarState } from "@/components/CarbonAvatar";
import { useCarbonScore } from "@/hooks/useCarbonScore";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AvatarPage() {
  const { score, goal, addScore, updateGoal, isLoaded } = useCarbonScore();
  const [history, setHistory] = useState<AvatarState[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLimit, setNewLimit] = useState("");

  const handleSaveLimit = () => {
    const parsed = parseFloat(newLimit);
    if (!isNaN(parsed) && parsed > 0) {
      updateGoal(parsed);
      setIsDialogOpen(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      setNewLimit(goal.toString());
      const currentState = getAvatarState(score, goal);
      setHistory([
        "GOOD", "NEUTRAL", "EXCELLENT", "GOOD", "WARNING", "GOOD", currentState
      ]);
    }
  }, [score, goal, isLoaded]);

  if (!isLoaded) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;

  const state = getAvatarState(score, goal);
  const healthPercentage = Math.max(0, 100 - (score / goal) * 100);
  const progressPercentage = Math.min(100, (score / goal) * 100);

  const actions = [
    { label: "Drove Car", icon: <Car className="w-5 h-5 mr-2" />, impact: 5, color: "bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border-orange-500/20" },
    { label: "Flew", icon: <Plane className="w-5 h-5 mr-2" />, impact: 30, color: "bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20" },
    { label: "Ate Meat", icon: <Utensils className="w-5 h-5 mr-2" />, impact: 3, color: "bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border-yellow-500/20" },
    { label: "Recycled", icon: <Recycle className="w-5 h-5 mr-2" />, impact: -2, color: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border-emerald-500/20" },
  ];

  const getHistoryColor = (s: AvatarState) => {
    switch(s) {
      case "EXCELLENT": return "bg-emerald-500";
      case "GOOD": return "bg-green-400";
      case "NEUTRAL": return "bg-yellow-400";
      case "WARNING": return "bg-orange-400";
      case "CRITICAL": return "bg-red-500";
      default: return "bg-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header */}
        <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Your Carbon Avatar</h1>
          <p className="text-muted-foreground">Keep your avatar happy by making sustainable choices!</p>
        </div>

        {/* Avatar Display Center */}
        <div className="flex justify-center mb-16 mt-12 relative">
          <CarbonAvatar score={score} goal={goal} size="lg" />
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <p className="text-sm text-muted-foreground mb-1">Total Footprint</p>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-4xl font-bold">{score.toFixed(1)}</span>
              <div className="flex items-center">
                <span className="text-muted-foreground pb-1">/ {goal} kg CO₂</span>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="ml-2 text-muted-foreground hover:text-primary pb-1 transition-colors relative z-10" aria-label="Edit Limit">
                      <Settings className="w-4 h-4" />
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Avatar Limit</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <Label htmlFor="limit">Total Carbon Limit (kg CO₂)</Label>
                      <Input 
                        id="limit" 
                        type="number" 
                        value={newLimit} 
                        onChange={(e) => setNewLimit(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleSaveLimit}>Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground text-right">{progressPercentage.toFixed(0)}% of limit</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="text-6xl">❤️</span>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Avatar Health</p>
            <div className="flex items-end gap-2 mb-2 relative z-10">
              <span className="text-4xl font-bold">{healthPercentage.toFixed(0)}%</span>
            </div>
            <p className="text-sm text-muted-foreground mt-4 relative z-10">
              State: <strong className="text-foreground">{state}</strong>
            </p>
          </div>
        </div>

        {/* Quick Log Buttons */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6 flex items-center justify-center gap-2">
            Quick Actions <span className="text-sm font-normal text-muted-foreground">(Instant update)</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => addScore(action.impact)}
                className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all duration-200 transform hover:-translate-y-1 hover:shadow-md ${action.color}`}
              >
                {action.icon}
                <span className="font-semibold text-sm mt-3">{action.label}</span>
                <span className="text-xs mt-1 opacity-80 backdrop-blur-sm px-2 py-1 rounded bg-black/5 dark:bg-white/5">
                  {action.impact > 0 ? `+${action.impact}` : action.impact} kg CO₂
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* History Bar */}
        <div className="bg-card border border-border rounded-xl p-6 text-center shadow-sm relative overflow-hidden">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Last 7 Days (Simulated)</h3>
          <div className="flex items-center justify-center gap-3 md:gap-6">
            {history.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="text-xs text-muted-foreground">Day {i + 1}</div>
                <div className={`w-8 h-8 rounded-full ${getHistoryColor(s)} shadow-inner flex items-center justify-center`}>
                  {s === "EXCELLENT" && "✨"}
                  {s === "GOOD" && "🙂"}
                  {s === "NEUTRAL" && "😐"}
                  {s === "WARNING" && "😟"}
                  {s === "CRITICAL" && "😭"}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
