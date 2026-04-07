import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not configured' }, { status: 500 });
    }

    const systemPrompt = `You are a carbon footprint prediction AI. Analyze the user's past monthly carbon data and predict next month's footprint. Return a JSON response with: predictedValue (number in kg CO2), trend (increasing/decreasing/stable), warningLevel (low/medium/high), reasons (array of 3 strings explaining why), tips (array of 3 actionable tips to reduce it), and a motivationalMessage (string). Ensure the output is strictly valid JSON without markdown blocks or any non-JSON content.`;

    const userMessage = `Here is my past carbon data:\n${JSON.stringify(data, null, 2)}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Error:', errorText);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices[0].message.content;
    const parsedData = JSON.parse(content);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('Error predicting carbon:', error);
    return NextResponse.json(
      { error: 'Failed to generate prediction', details: error.message },
      { status: 500 }
    );
  }
}
