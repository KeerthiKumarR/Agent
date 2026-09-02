/**
 * AI Provider abstraction for CommercePilot
 * Tier 1: Groq (Ultra-fast LLM inference)
 * Tier 2: Gemini (Google Generative AI fallback)
 * Tier 3: OpenAI (Optional fallback)
 * Tier 4: Built-in deterministic semantic engine fallback
 */

export interface LLMGenerateParams {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export async function generateAICompletion({
  systemPrompt,
  userPrompt,
  temperature = 0.7,
  maxTokens = 600
}: LLMGenerateParams): Promise<{ text: string; isRealLLM: boolean; model: string }> {
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // ==========================================
  // Tier 1: Groq (Primary High-Speed Provider)
  // ==========================================
  if (groqKey && (groqKey.startsWith('gsk_') || groqKey.length > 20)) {
    const groqModels = ['qwen/qwen3.8-27b', 'groq/compound', 'groq/compound-mini', 'openai/gpt-oss-120b'];
    for (const model of groqModels) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature,
            max_tokens: maxTokens
          })
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content && typeof content === 'string' && content.trim().length > 0) {
            return { text: content.trim(), isRealLLM: true, model: `groq/${model}` };
          }
        }
      } catch (e) {
        console.warn(`Groq (${model}) call error:`, e);
      }
    }
  }

  // ==========================================
  // Tier 2: Google Gemini (Secondary Fallback)
  // ==========================================
  if (geminiKey && geminiKey.length > 10) {
    const geminiModels = ['gemini-2.5-flash', 'gemini-3.7-flash', 'gemini-flash-latest'];
    for (const model of geminiModels) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: systemPrompt }]
              },
              contents: [
                {
                  role: 'user',
                  parts: [{ text: userPrompt }]
                }
              ],
              generationConfig: {
                temperature,
                maxOutputTokens: maxTokens
              }
            })
          }
        );

        if (res.ok) {
          const data = await res.json();
          const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (content && typeof content === 'string' && content.trim().length > 0) {
            return { text: content.trim(), isRealLLM: true, model: `google/${model}` };
          }
        }
      } catch (e) {
        console.warn(`Gemini (${model}) call error:`, e);
      }
    }
  }

  // ==========================================
  // Tier 3: OpenAI (Optional Fallback)
  // ==========================================
  if (openaiKey && openaiKey.startsWith('sk-')) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature,
          max_tokens: maxTokens
        })
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          return { text: content.trim(), isRealLLM: true, model: data.model || 'gpt-4o-mini' };
        }
      }
    } catch (e) {
      console.warn('OpenAI API call error:', e);
    }
  }

  // ==========================================
  // Tier 4: Semantic Domain Fallback Engine
  // ==========================================
  return { text: '', isRealLLM: false, model: 'commercepilot-semantic-engine-v1' };
}

