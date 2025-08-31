// scripts/build-ds.js
const fs = require("fs");
const path = require("path");

const INPUT = process.env.TOKENS || path.join(process.cwd(), "tokens.json");
const OUT_DIR = path.join(process.cwd(), "src/app", "styles");
const OUT_CSS = path.join(OUT_DIR, "tokens.css");
const PX_TO_REM = process.env.PX_TO_REM === "1";
const REM_BASE = Number(process.env.REM_BASE || 16);

const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
const isLeaf = (v) => isObj(v) && "$value" in v && "$type" in v;
const isRef = (v) => typeof v === "string" && /^\{[^}]+\}$/.test(v.trim());

const refToVar = (v) => {
  const t = v
    .slice(1, -1)
    .trim()
    .replace(/^primitive\./, "")
    .replace(/^semantic\./, "");
  return `var(--${t.replace(/\./g, "-")})`;
};
const pxToRemIf = (val, type) => {
  if (!PX_TO_REM || type !== "fontSizes") return val;
  if (typeof val !== "string" || !val.endsWith("px")) return val;
  const n = parseFloat(val);
  if (Number.isNaN(n)) return val;
  return `${n / REM_BASE}rem`;
};
const pathToVar = (segs) => {
  const s = [...segs];
  if (s[0] === "primitive" || s[0] === "semantic") s.shift();
  return `${s.join("-")}`;
};

function collectTokens(obj, prefix = [], acc = [], warnings = []) {
  for (const [k, v] of Object.entries(obj || {})) {
    if (isLeaf(v)) {
      const segs = [...prefix, k];
      const cssVar = pathToVar(segs);
      let val = v.$value;
      if (typeof val === "string" && isRef(val)) val = refToVar(val);
      if (typeof val === "string" && /^#?$/.test(val))
        warnings.push(`⚠️ empty value at "${segs.join(".")}"`);
      val = pxToRemIf(val, v.$type);
      acc.push({
        pathSegs: segs,
        key: segs.join("-"),
        type: v.$type,
        cssVar,
        valueCss: val,
      });
    } else if (isObj(v)) {
      collectTokens(v, [...prefix, k], acc, warnings);
    }
  }
  return { list: acc, warnings };
}

function writeTokensCss(tokens) {
  const { list: prim, warnings: w1 } = collectTokens(tokens.primitive || {}, [
    "primitive",
  ]);
  const { list: sem, warnings: w2 } = collectTokens(tokens.semantic || {}, [
    "semantic",
  ]);
  const lines = [
    "/** Generated from tokens.json – DO NOT EDIT */",
    "@theme {",
  ...prim.map((t) => `--${t.type}-${t.cssVar}: ${t.valueCss};`),
  ...sem.map((t) => `--${t.type}-${t.cssVar}: ${t.valueCss};`),
    "}",
  ];
  if (Array.isArray(tokens.$themes)) {
    for (const th of tokens.$themes) {
      const selector = th.selector || (th.name ? `@theme ${th.name}` : null);
      if (!selector) continue;
      const { list: tp } = collectTokens(th.primitive || {}, ["primitive"]);
      const { list: ts } = collectTokens(th.semantic || {}, ["semantic"]);
      if (tp.length || ts.length) {
        lines.push(
          "",
          `${selector} {`,
          ...tp.map((t) => `--${t.type}-${t.cssVar}: ${t.valueCss};`),
          ...ts.map((t) => `--${t.type}-${t.cssVar}: ${t.valueCss};`),
          "}"
        );
      }
    }
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_CSS, lines.join("\n"));
  console.log("✅ wrote", path.relative(process.cwd(), OUT_CSS));
  const warnings = [...w1, ...w2];
  if (warnings.length) {
    console.warn("Warnings:");
    warnings.forEach((w) => console.warn(" -", w));
  }
  return [...prim, ...sem];
}

(function main() {
  const tokens = JSON.parse(fs.readFileSync(INPUT, "utf8"));
  writeTokensCss(tokens);
})();
