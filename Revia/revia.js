function toggleRevia() {
  const revia = document.getElementById("revia");
  const current = revia.getAttribute("data-mode");
  const next = current === "angel" ? "daemon" : "angel";
  revia.setAttribute("data-mode", next);
}

function toggleGlyph() {
  const glyph = document.getElementById("glyphText");
  glyph.textContent = glyph.textContent === "「Ī’𞋒" ? "「Ī’☆" : "「Ī’𞋒";
}
