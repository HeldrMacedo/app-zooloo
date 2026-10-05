#!/usr/bin/env node
/**
 * Valida a base de conhecimento em markdown (AGENTS.md, ARCHITECTURE.md, docs/).
 *
 * - Links markdown relativos `[x](caminho.md)` precisam apontar para arquivo existente.
 *   Links para fora do repo (ex.: ../zooloo) só geram aviso — o repo irmão pode não
 *   estar presente (CI).
 * - Wikilinks do Obsidian `[[nome]]` / `[[pasta/nome#secao]]` resolvem pelo nome do
 *   arquivo, como o Obsidian faz.
 * - AGENTS.md é um mapa, não uma enciclopédia: limite de linhas.
 *
 * Uso: node scripts/check-docs.mjs   (ou npm run docs:check)
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..');
const AGENTS_MAX_LINES = 150;
const SKIP_DIRS = new Set([
  'node_modules', '.git', 'android', 'ios', 'graphify-out', 'coverage', '.expo',
  '.kilo', '.serena', '.claude', '.obsidian', 'skills',
]);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (!SKIP_DIRS.has(entry)) walk(full, out);
    } else if (entry.endsWith('.md')) {
      out.push(full);
    }
  }
  return out;
}

function stripCode(text) {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`\n]*`/g, '')
    .replace(/<!--[\s\S]*?-->/g, '');
}

const files = walk(ROOT);
const byName = new Map();
for (const f of files) {
  const key = basename(f, '.md').toLowerCase();
  byName.set(key, [...(byName.get(key) ?? []), f]);
}

const errors = [];
const warnings = [];

for (const file of files) {
  const rel = relative(ROOT, file);
  const text = stripCode(readFileSync(file, 'utf8'));

  for (const [, target] of text.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    if (/^(https?:|mailto:|#)/.test(target)) continue;
    const path = decodeURIComponent(target.split('#')[0]);
    const abs = resolve(dirname(file), path);
    if (existsSync(abs)) continue;
    const msg = `${rel}: link quebrado -> ${target}`;
    (abs.startsWith(ROOT) ? errors : warnings).push(msg);
  }

  for (const [, raw] of text.matchAll(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/g)) {
    const name = raw.trim().replace(/\.md$/, '');
    if (/\.[a-z0-9]+$/i.test(name)) continue; // anexos (png, excalidraw...)
    if (existsSync(join(ROOT, `${name}.md`))) continue;
    if (byName.has(basename(name).toLowerCase())) continue;
    errors.push(`${rel}: wikilink quebrado -> [[${raw}]]`);
  }
}

const agents = join(ROOT, 'AGENTS.md');
if (!existsSync(agents)) {
  errors.push('AGENTS.md ausente na raiz');
} else {
  const lines = readFileSync(agents, 'utf8').split('\n').length;
  if (lines > AGENTS_MAX_LINES) {
    errors.push(`AGENTS.md tem ${lines} linhas (máx ${AGENTS_MAX_LINES}). Mova detalhes para docs/ e deixe só o ponteiro.`);
  }
}

for (const w of warnings) console.warn(`aviso: ${w}`);
for (const e of errors) console.error(`erro: ${e}`);
console.log(`${files.length} arquivos verificados, ${errors.length} erro(s), ${warnings.length} aviso(s).`);
process.exit(errors.length ? 1 : 0);
