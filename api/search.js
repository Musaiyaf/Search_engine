export default async function handler(req, res) {
  // Allow requests from anywhere (CORS)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Missing query parameter: q" });
  }

  try {
    // Use DuckDuckGo Instant Answer API (free, no key needed)
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`;

    const response = await fetch(url);
    const data = await response.json();

    // Build a clean result for HandyOS
    const result = {
      query: q,
      answer: data.AbstractText || data.Answer || null,
      source: data.AbstractSource || null,
      url: data.AbstractURL || null,
      related: data.RelatedTopics
        ? data.RelatedTopics.slice(0, 5).map((t) => t.Text).filter(Boolean)
        : [],
    };

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: "Search failed", details: err.message });
  }
}
