// api/t212-portfolio.js
// Vivere atque FruiT – Portfolio Impulse Engine

const KEY = process.env.T212_API_KEY_VAFIT;

export default async function handler(req, res) {
  if (!KEY) {
    return res.status(500).json({
      error: "Chybí T212_API_KEY_VAFIT v prostředí serveru."
    });
  }

  try {
    const response = await fetch("https://demo.trading212.com/api/v0/equity/account", {
      headers: {
        Authorization: `Bearer ${KEY}`,
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({
        error: "Trading212 API error",
        status: response.status,
        text
      });
    }

    const data = await response.json();

    // Vyfiltrujeme pouze užitečné hodnoty
    const output = {
      currency: data?.account?.currency || "CZK",
      cash: data?.account?.cash || 0,
      invested: data?.account?.invested || 0,
      pnl: data?.account?.pnl || 0,
      total: data?.account?.total || 0,
      updated: new Date().toISOString()
    };

    return res.status(200).json({ portfolio: output });

  } catch (err) {
    return res.status(500).json({
      error: "Nečekaná chyba backendu při načítání portfolio impulsu.",
      message: err.message
    });
  }
}
