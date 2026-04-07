import { getUserHistory } from '@/lib/ai/dataAccess';
import { PROMPTS } from '@/lib/ai/prompts';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    let history: any[] = [];
    try {
      history = await getUserHistory();
    } catch (e) {
      console.error('[chat-claude] getUserHistory failed:', e);
    }

    const recentHistory = history.slice(0, 30);
    const systemPromptContext = `${PROMPTS.chatWithAdvisor}\n\nUser Recent Data Context: ${JSON.stringify(recentHistory)}`;

    const formattedMessages = messages
      .map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: String(m.content),
      }))
      .filter((m: any) => m.content);

    const groqRequestBody = {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPromptContext },
        ...formattedMessages,
      ],
      stream: false,
      max_tokens: 1024,
      temperature: 0.7,
    };

    console.log('[chat-claude] Calling Groq API (non-streaming)...');

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify(groqRequestBody),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[chat-claude] Groq API error:', res.status, errText);
      throw new Error(`Groq API error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const assistantContent = data.choices?.[0]?.message?.content || '';
    console.log('[chat-claude] Groq response length:', assistantContent.length);

    // Return as SSE so the frontend can read it the same way
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Send the full response as a single SSE chunk
        const payload = JSON.stringify({ text: assistantContent });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err: any) {
    console.error('[chat-claude] API error:', err);
    // Return the error as an SSE stream so the frontend always gets something
    const encoder = new TextEncoder();
    const errorStream = new ReadableStream({
      start(controller) {
        const payload = JSON.stringify({ text: 'Sorry, something went wrong. Please try again.' });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      },
    });
    return new Response(errorStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  }
}
