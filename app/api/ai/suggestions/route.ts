import { NextResponse } from 'next/server';
import { getUserHistory } from '@/lib/ai/dataAccess';
import { getPersonalizedSuggestions } from '@/lib/ai/aiService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const history = await getUserHistory();
    if (!history || history.length === 0) {
      return NextResponse.json({ tips: [{ title: 'Start Tracking', description: 'Add more data to receive personalized AI suggestions.', impact: 'High' }] });
    }

    // Limit context to recent entries to save tokens, optionally
    const recentHistory = history.slice(0, 50);
    const suggestions = await getPersonalizedSuggestions(recentHistory);
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Error in suggestions route:', error);
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 });
  }
}
