export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages, system } = req.body;

    const cleanSystem = system + `

IMPORTANT FORMATTING RULES - Always follow these:
1. Never use markdown symbols like ** or ## or * or backticks in your response
2. Write headings in CAPITAL LETTERS followed by a colon and new line
3. Use simple numbered lists like: 1. 2. 3.
4. Use simple bullet points with dash: -
5. Write in clear paragraphs with proper spacing
6. No tables - write information in simple bullet points instead
7. Keep emojis minimal - maximum 2-3 per response only
8. Make answers easy to read like a textbook - clean and simple`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: cleanSystem,
        messages
      })
    });

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
