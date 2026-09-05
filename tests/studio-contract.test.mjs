import assert from "node:assert/strict";
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (file) => readFileSync(resolve(root, file), "utf8");
const app = read("src/StudioApp.tsx");
const css = read("src/studio.css");
const ids = new Set([...app.matchAll(/\bid="([a-z][a-z0-9-]*)"/g)].map((match) => match[1]));

test("the new studio is the active application", () => {
  assert.match(read("src/main.tsx"), /import App from "\.\/StudioApp"/);
  assert.match(read("src/main.tsx"), /import "\.\/studio\.css"/);
});

test("all in-page navigation and legacy landing pages have real targets", () => {
  for (const [, id] of app.matchAll(/href="#([a-z0-9-]+)"/g)) {
    assert.ok(ids.has(id), `Missing navigation target: ${id}`);
  }
  for (const file of ["unreal-vr", "internal-tools", "interactive-prototypes", "founder-mvps"]) {
    const [, id] = read(`public/${file}.html`).match(/content="0; url=\/#([a-z0-9-]+)"/);
    assert.ok(ids.has(id), `Broken legacy redirect: ${file} → ${id}`);
  }
});

test("contact information matches the owner's confirmed details", () => {
  assert.match(app, /const EMAIL = "Larion1@gmail\.com"/);
  assert.match(app, /const WHATSAPP = "https:\/\/wa\.me\/972504931021"/);
  assert.doesNotMatch(app, /wa\.me\/66|922470654|Larion Siments|\bprototype\b/i);
});

test("every imported media asset is present", () => {
  for (const [, path] of app.matchAll(/from "(\.\.\/assets\/[^\"]+)"/g)) {
    assert.ok(existsSync(resolve(root, "src", path)), `Missing asset: ${path}`);
  }
});

test("the landing experience has no WebGL dependency or intercepted scrolling", () => {
  assert.doesNotMatch(app, /from ["'](?:three|@react-three\/[^"']+)["']/);
  assert.doesNotMatch(app, /addEventListener\(["'](?:wheel|touchmove)["']/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(app, /IntersectionObserver/);
  assert.match(app, /manuallyPaused/);
  assert.match(app, /visibilitychange/);
});

test("lead imagery stays within a compact delivery budget", () => {
  assert.ok(statSync(resolve(root, "assets/brand/editorial/playframe-worlds-hero.webp")).size < 150_000);
  assert.ok(statSync(resolve(root, "assets/brand/editorial/playframe-worlds-hero-960.webp")).size < 60_000);
});
