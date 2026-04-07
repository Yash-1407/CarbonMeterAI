"use client";

import { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";

const LIMIT_KEY = 'carbon_avatar_limit';

export function useCarbonScore() {
  const [score, setScore] = useState(0);
  const [goal, setGoal] = useState(100);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchData = async () => {
    // 1. Load limit from localStorage
    const savedLimit = localStorage.getItem(LIMIT_KEY);
    if (savedLimit) {
      setGoal(parseFloat(savedLimit));
    } else {
      setGoal(100); // Default to 100
    }

    // 2. Load total score from supabase this week's activities
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from('carbon_activities')
        .select('carbon_footprint')
        .eq('user_id', user.id);

      if (!error && data) {
        const totalScore = data.reduce((sum, a) => sum + Number(a.carbon_footprint || 0), 0);
        setScore(totalScore);
      }
    }
    
    setIsLoaded(true);
  };

  useEffect(() => {
    fetchData();

    const handleUpdate = () => {
      fetchData();
    };

    window.addEventListener('carbonScoreUpdated', handleUpdate);
    window.addEventListener('carbonLimitUpdated', handleUpdate);

    return () => {
      window.removeEventListener('carbonScoreUpdated', handleUpdate);
      window.removeEventListener('carbonLimitUpdated', handleUpdate);
    };
  }, []);

  const addScore = async (amount: number) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const activityType = amount > 0 ? 'other' : 'reduction';
      const footprint = amount;
      
      const { error } = await supabase
        .from('carbon_activities')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          category: 'avatar_quick_action',
          amount: Math.abs(amount),
          unit: 'kg',
          carbon_footprint: footprint,
          date: new Date().toISOString().split('T')[0],
          notes: 'Added from Avatar Quick Action'
        });
      
      if (!error) {
        window.dispatchEvent(new Event('carbonScoreUpdated'));
      }
    }
  };

  const updateGoal = (newGoal: number) => {
    localStorage.setItem(LIMIT_KEY, newGoal.toString());
    setGoal(newGoal);
    window.dispatchEvent(new Event('carbonLimitUpdated'));
  };

  return { score, goal, addScore, updateGoal, isLoaded };
}
