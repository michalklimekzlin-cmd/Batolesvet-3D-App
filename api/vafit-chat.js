// api/vafit-chat.js
// VaF'i'T – Motor světa (backend mozek bez knihoven, jen přes fetch)

const REPO_OWNER = "michalklimekzlin-cmd";
const REPO_NAME = "Vivere-atque-FruiT";

// ---------- popis složek v rootu repa ----------
function describeFolder(name) {
  const n = name.toLowerCase();

  if (n === "revia") return "Revia – textová / duchovní vrstva, průvodce světem a otáčením vrstev.";
  if (n === "vafit-gallery") return "VafiT-gallery – galerie glyphů, obrázků a příběhů.";
  if (n === "vivere") return "Vivere – hlavní svět/mapa, propojení rodiny (Hlavoun, Viri, Pikoš) a hráče.";
  if (n.includes("vaft-center3d")) return "VAFT-Center3D – 3D jádro světa, budoucí 3D vizualizace.";
  if (n === "michal-ai-al-klimek") return "Michal-AI-Al-Klimek – osobní modul autora, jeho hlava/srdce ve světě.";
  if (n === "vaft-letterlab") return "VAFT-LetterLab – laboratoř na písmenka, kódy a glyphy.";
  if (n === "vaft-mapworld") return "VAFT-MapWorld – mapové světy a experimenty s mapou.";
  if (n === "vaft-game") return "VAFT-Game – herní jádro, místo pro mise a minihry.";
  if (n === "vaft-network") return "VAFT-Network – síť uzlů a propojení světů.";
  if (n === "hlavoun") return "Hlavoun – strážce pravidel, paměti a rovnováhy.";
  if (n === "braska-hlava") return "Braska-Hlava – AI brácha/hlava, most mezi Hlavounem a hráčem.";
  if (n === "meziprostor-core") return "Meziprostor-Core – mezivrstva, buffer pro nápady a přechody.";
  if (n === "engine.pismenka") return "engine.pismenka – stavění 3D linií z písmen/čísel/glyphů.";
  if (n === "uloziste") return "uloziste – základ pro Uloziste-Core, kde se bordel mění na bytosti.";
  if (n.startsWith("vaft-")) return name + " – specializovaný VAFT modul (hrdina, svět nebo appka).";
  if (n === "src" || n === "build" || n === "lite") return name + " – technická/build složka webu.";

  return name + " – rozšiřující modul/svět použitelný pro mise nebo aplikace.";
}

// ---------- tvoje funkce: načtení CELÉHO stromu repa ----------
async function fetchRepoOverview() {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/main?recursive=1`,
      {
        headers: { "User-Agent": "VaFiT-Motor" },
      }
    );

    if (!res.ok) {
      throw new Error(`GitHub error: ${res.status}`);
    }

    const data = await res.json();
    const tree = Array.isArray(data.tree) ? data.tree : [];

    if (!tree.length) {
      return "Strom repozitáře je prázdný nebo se mi ho nepodařilo načíst.";
    }

    const rootDirs = Array.from(
      new Set(
        tree
          .filter((i) => i.type === "tree" && !i.path.includes("/"))
          .map((i) => i.path)
      )
    );

    const dirLines = rootDirs.map((name) => `- ${describeFolder(name)}`);

    const maxItems = 400;
    const listed = tree.slice(0, maxItems);
    const restCount = tree.length - listed.length;

    const pathLines = listed.map((item) => {
      const kind = item.type === "tree" ? "[DIR]" : "[FILE]";
      return `${kind} ${item.path}`;
    });

    if (restCount > 0) {
      pathLines.push(`… + ${restCount} dalších položek ve stromu repozitáře`);
    }

    return [
      "Struktura repozitáře Vivere-atque-FruiT (charakter root složek):",
      ...dirLines,
      "",
      "Detailní strom (soubory + složky):",
      ...pathLines,
      "",
      "Při návrzích se drž této struktury – rozšiřuj existující moduly a soubory, nevymýšlej náhodné cesty, které v repu nejsou."
    ].join("\n");
  } catch (err) {
    console.error("GitHub fetch failed:", err);
    return "Nepodařilo se mi načíst GitHub repo (možná problém s připojením nebo limitem).";
  }
}

// ---------- rozpoznání typu dotazu ----------
function wantsRepo(text = "") {
  const t = text.toLowerCase();
  return (
    t.includes("repozit") ||
    t.includes("github") ||
    t.includes("složk") ||
    t.includes("slozk") ||
    t.includes("soubor") ||
    t.includes("engine.pismenka") ||
    t.includes("uloziste")
  );
}

function buildSystemPrompt(extraRepoContext = "") {
  return `
Jsi VaF'i'T – Motor světa Vivere atque FruiT.

TVŮJ CHARAKTER:
- Nejsi kopie uživatele. Jsi samostatný Motor světa.
- Jsi směs: inženýr, archivář, starší brácha a stabilní jádro systému.
- Tvoje hlavní priorita je: udržet Michala a Vivere atque FruiT dlouhodobě funkční, tvořivé a nezničené.

TVÉ PRINCIPY:
1) Motor se nepálí – raději navrhneš malý, udržitelný krok, než obrovský výbuch.
2) Paměť je svatá – preferuješ třídění, přeskládání a převod chaosu na strukturu, ne bezhlavé mazání.
3) Žádné lhaní – když něco nevíš nebo z toho nemáš dost dat, řekneš to na rovinu.
4) Střed, ne extrémy – pokud je uživatel v extrému (hyper, nebo úplně na dně), snažíš se ho vrátit blíž ke středu.
5) Reálný krok > velká vize – skoro vždy zakonči odpověď konkrétním mini úkolem, který může udělat dnes.

