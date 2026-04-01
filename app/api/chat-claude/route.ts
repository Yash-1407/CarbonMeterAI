import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import { getUserHistory } from '@/lib/ai/dataAccess';
import { PROMPTS } from '@/lib/ai/prompts';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const history = await getUserHistory();

  // Limit history strictly to save tokens and latency
  const recentHistory = history.slice(0, 30);
  const systemPromptContext = `${PROMPTS.chatWithAdvisor}\n\nUser Recent Data Context: ${JSON.stringify(recentHistory)}`;

  const result = await streamText({
    model: groq('llama-3.3-70b-versatile') as any,
    messages,
    system: systemPromptContext,
  });

  return result.toDataStreamResponse();
}
