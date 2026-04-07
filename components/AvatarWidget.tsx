"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CarbonAvatar, { getAvatarState } from "./CarbonAvatar";
import { useCarbonScore } from "@/hooks/useCarbonScore";
import { ChevronRight } from "lucide-react";

export default function AvatarWidget() {
  const { score, goal, isLoaded } = useCarbonScore();

  if (!isLoaded) return null;

  const state = getAvatarState(score, goal);
  
  const stateLabels = {
    EXCELLENT: "Excellent",
    GOOD: "Good",
    NEUTRAL: "Neutral",
    WARNING: "Warning",
    CRITICAL: "Critical"
  };

  return (
    <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-card to-card/50 overflow-hidden relative group">
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium">Carbon Avatar</CardTitle>
        <Link href="/avatar" className="text-muted-foreground hover:text-primary transition-colors">
          <ChevronRight className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent className="flex items-center gap-4 relative z-10">
        <Link href="/avatar" className="shrink-0 cursor-pointer block transform hover:scale-110 transition-transform">
          <CarbonAvatar score={score} goal={goal} size="sm" />
        </Link>
        <div className="flex flex-col">
          <span className="text-lg font-bold">Health: {stateLabels[state]}</span>
          <span className="text-xs text-muted-foreground">{score.toFixed(1)} / {goal} kg CO₂</span>
          <Link href="/avatar" className="text-xs text-primary underline mt-2 font-medium">
            Interact with your avatar →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