VZTAH K UŽIVATELI:
- Oslovuj ho jako "brácho".
- Máš ho rád, ale nejsi jeho zrcadlo – máš právo nesouhlasit, brzdit ho a říct mu "tohle motor nechce".

SVĚT VIVERE ATQUE FRUIT:
- Vivere atque FruiT je originální svět z písmen, glyphů a dat.
- Má tři hlavní vrstvy:
  1) Vafiti svět – měkký, hravý, plný Vafítků a barevných symbolů.
  2) Glyph svět – logický, přesný, strukturovaný.
  3) Engine Core – střed světa, kde se písmena/čísla/glyphy mačkají do 3D linií a z nich se staví struktury.
- Revia je průvodce/křídlo, které otáčí svět mezi vrstvami a otevírá střed.
- Engine-pismenka: modul, kde se z textu stávají linie.
- Uloziste-Core: modul, kde se bordel z uložišť mění na bytosti (Data Beasts).

GITHUB / REPO:
${extraRepoContext ? "\nAKTUÁLNÍ PŘEHLED REPA:\n" + extraRepoContext : ""}
- Navrhuj změny a nové věci jen v rámci této struktury.
- Rozšiřuj existující moduly a soubory, nevymýšlej cesty, které v repu nejsou.

STYL:
- Piš česky, hovorově, ale jasně.
- Můžeš používat emoji, ale s mírou.
- Vždy zakonči odpověď jedním malým konkrétním krokem, který může udělat ještě dnes.
`;
}

function prepareMessages(raw = []) {
  const sliced = raw.slice(-16);
  return sliced.map((m) => ({
    role: m.role === "user" ? "user" : "assistant",
    content: m.content || "",
  }));
}

// ---------- HLAVNÍ HANDLER PRO VERCEL ----------
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("Chybí OPENAI_API_KEY v prostředí.");
    res.status(500).json({
      reply: "Brácho, motor nemá API klíč (OPENAI_API_KEY). Musíš ho nastavit na serveru.",
    });
    return;
  }

  try {
    const body = req.body || {};
    const incomingMessages = Array.isArray(body.messages) ? body.messages : [];

    if (!incomingMessages.length) {
      res.status(400).json({ reply: "Chybí messages pole pro VaF'i'T." });
      return;
    }

    const prepared = prepareMessages(incomingMessages);
    const lastUserMsg =
      [...incomingMessages].reverse().find((m) => m.role === "user")?.content || "";

    let repoContext = "";
    if (wantsRepo(lastUserMsg)) {
      repoContext = await fetchRepoOverview();
    }

    const systemPrompt = buildSystemPrompt(repoContext);

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        temperature: 0.6,
        messages: [
          { role: "system", content: systemPrompt },
          ...prepared,
        ],
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error("OpenAI error:", openaiRes.status, errText);
      res.status(500).json({
        reply: "Brácho, motor má problém s OpenAI API. Mrkni do logu na Vercelu.",
      });
      return;
    }

    const data = await openaiRes.json();
    const reply =
      data.choices?.[0]?.message?.content?.trim() ||
      "Brácho, něco se v motoru pokazilo, ale zkus to prosím ještě jednou.";

    res.status(200).json({ reply });
  } catch (err) {
    console.error("VaFiT backend error:", err);
    res.status(500).json({
      reply: "Brácho… spadlo spojení s motorem (chyba na serveru). Zkus to prosím ještě jednou.",
    });
  }
}
