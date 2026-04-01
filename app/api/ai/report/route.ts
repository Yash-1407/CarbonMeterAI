import { NextResponse } from 'next/server';
import { getUserHistory } from '@/lib/ai/dataAccess';
import { generateReport } from '@/lib/ai/aiService';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Reports can take longer

export async function GET() {
  try {
    const history = await getUserHistory();
    if (!history || history.length === 0) {
      return NextResponse.json({ error: 'Not enough data to generate report.' }, { status: 400 });
    }

    const report = await generateReport(history);
    return NextResponse.json(report);
  } catch (error) {
    console.error('Error in report route:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
