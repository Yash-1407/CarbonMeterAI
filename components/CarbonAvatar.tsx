"use client";

import React from "react";

export type AvatarState = "EXCELLENT" | "GOOD" | "NEUTRAL" | "WARNING" | "CRITICAL";

interface CarbonAvatarProps {
  score: number;
  goal: number;
  size?: "sm" | "md" | "lg";
}

export function getAvatarState(score: number, goal: number): AvatarState {
  const percentage = (score / goal) * 100;
  if (percentage <= 20) return "EXCELLENT";
  if (percentage <= 40) return "GOOD";
  if (percentage <= 60) return "NEUTRAL";
  if (percentage <= 80) return "WARNING";
  return "CRITICAL";
}

const stateConfig = {
  EXCELLENT: {
    color: "fill-emerald-400",
    bgColor: "bg-emerald-500/20",
    glow: "drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]",
    face: "M 35 45 Q 50 60 65 45", // Big smile
    eyes: "M 35 35 Q 40 30 45 35 M 55 35 Q 60 30 65 35", // Happy eyes
    animation: "animate-bounce-slow",
    text: "I'm thriving!"
  },
  GOOD: {
    color: "fill-green-400",
    bgColor: "bg-green-500/20",
    glow: "drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]",
    face: "M 40 50 Q 50 55 60 50", // Happy
    eyes: "M 35 35 A 5 5 0 1 1 35.1 35 M 65 35 A 5 5 0 1 1 65.1 35", // Normal eyes
    animation: "animate-pulse-slow",
    text: "I'm feeling good!"
  },
  NEUTRAL: {
    color: "fill-yellow-400",
    bgColor: "bg-yellow-500/20",
    glow: "drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]",
    face: "M 40 50 L 60 50", // Straight line
    eyes: "M 35 35 A 5 5 0 1 1 35.1 35 M 65 35 A 5 5 0 1 1 65.1 35",
    animation: "animate-wobble",
    text: "I'm doing okay..."
  },
  WARNING: {
    color: "fill-orange-400",
    bgColor: "bg-orange-500/20",
    glow: "drop-shadow-[0_0_12px_rgba(251,146,60,0.6)]",
    face: "M 40 55 Q 50 45 60 55", // Sad
    eyes: "M 35 35 A 4 4 0 1 1 35.1 35 M 65 35 A 4 4 0 1 1 65.1 35",
    animation: "animate-shake",
    text: "I'm struggling a bit..."
  },
  CRITICAL: {
    color: "fill-red-500",
    bgColor: "bg-red-500/20",
    glow: "drop-shadow-[0_0_20px_rgba(239,68,68,0.9)]",
    face: "M 35 60 Q 50 40 65 60", // Very sad
    eyes: "M 30 30 L 40 38 M 70 30 L 60 38", // Angry/sad eyes
    animation: "animate-shake-fast",
    text: "Help me! I can't breathe!"
  }
};

export default function CarbonAvatar({ score, goal, size = "md" }: CarbonAvatarProps) {
  const state = getAvatarState(score, goal);
  const config = stateConfig[state];

  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-48 h-48",
    lg: "w-64 h-64"
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4`}>
      {/* Custom Styles for animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes wobble {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg); }
          75% { transform: rotate(3deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          50% { transform: translateX(2px); }
          75% { transform: translateX(-2px); }
        }
        @keyframes shake-fast {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .animate-bounce-slow { animation: bounce-slow 3s infinite ease-in-out; }
        .animate-pulse-slow { animation: pulse-slow 4s infinite ease-in-out; }
        .animate-wobble { animation: wobble 3s infinite ease-in-out; }
        .animate-shake { animation: shake 2s infinite ease-in-out; }
        .animate-shake-fast { animation: shake-fast 0.5s infinite ease-in-out; }
        
        .sparkle {
          position: absolute;
          animation: sparkle-anim 2s infinite linear;
          opacity: 0;
        }
        @keyframes sparkle-anim {
          0% { transform: scale(0) rotate(0deg); opacity: 0; }
          50% { transform: scale(1) rotate(180deg); opacity: 1; }
          100% { transform: scale(0) rotate(360deg); opacity: 0; }
        }
        
        .tear {
          position: absolute;
          background: #60a5fa;
          width: 6px;
          height: 10px;
          border-radius: 50%;
          animation: tear-drop 1.5s infinite ease-in;
          opacity: 0;
        }
        @keyframes tear-drop {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(30px); opacity: 0; }
        }
      `}} />

      <div className={`relative ${sizeClasses[size]} ${config.animation} ${config.glow} transition-colors duration-500`}>
        {/* Planet SVG Base */}
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="45" className={`${config.color} transition-colors duration-500`} />
          
          {/* Continents (Stylized) */}
          <path 
            d="M 20 40 Q 30 20 40 30 T 45 50 Q 30 60 25 50 Q 15 45 20 40 Z" 
            className="fill-green-600/30 dark:fill-green-800/30" 
          />
          <path 
            d="M 60 25 Q 70 20 80 35 T 75 60 Q 60 65 55 50 Q 50 35 60 25 Z" 
            className="fill-green-600/30 dark:fill-green-800/30" 
          />
          
          {/* Face */}
          <g className="stroke-white stroke-2 fill-none stroke-linecap-round stroke-linejoin-round transition-all duration-500">
            {/* Eyes */}
            <path d={config.eyes} />
            {/* Mouth */}
            <path d={config.face} />
          </g>
        </svg>

        {/* Extra Animations based on state */}
        {state === "EXCELLENT" && (
          <>
            <div className="sparkle" style={{top: '10%', left: '20%', animationDelay: '0s'}}>✨</div>
            <div className="sparkle" style={{top: '20%', right: '10%', animationDelay: '0.7s'}}>✨</div>
            <div className="sparkle" style={{bottom: '20%', left: '30%', animationDelay: '1.4s'}}>✨</div>
          </>
        )}
        
        {state === "CRITICAL" && (
          <>
            <div className="tear" style={{top: '40%', left: '30%', animationDelay: '0s'}}></div>
            <div className="tear" style={{top: '40%', right: '30%', animationDelay: '0.5s'}}></div>
          </>
        )}
      </div>

      {size !== "sm" && (
        <div className="mt-6 text-center">
          <div className="inline-block relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            <div className="relative bg-card border border-border rounded-2xl px-6 py-3 shadow-xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-card border-t border-l border-border transform rotate-45" />
              <p className="text-lg font-medium tracking-wide dark:text-gray-100">{config.text}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
