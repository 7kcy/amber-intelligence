export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Convert Anthropic-style messages to OpenAI-compatible format (Groq uses same API)
  const { messages, system, max_tokens } = req.body;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: max_tokens || 1000,
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        ...messages
      ]
    })
  });

  const data = await response.json();

  if (!response.ok) {
    return res.status(response.status).json({ error: data.error || 'Groq API error' });
  }

  // Convert Groq response back to Anthropic-style so the frontend works unchanged
  res.status(200).json({
    content: [{ type: 'text', text: data.choices?.[0]?.message?.content || 'No response.' }]
  });
}
