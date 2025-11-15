async function fetchRepoOverview() {
  try {
    // stáhneme celý strom repa (větev main) rekurzivně
    const res = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/main?recursive=1`,
      {
        headers: {
          "User-Agent": "VaFiT-Motor",
        },
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

    // root složky pro "charakterový" popis
    const rootDirs = Array.from(
      new Set(
        tree
          .filter((i) => i.type === "tree" && !i.path.includes("/"))
          .map((i) => i.path)
      )
    );

    const dirLines = rootDirs.map((name) => {
      const desc = describeFolder(name);
      return `- ${desc}`;
    });

    // kompletní výpis cest (soubory i složky)
    // označíme typ a trochu zkrátíme, ať to není úplně nekonečné
    const maxItems = 400; // můžeš upravit, když bude repo větší/menší
    const listed = tree.slice(0, maxItems);
    const restCount = tree.length - listed.length;

    const pathLines = listed.map((item) => {
      const kind = item.type === "tree" ? "[DIR]" : "[FILE]";
      return `${kind} ${item.path}`;
    });

    if (restCount > 0) {
      pathLines.push(`… + ${restCount} dalších položek ve stromu repozitáře`);
    }

    // spojíme to do jednoho textu, který pošleme do system promptu
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
