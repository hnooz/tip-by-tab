import fs from "node:fs/promises";
import path from "node:path";
import { codeHash } from "./validate.mjs";
import { STACKS, humanize, parseBody, hashSeed, stableShuffle, parseTip } from "./shared.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIST = path.join(ROOT, "dist");

async function main() {
  const stacksMeta = [];
  const index = [];
  const rotation = {};

  await fs.mkdir(path.join(DIST, "stacks"), { recursive: true });

  for (const stack of STACKS) {
    const dir = path.join(ROOT, "tips", stack);
    let files = [];
    try {
      files = (await fs.readdir(dir)).filter((f) => f.endsWith(".md")).sort();
    } catch {
      files = [];
    }

    const tips = [];
    for (const file of files) {
      const raw = await fs.readFile(path.join(dir, file), "utf8");
      const { data, content } = parseTip(raw);
      if (!data.id) {
        throw new Error(`tips/${stack}/${file} has no id — run assign-id first`);
      }
      const { code, explanation } = parseBody(content);
      const hash = codeHash(code);
      tips.push({ ...data, code, explanation, codeHash: hash });
      index.push({ id: data.id, codeHash: hash, title: data.title, stack });
    }

    await fs.writeFile(
      path.join(DIST, "stacks", `${stack}.json`),
      JSON.stringify({ stack, tips }, null, 2)
    );

    const ids = tips.map((t) => t.id);
    rotation[stack] = stableShuffle(ids, hashSeed(ids.join(",")));

    stacksMeta.push({
      id: stack,
      name: humanize(stack),
      tipCount: tips.length,
      updated: new Date().toISOString().slice(0, 10),
    });
  }

  const stacksDir = path.join(DIST, "stacks");
  const keep = new Set(STACKS.map((s) => `${s}.json`));
  for (const file of await fs.readdir(stacksDir)) {
    if (file.endsWith(".json") && !keep.has(file)) {
      await fs.rm(path.join(stacksDir, file));
    }
  }

  await fs.writeFile(path.join(DIST, "rotation.json"), JSON.stringify(rotation, null, 2));
  await fs.writeFile(path.join(DIST, "index.json"), JSON.stringify(index, null, 2));
  await fs.writeFile(
    path.join(DIST, "manifest.json"),
    JSON.stringify({ version: 1, updated: new Date().toISOString(), stacks: stacksMeta }, null, 2)
  );

  console.log(`✓ built ${index.length} tip(s) across ${STACKS.length} stack(s)`);
}

main();
