import { NextResponse } from 'next/server';
import { getUserHistory } from '@/lib/ai/dataAccess';
import { getPrediction } from '@/lib/ai/aiService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const history = await getUserHistory();
    if (!history || history.length === 0) {
      return NextResponse.json({ predictedTotal: 0, trend: 'stable', reasoning: 'Not enough data.' });
    }

    const prediction = await getPrediction(history);
    return NextResponse.json(prediction);
  } catch (error) {
    console.error('Error in prediction route:', error);
    return NextResponse.json({ error: 'Failed to generate prediction' }, { status: 500 });
  }
}
