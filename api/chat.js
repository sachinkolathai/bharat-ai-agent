export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages, system, language } = req.body;

    const langInstructions = {
      english: `LANGUAGE RULE: Reply ONLY in pure English. Clear, simple, friendly English only.`,
      hindi: `LANGUAGE RULE: Reply ONLY in pure Hindi (Devanagari script). Poori tarah Hindi mein likho. Roman script bilkul mat use karo.`,
      hinglish: `LANGUAGE RULE: Reply in Hinglish only — casual mix of Hindi words written in English (Roman) script. For example: "GST return file karne ke liye pehle GST portal par login karo". Do not use Devanagari script.`
    };

    const selectedLang = langInstructions[language] || langInstructions.hinglish;

    const cleanSystem = system + `

${selectedLang}

IMPORTANT FORMATTING RULES - Always follow these:
1. Never use markdown symbols like ** or ## or * or backticks
2. Write headings in CAPITAL LETTERS followed by a colon
3. Use simple numbered lists: 1. 2. 3.
4. Use simple bullet points with dash: -
5. Write in clear paragraphs with proper spacing
6. No tables - use simple bullet points instead
7. Keep emojis minimal - maximum 2-3 per response
8. Make answers easy to read like a textbook`;

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
