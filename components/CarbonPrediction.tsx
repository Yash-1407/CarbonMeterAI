"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, TrendingDown, Minus, AlertTriangle, Lightbulb } from "lucide-react";

interface PredictionData {
  predictedValue: number;
  trend: "increasing" | "decreasing" | "stable";
  warningLevel: "low" | "medium" | "high";
  reasons: string[];
  tips: string[];
  motivationalMessage: string;
}

export function CarbonPrediction() {
  const [data, setData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrediction = async () => {
    setLoading(true);
    setError(null);
    try {
      // Sample data as requested
      const pastData = [
        { month: "November", year: 2024, totalCO2: 320 },
        { month: "December", year: 2024, totalCO2: 410 },
        { month: "January",  year: 2025, totalCO2: 380 },
        { month: "February", year: 2025, totalCO2: 450 },
        { month: "March",    year: 2025, totalCO2: 430 }
      ];

      const response = await fetch("/api/predict-carbon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pastData),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch prediction");
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching prediction");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, []);

  if (error) {
    return (
      <Card className="border-red-900/50 bg-red-950/10 mt-8 mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4 text-red-500">
            <AlertTriangle className="h-10 w-10" />
            <p className="font-medium">Failed to load prediction</p>
            <p className="text-sm opacity-80">{error}</p>
            <Button variant="outline" onClick={fetchPrediction}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-900/40 bg-gradient-to-br from-green-950/20 to-background overflow-hidden relative mt-8 mb-8">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-green-900/20">
        <CardTitle className="text-xl font-semibold text-green-500 flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          AI Carbon Prediction Engine
        </CardTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={fetchPrediction} 
          disabled={loading}
          className="text-green-500 hover:text-green-400 hover:bg-green-900/30 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      
      <CardContent className="p-6">
        {loading || !data ? (
          <div className="space-y-6 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="h-16 w-32 bg-green-900/20 rounded-lg"></div>
              <div className="flex gap-2">
                <div className="h-8 w-24 bg-green-900/20 rounded-full"></div>
                <div className="h-8 w-24 bg-green-900/20 rounded-full"></div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 bg-background/50 rounded-xl p-5 border border-green-900/10">
              <div className="space-y-3">
                <div className="h-5 w-1/3 bg-green-900/20 rounded mb-4"></div>
                <div className="flex items-start gap-3"><div className="w-4 h-4 rounded-full bg-primary/20 shrink-0"></div><div className="h-4 w-full bg-green-900/20 rounded"></div></div>
                <div className="flex items-start gap-3"><div className="w-4 h-4 rounded-full bg-primary/20 shrink-0"></div><div className="h-4 w-full bg-green-900/20 rounded"></div></div>
                <div className="flex items-start gap-3"><div className="w-4 h-4 rounded-full bg-primary/20 shrink-0"></div><div className="h-4 w-5/6 bg-green-900/20 rounded"></div></div>
              </div>
              <div className="space-y-3">
                <div className="h-5 w-1/3 bg-green-900/20 rounded mb-4"></div>
                <div className="flex items-start gap-3"><div className="w-4 h-4 rounded-full bg-green-500/20 shrink-0"></div><div className="h-4 w-full bg-green-900/20 rounded"></div></div>
                <div className="flex items-start gap-3"><div className="w-4 h-4 rounded-full bg-green-500/20 shrink-0"></div><div className="h-4 w-full bg-green-900/20 rounded"></div></div>
                <div className="flex items-start gap-3"><div className="w-4 h-4 rounded-full bg-green-500/20 shrink-0"></div><div className="h-4 w-5/6 bg-green-900/20 rounded"></div></div>
              </div>
            </div>
            <div className="h-10 w-3/4 mx-auto bg-green-900/20 rounded-xl mt-4"></div>
          </div>
        ) : (
          <div className="space-y-8 tracking-wide">
            {/* Top section: Main Value and Badges */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="text-sm text-green-500/70 uppercase tracking-widest font-semibold mb-1">Next Month's Forecast</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-foreground">{data.predictedValue}</span>
                  <span className="text-xl font-medium text-muted-foreground">kg CO₂</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Trend Badge */}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border
                  ${data.trend === 'increasing' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                    data.trend === 'decreasing' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                    'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                  {data.trend === 'increasing' && <TrendingUp className="h-4 w-4" />}
                  {data.trend === 'decreasing' && <TrendingDown className="h-4 w-4" />}
                  {data.trend === 'stable' && <Minus className="h-4 w-4" />}
                  <span className="capitalize">{data.trend}</span>
                </div>

                {/* Warning Level Badge */}
                <div className={`px-3 py-1.5 rounded-full text-sm font-semibold border
                  ${data.warningLevel === 'low' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                    data.warningLevel === 'medium' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                    'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                  <span className="capitalize">{data.warningLevel} Risk</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 bg-background/50 rounded-xl p-5 border border-green-900/10">
              {/* Reasons */}
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
                  Why this prediction?
                </h4>
                <ul className="space-y-3">
                  {data.reasons.map((reason, i) => (
                    <li key={i} className="text-sm flex items-start gap-3 text-foreground/80 leading-relaxed">
                      <span className="text-primary font-bold opacity-50 mt-0.5">{i + 1}.</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tips */}
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500/50"></span>
                  Actionable Tips
                </h4>
                <ul className="space-y-3">
                  {data.tips.map((tip, i) => (
                    <li key={i} className="text-sm flex items-start gap-3 text-foreground/80 leading-relaxed">
                      <span className="text-green-500 font-bold opacity-50 mt-0.5">{i + 1}.</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Motivation */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
              <p className="text-sm font-medium text-primary italic">"{data.motivationalMessage}"</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
