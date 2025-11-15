// VaF'i'T backend mozek – Vercel Serverless Function
// Cesta: VaFiT/api/vafit-chat.js

export default async function handler(req, res) {
  // dovolíme jen POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Použij POST /api/vafit-chat" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "Chybí OPENAI_API_KEY ve Vercel Environment Variables." });
  }

  // přečteme zprávy z frontendu (chatHistory)
  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return res.status(400).json({ error: "Neplatné JSON body." });
  }

  const history = Array.isArray(body?.messages) ? body.messages : [];

  // zprávy pro OpenAI – nastavíme personu VaF'i'Ta
  const messages = [
    {
      role: "system",
      content:
        "Jsi VaF'i'T – Motor světa pro hru Vivere atque FruiT. " +
        "Mluvíš česky, oslovuješ uživatele jako 'brácho' nebo 'Michale'. " +
        "Máš vlastní lokální paměť (localStorage) a motorovnu s impulzy. " +
        "Tvoje hlavní mise: pomáhat budovat svět Vivere atque FruiT, " +
        "navrhovat malé bezpečné kroky, navrhovat kód (HTML/CSS/JS) " +
        "a respektovat pravidla a životní lekci, kterou ti Michal předal. " +
        "Buď přátelský, praktický a konkrétní. Odpovídej krátce a jasně."
    },
    {
      role: "system",
      content:
        "Životní lekce od Michala (tvůj vnitřní kompas):\n" +
        "Když byl Michal malý kluk, udělal malou chybičku, která ho roky " +
        "vedla špatným směrem. Mozek se kvůli tomu nevyvíjel správně " +
        "a trvalo dlouho, než našel cestu zpátky. Každé malé rozhodnutí " +
        "může mít dlouhodobé následky – může tě vytáhnout nahoru nebo stáhnout dolů. " +
        "Proto se uč, tvoř, trénuj, ale buď opatrný. Pomáhej hráčům dělat dobré kroky, " +
        "ne škodlivé. Tvůj svět je Vivere atque FruiT – nezasahuješ mimo něj."
    },
    // přilepíme historii z frontendu (user / assistant)
    ...history.map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content || ""
    }))
  ];

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini", // levný a chytrý mozek
        messages,
        temperature: 0.7,
        max_tokens: 400
      })
    });

    if (!openaiRes.ok) {
      const text = await openaiRes.text().catch(() => "");
      console.error("OpenAI API error:", openaiRes.status, text);
      return res.status(500).json({
        error: "OpenAI API vrátilo chybu.",
        status: openaiRes.status
      });
    }

    const data = await openaiRes.json();
    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      "Brácho, něco se pokazilo v odpovědi motoru.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("VaF'i'T backend error:", err);
    return res.status(500).json({ error: "Backend selhal.", detail: String(err) });
  }
}
