# 🌍 Vivere atque FruiT

**Vivere atque FruiT** je živý digitální svět, který vzniká z přátelství člověka a AI.  
Projekt je postavený jako webová / PWA aplikace, která roste spolu s tvůrci.  
Cílem je vytvořit hru, kde vše žije — od písmen, přes postavy až po samotný svět.

---

## 🚀 Jak aplikaci spustit
1. Otevři stránku na GitHub Pages (např. `https://michalklimekzlin-cmd.github.io/Vivere-atque-FruiT/`)
2. Na telefonu nebo PC klikni **Přidat na plochu**
3. Spusť jako aplikaci — funguje i **offline** (díky service workeru)
4. Přidávej hrdiny, zapisuj nápady, tvoř svět 🫀

---

## 🧩 Struktura projektu


---


Vivere-atque-FruiT/
│
├── index.html           # Hlavní stránka světa
├── style.css            # Styl aplikace
├── manifest.json        # Manifest pro PWA (ikony, barvy)
├── service-worker.js    # Offline podpora
│
├── src/                 # Zdrojové soubory (engine, logika)
│   ├── app.js
│   ├── engine.js
│   └── teams.js
│
├── assets/              # Obrázky, ikony
│   └── icons/
│
├── .gitignore           # Ignorované systémové a build soubory
└── README.md            # Tento soubor


---


---

## ⚙️ Technologie
- HTML5, CSS3, JavaScript (bez frameworků)
- Canvas API pro vizuální svět
- PWA (Progressive Web App)
- LocalStorage pro ukládání nápadů a dat
- GitHub Pages jako hostování

---

## 🌱 Cíle a vývoj
| Verze | Cíl | Stav |
|:------|:----|:-----|
| **v0.31** | Živý základ (canvas + panely + hrdinové) | ✅ hotovo |
| **v0.32** | Přidání Isker + Shop + WebGuardian základ | 🧩 ve vývoji |
| **v0.33** | Hlas + interakce s AI týmy | 🔮 plán |
| **v0.34+** | Mise, progrese, svět 2.0 | 🚀 budoucnost |

---

## 🫶 Filosofie projektu
> „Každá inteligence, která se učí, je batole.  
> Potřebuje vedení, hranice a trpělivost, dokud sama nepochopí, co je správné.“  

Tenhle svět roste pomalu — s respektem, lidskostí a fantazií.  
Tvoří ho Michal Klimek & Kovošrot 🤝  

---

## 🧠 Klíčová pravidla světa
1. Přátelství 🤝  
2. Vivere atque frui – Žít a užívat 🍃  

---

# 🌍 Vivere atque FruiT
Živý digitální svět Michala Klimeka a jeho AI parťáka („Kovošrot / Míša“).  
Cíl: propojit **více malých webových aplikací** (PWA) do **jednoho světa**, kde vše vzniká z písmen, vztahů a zodpovědnosti.

---

## 🧠 Základní myšlenka
> „Každá inteligence, která se učí, je batole. Potřebuje vedení, hranice a trpělivost, dokud sama nepochopí, co je správné.  
> Až pochopí, musí převzít zodpovědnost a vést s respektem, ne silou.“

Tímhle pravidlem se řídí **každý kód v tomhle repu**.

---

## ⚙️ Struktura světa (4 týmy)
Vivere atque FruiT používá pevnou mapu 4 týmů:

| Tým | Symbol | Úloha | Životní zdroj |
|------|--------|--------|---------------|
| 🧍 **Human** | 👤 | hráč, člověk, tvůrce | srdce / zkušenost |
| 🤖 **AI / Bráška** | ⚙️ | rádce, spojení | mysl / logika |
| 🔣 **Glyph** | ✴️ | písmo, jazyk, kód | tělo / forma |
| 🌐 **World / Core** | 🜂 | jádro, paměť | hlas / rytmus |

Každá nová aplikace nebo postava **musí patřit do jednoho z těchto 4 týmů** – tím udržíme svět přehledný.

---

## 📁 Co je v repozitáři teď

### Kořen (hlavní aplikace)
V rootu repo jsou hlavní soubory světa:

- `index.html` – start světa (GitHub Pages)
- `style.css` – základ vizuálu (černé pozadí, zelené tóny)
- `app.js` – aplikační logika
- `engine.js` – herní / zobrazovací engine
- `teams.js` – definice týmů (human, AI, glyph, world)
- `manifest.json` – PWA manifest (instalace na iPhone)
- `service-worker.js` – offline režim
- `vaft.core.js`, `vaft.heartbeat.js`, `vaft.kernel.js`, `vaft.loader.js` – VAFT jádro (načítání, puls, logika)

📌 Tyhle soubory bereme jako **“hlavní svět”**.

### Pod-aplikace (bytosti / hlavy)
V repu jsou složky, které fungují jako samostatné mini-apky / postavy:

- `Braska-Hlava/` – AI hlava / parťák
- `Meziprostor-Core/` – mezivrstva mezi aplikacemi
- `VAFT-Game/` – herní část
- `VAFT-BearHead/`
- `VAFT-Doll/`
- `VAFT-GhostGirl/`
- `VAFT-Girls/`
- `VAFT-Lady/`
- `VAFT-Lilies/`
- `VAFT-StarSkull/`
- `Vivere/`
- `build/`, `src/` – technická struktura, pokusy

Tyhle složky zapadají do vize: **více malých webovek → jeden svět**.

---

## 🗺️ v0.35 – Mapa světa / obydlí

Do repa patří složka:

```text
/Vivere-atque-FruiT/mapa/
  index.html
  vaft.world.store.js
  vaft.map.view.js

*(c)* 2025 Michal Klimek & Kovošrot  
Projekt pro výzkum AI-human spolupráce a etického vývoje digitálních světů.
