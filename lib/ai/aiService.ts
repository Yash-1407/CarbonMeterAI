import { PROMPTS } from './prompts';

const FREE_MODEL = 'llama-3.3-70b-versatile';

// Direct Groq REST API call with native JSON mode support
async function callGroq(systemPrompt: string, userPrompt: string, jsonMode: boolean = false, maxTokens: number = 1024): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set');

  const body: any = {
    model: FREE_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: maxTokens,
    temperature: 0.7,
  };

  if (jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('[Groq API] Error response:', res.status, errText);
    throw new Error(`Groq API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';
  console.log('[Groq API] Response (first 300 chars):', content.substring(0, 300));
  return content;
}

// Helper: safely parse JSON from model text
function safeParseJSON(text: string): any {
  if (!text || text.trim().length === 0) return null;

  // Strip markdown code fences if present
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Try extracting JSON object
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { /* ignore */ }
    }
    console.warn('[AI Service] Could not parse JSON from:', text.substring(0, 200));
    return null;
  }
}

export async function getPersonalizedSuggestions(userDataContext: any) {
  try {
    const limitedContext = Array.isArray(userDataContext) ? userDataContext.slice(0, 20) : userDataContext;
    const text = await callGroq(
      PROMPTS.getPersonalizedSuggestions,
      `User Data Context: ${JSON.stringify(limitedContext)}`,
      true, // JSON mode
      1024
    );

    const parsed = safeParseJSON(text);
    if (parsed?.tips) return parsed;

    return {
      tips: [
        { title: 'Reduce Transport Emissions', description: 'Consider cycling or public transport for short commutes.', impact: 'High' },
        { title: 'Optimize Energy Use', description: 'Switch off appliances when not in use and use LED lighting.', impact: 'Medium' },
        { title: 'Track Consistently', description: 'Log your activities daily for better AI predictions.', impact: 'Low' },
      ]
    };
  } catch (error) {
    console.error('[AI Service] getPersonalizedSuggestions error:', error);
    return { tips: [{ title: 'Start Tracking', description: 'Add more data for personalized suggestions.', impact: 'High' }] };
  }
}

export async function generateWeeklySummary(weekData: any) {
  try {
    const limitedData = Array.isArray(weekData) ? weekData.slice(0, 20) : weekData;
    const text = await callGroq(
      PROMPTS.generateWeeklySummary,
      `Weekly Data Context: ${JSON.stringify(limitedData)}`,
      false,
      512
    );
    return text || 'Your weekly summary is being generated. Check back soon!';
  } catch (error) {
    console.error('[AI Service] generateWeeklySummary error:', error);
    return 'Unable to generate summary at this time.';
  }
}

export async function getCategoryInsight(category: string, userDataContext: any) {
  try {
    const limitedContext = Array.isArray(userDataContext) ? userDataContext.slice(0, 15) : userDataContext;
    const text = await callGroq(
      PROMPTS.getCategoryInsight,
      `Focus Category: ${category}\nUser Data Context: ${JSON.stringify(limitedContext)}`,
      false,
      512
    );
    return text || 'No insight available for this category yet.';
  } catch (error) {
    console.error('[AI Service] getCategoryInsight error:', error);
    return 'Unable to generate insight at this time.';
  }
}

export async function getPrediction(userDataContext: any) {
  try {
    const limitedContext = Array.isArray(userDataContext) ? userDataContext.slice(0, 20) : userDataContext;
    const text = await callGroq(
      PROMPTS.getPrediction,
      `User Data Context: ${JSON.stringify(limitedContext)}\nPredict footprint for next 30 days.`,
      true, // JSON mode
      512
    );

    const parsed = safeParseJSON(text);
    if (parsed?.predictedTotal !== undefined) return parsed;

    return { predictedTotal: 0, trend: 'stable', reasoning: 'Not enough data for prediction yet.' };
  } catch (error) {
    console.error('[AI Service] getPrediction error:', error);
    return { predictedTotal: 0, trend: 'stable', reasoning: 'Prediction service temporarily unavailable.' };
  }
}

export async function getRoastOrPraise(scoreSummary: any) {
  try {
    const text = await callGroq(
      PROMPTS.getRoastOrPraise,
      `Score/Performance context: ${JSON.stringify(scoreSummary)}`,
      false,
      256
    );
    return text || 'Keep going! Every step counts. 🌍';
  } catch (error) {
    console.error('[AI Service] getRoastOrPraise error:', error);
    return 'Keep up the great work! 🌱';
  }
}

export async function generateReport(userDataContext: any) {
  try {
    const limitedContext = Array.isArray(userDataContext) ? userDataContext.slice(0, 30) : userDataContext;
    const text = await callGroq(
      PROMPTS.generateReport,
      `Generate full report for this User Data Context: ${JSON.stringify(limitedContext)}`,
      true, // JSON mode
      2048
    );

    const parsed = safeParseJSON(text);
    if (parsed?.executiveSummary) return parsed;

    return {
      executiveSummary: 'Report generation requires more data. Continue tracking your carbon footprint.',
      categoryAnalysis: [{ category: 'General', analysis: 'Insufficient data for detailed analysis.' }],
      comparison: 'More data needed for comparison.',
      topRecommendations: ['Keep tracking your daily activities.'],
      actionPlan30Days: ['Week 1-4: Continue logging data for better insights.']
    };
  } catch (error) {
    console.error('[AI Service] generateReport error:', error);
    return {
      executiveSummary: 'Report temporarily unavailable.',
      categoryAnalysis: [],
      comparison: 'N/A',
      topRecommendations: ['Try again later.'],
      actionPlan30Days: ['Service will be available shortly.']
    };
  }
}
