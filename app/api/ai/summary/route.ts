import { NextResponse } from 'next/server';
import { getUserHistory } from '@/lib/ai/dataAccess';
import { generateWeeklySummary, getRoastOrPraise } from '@/lib/ai/aiService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const history = await getUserHistory();
    if (!history || history.length === 0) {
      return NextResponse.json({ summary: 'No data available to generate a summary yet.', roastOrPraise: '' });
    }

    const recentHistory = history.slice(0, 30);
    const summary = await generateWeeklySummary(recentHistory);
    const roastOrPraise = await getRoastOrPraise(recentHistory);

    return NextResponse.json({ summary, roastOrPraise });
  } catch (error) {
    console.error('Error in summary route:', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}
